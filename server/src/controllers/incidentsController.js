import db, { clearAllPreScenarios } from '../db/database.js';
import { llmDialogue } from '../services/llmDialogueService.js';
import { OpenAIDecisionsService } from '../services/openaiDecisionsService.js';
import { SummaryService } from '../services/summaryService.js';

export const incidentsController = {
  // GET /api/incidents/tickets
  getTickets(req, res) {
    try {
      const tickets = db.prepare('SELECT * FROM tickets ORDER BY created_at DESC').all();
      const formatted = tickets.map(t => {
        let reporter = {};
        try { reporter = JSON.parse(t.reporter_json || '{}'); } catch (e) {}

        const claims = db.prepare('SELECT * FROM epistemic_claims WHERE ticket_id = ?').all(t.id);

        return {
          id: t.scenario_id || t.id,
          ticketId: t.id,
          title: t.title,
          subtitle: t.subtitle,
          department: t.department || 'Operations Team',
          targetDepartment: t.target_department || 'On-Call Engineering',
          urgency: t.urgency,
          sufficientDetail: t.sufficient_detail,
          status: t.status,
          matchedSop: t.matched_sop || 'SOP-DYNAMIC-01: Incident Triage Protocol',
          impact: t.impact || 'Under Operational Assessment',
          reporter,
          claims
        };
      });

      res.json(formatted);
    } catch (err) {
      console.error('[incidentsController] Error in getTickets:', err);
      res.status(500).json({ error: 'Failed to fetch tickets', details: err.message });
    }
  },

  // POST /api/incidents/tickets (Create a dynamic new incident ticket)
  createTicket(req, res) {
    try {
      const { title, callerName, department, targetDepartment, urgency } = req.body || {};
      const ticketId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;

      const newTicket = {
        id: ticketId,
        scenario_id: ticketId.toLowerCase(),
        title: title || 'New Incident Call',
        subtitle: 'Live Frontline Operational Intake',
        department: department || 'Operations',
        target_department: targetDepartment || 'Incident Escalation Queue',
        urgency: urgency || 5,
        sufficient_detail: 0.25,
        status: 'TRIAGING',
        matched_sop: 'SOP-DYNAMIC-01: Incident Triage Protocol',
        impact: 'Evaluating frontline business impact',
        reporter_json: JSON.stringify({
          name: callerName || 'Frontline Caller',
          role: 'Operational Reporter',
          location: 'Live Stream'
        })
      };

      db.prepare(`
        INSERT INTO tickets (
          id, scenario_id, title, subtitle, department, target_department,
          urgency, sufficient_detail, status, matched_sop, impact, reporter_json
        ) VALUES (
          @id, @scenario_id, @title, @subtitle, @department, @target_department,
          @urgency, @sufficient_detail, @status, @matched_sop, @impact, @reporter_json
        )
      `).run(newTicket);

      // Add welcoming agent turn
      const welcomeTurn = "SyncUp Incident Intake active. Please state the operational problem, affected systems, and frontline impact.";
      db.prepare(`
        INSERT INTO conversation_turns (ticket_id, role, sender, body)
        VALUES (?, 'agent', 'SyncUp Intake Agent', ?)
      `).run(ticketId, welcomeTurn);

      res.status(201).json({
        success: true,
        ticket: newTicket,
        initialGreeting: welcomeTurn
      });
    } catch (err) {
      console.error('[incidentsController] Error in createTicket:', err);
      res.status(500).json({ error: 'Failed to create ticket', details: err.message });
    }
  },

  // GET /api/incidents/tickets/:id
  async getTicketDetails(req, res) {
    try {
      const { id } = req.params;
      const ticket = db.prepare('SELECT * FROM tickets WHERE id = ? OR scenario_id = ?').get(id, id);

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      let reporter = {};
      try { reporter = JSON.parse(ticket.reporter_json || '{}'); } catch (e) {}

      const turns = db.prepare('SELECT role, sender, body, timestamp FROM conversation_turns WHERE ticket_id = ? ORDER BY id ASC').all(ticket.id);
      const claims = db.prepare('SELECT id, text, type, confidence FROM epistemic_claims WHERE ticket_id = ? ORDER BY id ASC').all(ticket.id);

      // Generate dynamic plain-language summary
      const summaryResult = await SummaryService.generateSummary({
        ticket,
        conversationHistory: turns,
        claims
      });

      res.json({
        ticket: {
          id: ticket.scenario_id || ticket.id,
          ticketId: ticket.id,
          title: ticket.title,
          subtitle: ticket.subtitle,
          department: ticket.department,
          targetDepartment: ticket.target_department,
          urgency: ticket.urgency,
          sufficientDetail: ticket.sufficient_detail,
          status: ticket.status,
          matchedSop: ticket.matched_sop,
          impact: ticket.impact,
          reporter
        },
        conversation: turns,
        claims,
        liveSummary: summaryResult.liveSummary,
        keyDetails: claims.map(c => c.text)
      });
    } catch (err) {
      console.error('[incidentsController] Error in getTicketDetails:', err);
      res.status(500).json({ error: 'Failed to fetch ticket details', details: err.message });
    }
  },

  // POST /api/incidents/turn (Process speech turn with dynamic ticket auto-creation)
  async processTurn(req, res) {
    try {
      const { userMessage, senderName } = req.body;
      let ticketId = req.params.id || req.body.ticketId || req.body.scenarioId;

      if (!userMessage || !userMessage.trim()) {
        return res.status(400).json({ error: 'userMessage is required' });
      }

      // If no ticket exists yet, create one dynamically on the fly
      let ticket = ticketId ? db.prepare('SELECT * FROM tickets WHERE id = ? OR scenario_id = ?').get(ticketId, ticketId) : null;

      if (!ticket) {
        ticketId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;

        const teamEval = SummaryService.evaluateResolutionTeam(userMessage);

        const dynamicTitle = userMessage.length > 45 ? `${userMessage.slice(0, 42)}...` : userMessage;

        db.prepare(`
          INSERT INTO tickets (
            id, scenario_id, title, subtitle, department, target_department,
            urgency, sufficient_detail, status, matched_sop, impact, reporter_json
          ) VALUES (?, ?, ?, ?, ?, ?, 5, 0.40, 'TRIAGING', 'SOP-GEN-01: Priority Escalation', 'Active Frontline Incident', ?)
        `).run(
          ticketId,
          ticketId.toLowerCase(),
          dynamicTitle,
          'Dynamic Incident Intake',
          'Frontline Operations',
          teamEval.department,
          JSON.stringify({ name: senderName || 'Frontline Caller', role: 'Caller', location: 'Live Intake' })
        );

        ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId);
      }

      ticketId = ticket.id;
      let reporter = {};
      try { reporter = JSON.parse(ticket.reporter_json || '{}'); } catch (e) {}

      // 1. Save caller turn
      db.prepare(`
        INSERT INTO conversation_turns (ticket_id, role, sender, body)
        VALUES (?, 'reporter', ?, ?)
      `).run(ticketId, senderName || reporter.name || 'Caller', userMessage.trim());

      const conversationHistory = db.prepare('SELECT role, sender, body FROM conversation_turns WHERE ticket_id = ? ORDER BY id ASC').all(ticketId);
      const existingClaims = db.prepare('SELECT * FROM epistemic_claims WHERE ticket_id = ?').all(ticketId);
      const criticalUnknowns = existingClaims.filter(c => c.type === 'critical_unknown');

      // 2. Brain 1: Socratic Probing Question
      const socraticResult = await llmDialogue.generateNextTurn({
        ticket,
        conversationHistory,
        latestUserMessage: userMessage,
        criticalUnknowns
      });

      // 3. Brain 2: Decisions API Evaluation
      const decisionsResult = await OpenAIDecisionsService.evaluate(userMessage, [
        {
          type: 'predicate',
          name: 'sufficient_detail_collected',
          instructions: 'Evaluate if caller provided operational specifics (time, symptom, scale).'
        },
        {
          type: 'choice',
          name: 'epistemic_category',
          options: ['observed_fact', 'critical_unknown', 'user_hypothesis']
        }
      ]);

      // Extract new claims from caller's statement
      const newClaims = OpenAIDecisionsService.extractClaims(userMessage, ticketId);
      for (const claim of newClaims) {
        db.prepare(`
          INSERT OR REPLACE INTO epistemic_claims (id, ticket_id, text, type, confidence)
          VALUES (?, ?, ?, ?, ?)
        `).run(claim.id, ticketId, claim.text, claim.type, claim.confidence);
      }

      const allClaims = db.prepare('SELECT id, text, type, confidence FROM epistemic_claims WHERE ticket_id = ? ORDER BY id DESC').all(ticketId);

      // 4. Brain 3: Generate Live Plain-Language Summary & Evaluate Optimal Escalation Team
      const summaryResult = await SummaryService.generateSummary({
        ticket,
        conversationHistory,
        claims: allClaims
      });

      const teamEval = SummaryService.evaluateResolutionTeam(userMessage, ticket.target_department);

      // Update detail score and target department in database
      const newDetailScore = Math.min(1.0, parseFloat((ticket.sufficient_detail + 0.05).toFixed(2)));
      db.prepare('UPDATE tickets SET sufficient_detail = ?, target_department = ? WHERE id = ?').run(
        newDetailScore,
        teamEval.department,
        ticketId
      );

      // 5. Save agent reply turn
      const agentReplyText = socraticResult.reply;
      db.prepare(`
        INSERT INTO conversation_turns (ticket_id, role, sender, body)
        VALUES (?, 'agent', 'SyncUp Intake Agent', ?)
      `).run(ticketId, agentReplyText);

      res.json({
        success: true,
        ticketId,
        agentResponse: agentReplyText,
        source: socraticResult.source,
        decisionEvaluation: decisionsResult.answers,
        sufficientDetail: newDetailScore,
        liveSummary: summaryResult.liveSummary,
        recommendedTeam: teamEval.department,
        teamRationale: teamEval.rationale,
        teamConfidence: teamEval.confidence,
        keyDetails: allClaims.map(c => c.text),
        newClaims,
        allClaims
      });
    } catch (err) {
      console.error('[incidentsController] Error processing turn:', err);
      res.status(500).json({ error: 'Failed to process turn', details: err.message });
    }
  },

  // DELETE /api/incidents/clear (Clears all tickets and turns)
  clearTickets(req, res) {
    try {
      clearAllPreScenarios();
      res.json({ success: true, message: 'All tickets and conversation history cleared from database.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to clear database', details: err.message });
    }
  }
};

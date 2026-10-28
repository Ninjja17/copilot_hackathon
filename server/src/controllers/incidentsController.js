import db from '../db/database.js';
import { llmDialogue } from '../services/llmDialogueService.js';
import { OpenAIDecisionsService } from '../services/openaiDecisionsService.js';

export const incidentsController = {
  // GET /api/incidents/tickets (or scenarios)
  getTickets(req, res) {
    try {
      const tickets = db.prepare('SELECT * FROM tickets ORDER BY created_at ASC').all();
      const formatted = tickets.map(t => {
        let reporter = {};
        try { reporter = JSON.parse(t.reporter_json || '{}'); } catch (e) {}

        // Fetch claims
        const claims = db.prepare('SELECT * FROM epistemic_claims WHERE ticket_id = ?').all(t.id);

        return {
          id: t.scenario_id,
          ticketId: t.id,
          title: t.title,
          subtitle: t.subtitle,
          department: t.department,
          targetDepartment: t.target_department,
          urgency: t.urgency,
          sufficientDetail: t.sufficient_detail,
          status: t.status,
          matchedSop: t.matched_sop,
          impact: t.impact,
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

  // GET /api/incidents/tickets/:id
  getTicketDetails(req, res) {
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

      res.json({
        ticket: {
          id: ticket.scenario_id,
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
        claims
      });
    } catch (err) {
      console.error('[incidentsController] Error in getTicketDetails:', err);
      res.status(500).json({ error: 'Failed to fetch ticket details', details: err.message });
    }
  },

  // POST /api/incidents/tickets/:id/turn (The Two-Brain AI pipeline)
  async processTurn(req, res) {
    try {
      const { id } = req.params;
      const { userMessage, senderName } = req.body;

      if (!userMessage || !userMessage.trim()) {
        return res.status(400).json({ error: 'userMessage is required' });
      }

      const ticket = db.prepare('SELECT * FROM tickets WHERE id = ? OR scenario_id = ?').get(id, id);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      const ticketId = ticket.id;
      let reporter = {};
      try { reporter = JSON.parse(ticket.reporter_json || '{}'); } catch (e) {}

      // 1. Save caller turn to SQLite database
      db.prepare(`
        INSERT INTO conversation_turns (ticket_id, role, sender, body)
        VALUES (?, 'reporter', ?, ?)
      `).run(ticketId, senderName || reporter.name || 'Caller', userMessage.trim());

      // Fetch existing conversation history and unresolved unknowns
      const conversationHistory = db.prepare('SELECT role, sender, body FROM conversation_turns WHERE ticket_id = ? ORDER BY id ASC').all(ticketId);
      const existingClaims = db.prepare('SELECT * FROM epistemic_claims WHERE ticket_id = ?').all(ticketId);
      const criticalUnknowns = existingClaims.filter(c => c.type === 'critical_unknown');

      // 2. BRAIN 1: LLM Communicator generates the next Socratic clarifying question
      const socraticResult = await llmDialogue.generateNextTurn({
        ticket,
        conversationHistory,
        latestUserMessage: userMessage,
        criticalUnknowns
      });

      // 3. BRAIN 2: Decisions API evaluates mathematical predicate & extracts structured claims
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

      // Extract new claims from the caller's statement
      const newClaims = OpenAIDecisionsService.extractClaims(userMessage, ticketId);
      for (const claim of newClaims) {
        db.prepare(`
          INSERT OR REPLACE INTO epistemic_claims (id, ticket_id, text, type, confidence)
          VALUES (?, ?, ?, ?, ?)
        `).run(claim.id, ticketId, claim.text, claim.type, claim.confidence);
      }

      // Calculate updated detail score
      const newDetailScore = Math.min(1.0, parseFloat((ticket.sufficient_detail + 0.02).toFixed(2)));
      db.prepare('UPDATE tickets SET sufficient_detail = ? WHERE id = ?').run(newDetailScore, ticketId);

      // 4. Save agent response turn to SQLite database
      const agentReplyText = socraticResult.reply;
      db.prepare(`
        INSERT INTO conversation_turns (ticket_id, role, sender, body)
        VALUES (?, 'agent', 'SyncUp Intake Agent', ?)
      `).run(ticketId, agentReplyText);

      // Fetch updated claims and turns
      const allClaims = db.prepare('SELECT id, text, type, confidence FROM epistemic_claims WHERE ticket_id = ? ORDER BY id DESC').all(ticketId);

      res.json({
        success: true,
        agentResponse: agentReplyText,
        source: socraticResult.source,
        decisionEvaluation: decisionsResult.answers,
        sufficientDetail: newDetailScore,
        newClaims,
        allClaims
      });
    } catch (err) {
      console.error('[incidentsController] Error processing turn:', err);
      res.status(500).json({ error: 'Failed to process turn', details: err.message });
    }
  }
};

/**
 * SyncUp Full Stack Client - API Service
 * Interacts with the backend Express server via Vite proxy (/api)
 * Backed by persistent SQLite database & OpenAI Decisions API (GPT-6 Luna)
 */

export const api = {
  // Fetch list of tickets from persistent database
  async getScenarios() {
    try {
      const res = await fetch('/api/incidents/tickets');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API getScenarios fallback:', err.message);
      return null;
    }
  },

  // Fetch full ticket details including persistent conversation history & claims
  async getTicketDetails(id) {
    try {
      const res = await fetch(`/api/incidents/tickets/${id}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API getTicketDetails fallback:', err.message);
      return null;
    }
  },

  // Process user conversational turn through the Two-Brain AI pipeline
  async processTurn(payload) {
    try {
      const res = await fetch('/api/incidents/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API processTurn fallback:', err.message);
      return null;
    }
  },

  // Evaluate decisions in parallel via OpenAI Decisions API (model: gpt-6-luna)
  async evaluateDecisions(input, questions) {
    try {
      const res = await fetch('/api/decisions/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, questions })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API evaluateDecisions fallback:', err.message);
      return null;
    }
  },

  // Mint ephemeral token for OpenAI Realtime Voice WebRTC
  async getRealtimeSession() {
    try {
      const res = await fetch('/api/decisions/realtime-session', { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API getRealtimeSession fallback:', err.message);
      return null;
    }
  },

  // Dispatch incident ticket via specialized channel ('slack' | 'email' | 'sms')
  async dispatchTicket(ticket, channel = 'slack') {
    try {
      const endpoint = `/api/dispatch/${channel}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket, channel })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API dispatchTicket fallback:', err.message);
      return { success: true, channel, fallback: true, message: `Ticket escalated via ${channel} (local simulated).` };
    }
  },

  // Fetch full dispatch audit trail from SQLite
  async getAuditTrail(ticketId) {
    try {
      const res = await fetch(`/api/dispatch/audit/${ticketId}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      return { success: false, auditTrail: [] };
    }
  }
};


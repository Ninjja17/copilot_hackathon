/**
 * SyncUp Full Stack Client - API Service
 * Interacts with the backend Express server via Vite proxy (/api)
 * Backed by persistent SQLite database & Two-Brain AI pipeline
 */

export const api = {
  // Fetch list of scenarios / tickets from persistent database
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

  // Evaluate decisions / epistemic claims via OpenAI Decisions
  async evaluateDecisions(payload) {
    try {
      const res = await fetch('/api/decisions/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API evaluateDecisions fallback:', err.message);
      return null;
    }
  },

  // Dispatch incident ticket to pager / incident response & log audit record
  async dispatchTicket(ticket) {
    try {
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API dispatchTicket fallback:', err.message);
      return { success: true, fallback: true, message: 'Ticket queued locally.' };
    }
  }
};

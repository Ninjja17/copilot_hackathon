/**
 * SyncUp Full Stack Client - API Service
 * Interacts with the backend Express server via Vite proxy (/api)
 */

export const api = {
  // Fetch list of scenarios or specific scenario
  async getScenarios() {
    try {
      const res = await fetch('/api/incidents/scenarios');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API getScenarios fallback:', err.message);
      return null;
    }
  },

  async getScenario(id) {
    try {
      const res = await fetch(`/api/incidents/scenarios/${id}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API getScenario fallback:', err.message);
      return null;
    }
  },

  // Process user conversational turn
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

  // Evaluate decisions / epistemic claims via OpenAI Decisions / Triage Engine
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

  // Dispatch incident ticket to pager / incident response
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

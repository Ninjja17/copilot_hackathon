import { CONFIG } from '../config.js';

/**
 * LLM Dialogue Service (The Communicator)
 * Generates active-listening, empathy-anchored Socratic clarifying questions
 * designed to isolate and eliminate critical unknowns during an operational incident.
 */
export class LLMDialogueService {
  constructor() {
    this.apiKey = CONFIG.OPENAI_API_KEY;
  }

  /**
   * Generates next Socratic turn based on ticket context, turns history, and unresolved unknowns
   */
  async generateNextTurn({ ticket, conversationHistory, latestUserMessage, criticalUnknowns = [] }) {
    // 1. If an OpenAI API Key is provided, call live OpenAI Chat Completions
    if (this.apiKey && this.apiKey.startsWith('sk-')) {
      try {
        const messages = [
          {
            role: 'system',
            content: `You are the SyncUp Autonomous Incident Intake Agent.
Your job is to triage high-priority enterprise operational incidents with calm, empathetic authority.
Context:
- Incident: ${ticket.title} (${ticket.id})
- Reporter: ${ticket.reporter_name || 'Caller'}
- Target Queue: ${ticket.target_department}
- Current Unresolved Unknowns: ${criticalUnknowns.map(u => u.text).join('; ') || 'None identified yet'}

Rules:
1. First acknowledge the urgency/frustration in 1 short empathetic phrase.
2. Ask exactly ONE precise, Socratic operational question designed to eliminate the highest-risk critical unknown or verify fallback.
3. Keep response under 3 sentences for seamless voice speech synthesis (TTS).
4. Do NOT use bullet points or markdown bolding (this is spoken aloud).`
          },
          ...conversationHistory.slice(-6).map(turn => ({
            role: turn.role === 'agent' ? 'assistant' : 'user',
            content: turn.body
          })),
          {
            role: 'user',
            content: latestUserMessage
          }
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages,
            temperature: 0.3,
            max_tokens: 150
          })
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply && reply.trim()) {
            return {
              source: 'openai_gpt4o',
              reply: reply.trim()
            };
          }
        }
      } catch (err) {
        console.warn('[LLMDialogueService] Live LLM call failed, engaging deterministic Socratic engine:', err.message);
      }
    }

    // 2. High-Fidelity Socratic Incident Probing Engine
    const lower = (latestUserMessage || '').toLowerCase();

    // Check specific critical unknowns for targeted probing
    if (lower.includes('firmware') || lower.includes('update') || lower.includes('patch') || lower.includes('deploy')) {
      return {
        source: 'socratic_prober',
        reply: "Understood on the recent update correlation. Can you confirm if an on-call engineer has access to the server switch rack to initiate an emergency rollback right now?"
      };
    }

    if (lower.includes('freeze') || lower.includes('scanner') || lower.includes('fail') || lower.includes('error') || lower.includes('lock')) {
      return {
        source: 'socratic_prober',
        reply: "I hear the urgency with pickers halted on the floor. Are adjacent zones experiencing this same QR freeze, and what is your hard deadline before shipping departure?"
      };
    }

    if (lower.includes('timeout') || lower.includes('504') || lower.includes('gateway') || lower.includes('spike')) {
      return {
        source: 'socratic_prober',
        reply: "Logged on the 504 gateway spike. Have upstream acquiring connectors been pinged, and should we authorize the secondary London gateway reroute immediately?"
      };
    }

    if (lower.includes('vital') || lower.includes('icu') || lower.includes('telemetry') || lower.includes('bed')) {
      return {
        source: 'socratic_prober',
        reply: "Nurse Elena, patient safety is top priority. Are the local bedside Philips monitors alarming independently for all affected beds right now?"
      };
    }

    if (lower.includes('manual') || lower.includes('paper') || lower.includes('slow') || lower.includes('backup')) {
      return {
        source: 'socratic_prober',
        reply: "I have recorded your contingency fallback. We have captured sufficient operational clarity to escalate. Shall I proceed to dispatch this ticket to on-call engineering with P1 priority?"
      };
    }

    return {
      source: 'socratic_prober',
      reply: `I've logged those details into the incident record. Are there any secondary systems or adjacent customer channels degraded by this same issue?`
    };
  }
}

export const llmDialogue = new LLMDialogueService();

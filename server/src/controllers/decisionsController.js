import { OpenAIDecisionsService } from '../services/openaiDecisionsService.js';
import { CONFIG } from '../config.js';

export class DecisionsController {
  /**
   * Fast Decisions API evaluation endpoint (model: gpt-6-luna)
   */
  static async evaluate(req, res, next) {
    try {
      const { input, questions } = req.body;
      if (!input || !questions || !Array.isArray(questions)) {
        return res.status(400).json({
          success: false,
          error: 'Payload requires "input" string/object and "questions" array.'
        });
      }
      const evaluation = await OpenAIDecisionsService.evaluate(input, questions);
      res.json(evaluation);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Mints an ephemeral session token for OpenAI Realtime Voice WebRTC
   * (Matches OpenAI's GPT-Live Realtime Voice specification)
   */
  static async createRealtimeSession(req, res, next) {
    try {
      if (CONFIG.OPENAI_API_KEY && CONFIG.OPENAI_API_KEY.startsWith('sk-')) {
        const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-realtime-preview-2024-10-01',
            voice: 'alloy',
            instructions: 'You are the SyncUp Autonomous Incident Intake Agent. Triage the caller problem with calm empathy and Socratic operational questioning.'
          })
        });

        if (response.ok) {
          const sessionData = await response.json();
          return res.json({
            success: true,
            source: 'live_openai_realtime',
            session: sessionData
          });
        }
      }

      // Local fallback session configuration
      res.json({
        success: true,
        source: 'local_voice_orchestrator',
        message: 'Using continuous local voice-to-voice orchestrator paired with GPT-6 Luna Decisions API.'
      });
    } catch (err) {
      next(err);
    }
  }
}

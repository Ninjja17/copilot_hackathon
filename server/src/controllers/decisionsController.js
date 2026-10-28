import { OpenAIDecisionsService } from '../services/openaiDecisionsService.js';

export class DecisionsController {
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
}

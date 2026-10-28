import { DispatchService } from '../services/dispatchService.js';

export class DispatchController {
  static async dispatch(req, res, next) {
    try {
      const ticketPayload = req.body;
      if (!ticketPayload || !ticketPayload.ticketId) {
        return res.status(400).json({
          success: false,
          error: 'Valid ticket payload with ticketId is required.'
        });
      }
      const dispatchResult = await DispatchService.dispatchIncident(ticketPayload);
      res.json({ success: true, data: dispatchResult });
    } catch (err) {
      next(err);
    }
  }
}

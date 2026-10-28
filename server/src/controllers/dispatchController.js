import { DispatchService } from '../services/dispatchService.js';

export class DispatchController {
  static async dispatch(req, res, next) {
    try {
      const ticketPayload = req.body.ticket || req.body;
      if (!ticketPayload || (!ticketPayload.ticketId && !ticketPayload.id)) {
        return res.status(400).json({
          success: false,
          error: 'Valid ticket payload with ticketId is required.'
        });
      }

      if (!ticketPayload.ticketId && ticketPayload.id) {
        ticketPayload.ticketId = ticketPayload.id;
      }

      const dispatchResult = await DispatchService.dispatchIncident(ticketPayload);
      res.json({ success: true, ...dispatchResult });
    } catch (err) {
      next(err);
    }
  }
}

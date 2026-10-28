import { DispatchService } from '../services/dispatchService.js';

export class DispatchController {
  // Generic dispatch router
  static async dispatch(req, res, next) {
    try {
      const ticketPayload = req.body.ticket || req.body;
      const channel = req.body.channel || ticketPayload.channel || 'slack';

      if (!ticketPayload || (!ticketPayload.ticketId && !ticketPayload.id)) {
        return res.status(400).json({
          success: false,
          error: 'Valid ticket payload with ticketId is required.'
        });
      }

      if (!ticketPayload.ticketId && ticketPayload.id) {
        ticketPayload.ticketId = ticketPayload.id;
      }

      const result = await DispatchService.dispatchIncident(ticketPayload, channel);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // Dedicated Slack endpoint
  static async dispatchSlack(req, res, next) {
    try {
      const ticketPayload = req.body.ticket || req.body;
      if (!ticketPayload.ticketId && ticketPayload.id) ticketPayload.ticketId = ticketPayload.id;
      const result = await DispatchService.dispatchToSlack(ticketPayload);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // Dedicated Email endpoint
  static async dispatchEmail(req, res, next) {
    try {
      const ticketPayload = req.body.ticket || req.body;
      if (!ticketPayload.ticketId && ticketPayload.id) ticketPayload.ticketId = ticketPayload.id;
      const result = await DispatchService.dispatchToEmail(ticketPayload);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // Dedicated SMS endpoint
  static async dispatchSMS(req, res, next) {
    try {
      const ticketPayload = req.body.ticket || req.body;
      if (!ticketPayload.ticketId && ticketPayload.id) ticketPayload.ticketId = ticketPayload.id;
      const result = await DispatchService.dispatchToSMS(ticketPayload);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // Audit trail endpoint
  static async getAudit(req, res, next) {
    try {
      const { ticketId } = req.params;
      const auditTrail = DispatchService.getAuditTrail(ticketId);
      res.json({ success: true, ticketId, auditTrail });
    } catch (err) {
      next(err);
    }
  }
}

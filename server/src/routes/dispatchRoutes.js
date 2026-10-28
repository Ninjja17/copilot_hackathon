import { Router } from 'express';
import { DispatchController } from '../controllers/dispatchController.js';

const router = Router();

// Generic dispatch with channel selector
router.post('/', DispatchController.dispatch);

// Dedicated multi-channel dispatch routes
router.post('/slack', DispatchController.dispatchSlack);
router.post('/email', DispatchController.dispatchEmail);
router.post('/sms', DispatchController.dispatchSMS);

// Audit trail route
router.get('/audit/:ticketId', DispatchController.getAudit);

export default router;

import { Router } from 'express';
import { incidentsController } from '../controllers/incidentsController.js';

const router = Router();

// Retrieve all tickets / scenarios
router.get('/', incidentsController.getTickets);
router.get('/tickets', incidentsController.getTickets);
router.get('/scenarios', incidentsController.getTickets);

// Retrieve single ticket with its conversation history and epistemic claims
router.get('/tickets/:id', incidentsController.getTicketDetails);
router.get('/scenarios/:id', incidentsController.getTicketDetails);
router.get('/:id', incidentsController.getTicketDetails);

// Process a conversational voice or text turn through the Two-Brain AI pipeline
router.post('/tickets/:id/turn', incidentsController.processTurn);
router.post('/turn', (req, res) => {
  req.params.id = req.body.ticketId || req.body.scenarioId || 'INC-8492';
  return incidentsController.processTurn(req, res);
});

export default router;

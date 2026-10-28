import { Router } from 'express';
import { incidentsController } from '../controllers/incidentsController.js';

const router = Router();

// Retrieve all tickets
router.get('/', incidentsController.getTickets);
router.get('/tickets', incidentsController.getTickets);
router.get('/scenarios', incidentsController.getTickets);

// Create a new dynamic ticket on the fly
router.post('/', incidentsController.createTicket);
router.post('/tickets', incidentsController.createTicket);

// Clear all database records
router.delete('/clear', incidentsController.clearTickets);
router.post('/clear', incidentsController.clearTickets);

// Retrieve single ticket details
router.get('/tickets/:id', incidentsController.getTicketDetails);
router.get('/scenarios/:id', incidentsController.getTicketDetails);
router.get('/:id', incidentsController.getTicketDetails);

// Process a conversational speech or text turn
router.post('/tickets/:id/turn', incidentsController.processTurn);
router.post('/turn', (req, res) => {
  return incidentsController.processTurn(req, res);
});

export default router;

import { Router } from 'express';
import { IncidentsController } from '../controllers/incidentsController.js';

const router = Router();

router.get('/', IncidentsController.getAllIncidents);
router.get('/:id', IncidentsController.getIncidentById);
router.post('/turn', IncidentsController.processTurn);

export default router;

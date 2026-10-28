import { Router } from 'express';
import { DecisionsController } from '../controllers/decisionsController.js';

const router = Router();

router.post('/evaluate', DecisionsController.evaluate);

export default router;

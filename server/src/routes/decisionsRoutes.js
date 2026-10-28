import { Router } from 'express';
import { DecisionsController } from '../controllers/decisionsController.js';

const router = Router();

// Fast Decisions API evaluation (GPT-6 Luna)
router.post('/evaluate', DecisionsController.evaluate);

// Ephemeral Session minting for OpenAI Realtime Voice
router.post('/realtime-session', DecisionsController.createRealtimeSession);
router.get('/session', DecisionsController.createRealtimeSession);

export default router;

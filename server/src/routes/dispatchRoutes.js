import { Router } from 'express';
import { DispatchController } from '../controllers/dispatchController.js';

const router = Router();

router.post('/', DispatchController.dispatch);

export default router;

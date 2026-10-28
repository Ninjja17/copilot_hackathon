import express from 'express';
import cors from 'cors';
import { CONFIG } from './config.js';
import incidentsRoutes from './routes/incidentsRoutes.js';
import decisionsRoutes from './routes/decisionsRoutes.js';
import dispatchRoutes from './routes/dispatchRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }));
  app.use(express.json());

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      system: 'SyncUp Incident Intake API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // API Routes
  app.use('/api/incidents', incidentsRoutes);
  app.use('/api/decisions', decisionsRoutes);
  app.use('/api/dispatch', dispatchRoutes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

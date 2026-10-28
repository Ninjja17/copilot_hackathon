import express from 'express';
import cors from 'cors';
import { CONFIG } from './config.js';
import db from './db/database.js';
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

  // Health Check & Database Status
  app.get('/api/health', (req, res) => {
    let dbStatus = 'healthy';
    let ticketCount = 0;
    try {
      ticketCount = db.prepare('SELECT COUNT(*) as count FROM tickets').get().count;
    } catch (e) {
      dbStatus = 'degraded';
    }

    res.json({
      status: 'healthy',
      database: dbStatus,
      persistedTickets: ticketCount,
      system: 'SyncUp Incident Intake & Decisions API',
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

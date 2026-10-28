import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TriageEngine } from '../services/triageEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scenariosPath = path.join(__dirname, '../data/scenariosData.json');

export class IncidentsController {
  static async getAllIncidents(req, res, next) {
    try {
      const data = await fs.readFile(scenariosPath, 'utf-8');
      const incidents = JSON.parse(data);
      res.json({ success: true, count: incidents.length, data: incidents });
    } catch (err) {
      next(err);
    }
  }

  static async getIncidentById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await fs.readFile(scenariosPath, 'utf-8');
      const incidents = JSON.parse(data);
      const incident = incidents.find(i => i.id === id || i.ticketId === id);
      if (!incident) {
        return res.status(404).json({ success: false, error: 'Incident scenario not found.' });
      }
      res.json({ success: true, data: incident });
    } catch (err) {
      next(err);
    }
  }

  static async processTurn(req, res, next) {
    try {
      const { message, incidentContext } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({ success: false, error: 'Message text is required.' });
      }
      const triageResult = TriageEngine.analyzeInput(message, incidentContext);
      res.json({ success: true, ...triageResult });
    } catch (err) {
      next(err);
    }
  }
}

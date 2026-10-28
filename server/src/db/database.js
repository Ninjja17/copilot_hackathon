import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'syncup.db');
const db = new Database(dbPath);

// Enable WAL mode for ultra-fast concurrent reads and writes
db.pragma('journal_mode = WAL');

// Initialize schema (No hardcoded pre-scenarios)
db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    scenario_id TEXT,
    title TEXT NOT NULL,
    subtitle TEXT,
    department TEXT,
    target_department TEXT,
    urgency INTEGER DEFAULT 5,
    sufficient_detail REAL DEFAULT 0.5,
    status TEXT DEFAULT 'OPEN',
    matched_sop TEXT,
    impact TEXT,
    reporter_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    dispatched_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS conversation_turns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT NOT NULL,
    role TEXT NOT NULL,
    sender TEXT NOT NULL,
    body TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS epistemic_claims (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    text TEXT NOT NULL,
    type TEXT NOT NULL,
    confidence REAL DEFAULT 0.90,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS dispatch_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT NOT NULL,
    target_queue TEXT NOT NULL,
    webhook_url TEXT,
    webhook_status TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    dispatched_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

/**
 * Wipe pre-scenarios so database starts clean with no predetermined teams
 */
export function clearAllPreScenarios() {
  db.prepare('DELETE FROM conversation_turns').run();
  db.prepare('DELETE FROM epistemic_claims').run();
  db.prepare('DELETE FROM dispatch_audit').run();
  db.prepare('DELETE FROM tickets').run();
  console.log('[DB] Database wiped clean. No pre-set scenarios or fixed teams stored.');
}

export default db;

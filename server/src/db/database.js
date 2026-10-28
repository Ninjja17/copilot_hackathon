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

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    scenario_id TEXT UNIQUE,
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

// Auto-seed initial enterprise scenarios if database is empty
const ticketCount = db.prepare('SELECT COUNT(*) as count FROM tickets').get().count;

if (ticketCount === 0) {
  const seedFile = path.resolve(__dirname, '../data/scenariosData.json');
  if (fs.existsSync(seedFile)) {
    try {
      const scenarios = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
      const insertTicket = db.prepare(`
        INSERT INTO tickets (
          id, scenario_id, title, subtitle, department, target_department,
          urgency, sufficient_detail, status, matched_sop, impact, reporter_json
        ) VALUES (
          @ticketId, @id, @title, @subtitle, @department, @targetDepartment,
          @urgency, @sufficientDetail, 'TRIAGING', @matchedSop, @impact, @reporterJson
        )
      `);

      const insertTurn = db.prepare(`
        INSERT INTO conversation_turns (ticket_id, role, sender, body)
        VALUES (?, ?, ?, ?)
      `);

      const insertClaim = db.prepare(`
        INSERT INTO epistemic_claims (id, ticket_id, text, type, confidence)
        VALUES (?, ?, ?, ?, ?)
      `);

      const seedAll = db.transaction(() => {
        for (const sc of scenarios) {
          insertTicket.run({
            ticketId: sc.ticketId,
            id: sc.id,
            title: sc.title,
            subtitle: sc.subtitle,
            department: sc.department,
            targetDepartment: sc.targetDepartment,
            urgency: sc.urgency,
            sufficientDetail: sc.sufficientDetail,
            matchedSop: sc.matchedSop,
            impact: sc.impact,
            reporterJson: JSON.stringify(sc.reporter)
          });

          // Seed initial turns
          insertTurn.run(sc.ticketId, 'reporter', sc.reporter.name, sc.initialReport);
          insertTurn.run(sc.ticketId, 'agent', 'SyncUp Intake Agent', sc.initialAgentQuestion);

          // Seed claims
          if (Array.isArray(sc.claims)) {
            for (const c of sc.claims) {
              const claimId = `${sc.ticketId}_claim_${c.id}`;
              insertClaim.run(claimId, sc.ticketId, c.text, c.type, c.confidence);
            }
          }
        }
      });

      seedAll();
      console.log(`[DB] Successfully seeded ${scenarios.length} incident scenarios into SQLite database at: ${dbPath}`);
    } catch (err) {
      console.error('[DB] Error seeding database:', err);
    }
  }
}

export default db;

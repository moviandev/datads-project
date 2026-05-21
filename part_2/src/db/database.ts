import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../../data.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ad_performance (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      ad_id        TEXT    NOT NULL,
      campaign_id  TEXT    NOT NULL,
      platform     TEXT    NOT NULL,
      date         TEXT    NOT NULL,
      impressions  INTEGER NOT NULL DEFAULT 0,
      clicks       INTEGER NOT NULL DEFAULT 0,
      spend        REAL    NOT NULL DEFAULT 0,
      revenue      REAL    NOT NULL DEFAULT 0,
      conversions  INTEGER NOT NULL DEFAULT 0,
      ingested_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(campaign_id, date, platform)
    );
    CREATE INDEX IF NOT EXISTS idx_platform ON ad_performance(platform);
    CREATE INDEX IF NOT EXISTS idx_date     ON ad_performance(date);
    CREATE INDEX IF NOT EXISTS idx_campaign ON ad_performance(campaign_id);
  `);
}

export function closeDb(): void {
  if (db) db.close();
}

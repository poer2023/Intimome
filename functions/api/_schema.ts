let schemaEnsured = false;

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  google_sub TEXT UNIQUE,
  email TEXT,
  picture_url TEXT,
  provider TEXT DEFAULT 'local',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

CREATE TABLE IF NOT EXISTS session_logs (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  type TEXT NOT NULL,
  partner_name TEXT,
  location TEXT NOT NULL,
  positions TEXT NOT NULL,
  rating INTEGER NOT NULL,
  mood TEXT NOT NULL,
  tags TEXT,
  notes TEXT,
  orgasm_reached INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_logs_user_id ON session_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_date ON session_logs(date);
`;

export async function ensureSchema(db: D1Database): Promise<void> {
  if (schemaEnsured) return;
  try {
    const statements = SCHEMA_SQL
      .split(';')
      .map(s => s.trim())
      .filter(Boolean);

    for (const stmt of statements) {
      await db.prepare(stmt).run();
    }
    schemaEnsured = true;
  } catch (error) {
    console.error('ensureSchema error:', error);
    throw error;
  }
}

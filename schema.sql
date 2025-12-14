-- D1 Database Schema for IntimDiary
-- Run: npx wrangler d1 execute intimome-db --remote --file=./schema.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    google_sub TEXT UNIQUE, -- Google OIDC subject
    email TEXT,
    picture_url TEXT,
    provider TEXT DEFAULT 'local',
    countdown_target TEXT, -- Countdown timer target datetime
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Session logs table
CREATE TABLE IF NOT EXISTS session_logs (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    type TEXT NOT NULL,
    partner_name TEXT,
    location TEXT NOT NULL,
    positions TEXT NOT NULL,  -- JSON array stored as text
    rating INTEGER NOT NULL,
    mood TEXT NOT NULL,
    tags TEXT,  -- JSON array stored as text
    notes TEXT,
    orgasm_reached INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_logs_user_id ON session_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_date ON session_logs(date);

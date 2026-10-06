CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ADMIN',
  created_at TEXT NOT NULL
);
CREATE TABLE tattoo_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);
CREATE TABLE tattoo_works (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES tattoo_categories(id),
  description TEXT NOT NULL,
  work_date TEXT,
  published INTEGER NOT NULL DEFAULT 0,
  featured INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE tattoo_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  work_id INTEGER NOT NULL REFERENCES tattoo_works(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  is_cover INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client TEXT NOT NULL,
  phone TEXT NOT NULL,
  start_at TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  style TEXT NOT NULL,
  description TEXT NOT NULL,
  notes TEXT DEFAULT '',
  status TEXT NOT NULL CHECK(status IN ('SOLICITADO','CONFIRMADO','CONCLUÍDO','CANCELADO')),
  created_at TEXT NOT NULL
);
CREATE TABLE tattoo_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  style TEXT NOT NULL,
  body_region TEXT NOT NULL,
  approximate_size TEXT NOT NULL,
  idea TEXT NOT NULL,
  availability TEXT NOT NULL,
  reference_url TEXT,
  status TEXT NOT NULL DEFAULT 'NOVA',
  created_at TEXT NOT NULL
);
CREATE TABLE contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_works_published ON tattoo_works(published, sort_order);
CREATE INDEX idx_appointments_start ON appointments(start_at);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

ALTER TABLE tattoo_categories ADD COLUMN description TEXT NOT NULL DEFAULT '';
CREATE TABLE artists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  specialties TEXT NOT NULL,
  bio TEXT NOT NULL,
  image_url TEXT NOT NULL,
  signature TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);
ALTER TABLE appointments ADD COLUMN artist_id INTEGER REFERENCES artists(id);
CREATE INDEX idx_appointments_artist_start ON appointments(artist_id,start_at);

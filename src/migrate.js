import fs from 'node:fs';
import path from 'node:path';
import { db } from './db.js';

const dir = path.resolve('src/migrations');
db.exec('CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)');
for (const name of fs.readdirSync(dir).filter(x => x.endsWith('.sql')).sort()) {
  const done = db.prepare('SELECT 1 FROM migrations WHERE name=?').get(name);
  if (done) continue;
  const sql = fs.readFileSync(path.join(dir, name), 'utf8');
  db.exec('BEGIN');
  try {
    db.exec(sql);
    db.prepare('INSERT INTO migrations(name,applied_at) VALUES(?,?)').run(name, new Date().toISOString());
    db.exec('COMMIT');
    console.log(`Migration aplicada: ${name}`);
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}

import path from 'node:path';
import fs from 'node:fs';

function loadEnv() {
  const file = path.resolve('.env');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match && process.env[match[1].trim()] === undefined) process.env[match[1].trim()] = match[2].trim();
  }
}
loadEnv();

export const config = {
  port: Number(process.env.PORT || 4187),
  sessionSecret: process.env.SESSION_SECRET || 'dev-only-change-this-secret',
  adminEmail: process.env.ADMIN_EMAIL || 'artista@arcuz.local',
  adminPassword: process.env.ADMIN_PASSWORD || 'ArcuzDemo2026!',
  dbPath: path.resolve(process.env.DATABASE_PATH || './data/arcuz.sqlite'),
  uploadDir: path.resolve(process.env.UPLOAD_DIR || './data/uploads'),
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 8),
  whatsapp: process.env.WHATSAPP_NUMBER || '5511999999999'
};

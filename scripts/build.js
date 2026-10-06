import { access, readFile } from 'node:fs/promises';
const required = ['public/index.html','public/styles.css','public/styles-v3.css','public/styles-v4.css','public/media/tattoo-hero.mp4','public/app.js','public/admin.html','public/admin-v3.css','public/admin-v4.css','public/admin.js','src/server.js'];
for (const file of required) await access(file);
const html = await readFile('public/index.html','utf8');
if (!html.includes('ARCUZ TATTOO')) throw new Error('Marca não encontrada no build.');
console.log(`Build validado: ${required.length} arquivos essenciais presentes.`);

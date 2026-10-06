import bcrypt from 'bcryptjs';
import { db, get } from './db.js';
import { config } from './config.js';
import './migrate.js';

const now = new Date().toISOString();
if (!get('SELECT id FROM users LIMIT 1')) {
  db.prepare('INSERT INTO users(name,email,password_hash,role,created_at) VALUES(?,?,?,?,?)')
    .run('Artista ARCUZ', config.adminEmail.toLowerCase(), await bcrypt.hash(config.adminPassword, 12), 'ADMIN', now);
}
const cats = ['Blackwork','Fine Line','Realismo','Old School','Oriental','Geométrico','Minimalista','Lettering','Colorido'];
const slug = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-');
for (const name of cats) db.prepare('INSERT OR IGNORE INTO tattoo_categories(name,slug) VALUES(?,?)').run(name,slug(name));
const categoryDescriptions={
  Blackwork:'Para quem encontra força no contraste. Massas de preto, respiros e textura criam uma presença quase ritual, desenhada para acompanhar músculos, dobras e o modo como o corpo ocupa o espaço.',
  'Fine Line':'Delicadeza não é ausência de intenção. Linhas finas registram lembranças, vínculos e pequenos símbolos com silêncio visual, respeitando a escala e o envelhecimento natural de cada traço.',
  Realismo:'Uma forma de manter perto um rosto, um instante ou algo que o tempo não deveria apagar. Luz, sombra e textura são reconstruídas para preservar expressão e profundidade sem perder a leitura na pele.',
  'Old School':'Símbolos diretos para histórias que merecem ser ditas sem rodeios. Contorno firme, composição clara e cor marcante transformam coragem, saudade, liberdade e pertencimento em imagens feitas para durar.',
  Oriental:'Mais do que figuras isoladas, é uma narrativa que percorre o corpo. Movimento, vento, água e símbolos tradicionais se conectam em grandes composições guiadas pela anatomia e pelo significado de quem as veste.',
  'Geométrico':'Ordem, repetição e equilíbrio para quem enxerga sentido nas estruturas. Cada eixo responde ao corpo, criando uma imagem precisa que muda sutilmente conforme você se move.',
  Minimalista:'Quando uma pequena forma consegue guardar uma história inteira. O essencial é desenhado com intenção, escala responsável e espaço suficiente para que o símbolo continue claro com o passar dos anos.',
  Lettering:'Palavras também têm corpo. Cada letra é construída a partir do tom da mensagem, da personalidade de quem a carrega e do lugar onde será lida — como voz transformada em traço.',
  Colorido:'Para memórias e identidades que pedem intensidade. A paleta nasce do sentimento do projeto e é equilibrada com contraste, tom de pele e composição para continuar vibrante sem perder profundidade.'
};
for(const [name,description] of Object.entries(categoryDescriptions)) db.prepare('UPDATE tattoo_categories SET description=? WHERE name=?').run(description,name);

if (!get('SELECT id FROM tattoo_works LIMIT 1')) {
  const photos = [
    ['Silêncio Botânico','Fine Line','Ramos delicados construídos para acompanhar o movimento natural do braço.','2026-08-14','https://images.pexels.com/photos/5088509/pexels-photo-5088509.jpeg?auto=compress&cs=tinysrgb&w=1400'],
    ['Guardião Noturno','Blackwork','Contraste denso, textura pontilhada e presença gráfica em grande escala.','2026-07-22','https://images.pexels.com/photos/29547855/pexels-photo-29547855.jpeg?auto=compress&cs=tinysrgb&w=1400'],
    ['Memória em Pele','Realismo','Retrato criado em camadas suaves de cinza, preservando luz e expressão.','2026-06-18','https://images.pexels.com/photos/29547857/pexels-photo-29547857.jpeg?auto=compress&cs=tinysrgb&w=1400'],
    ['Órbita','Geométrico','Geometria ritual e linhas de precisão em uma composição de movimento.','2026-05-09','https://images.pexels.com/photos/35833278/pexels-photo-35833278.jpeg?auto=compress&cs=tinysrgb&w=1400'],
    ['Pulso Antigo','Old School','Leitura contemporânea de símbolos clássicos, com traço firme e cor contida.','2026-04-12','https://images.pexels.com/photos/5088509/pexels-photo-5088509.jpeg?auto=compress&cs=tinysrgb&w=1400'],
    ['Entrelinhas','Lettering','Lettering desenhado exclusivamente para a anatomia e a história da cliente.','2026-03-27','https://images.pexels.com/photos/29547855/pexels-photo-29547855.jpeg?auto=compress&cs=tinysrgb&w=1400']
  ];
  const insertWork=db.prepare('INSERT INTO tattoo_works(title,category_id,description,work_date,published,featured,sort_order,created_at,updated_at) VALUES(?,?,?,?,1,?,?,?,?)');
  photos.forEach((p,i)=>{
    const cat=get('SELECT id FROM tattoo_categories WHERE name=?',p[1]);
    const result=insertWork.run(p[0],cat.id,p[2],p[3],i<3?1:0,i,now,now);
    db.prepare('INSERT INTO tattoo_images(work_id,url,alt_text,is_cover,sort_order) VALUES(?,?,?,1,0)').run(result.lastInsertRowid,p[4],`${p[0]} — trabalho demonstrativo`);
  });
}
const artists=[
  ['Rafael Arcuz','Direção artística · Tatuador','Blackwork · Geométrico · Grandes projetos','Constrói peças de alto contraste a partir do movimento, da musculatura e dos espaços de silêncio da pele.','https://images.pexels.com/photos/3914562/pexels-photo-3914562.jpeg?auto=compress&cs=tinysrgb&w=1200','A pele não é suporte. É parte do desenho.',0],
  ['Lia Nascimento','Tatuadora residente','Fine Line · Botânico · Lettering','Pesquisa delicadeza sem fragilidade: linhas leves, desenho botânico e letras criadas para acompanhar o corpo.','https://images.pexels.com/photos/4123895/pexels-photo-4123895.jpeg?auto=compress&cs=tinysrgb&w=1200','Precisão também pode ser afeto.',1],
  ['Caio Moura','Tatuador residente','Realismo · Preto e cinza','Trabalha memória, retrato e textura em composições de luz controlada e leitura duradoura.','https://images.pexels.com/photos/28991541/pexels-photo-28991541.jpeg?auto=compress&cs=tinysrgb&w=1200','Cada sombra precisa ter motivo.',2]
];
for(const a of artists) db.prepare('INSERT INTO artists(name,role,specialties,bio,image_url,signature,sort_order) SELECT ?,?,?,?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM artists WHERE name=?)').run(...a,a[0]);

const demoImages=[
  ['Silêncio Botânico','https://images.pexels.com/photos/8258889/pexels-photo-8258889.jpeg?auto=compress&cs=tinysrgb&w=1400'],
  ['Guardião Noturno','https://images.pexels.com/photos/8349189/pexels-photo-8349189.jpeg?auto=compress&cs=tinysrgb&w=1400'],
  ['Memória em Pele','https://images.pexels.com/photos/28742943/pexels-photo-28742943.jpeg?auto=compress&cs=tinysrgb&w=1400'],
  ['Órbita','https://images.pexels.com/photos/4750247/pexels-photo-4750247.jpeg?auto=compress&cs=tinysrgb&w=1400'],
  ['Pulso Antigo','https://images.pexels.com/photos/2126124/pexels-photo-2126124.jpeg?auto=compress&cs=tinysrgb&w=1400'],
  ['Entrelinhas','https://images.pexels.com/photos/10710995/pexels-photo-10710995.jpeg?auto=compress&cs=tinysrgb&w=1400']
];
for(const [title,url] of demoImages){const work=get('SELECT id FROM tattoo_works WHERE title=?',title);if(work)db.prepare('UPDATE tattoo_images SET url=? WHERE work_id=? AND is_cover=1').run(url,work.id)}
const extraWorks=[
  ['Linha de Horizonte','Minimalista','Um único gesto acompanha o pulso sem disputar atenção com a anatomia.','https://images.pexels.com/photos/16626427/pexels-photo-16626427.jpeg?auto=compress&cs=tinysrgb&w=1400'],
  ['Jardim Elétrico','Colorido','Paleta vibrante e contraste definido para manter leitura e energia sobre a pele.','https://images.pexels.com/photos/12038943/pexels-photo-12038943.jpeg?auto=compress&cs=tinysrgb&w=1400'],
  ['Fluxo do Vento','Oriental','Movimento contínuo e composição vertical guiada pelo eixo natural do braço.','https://images.pexels.com/photos/6503747/pexels-photo-6503747.jpeg?auto=compress&cs=tinysrgb&w=1400']
];
for(const [title,category,description,url] of extraWorks){
  if(get('SELECT id FROM tattoo_works WHERE title=?',title))continue;
  const cat=get('SELECT id FROM tattoo_categories WHERE name=?',category);
  const result=db.prepare('INSERT INTO tattoo_works(title,category_id,description,work_date,published,featured,sort_order,created_at,updated_at) VALUES(?,?,?,?,1,0,?,?,?)').run(title,cat.id,description,'2026-09-12',20,now,now);
  db.prepare('INSERT INTO tattoo_images(work_id,url,alt_text,is_cover,sort_order) VALUES(?,?,?,1,0)').run(result.lastInsertRowid,url,`${title} — exemplo demonstrativo`);
}
const settings={studio_name:'ARCUZ TATTOO',tagline:'Arte que fica. Identidade que permanece.',whatsapp:config.whatsapp,instagram:'@arcuz.tattoo',address:'Endereço demonstrativo — São Paulo, SP',artist_name:'Rafael Arcuz',artist_bio:'Artista fictício especializado em composições autorais, blackwork e precisão gráfica.'};
for(const [key,value] of Object.entries(settings)) db.prepare('INSERT OR IGNORE INTO site_settings(key,value) VALUES(?,?)').run(key,value);
if(!get('SELECT id FROM appointments LIMIT 1')) {
  const d=new Date(); d.setDate(d.getDate()+2); d.setHours(14,0,0,0);
  db.prepare('INSERT INTO appointments(client,phone,start_at,duration_minutes,style,description,notes,status,created_at) VALUES(?,?,?,?,?,?,?,?,?)').run('Cliente demonstração','(11) 99999-9999',d.toISOString(),180,'Blackwork','Antebraço autoral','Confirmar desenho na véspera','CONFIRMADO',now);
}
console.log('Seed concluído.');

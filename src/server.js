import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import { all, get, run } from './db.js';
import './migrate.js';

fs.mkdirSync(config.uploadDir,{recursive:true});
const app=express();
app.disable('x-powered-by');
app.use(helmet({contentSecurityPolicy:false,crossOriginResourcePolicy:{policy:'cross-origin'}}));
app.use(express.json({limit:'1mb'}));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser(config.sessionSecret));
app.use('/uploads',express.static(config.uploadDir,{maxAge:'7d'}));
app.use(express.static(path.resolve('public'),{extensions:['html']}));

const clean=v=>String(v??'').trim();
const required=(obj,fields)=>fields.every(k=>clean(obj[k]));
const publicWorkSql=`SELECT w.id,w.title,w.category_id,w.description,w.work_date,w.published,w.featured,w.sort_order,c.name category,c.slug,
 (SELECT url FROM tattoo_images WHERE work_id=w.id ORDER BY is_cover DESC,sort_order,id LIMIT 1) cover,
 (SELECT json_group_array(json_object('id',id,'url',url,'alt',alt_text,'cover',is_cover)) FROM tattoo_images WHERE work_id=w.id) images
 FROM tattoo_works w JOIN tattoo_categories c ON c.id=w.category_id`;

function session(req){
  const token=req.signedCookies.arcuz_session;
  if(!token)return null;
  return get(`SELECT s.id,u.id user_id,u.name,u.email,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>?`,token,new Date().toISOString());
}
function auth(req,res,next){const s=session(req);if(!s)return res.status(401).json({error:'Autenticação necessária.'});req.user=s;next();}
function issueSession(res,userId){
  const token=crypto.randomBytes(32).toString('hex');
  const expires=new Date(Date.now()+7*864e5);
  run('DELETE FROM sessions WHERE expires_at<?',new Date().toISOString());
  run('INSERT INTO sessions(id,user_id,expires_at,created_at) VALUES(?,?,?,?)',token,userId,expires.toISOString(),new Date().toISOString());
  res.cookie('arcuz_session',token,{signed:true,httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production',expires});
}

const storage=multer.diskStorage({destination:config.uploadDir,filename:(_r,f,cb)=>cb(null,`${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(f.originalname).toLowerCase()}`)});
const upload=multer({storage,limits:{fileSize:config.maxUploadMb*1024*1024,files:8},fileFilter:(_r,f,cb)=>cb(null,['image/jpeg','image/png','image/webp'].includes(f.mimetype))});

app.get('/api/health',(_req,res)=>res.json({status:'ok',service:'arcuz-tattoo',time:new Date().toISOString()}));
app.get('/api/public',(req,res)=>{
  const category=clean(req.query.category);
  const works=all(`${publicWorkSql} WHERE w.published=1 ${category?'AND c.slug=?':''} ORDER BY w.sort_order,w.created_at DESC`,...(category?[category]:[])).map(w=>({...w,images:JSON.parse(w.images||'[]')}));
  const categories=all('SELECT id,name,slug,description FROM tattoo_categories ORDER BY name');
  const artists=all('SELECT * FROM artists WHERE active=1 ORDER BY sort_order,name');
  const settings=Object.fromEntries(all('SELECT key,value FROM site_settings').map(x=>[x.key,x.value]));
  res.json({works,categories,artists,settings});
});
app.post('/api/consultations',(req,res)=>{
  if(!required(req.body,['name','whatsapp','artist_id','start_at','description']))return res.status(400).json({error:'Preencha nome, WhatsApp, artista, data e assunto.'});
  const b=req.body,start=new Date(b.start_at);if(Number.isNaN(start.getTime()))return res.status(400).json({error:'Escolha uma data válida.'});
  const artist=get('SELECT id FROM artists WHERE id=? AND active=1',Number(b.artist_id));if(!artist)return res.status(400).json({error:'Artista não encontrado.'});
  const result=run("INSERT INTO appointments(client,phone,start_at,duration_minutes,style,description,notes,status,created_at,artist_id) VALUES(?,?,?,?,?,?,?,'SOLICITADO',?,?)",clean(b.name),clean(b.whatsapp),start.toISOString(),45,'CONVERSA',clean(b.description),clean(b.availability),new Date().toISOString(),artist.id);
  res.status(201).json({ok:true,id:Number(result.lastInsertRowid),message:'Pedido de conversa recebido. O estúdio confirmará o horário pelo WhatsApp.'});
});
app.post('/api/requests',(req,res)=>{
  if(!required(req.body,['name','whatsapp','style','body_region','approximate_size','idea','availability']))return res.status(400).json({error:'Preencha todos os campos obrigatórios.'});
  const b=req.body;
  const result=run(`INSERT INTO tattoo_requests(name,whatsapp,email,style,body_region,approximate_size,idea,availability,reference_url,status,created_at) VALUES(?,?,?,?,?,?,?,?,?,'NOVA',?)`,clean(b.name),clean(b.whatsapp),clean(b.email),clean(b.style),clean(b.body_region),clean(b.approximate_size),clean(b.idea),clean(b.availability),clean(b.reference_url),new Date().toISOString());
  res.status(201).json({ok:true,id:Number(result.lastInsertRowid),message:'Sua ideia chegou ao estúdio. Retornaremos pelo WhatsApp.'});
});
app.post('/api/contact',(req,res)=>{
  if(!required(req.body,['name','phone','message']))return res.status(400).json({error:'Informe nome, telefone e mensagem.'});
  const b=req.body; run('INSERT INTO contact_messages(name,phone,email,message,created_at) VALUES(?,?,?,?,?)',clean(b.name),clean(b.phone),clean(b.email),clean(b.message),new Date().toISOString());
  res.status(201).json({ok:true,message:'Mensagem recebida. Obrigado pelo contato.'});
});
app.post('/api/auth/login',async(req,res)=>{
  const user=get('SELECT * FROM users WHERE email=?',clean(req.body.email).toLowerCase());
  if(!user||!await bcrypt.compare(String(req.body.password||''),user.password_hash))return res.status(401).json({error:'E-mail ou senha inválidos.'});
  issueSession(res,user.id); res.json({ok:true,user:{name:user.name,email:user.email}});
});
app.post('/api/auth/logout',(req,res)=>{const token=req.signedCookies.arcuz_session;if(token)run('DELETE FROM sessions WHERE id=?',token);res.clearCookie('arcuz_session');res.json({ok:true});});
app.get('/api/auth/me',(req,res)=>{const s=session(req);if(!s)return res.status(401).json({error:'Não autenticado.'});res.json({user:{name:s.name,email:s.email,role:s.role}});});

app.get('/api/admin/overview',auth,(_req,res)=>res.json({
  counts:{works:get('SELECT count(*) total FROM tattoo_works').total,published:get('SELECT count(*) total FROM tattoo_works WHERE published=1').total,requests:get("SELECT count(*) total FROM tattoo_requests WHERE status='NOVA'").total,appointments:get("SELECT count(*) total FROM appointments WHERE status IN ('SOLICITADO','CONFIRMADO') AND start_at>=?",new Date().toISOString()).total},
  requests:all('SELECT * FROM tattoo_requests ORDER BY created_at DESC LIMIT 20'),
  messages:all('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 20')
}));
app.get('/api/admin/works',auth,(_req,res)=>res.json({works:all(`${publicWorkSql} ORDER BY w.sort_order,w.created_at DESC`).map(w=>({...w,images:JSON.parse(w.images||'[]')})),categories:all('SELECT * FROM tattoo_categories ORDER BY name')}));
app.put('/api/admin/categories/:id',auth,(req,res)=>{if(!clean(req.body.description))return res.status(400).json({error:'A legenda do estilo não pode ficar vazia.'});run('UPDATE tattoo_categories SET description=? WHERE id=?',clean(req.body.description),Number(req.params.id));res.json({ok:true});});
app.get('/api/admin/artists',auth,(_req,res)=>res.json({artists:all('SELECT * FROM artists ORDER BY sort_order,name')}));
app.put('/api/admin/artists/:id',auth,upload.single('image'),(req,res)=>{const b=req.body,current=get('SELECT * FROM artists WHERE id=?',Number(req.params.id));if(!current)return res.status(404).json({error:'Artista não encontrado.'});if(!required(b,['name','role','specialties','bio']))return res.status(400).json({error:'Preencha os dados essenciais do artista.'});const imageUrl=req.file?`/uploads/${req.file.filename}`:current.image_url;run('UPDATE artists SET name=?,role=?,specialties=?,bio=?,image_url=?,signature=?,sort_order=?,active=? WHERE id=?',clean(b.name),clean(b.role),clean(b.specialties),clean(b.bio),imageUrl,clean(b.signature),Number(b.sort_order||0),b.active==='true'||b.active==='1'?1:0,Number(req.params.id));res.json({ok:true,image_url:imageUrl});});
app.post('/api/admin/works',auth,upload.array('images',8),(req,res)=>{
  if(!required(req.body,['title','category_id','description']))return res.status(400).json({error:'Título, categoria e descrição são obrigatórios.'});
  const b=req.body,now=new Date().toISOString();
  const result=run('INSERT INTO tattoo_works(title,category_id,description,work_date,published,featured,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)',clean(b.title),Number(b.category_id),clean(b.description),clean(b.work_date)||null,b.published==='true'||b.published==='1'?1:0,b.featured==='true'||b.featured==='1'?1:0,Number(b.sort_order||0),now,now);
  const files=req.files||[];
  files.forEach((f,i)=>run('INSERT INTO tattoo_images(work_id,url,alt_text,is_cover,sort_order) VALUES(?,?,?,?,?)',result.lastInsertRowid,`/uploads/${f.filename}`,`${clean(b.title)} — imagem ${i+1}`,i===0?1:0,i));
  if(!files.length&&clean(b.image_url))run('INSERT INTO tattoo_images(work_id,url,alt_text,is_cover,sort_order) VALUES(?,?,?,1,0)',result.lastInsertRowid,clean(b.image_url),`${clean(b.title)} — capa`);
  res.status(201).json({ok:true,id:Number(result.lastInsertRowid)});
});
app.put('/api/admin/works/:id',auth,upload.array('images',8),(req,res)=>{
  if(!required(req.body,['title','category_id','description']))return res.status(400).json({error:'Dados incompletos.'});
  const b=req.body,id=Number(req.params.id);run('UPDATE tattoo_works SET title=?,category_id=?,description=?,work_date=?,published=?,featured=?,sort_order=?,updated_at=? WHERE id=?',clean(b.title),Number(b.category_id),clean(b.description),clean(b.work_date)||null,b.published==='true'||b.published==='1'?1:0,b.featured==='true'||b.featured==='1'?1:0,Number(b.sort_order||0),new Date().toISOString(),id);
  const files=req.files||[];if(files.length){if(b.replace_images==='true')run('DELETE FROM tattoo_images WHERE work_id=?',id);files.forEach((f,i)=>run('INSERT INTO tattoo_images(work_id,url,alt_text,is_cover,sort_order) VALUES(?,?,?,?,?)',id,`/uploads/${f.filename}`,`${clean(b.title)} — imagem ${i+1}`,i===0?1:0,i));}
  res.json({ok:true});
});
app.delete('/api/admin/works/:id',auth,(req,res)=>{run('DELETE FROM tattoo_works WHERE id=?',Number(req.params.id));res.json({ok:true});});
app.patch('/api/admin/requests/:id',auth,(req,res)=>{run('UPDATE tattoo_requests SET status=? WHERE id=?',clean(req.body.status),Number(req.params.id));res.json({ok:true});});

app.get('/api/admin/appointments',auth,(req,res)=>res.json({appointments:all('SELECT a.*,ar.name artist_name FROM appointments a LEFT JOIN artists ar ON ar.id=a.artist_id ORDER BY a.start_at'),artists:all('SELECT id,name FROM artists WHERE active=1 ORDER BY sort_order,name')}));
app.post('/api/admin/appointments',auth,(req,res)=>{
  const b=req.body;if(!required(b,['client','phone','start_at','duration_minutes','style','description','status']))return res.status(400).json({error:'Preencha os campos obrigatórios.'});
  const start=new Date(b.start_at),end=new Date(start.getTime()+Number(b.duration_minutes)*60000);
  const conflicts=all("SELECT id,client,start_at,duration_minutes FROM appointments WHERE status NOT IN ('CANCELADO','CONCLUÍDO')").filter(a=>{const s=new Date(a.start_at),e=new Date(s.getTime()+a.duration_minutes*60000);return start<e&&end>s});
  if(conflicts.length&&!b.allow_conflict)return res.status(409).json({error:`Conflito com ${conflicts[0].client}.`,conflicts});
  const result=run('INSERT INTO appointments(client,phone,start_at,duration_minutes,style,description,notes,status,created_at,artist_id) VALUES(?,?,?,?,?,?,?,?,?,?)',clean(b.client),clean(b.phone),start.toISOString(),Number(b.duration_minutes),clean(b.style),clean(b.description),clean(b.notes),clean(b.status),new Date().toISOString(),Number(b.artist_id)||null);
  res.status(201).json({ok:true,id:Number(result.lastInsertRowid)});
});
app.put('/api/admin/appointments/:id',auth,(req,res)=>{const b=req.body;run('UPDATE appointments SET client=?,phone=?,start_at=?,duration_minutes=?,style=?,description=?,notes=?,status=?,artist_id=? WHERE id=?',clean(b.client),clean(b.phone),new Date(b.start_at).toISOString(),Number(b.duration_minutes),clean(b.style),clean(b.description),clean(b.notes),clean(b.status),Number(b.artist_id)||null,Number(req.params.id));res.json({ok:true});});
app.delete('/api/admin/appointments/:id',auth,(req,res)=>{run('DELETE FROM appointments WHERE id=?',Number(req.params.id));res.json({ok:true});});
app.get('/api/admin/settings',auth,(_req,res)=>res.json({settings:Object.fromEntries(all('SELECT key,value FROM site_settings').map(x=>[x.key,x.value]))}));
app.put('/api/admin/settings',auth,(req,res)=>{for(const [k,v] of Object.entries(req.body))if(['studio_name','tagline','whatsapp','instagram','address','artist_name','artist_bio'].includes(k))run('INSERT INTO site_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',k,clean(v));res.json({ok:true});});

app.get('/admin',(_req,res)=>res.sendFile(path.resolve('public/admin.html')));
app.use('/api',(req,res)=>res.status(404).json({error:'Rota não encontrada.'}));
app.use((err,req,res,_next)=>{console.error(err);if(err instanceof multer.MulterError)return res.status(400).json({error:`Upload inválido: ${err.message}`});res.status(500).json({error:'Não foi possível concluir a operação.'});});
app.listen(config.port,'0.0.0.0',()=>console.log(`ARCUZ disponível em http://localhost:${config.port}`));

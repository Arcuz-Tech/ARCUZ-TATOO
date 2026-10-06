import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const port=4197;
let server;
let authCookie;
test.before(async()=>{
  fs.rmSync('./data/test.sqlite',{force:true});
  server=spawn(process.execPath,['src/seed.js'],{env:{...process.env,DATABASE_PATH:'./data/test.sqlite',PORT:String(port)},stdio:'ignore'});
  await new Promise((resolve,reject)=>{server.on('exit',code=>code===0?resolve():reject(new Error('seed failed')))});
  server=spawn(process.execPath,['src/server.js'],{env:{...process.env,DATABASE_PATH:'./data/test.sqlite',PORT:String(port)},stdio:'ignore'});
  for(let i=0;i<30;i++){try{const r=await fetch(`http://127.0.0.1:${port}/api/health`);if(r.ok)return}catch{}await new Promise(r=>setTimeout(r,100))}throw new Error('server not ready');
});
test.after(async()=>{
  if(server){server.kill();await new Promise(resolve=>server.once('exit',resolve));}
  for(const file of ['./data/test.sqlite','./data/test.sqlite-wal','./data/test.sqlite-shm']){
    try{fs.rmSync(file,{force:true})}catch{}
  }
});
test('health, portfólio, estilos e equipe pública',async()=>{assert.equal((await fetch(`http://127.0.0.1:${port}/api/health`)).status,200);const p=await (await fetch(`http://127.0.0.1:${port}/api/public`)).json();assert.ok(p.works.length>=9);assert.ok(p.categories.length>=9);assert.ok(p.categories.every(c=>c.description));assert.equal(p.artists.length,3)});
test('login, solicitação e painel',async()=>{const login=await fetch(`http://127.0.0.1:${port}/api/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'artista@arcuz.local',password:'ArcuzDemo2026!'})});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];const req=await fetch(`http://127.0.0.1:${port}/api/requests`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Teste',whatsapp:'11999999999',style:'Blackwork',body_region:'Braço',approximate_size:'15cm',idea:'Composição abstrata',availability:'Sábado'})});assert.equal(req.status,201);const overview=await fetch(`http://127.0.0.1:${port}/api/admin/overview`,{headers:{cookie}});assert.equal(overview.status,200);assert.ok((await overview.json()).counts.requests>=1)});
test('CRUD publicado com upload aparece no site',async()=>{
  const login=await fetch(`http://127.0.0.1:${port}/api/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'artista@arcuz.local',password:'ArcuzDemo2026!'})});authCookie=login.headers.get('set-cookie').split(';')[0];
  const current=await (await fetch(`http://127.0.0.1:${port}/api/admin/works`,{headers:{cookie:authCookie}})).json();
  const fd=new FormData();fd.set('title','Peça de validação');fd.set('category_id',String(current.categories[0].id));fd.set('description','Criada automaticamente no teste de integração.');fd.set('published','true');fd.set('sort_order','99');fd.append('images',new Blob([new Uint8Array([137,80,78,71])],{type:'image/png'}),'teste.png');
  const created=await fetch(`http://127.0.0.1:${port}/api/admin/works`,{method:'POST',headers:{cookie:authCookie},body:fd});assert.equal(created.status,201);const id=(await created.json()).id;
  const pub=await (await fetch(`http://127.0.0.1:${port}/api/public`)).json();assert.ok(pub.works.some(w=>w.id===id));
  const edited=await fetch(`http://127.0.0.1:${port}/api/admin/works/${id}`,{method:'PUT',headers:{cookie:authCookie,'Content-Type':'application/json'},body:JSON.stringify({title:'Peça validada',category_id:current.categories[0].id,description:'Editada no teste.',published:true,featured:false,sort_order:99})});assert.equal(edited.status,200);
  const removed=await fetch(`http://127.0.0.1:${port}/api/admin/works/${id}`,{method:'DELETE',headers:{cookie:authCookie}});assert.equal(removed.status,200);
});
test('contato, agenda e alerta de conflito',async()=>{
  const contact=await fetch(`http://127.0.0.1:${port}/api/contact`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Contato teste',phone:'1199999999',message:'Mensagem de integração'})});assert.equal(contact.status,201);
  const start=new Date(Date.now()+10*864e5);start.setHours(10,0,0,0);const appointment={client:'Cliente A',phone:'1199999999',start_at:start.toISOString(),duration_minutes:120,style:'Fine Line',description:'Teste',status:'CONFIRMADO'};
  const first=await fetch(`http://127.0.0.1:${port}/api/admin/appointments`,{method:'POST',headers:{cookie:authCookie,'Content-Type':'application/json'},body:JSON.stringify(appointment)});assert.equal(first.status,201);
  const conflict=await fetch(`http://127.0.0.1:${port}/api/admin/appointments`,{method:'POST',headers:{cookie:authCookie,'Content-Type':'application/json'},body:JSON.stringify({...appointment,client:'Cliente B'})});assert.equal(conflict.status,409);
});
test('pedido público de conversa entra na agenda',async()=>{
  const p=await (await fetch(`http://127.0.0.1:${port}/api/public`)).json();const start=new Date(Date.now()+15*864e5);
  const response=await fetch(`http://127.0.0.1:${port}/api/consultations`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Conversa teste',whatsapp:'11999999999',artist_id:p.artists[0].id,start_at:start.toISOString(),description:'Conhecer possibilidades de composição',availability:'Tardes'})});assert.equal(response.status,201);
  const agenda=await (await fetch(`http://127.0.0.1:${port}/api/admin/appointments`,{headers:{cookie:authCookie}})).json();assert.ok(agenda.appointments.some(a=>a.client==='Conversa teste'&&a.style==='CONVERSA'));
});

const state={works:[],categories:[],artists:[],settings:{},filter:''};
const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

async function load(category=''){
  let data;try{const r=await fetch(`/api/public${category?`?category=${encodeURIComponent(category)}`:''}`);if(!r.ok)throw new Error();data=await r.json()}catch{data=window.ARCUZ_DEMO_DATA||{works:[],categories:[],artists:[],settings:{}}}Object.assign(state,data);
  if(category)state.works=(window.ARCUZ_DEMO_DATA?.works||state.works).filter(w=>state.categories.find(c=>c.slug===category)?.name===w.category);
  state.filter=category;renderFilters();renderWorks();renderStyles();renderTeam();applySettings();
}
function renderFilters(){const box=$('.filters');box.innerHTML=`<button class="${!state.filter?'active':''}" data-filter="">Todos</button>`+state.categories.map(c=>`<button class="${state.filter===c.slug?'active':''}" data-filter="${esc(c.slug)}">${esc(c.name)}</button>`).join('');const active=state.categories.find(c=>c.slug===state.filter);$('.filter-note').textContent=active?.description||'Do gesto mínimo ao preto sólido: explore o acervo inteiro ou escolha uma linguagem.';}
function renderWorks(){const box=$('.gallery');box.innerHTML=state.works.length?state.works.map((w,i)=>`<article class="work-card" tabindex="0" data-id="${w.id}" aria-label="Abrir trabalho ${esc(w.title)}"><div class="work-image"><img src="${esc(w.cover)}" alt="${esc(w.title)}" loading="${i<3?'eager':'lazy'}"></div><div class="work-meta"><h3>${esc(w.title)}</h3><span>${esc(w.category)}</span><p>${esc(w.description)}</p></div></article>`).join(''):`<p class="empty">Nenhum trabalho publicado neste estilo.</p>`;}
function renderStyles(){const box=$('.style-strip');if(!box)return;box.innerHTML=state.categories.map((c,i)=>`<article class="style-card"><span class="num">${String(i+1).padStart(2,'0')}</span><h3>${esc(c.name)}</h3><p>${esc(c.description)}</p></article>`).join('')}
function renderTeam(){const box=$('.team-grid');if(!box)return;box.innerHTML=state.artists.map(a=>`<article class="artist-card"><img src="${esc(a.image_url)}" alt="Retrato demonstrativo de ${esc(a.name)}" loading="lazy"><div class="artist-overlay"><span class="role">${esc(a.role)}</span><h3>${esc(a.name)}</h3><p><strong>${esc(a.specialties)}</strong></p><p>${esc(a.bio)}</p><blockquote>“${esc(a.signature)}”</blockquote></div></article>`).join('');const select=$('#consultation-form select[name=artist_id]');select.innerHTML='<option value="">Escolha um artista</option>'+state.artists.map(a=>`<option value="${a.id}">${esc(a.name)} · ${esc(a.specialties)}</option>`).join('')}
function applySettings(){const s=state.settings;$('.address').textContent=s.address||'';$('.instagram').textContent=s.instagram||'';const wa=`https://wa.me/${s.whatsapp||''}?text=${encodeURIComponent('Olá! Conheci a ARCUZ Tattoo pelo site e gostaria de conversar sobre uma tatuagem.')}`;$('.whatsapp').href=wa;}
document.addEventListener('click',async e=>{
  const filter=e.target.closest('[data-filter]');if(filter){await load(filter.dataset.filter);}
  const card=e.target.closest('.work-card');if(card)openWork(Number(card.dataset.id));
});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('.work-card'))openWork(Number(e.target.dataset.id));});
function openWork(id){const w=state.works.find(x=>x.id===id);if(!w)return;$('.modal-content').innerHTML=`<div class="modal-grid"><img src="${esc(w.cover)}" alt="${esc(w.title)}"><div class="modal-copy"><p class="eyebrow">${esc(w.category)} · ${esc(w.work_date||'Acervo')}</p><h3>${esc(w.title)}</h3><p>${esc(w.description)}</p></div></div>`;$('#work-modal').showModal();}
$('.modal-close').onclick=()=>$('#work-modal').close();$('#work-modal').onclick=e=>{if(e.target===$('#work-modal'))e.target.close()};
$('.menu-btn').onclick=e=>{const nav=$('.topbar nav'),open=nav.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',open)};$$('.topbar nav a').forEach(a=>a.onclick=()=>$('.topbar nav').classList.remove('open'));
async function submit(form,url){const status=$('.form-status',form),button=$('button[type=submit]',form);status.textContent='Enviando…';button.disabled=true;try{const body=Object.fromEntries(new FormData(form));const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw new Error(data.error);status.textContent=data.message;form.reset();}catch(e){status.textContent=e.message||'Não foi possível enviar.'}finally{button.disabled=false}}
$('#request-form').onsubmit=e=>{e.preventDefault();submit(e.currentTarget,'/api/requests')};$('#contact-form').onsubmit=e=>{e.preventDefault();submit(e.currentTarget,'/api/contact')};
$('#consultation-form').onsubmit=e=>{e.preventDefault();submit(e.currentTarget,'/api/consultations')};
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('reveal')}),{threshold:.08});$$('.section-head,.style-card,.artist-card,.process li').forEach(el=>observer.observe(el));
if(matchMedia('(prefers-reduced-motion: reduce)').matches){const video=$('.hero video');video?.pause();video?.removeAttribute('autoplay')}
load().catch(()=>{$('.gallery').innerHTML='<p class="empty">Não foi possível carregar o portfólio agora.</p>'});

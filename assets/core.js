/* Rise Up MTech — core (gerado da separação do operations.html em páginas, 18/nov/2026) */

// ── Registros entre páginas ─────────────────────────────────────────────
// Antes, as 7 abas viviam no mesmo operations.html e se chamavam direto
// (switchTab, refreshAllWorkspaceSelectors...). Agora cada aba é uma
// página; o que precisa "avisar" a página atual passa por esses registros.
window.RU = window.RU || {};
RU.workspaceRefreshers = [];   // cada página põe aqui o loader de workspaces dela
RU.oauthListeners = [];        // callbacks chamados quando uma conexão OAuth volta
RU.PAGES = {"dashboard":"Overview","campanhas":"Campanhas","audiencias":"Audiências","desdobrador":"Desdobrador","criativos":"Criativos","status":"Status","bigtable":"Big Table"};
window.dataLayer = window.dataLayer || [];
// Página real = pageview real no GA4/GTM (GitHub Pages serve cada .html).
// Mantém o evento virtual_page_view que já existia, com o mesmo formato,
// pra não quebrar o trigger do GTM.
RU.trackPage = function(id){
  const label = RU.PAGES[id] || id;
  const title = 'Rise Up MTech — ' + label;
  document.title = title;
  window.dataLayer.push({ event: 'virtual_page_view', page_title: title, page_path: location.pathname, page_location: location.href });
};
RU.ready = function(fn){
  if(document.readyState === 'complete') fn(); else window.addEventListener('load', fn);
};

const STATUS_DATA=[
  {criativo:'Banner_300x250_V1',plat:'Google Ads',camp:'Awareness Q1',status:'implemented',id:'12839401',start:'01 Mar',end:'31 Mar',upd:'há 2h'},
  {criativo:'Banner_728x90_V1',plat:'Google Ads',camp:'Awareness Q1',status:'implemented',id:'12839402',start:'01 Mar',end:'31 Mar',upd:'há 2h'},
  {criativo:'Stories_1080x1920',plat:'Meta Ads',camp:'Performance — Leads',status:'implemented',id:'23948112',start:'03 Mar',end:'31 Mar',upd:'há 2h'},
  {criativo:'Feed_1080x1080',plat:'Meta Ads',camp:'Retargeting',status:'implemented',id:'23948113',start:'05 Mar',end:'28 Mar',upd:'há 3h'},
  {criativo:'Carrossel_V2',plat:'Meta Ads',camp:'Retargeting',status:'implemented',id:'23948120',start:'10 Mar',end:'31 Mar',upd:'há 3h'},
  {criativo:'Video_15s_V2',plat:'YouTube',camp:'Video Reach',status:'stand_by',id:'—',start:'15 Mar',end:'31 Mar',upd:'há 1h'},
  {criativo:'Bumper_6s',plat:'YouTube',camp:'Video Reach',status:'stand_by',id:'—',start:'15 Mar',end:'31 Mar',upd:'há 1h'},
  {criativo:'TopView_TK',plat:'TikTok Ads',camp:'TikTok — Gen Z',status:'implemented',id:'TK8812944',start:'01 Mar',end:'30 Mar',upd:'há 4h'},
  {criativo:'InFeed_TK_V1',plat:'TikTok Ads',camp:'TikTok — Gen Z',status:'implemented',id:'TK8812945',start:'01 Mar',end:'30 Mar',upd:'há 4h'},
  {criativo:'InMail_B2B',plat:'LinkedIn',camp:'LinkedIn B2B',status:'error',id:'—',start:'08 Mar',end:'31 Mar',upd:'há 30min'},
  {criativo:'Prospecting_728x90',plat:'DV360',camp:'Prospecting DV360',status:'pending',id:'—',start:'27 Mar',end:'30 Abr',upd:'—'},
  {criativo:'Prospecting_300x600',plat:'DV360',camp:'Prospecting DV360',status:'pending',id:'—',start:'27 Mar',end:'30 Abr',upd:'—'},
];
const PLATS=[
  {name:'Google Drive',on:true,alwaysOn:true},
  {name:'Google Ads',on:true},{name:'Meta Ads',on:true},{name:'TikTok Ads',on:true},
  {name:'YouTube',on:true},{name:'DV360',on:false},{name:'LinkedIn',on:false},
  {name:'Pinterest',on:false},{name:'Amazon Ads',on:false},{name:'GA4',on:true},
];
const USERS=[
  {name:'Leonardo Gardezani',email:'leo@riseupmtech.com',role:'Admin'},
  {name:'Ana Souza',email:'ana@riseupmtech.com',role:'Aprovador'},
  {name:'Carlos Lima',email:'carlos@riseupmtech.com',role:'Leitura'},
];
// ── TABS ──
function togglePanel(){
  const p=document.getElementById('rPanel'),o=document.getElementById('overlay'),m=document.getElementById('main');
  if(p.classList.contains('open')){closePanel();}
  else{p.classList.add('open');o.classList.add('on');m.classList.add('panel-open');openRpPage('nav');}
}
function closePanel(){
  document.getElementById('rPanel').classList.remove('open');
  document.getElementById('overlay').classList.remove('on');
  document.getElementById('main').classList.remove('panel-open');
}
function openRpPage(id){
  document.querySelectorAll('.rp-page').forEach(p=>p.classList.remove('active'));
  document.getElementById('rp-'+id).classList.add('active');
  if(id==='conexoes')renderConns();
  if(id==='usuarios')renderUsers();
  if(id==='planilha')planLoadWorkspaces();
}
// ── COLLAPSIBLE ──
function toggleColl(id){
  const el=document.getElementById('coll-'+id);
  const hdr=el.querySelector('.coll-header');
  const body=el.querySelector('.coll-body');
  const isOpen=body.classList.contains('open');
  // sync both to opposite state
  if(isOpen){
    body.classList.remove('open');
    hdr.classList.remove('open');
  } else {
    body.classList.add('open');
    hdr.classList.add('open');
  }
}
// ── ESCAPE HELPERS ──
// _escJsAttr: prepara uma string pra entrar dentro de um argumento de
// função em atributo onclick="..." delimitado por ASPAS DUPLAS, quando o
// argumento em si usa aspas SIMPLES (onclick="fn('valor')"). Bug corrigido
// nesta sessão: usar JSON.stringify() aqui quebrava tudo, porque
// JSON.stringify sempre devolve aspas DUPLAS — que colidem com as aspas
// duplas do atributo onclick e cortam o HTML no meio, deixando o resto
// como texto solto (o clique simplesmente não chamava a função, sem erro
// nenhum visível no console). Aqui: escapa backslash e aspas simples pro
// JS não quebrar, e aspas duplas viram &quot; pro HTML não quebrar.
function _escJsAttr(str){
  return String(str == null ? '' : str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;');
}
// _escHtml: escapa texto que vai virar innerHTML (não onclick) — usado
// pra nome de cliente/planilha não quebrar a marcação se tiver <, >, & etc.
function _escHtml(str){
  const div = document.createElement('div');
  div.textContent = String(str == null ? '' : str);
  return div.innerHTML;
}
// ── TOAST ──
// NOTA: essa função era chamada em 17 lugares do arquivo original mas nunca
// tinha sido definida (nenhum erro visível na tela, só um erro silencioso no
// console) — corrigido nesta sessão junto com a aba Desdobrador, que também
// depende dela pra dar feedback de upload/envio.
function toast(message, type=''){
  const tc = document.getElementById('tc');
  if(!tc) return;
  const el = document.createElement('div');
  el.className = 'to' + (type ? ' ' + type : '');
  const icon = type === 'ok' ? '✓' : type === 'er' ? '✕' : '●';
  el.innerHTML = '<span>' + icon + '</span><span>' + message + '</span>';
  tc.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }, 2600);
}
// ── BADGE ──
function badgeH(s){
  const m={implemented:'<span class="badge b-g">Implementado</span>',pending:'<span class="badge b-b">Pendente</span>',stand_by:'<span class="badge b-y">Stand By</span>',error:'<span class="badge b-r">Erro</span>'};
  return m[s]||`<span class="badge b-gr">${s}</span>`;
}
function fmt(n){return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'k':n.toFixed(0);}
function refreshAll(){toast('Filtros aplicados','ok');}
const MONO_FONT = {family:'Share Tech Mono', size:9};
const GRID_COLOR = '#f0f0ec';
const labels30 = Array.from({length:30}, (_,i) => (i+1)+' Mar');
const inv30  = [7.2,8.1,6.8,9.4,10.2,9.8,11.1,8.4,10.8,12.1,11.4,9.2,13.2,11.8,10.4,14.2,12.8,11.2,15.4,13.8,12.4,16.2,14.8,13.2,17.4,15.8,14.2,18.6,16.8,15.2];
function chartBaseOpts(){
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {duration:800, easing:'easeInOutQuart'},
    plugins: {legend:{labels:{font:{family:'Share Tech Mono',size:10}, boxWidth:10, padding:14}}}
  };
}
function chartScales(yLbl, y1Lbl){
  return {scales:{
    y:  {position:'left',  title:{display:true, text:yLbl,  font:MONO_FONT, color:'#bbb'}, grid:{color:GRID_COLOR}, ticks:{font:MONO_FONT, color:'#bbb'}},
    y1: {position:'right', title:{display:true, text:y1Lbl, font:MONO_FONT, color:'#bbb'}, grid:{display:false},    ticks:{font:MONO_FONT, color:'#bbb'}}
  }};
}
// ── CHART RESIZE ──
function setupChartResize(){
  if(!window.ResizeObserver) return;
  const obs = new ResizeObserver(()=>{
    Object.values(Chart.instances).forEach(ch=>ch.resize());
  });
  document.querySelectorAll('.chart-canvas-wrap').forEach(el=>obs.observe(el));
}
// ── DESDOBRADOR DE PEÇAS ──
// Espelha api/creative_deploy.py + services/creative_ai_engine.py (backend)
// — ver desdobrador-arquitetura.md. A fila (DESD_QUEUE) vem 100% de
// GET /desdobrador/queue.
//
// Reescrito nesta sessão (pedido do Leonardo): tirado o posicionamento
// manual de headline/CTA arrastável — agora é a IA (Gemini, via
// POST /desdobrador/ai-preview) que recompõe o KV inteiro pro formato
// pedido, a partir de um prompt livre. O usuário escolhe uma das
// variações geradas, define só o texto/cor do CTA (sempre embaixo,
// largura total, 15% de altura — desenhado por código depois, nunca pela
// IA, pra garantir posição/cor exatas), e envia pra aprovação.
const API_BASE = document.querySelector('#rp-config .fi[value*="southamerica-east1"]')?.value
  || 'https://riseup-backend-509219529113.southamerica-east1.run.app';function goToDesdobrador(){
  closePanel();
  location.href = 'desdobrador.html';
}


// ── CONEXÕES + USUÁRIOS (v2.6 — RBAC analista/editor/admin) ──
// Integrado nesta sessão a partir de claude/conexoes-usuarios.js. Redeclara
// renderConns/renderUsers (chamadas em openRpPage() acima mas nunca antes
// definidas) e adiciona as funções de conectar/desconectar plataforma e
// gerenciar membros. Backend real: api/connect.py + api/workspace.py +
// core/rbac.py — sem login (JWT) implementado neste arquivo ainda, então os
// fetches caem no modo demo local até isso existir (mesmo padrão do resto
// do arquivo, ex. desdUploadKvToBackend).

// Login real via Google OAuth acontece no app.html (tela dark/matrix —
// identidade visual do site). operations.html só consome o token: se não
// tiver um válido em localStorage, manda pro app.html pra autenticar.
let AUTH_TOKEN = localStorage.getItem('riseup_token') || null;

function authHeaders() {
  return AUTH_TOKEN ? { 'Authorization': 'Bearer ' + AUTH_TOKEN } : {};
}
function doLogout(){
  localStorage.removeItem('riseup_token');
  localStorage.removeItem('riseup_user');
  location.href = 'app.html';
}
async function verifyAuth(){
  // Bug real corrigido nesta sessão: antes, QUALQUER falha aqui (erro de
  // rede, timeout, o Cloud Run "acordando" de cold start e devolvendo
  // 500/502 por um instante) era tratada como "não autenticado" e
  // deslogava na hora — Ctrl+Shift+R (hard refresh) expôs isso mais
  // porque força tudo a recarregar do zero, batendo com mais frequência
  // num backend frio. Agora: só desloga de verdade em 401/403 (rejeição
  // de auth confirmada pelo backend); qualquer outra falha (rede, 5xx)
  // tenta de novo (_fetchWithRetry) e, se persistir, MANTÉM a sessão
  // como está — o usuário continua logado com o token que já tinha, em
  // vez de ser expulso por um problema temporário que não tem nada a
  // ver com o token dele ser válido ou não.
  try{
    const res = await _fetchWithRetry(API_BASE + '/auth/me', { headers: authHeaders() });
    if(res && (res.status === 401 || res.status === 403)){
      localStorage.removeItem('riseup_token');
      return null; // rejeição de auth de verdade — aí sim desloga
    }
    if(!res || !res.ok){
      return 'keep'; // falha de rede/servidor, não de auth — mantém a sessão atual
    }
    const u = await res.json();
    localStorage.setItem('riseup_user', JSON.stringify({name:u.name, email:u.email}));
    return u;
  }catch(e){
    return 'keep'; // idem — erro de rede não é motivo pra deslogar
  }
}
async function checkAuth(){
  if(window.__oauthReturnHandled) return; // idem — não redireciona nem verifica nada nessa aba
  if(!AUTH_TOKEN){ location.href = 'app.html'; return; }
  const u = await verifyAuth();
  if(u === null){ location.href = 'app.html'; return; } // só desloga em rejeição de auth confirmada
  if(u === 'keep'){
    // Não conseguiu confirmar (rede/servidor) — mantém a sessão e usa o
    // que já tinha salvo de nome/email, sem forçar logout.
    const cached = JSON.parse(localStorage.getItem('riseup_user') || 'null');
    const el = document.getElementById('topUser');
    if(el && cached) el.textContent = '// ' + (cached.name || cached.email);
    return;
  }
  const el = document.getElementById('topUser');
  if(el) el.textContent = '// ' + (u.name || u.email);
}
window.addEventListener('load', checkAuth);

// ── CONEXÕES ────────────────────────────────────────────────────────────

const PLATFORM_KEYS = { 'Google Ads': 'google_ads', 'Meta Ads': 'meta', 'TikTok Ads': 'tiktok' };
let connCompany = { company: '', can_manage: false, platforms: null, error: '' };

async function renderConns() {
  const el = document.getElementById('connList');
  if (!el) return;

  // Conexões são da EMPRESA (domínio do e-mail de login), não de um
  // workspace: a empresa vem do login no backend, o front não escolhe.
  el.innerHTML = '<div style="font-family:var(--mono);font-size:10px;color:var(--ink-muted);padding:12px 0">Carregando conexões...</div>';
  connCompany = { company: '', can_manage: false, platforms: null, error: '' };
  try {
    const res = await fetch(API_BASE + '/connect/company/status', { headers: authHeaders() });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      connCompany = { company: data.company, can_manage: !!data.can_manage, platforms: data.platforms || {}, error: '' };
    } else {
      connCompany.error = data.detail || 'Não foi possível carregar as conexões.';
    }
  } catch (e) { connCompany.error = 'Não foi possível carregar as conexões.'; }

  const info = document.getElementById('connCompanyInfo');
  if (info) {
    info.textContent = connCompany.company
      ? ('Empresa: ' + connCompany.company + (connCompany.can_manage ? '' : ' — somente leitura (conectar exige papel editor ou admin)'))
      : '';
  }
  if (connCompany.error) {
    el.innerHTML = '<div style="font-family:var(--mono);font-size:10px;color:var(--warn);padding:12px 0">' + _escHtml(connCompany.error) + '</div>';
    return;
  }
  PLATS.forEach(p => {
    const key = PLATFORM_KEYS[p.name];
    if (key && connCompany.platforms && key in connCompany.platforms) p.on = !!connCompany.platforms[key].connected;
  });

  el.innerHTML = PLATS.map(p => {
    const key = PLATFORM_KEYS[p.name];
    const hasBackend = !!key;
    // Google Drive — adicionado nesta sessão, pedido do Leonardo: exibe
    // como "sempre conectado" só por transparência (o cliente vê que o
    // Drive já está integrado), sem botão de conectar/desconectar — não
    // é uma conexão OAuth separada de verdade, já vem embutida no login
    // principal do app (mesmos escopos usados por /plan/provision).
    if (p.alwaysOn) {
      return '<div class="conn-item">'
        + '<div><div class="conn-name">' + p.name + '</div>'
        + '<div class="conn-status on">● Conectado</div></div>'
        + '<span style="font-family:var(--mono);font-size:9px;color:var(--ink-muted)">via login</span>'
        + '</div>';
    }
    const canManage = !key || connCompany.can_manage;
    const actions = !canManage ? ''
      : p.on
      ? '<div style="display:flex;gap:6px">'
        + '<button class="btn-sm ghost" onclick="disconnectPlatform(\'' + p.name + '\',\'' + (key || '') + '\')">Desconectar</button>'
        + '</div>'
      : '<button class="btn-sm" onclick="connectPlatform(\'' + p.name + '\',\'' + (key || '') + '\')">Conectar</button>';
    const pinfo = key && connCompany.platforms ? connCompany.platforms[key] : null;
    const detail = (pinfo && pinfo.connected)
      ? '<div style="font-family:var(--mono);font-size:9px;color:var(--ink-muted);margin-top:2px">'
        + ((pinfo.accounts || []).length) + ' conta(s)/página(s) disponível(is)'
        + (pinfo.connected_by ? ' · por ' + _escHtml(pinfo.connected_by) : '') + '</div>'
      : '';
    return '<div class="conn-item">'
      + '<div><div class="conn-name">' + p.name + '</div>'
      + '<div class="conn-status ' + (p.on ? 'on' : 'off') + '">' + (p.on ? '● Conectado' : '○ Desconectado') + '</div>' + detail + '</div>'
      + actions
      + '</div>';
  }).join('');
}

// Bug real corrigido nesta sessão: às vezes aparecia "conexão pendente"
// mesmo com a conexão certinha — falha de rede passageira (Cloud Run
// "acordando" de cold start, timeout pontual) fazia o fetch falhar uma
// vez só, e o código já desistia direto, sem tentar de novo. Helper
// pequeno de retry: tenta 1 vez extra depois de uma pausa curta antes
// de desistir de verdade. Usado nos dois fetches que alimentam os
// mounts de conta/página (status da conexão + lista de contas).
async function _fetchWithRetry(url, options, retries = 1, delayMs = 700){
  for(let attempt = 0; attempt <= retries; attempt++){
    try{
      const res = await fetch(url, options);
      if(res.ok) return res;
      if(attempt === retries) return res; // última tentativa — devolve mesmo sem ok, quem chamou decide
    }catch(e){
      if(attempt === retries) throw e;
    }
    await new Promise(r => setTimeout(r, delayMs));
  }
}

function connectPlatform(name, key) {
  if (!key) { // sem integração real ainda (YouTube, DV360, LinkedIn, Pinterest, Amazon Ads, GA4)
    const p = PLATS.find(x => x.name === name);
    if (p) p.on = true;
    renderConns();
    toast('✓ ' + name + ' conectado (demo — integração real ainda não existe)', 'ok');
    return;
  }
  if(!connCompany.can_manage){ toast('Conectar plataformas exige papel editor ou admin', 'er'); return; }
  // OAuth real precisa abrir em nova aba (o backend redireciona pro provedor).
  // Bug corrigido nesta sessão: window.open() é navegação de aba comum, NÃO
  // manda o header Authorization — então token e workspace_id vão como
  // query string mesmo (o backend aceita os dois, ver
  // core.auth.get_current_user_flexible). Isso significa que o JWT fica
  // visível na URL desta aba/nos logs de acesso do navegador — aceitável
  // aqui porque é um fluxo de poucos segundos até o redirect pro provedor,
  // mas vale saber que não é o padrão usado no resto do app.
  // A empresa NÃO vai na URL: o backend deriva do login (token).
  const url = API_BASE + '/connect/' + key
    + '?token=' + encodeURIComponent(AUTH_TOKEN || '');
  window.open(url, '_blank');
}

// Chamado pela ABA DE OAUTH (via window.opener) depois de conectar uma
// plataforma com sucesso — ver o bloco no topo do arquivo. Atualiza só o
// que mudou aqui na aba ORIGINAL (onde o usuário realmente clicou
// "Conectar"), sem precisar recarregar nada. Nova nesta sessão.
function onOAuthConnected(platform){
  // Reaproveita os refreshes que já existem — cada um já é no-op se o
  // elemento não estiver na tela (usuário podia estar em outra aba do
  // app quando clicou "Conectar").
  if(document.getElementById('connList')) renderConns();
  RU.oauthListeners.forEach(fn => { try{ fn(platform); }catch(e){ console.error(e); } });
  const label = { google_ads: 'Google Ads', meta: 'Meta Ads', tiktok: 'TikTok Ads' }[platform] || platform;
  toast('✓ ' + label + ' conectado', 'ok');
}

async function disconnectPlatform(name, key) {
  if (key) {
    if(!confirm('Desconectar ' + name + ' de toda a empresa? Todos os planos de mídia deixam de poder usar essa conexão até reconectar.')) return;
    try {
      const res = await fetch(API_BASE + '/connect/company/' + key, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) {
        toast('✓ ' + name + ' desconectado', 'ok');
        renderConns();
        return;
      }
      const d = await res.json().catch(() => ({}));
      toast('✕ ' + (d.detail || 'Não foi possível desconectar'), 'er');
      return;
    } catch (e) { toast('✕ Não foi possível desconectar agora', 'er'); return; }
  }
  const p = PLATS.find(x => x.name === name);
  if (p) p.on = false;
  renderConns();
  toast('✓ ' + name + ' desconectado (demo)', 'ok');
}

// ── USUÁRIOS (papéis: analista / editor / admin) ───────────────────────

const ROLE_LABEL = { admin: 'Admin', editor: 'Editor', analista: 'Analista' };
const ROLE_BADGE_CLASS = { admin: 'b-g', editor: 'b-b', analista: 'b-gr' };

// Substitui o array USERS antigo (papéis "Admin"/"Aprovador"/"Leitura" não
// batiam com a hierarquia pedida) — mesmo dado, papéis remapeados.
const USERS_V2 = [
  { name: 'Leonardo Gardezani', email: 'leo@riseupmtech.com', role: 'admin' },
  { name: 'Ana Souza', email: 'ana@riseupmtech.com', role: 'editor' },
  { name: 'Carlos Lima', email: 'carlos@riseupmtech.com', role: 'analista' },
];

async function renderUsers() {
  const el = document.getElementById('userList');
  if (!el) return;
  el.innerHTML = '<div style="font-family:var(--mono);font-size:10px;color:var(--ink-muted);padding:12px 0">Carregando usuários...</div>';

  let members = null;
  try {
    const res = await fetch(API_BASE + '/workspace/members', { headers: authHeaders() });
    if (res.ok) { const data = await res.json(); members = data.members; }
  } catch (e) { /* segue no modo demo */ }

  const list = members || USERS_V2;
  const usingBackend = !!members;

  el.innerHTML = list.map(u => {
    const name = u.name || u.email;
    const badge = '<span class="badge ' + (ROLE_BADGE_CLASS[u.role] || 'b-gr') + '">' + (ROLE_LABEL[u.role] || u.role) + '</span>';
    return '<div class="conn-item">'
      + '<div><div class="conn-name">' + name + '</div>'
      + '<div style="font-family:var(--mono);font-size:9px;color:var(--ink-muted);margin-top:2px">' + u.email + '</div></div>'
      + '<div style="display:flex;gap:6px;align-items:center">'
      + badge
      + '<select class="fs_" style="width:auto;padding:4px 20px 4px 8px;font-size:10px" onchange="updateMemberRole(\'' + u.email + '\', this.value, ' + usingBackend + ')">'
      + ['analista', 'editor', 'admin'].map(r => '<option value="' + r + '"' + (r === u.role ? ' selected' : '') + '>' + ROLE_LABEL[r] + '</option>').join('')
      + '</select>'
      + '<button class="btn-sm ghost" onclick="removeMember(\'' + u.email + '\', ' + usingBackend + ')">✕</button>'
      + '</div></div>';
  }).join('');
}

async function updateMemberRole(email, role, usingBackend) {
  if (usingBackend) {
    try {
      const res = await fetch(API_BASE + '/workspace/members/' + encodeURIComponent(email) + '/role', {
        method: 'PATCH',
        headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
        body: JSON.stringify({ role }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.detail || 'falha ao atualizar papel'); }
      toast('✓ Papel de ' + email + ' atualizado para ' + ROLE_LABEL[role], 'ok');
      renderUsers();
      return;
    } catch (e) {
      toast('✕ ' + (e.message || 'Não foi possível atualizar (backend)'), 'er');
      renderUsers();
      return;
    }
  }
  const u = USERS_V2.find(x => x.email === email);
  if (u) u.role = role;
  renderUsers();
  toast('✓ Papel de ' + email + ' atualizado (demo)', 'ok');
}

async function removeMember(email, usingBackend) {
  if (usingBackend) {
    try {
      const res = await fetch(API_BASE + '/workspace/members/' + encodeURIComponent(email), {
        method: 'DELETE', headers: authHeaders(),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.detail || 'falha ao remover'); }
      toast('✓ ' + email + ' removido', 'ok');
      renderUsers();
      return;
    } catch (e) {
      toast('✕ ' + (e.message || 'Não foi possível remover (backend)'), 'er');
      return;
    }
  }
  const idx = USERS_V2.findIndex(x => x.email === email);
  if (idx >= 0) USERS_V2.splice(idx, 1);
  renderUsers();
  toast('✓ ' + email + ' removido (demo)', 'ok');
}

async function inviteMember() {
  const emailEl = document.getElementById('inviteEmail');
  const roleEl = document.getElementById('inviteRole');
  const email = emailEl ? emailEl.value.trim() : '';
  const role = roleEl ? roleEl.value : 'analista';
  if (!email || !email.includes('@')) { toast('Informe um e-mail válido', 'er'); return; }

  try {
    const res = await fetch(API_BASE + '/workspace/members/invite', {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
      body: JSON.stringify({ email, role }),
    });
    if (!res.ok) throw new Error('backend indisponível');
    toast('✓ ' + email + ' convidado como ' + ROLE_LABEL[role], 'ok');
  } catch (e) {
    USERS_V2.push({ name: email.split('@')[0], email, role });
    toast('✓ ' + email + ' convidado como ' + ROLE_LABEL[role] + ' (demo)', 'ok');
  }
  if (emailEl) emailEl.value = '';
  renderUsers();
}

// ── PLANILHA (Google Sheets do workspace) ──
// Espelha api/plan.py (POST /plan/provision, GET /plan/workspaces,
// POST /plan/sync, GET /plan/status) e services/sheets.py
// (SheetsService.create_workspace_spreadsheet) — automação que substituiu
// o Code.gs (Apps Script). Um operador de agência provisiona uma planilha
// por cliente, então a tela mostra TODAS as planilhas que o usuário
// logado tem acesso (GET /plan/workspaces), não só uma — bug corrigido
// nesta sessão: a versão anterior tratava "1 usuário logado = 1
// planilha", sempre reabrindo a mesma em vez de deixar criar mais.
let planWorkspaces = [];

// Guarda o workspace_id pendente de exclusão enquanto o modal de
// confirmação está aberto — usado por planDeleteRequest/planDeleteConfirm
// (nova função desta sessão, ver mais abaixo).
let pendingDeleteWorkspace = null;

function renderPlanWorkspaceList(){
  const box = document.getElementById('planWorkspaceList');
  if(!box) return;
  if(!planWorkspaces.length){
    box.innerHTML = '<div style="font-family:var(--mono);font-size:10px;color:var(--ink-muted);margin-bottom:4px">Nenhum plano de mídia criado ainda.</div>';
    return;
  }
  box.innerHTML = planWorkspaces.map(w => (
    '<div class="conn-item" data-ws="' + w.workspace_id + '">'
    + '<div><div class="conn-name">' + _escHtml(w.client_name || 'Sem nome') + '</div>'
    + '<div class="conn-status on">● Conectada</div></div>'
    + '<div style="display:flex;gap:6px">'
    + '<button class="btn-sm ghost" onclick="planSync(\'' + w.workspace_id + '\',this)" title="Forçar sincronização agora">↻</button>'
    + '<a href="' + w.spreadsheet_url + '" target="_blank" class="btn-sm ghost">Abrir ↗</a>'
    + '<button class="btn-sm ghost" style="color:var(--danger);border-color:#fecaca" onclick="planDeleteRequest(\'' + w.workspace_id + '\', \'' + _escJsAttr(w.client_name || 'este plano de mídia') + '\')" title="Excluir plano de mídia">✕</button>'
    + '</div></div>'
  )).join('');
}

async function planLoadWorkspaces(){
  try{
    const res = await fetch(API_BASE + '/plan/workspaces', { headers: authHeaders() });
    if(!res.ok) throw new Error('sem acesso ao backend');
    planWorkspaces = await res.json();
  }catch(e){
    planWorkspaces = [];
  }
  renderPlanWorkspaceList();
}async function refreshAllWorkspaceSelectors(){
  // Cada página registra em RU.workspaceRefreshers o carregador de workspaces que ela tem.
  if(document.getElementById('connList')) await renderConns();
  for(const fn of RU.workspaceRefreshers){ try{ await fn(); }catch(e){ console.error(e); } }
}


async function planProvision(){
  const nameEl = document.getElementById('planClientName');
  const emailEl = document.getElementById('planClientEmail');
  const clientName = nameEl ? nameEl.value.trim() : '';
  const clientEmail = emailEl ? emailEl.value.trim() : '';
  if(!clientName){ toast('Informe o nome do cliente', 'er'); return; }

  // Abre a aba de forma síncrona, ainda dentro do clique — Chrome (e a
  // maioria dos navegadores) só bloqueia window.open() disparado DEPOIS
  // de uma espera assíncrona (await fetch), não quando é a reação
  // direta e imediata a um clique real. loading.html é uma página própria
  // (identidade visual igual ao app.html — fundo escuro, grid, logo
  // JP/EN, barra de gradiente ciano→magenta) hospedada junto do
  // operations.html/app.html — troca pro endereço real da planilha só
  // depois que a resposta do backend chegar (pendingTab.location.href).
  const pendingTab = window.open('loading.html', '_blank');

  const btn = document.getElementById('planCreateBtn');
  if(btn){ btn.disabled = true; btn.textContent = 'Criando...'; }
  try{
    const res = await fetch(API_BASE + '/plan/provision', {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
      body: JSON.stringify({ client_name: clientName, client_email: clientEmail || null }),
    });
    const data = await res.json().catch(() => ({}));
    if(!res.ok) throw new Error(data.detail || 'backend indisponível ou sem login');
    toast(data.reused ? '✓ Cliente já tinha plano de mídia — vinculado' : '✓ Plano de mídia criado com sucesso', 'ok');
    if(nameEl) nameEl.value = '';
    if(emailEl) emailEl.value = '';
    // Navega a aba já aberta (não abre uma nova) — ver comentário acima
    // do pendingTab. Só navega se a planilha foi CRIADA agora (não
    // quando reused=true, já que aí o trigger já deve ter sido
    // instalado numa criação anterior) — fecha a aba em branco nesse
    // caso, pra não deixar sobrando.
    if(data.spreadsheet_url && !data.reused){
      if(pendingTab){
        pendingTab.location.href = data.spreadsheet_url;
        // Tenta manter o foco na aba atual (operations.html) em vez de
        // pular pra aba nova — sem garantia: navegadores modernos (Chrome
        // em especial), por segurança/anti-incômodo, costumam IGNORAR
        // tentativas de script de controlar foco de aba. Funciona em
        // algumas configurações/navegadores, não em todos.
        try{
          pendingTab.blur();
          window.focus();
        }catch(e){}
      }else{
        // Mesmo abrindo em branco de forma síncrona, alguns navegadores
        // com configuração muito restritiva ainda podem bloquear —
        // avisa nesse caso raro.
        toast('Plano de mídia criado, mas o navegador bloqueou a aba automática — abre ele manualmente uma vez pra ativar a sincronização automática', '');
      }
    }else if(pendingTab){
      pendingTab.close();
    }
    await planLoadWorkspaces();
    await refreshAllWorkspaceSelectors();
  }catch(e){
    if(pendingTab) pendingTab.close();
    toast('✕ ' + (e.message || 'Falha ao criar o plano de mídia'), 'er');
  }
  if(btn){ btn.disabled = false; btn.textContent = 'Criar Plano de Mídia'; }
}

async function planSync(workspaceId, btnEl){
  // O Cloud Scheduler já roda isso sozinho a cada 15min (/plan/sync-all,
  // v2.7) pra todos os workspaces — este botão por linha é só um atalho
  // manual pra forçar um cliente específico agora, sem esperar o próximo
  // ciclo (ex.: acabou de editar a planilha dele).
  if(btnEl){ btnEl.disabled = true; }
  try{
    const res = await fetch(API_BASE + '/plan/sync?workspace_id=' + encodeURIComponent(workspaceId), {
      method: 'POST', headers: authHeaders(),
    });
    if(!res.ok) throw new Error('falha na sincronização');
    toast('✓ Sincronizado com o BigQuery', 'ok');
  }catch(e){
    toast('✕ Não foi possível sincronizar agora', 'er');
  }
  if(btnEl){ btnEl.disabled = false; }
}

// ── EXCLUSÃO DE PLANILHA (nova nesta sessão) ──
// Fluxo: botão ✕ por linha (renderPlanWorkspaceList) -> planDeleteRequest
// abre o modal de confirmação com o nome do cliente -> usuário confirma ->
// planDeleteConfirm chama DELETE /plan/workspaces/{workspace_id}.
// IMPORTANTE: não existe fallback "modo demo" pra exclusão (diferente do
// resto do arquivo) — de propósito. Fingir que excluiu algo que na
// verdade não foi removido do backend é pior que mostrar um erro claro;
// o endpoint DELETE /plan/workspaces/{workspace_id} ainda PRECISA ser
// implementado no backend (api/plan.py) pra este botão funcionar de
// verdade — até lá, o clique vai mostrar um toast de erro, o que é o
// comportamento correto (nunca remover da lista sem confirmação real do
// servidor).
function planDeleteRequest(workspaceId, clientName){
  pendingDeleteWorkspace = workspaceId;
  const textEl = document.getElementById('confirmText');
  if(textEl){
    textEl.innerHTML = 'Isso remove <strong>' + _escHtml(clientName) + '</strong> da lista de workspaces e move o plano de mídia (Google Sheets) para a lixeira do Drive (recuperável por 30 dias — não é apagada na hora). Essa ação não pode ser desfeita por aqui.';
  }
  document.getElementById('confirmModal').classList.add('open');
}

function closeConfirmModal(e){
  // Se veio de um clique no overlay (e.target === o próprio modal), fecha.
  // Se veio do botão Cancelar (chamado sem argumento), também fecha.
  if(e && e.target !== document.getElementById('confirmModal')) return;
  document.getElementById('confirmModal').classList.remove('open');
  pendingDeleteWorkspace = null;
}

async function planDeleteConfirm(){
  if(!pendingDeleteWorkspace) return;
  const workspaceId = pendingDeleteWorkspace;
  const btn = document.querySelector('#confirmModal .confirm-btn.danger');
  if(btn){ btn.disabled = true; btn.textContent = 'Excluindo...'; }
  try{
    const res = await fetch(API_BASE + '/plan/workspaces/' + encodeURIComponent(workspaceId), {
      method: 'DELETE', headers: authHeaders(),
    });
    if(!res.ok){
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'falha ao excluir (endpoint pode ainda não existir no backend)');
    }
    planWorkspaces = planWorkspaces.filter(w => w.workspace_id !== workspaceId);
    renderPlanWorkspaceList();
    toast('✓ Plano de mídia excluído', 'ok');
    await refreshAllWorkspaceSelectors();
  }catch(e){
    toast('✕ ' + (e.message || 'Não foi possível excluir agora'), 'er');
  }
  if(btn){ btn.disabled = false; btn.textContent = 'Excluir'; }
  document.getElementById('confirmModal').classList.remove('open');
  pendingDeleteWorkspace = null;
}

/* Rise Up MTech — Criativos (gerado da separação do operations.html em páginas, 18/nov/2026) */

// ── REPO DATA ──
const REPO_ASSETS = [
  {id:1,name:'Banner_300x250_V1',camp:'Awareness Q1',plat:'Google Ads',type:'image',date:'01 Mar 2025',
   img:'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=338&fit=crop',
   dims:'300×250px',size:'48KB',fmt:'JPG',version:'v1',kv:'KV_Awareness_Q1',tags:['IAB','Display','300x250'],approved:true},
  {id:2,name:'Banner_728x90_V1',camp:'Awareness Q1',plat:'Google Ads',type:'image',date:'01 Mar 2025',
   img:'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=728&h=90&fit=crop',
   dims:'728×90px',size:'32KB',fmt:'JPG',version:'v1',kv:'KV_Awareness_Q1',tags:['IAB','Leaderboard'],approved:true},
  {id:3,name:'Banner_160x600_V1',camp:'Awareness Q1',plat:'Google Ads',type:'image',date:'02 Mar 2025',
   img:'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=160&h=600&fit=crop',
   dims:'160×600px',size:'38KB',fmt:'JPG',version:'v1',kv:'KV_Awareness_Q1',tags:['IAB','Skyscraper'],approved:true},
  {id:4,name:'Responsive_HTML5_V1',camp:'Awareness Q1',plat:'Google Ads',type:'html5',date:'03 Mar 2025',
   img:'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&h=338&fit=crop',
   dims:'Responsivo',size:'120KB',fmt:'HTML5 ZIP',version:'v1',kv:'KV_Awareness_Q1',tags:['HTML5','Animado'],approved:true},
  {id:5,name:'Feed_1080x1080_V1',camp:'Performance — Leads',plat:'Meta Ads',type:'image',date:'04 Mar 2025',
   img:'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=600&h=600&fit=crop',
   dims:'1080×1080px',size:'210KB',fmt:'JPG',version:'v1',kv:'KV_Leads_V1',tags:['Meta','Feed','1:1'],approved:true},
  {id:6,name:'Stories_1080x1920_V1',camp:'Performance — Leads',plat:'Meta Ads',type:'image',date:'04 Mar 2025',
   img:'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=338&h=600&fit=crop',
   dims:'1080×1920px',size:'284KB',fmt:'JPG',version:'v2',kv:'KV_Leads_V1',tags:['Meta','Stories','9:16'],approved:true},
  {id:7,name:'Carrossel_1080x1080_V2',camp:'Retargeting',plat:'Meta Ads',type:'image',date:'05 Mar 2025',
   img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=600&fit=crop',
   dims:'1080×1080px',size:'196KB',fmt:'JPG',version:'v2',kv:'KV_Retargeting',tags:['Meta','Carrossel'],approved:true},
  {id:8,name:'Reels_1080x1920_V1',camp:'Retargeting',plat:'Meta Ads',type:'video',date:'06 Mar 2025',
   img:'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=338&h=600&fit=crop',
   dims:'1080×1920px',size:'8,4MB',fmt:'MP4 · 15s',version:'v1',kv:'KV_Retargeting',tags:['Meta','Reels','Vídeo'],approved:true},
  {id:9,name:'TopView_1080x1920_V1',camp:'TikTok — Gen Z',plat:'TikTok Ads',type:'video',date:'07 Mar 2025',
   img:'https://images.unsplash.com/photo-1558655146-d09347e92766?w=338&h=600&fit=crop',
   dims:'1080×1920px',size:'12,2MB',fmt:'MP4 · 30s',version:'v1',kv:'KV_GenZ',tags:['TikTok','TopView','Vídeo'],approved:true},
  {id:10,name:'InFeed_1080x1920_V1',camp:'TikTok — Gen Z',plat:'TikTok Ads',type:'video',date:'07 Mar 2025',
   img:'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=338&h=600&fit=crop',
   dims:'1080×1920px',size:'9,8MB',fmt:'MP4 · 15s',version:'v1',kv:'KV_GenZ',tags:['TikTok','InFeed','Vídeo'],approved:true},
  {id:11,name:'PreRoll_1920x1080_V1',camp:'Performance — Leads',plat:'YouTube',type:'video',date:'08 Mar 2025',
   img:'https://images.unsplash.com/photo-1551817958-11e40576f80e?w=600&h=338&fit=crop',
   dims:'1920×1080px',size:'18,4MB',fmt:'MP4 · 15s',version:'v1',kv:'KV_Leads_V1',tags:['YouTube','PreRoll','Vídeo'],approved:true},
  {id:12,name:'Bumper_1920x1080_V1',camp:'Awareness Q1',plat:'YouTube',type:'video',date:'08 Mar 2025',
   img:'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=338&fit=crop',
   dims:'1920×1080px',size:'6,2MB',fmt:'MP4 · 6s',version:'v1',kv:'KV_Awareness_Q1',tags:['YouTube','Bumper','Vídeo'],approved:true},
  {id:13,name:'OOH_Outdoor_6x3m',camp:'Awareness Q1',plat:'OOH',type:'image',date:'10 Mar 2025',
   img:'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=300&fit=crop',
   dims:'6000×3000px',size:'14MB',fmt:'TIFF 300dpi',version:'v1',kv:'KV_Awareness_Q1',tags:['OOH','Outdoor'],approved:true},
  {id:14,name:'OOH_MidiaMóvel_V1',camp:'Awareness Q1',plat:'OOH',type:'image',date:'10 Mar 2025',
   img:'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
   dims:'3000×2000px',size:'8,4MB',fmt:'TIFF 300dpi',version:'v1',kv:'KV_Awareness_Q1',tags:['OOH','Mídia Móvel'],approved:true},
  {id:15,name:'Radio_30s_V1',camp:'Awareness Q1',plat:'Rádio',type:'audio',date:'12 Mar 2025',
   img:'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&h=338&fit=crop',
   dims:'—',size:'2,8MB',fmt:'MP3 · 30s · 320kbps',version:'v1',kv:'KV_Awareness_Q1',tags:['Rádio','30s'],approved:true},
  {id:16,name:'Radio_15s_V1',camp:'Performance — Leads',plat:'Rádio',type:'audio',date:'12 Mar 2025',
   img:'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&h=338&fit=crop',
   dims:'—',size:'1,4MB',fmt:'MP3 · 15s · 320kbps',version:'v1',kv:'KV_Leads_V1',tags:['Rádio','15s'],approved:true},
];
let PENDING_ASSETS = [];
let repoTypeFilter = '';
function typeIcon(t){return {image:'🖼',video:'▶',html5:'⟨/⟩',audio:'♪',text:'📝'}[t]||'📄';}
function typeLabel(t){return {image:'Imagem',video:'Vídeo',html5:'HTML5',audio:'Áudio',text:'Texto'}[t]||t;}
function setType(type,el){
  repoTypeFilter=type;
  document.querySelectorAll('.repo-type-pill').forEach(p=>p.classList.remove('on'));
  el.classList.add('on');
  filterRepo();
}
function filterRepo(){
  const camp=document.getElementById('rf-camp').value;
  const plat=document.getElementById('rf-plat').value;
  const filtered=REPO_ASSETS.filter(a=>(!camp||a.camp===camp)&&(!plat||a.plat===plat)&&(!repoTypeFilter||a.type===repoTypeFilter));
  renderRepo(filtered);
}
function renderRepo(assets){
  const grid = document.getElementById('repoGrid');
  const cnt = document.getElementById('repo-count');
  const cntHeader = document.getElementById('repo-count-header');
  const label = assets.length + ' asset' + (assets.length !== 1 ? 's' : '');
  if(cnt) cnt.textContent = label;
  if(cntHeader) cntHeader.textContent = label;
  if(!grid) return;
  if(!assets.length){
    grid.innerHTML = '<div style="grid-column:1/-1;padding:60px;text-align:center;background:var(--bg)">'
      + '<div style="font-family:var(--fh);font-size:18px;text-transform:uppercase;color:var(--ink-muted);font-weight:700">Nenhum criativo encontrado</div></div>';
    return;
  }
  grid.innerHTML = '';
  assets.forEach(a => {
    const div = document.createElement('div');
    div.className = 'repo-card';
    const imgStyle = a.type === 'audio' ? 'filter:grayscale(1);opacity:.5;' : '';
    div.innerHTML =
      '<div class="repo-thumb-wrap">'
      + '<img class="repo-thumb" src="' + a.img + '" alt="' + a.name + '" loading="lazy" style="' + imgStyle + '">'
      + '<div class="type-tag">' + typeIcon(a.type) + ' ' + typeLabel(a.type) + '</div>'
      + '<div class="approved-tag">✓ Aprovado</div>'
      + '<div class="repo-actions">'
      + '<button class="repo-action" onclick="downloadAsset(' + a.id + ')">↓ Download</button>'
      + '<button class="repo-action" onclick="openDetail(' + a.id + ')">⊕ Detalhes</button>'
      + '<button class="repo-action" onclick="copyLink(' + a.id + ')">⎘ Link</button>'
      + '<button class="repo-action" onclick="sendToPlatform(' + a.id + ')">↑ Enviar</button>'
      + '</div></div>'
      + '<div class="repo-info">'
      + '<div class="repo-name">' + a.name + '</div>'
      + '<div class="repo-meta">' + a.plat + ' · ' + a.fmt + ' · ' + a.size + ' · ' + a.date + '</div>'
      + '<div class="repo-tags">' + a.tags.map(t => '<span class="repo-tag">' + t + '</span>').join('') + '</div>'
      + '</div>';
    grid.appendChild(div);
  });
}
// ── PENDING (Aguardando Aprovação) — 100% real: GET /desdobrador/pending +
// POST /desdobrador/{row_id}/approve|reject. Substituiu o array mock que
// existia aqui antes (esta sessão, a pedido do Leonardo).
// Fix desta sessão: BUG real — não filtrava por workspace (lia a tabela
// implementation inteira, multi-tenant, misturando a fila de aprovação
// de TODOS os workspaces). Agora exige workspace_id, com seletor PRÓPRIO
// (pendWorkspaceId) — pedido explícito do Leonardo: reaproveitar o
// seletor de "Upload direto" silenciosamente confundia, sem deixar claro
// que a fila estava filtrada por aquele workspace. ──
let pendWorkspaceId = '';

async function pendLoadWorkspaces(){
  const sel = document.getElementById('pendWorkspaceSelect');
  if(!sel) return;
  const prev = sel.value || pendWorkspaceId;
  sel.innerHTML = '<option value="">Carregando...</option>';
  try{
    const res = await fetch(API_BASE + '/plan/workspaces', { headers: authHeaders() });
    if(!res.ok) throw new Error('sem acesso ao backend');
    const list = await res.json();
    if(!list.length){ sel.innerHTML = '<option value="">Nenhum workspace encontrado</option>'; pendWorkspaceId = ''; return; }
    sel.innerHTML = list.map(w =>
      '<option value="' + w.workspace_id + '">' + _escHtml(w.client_name || w.workspace_id) + '</option>'
    ).join('');
    if(prev && list.some(w => w.workspace_id === prev)) sel.value = prev;
    pendWorkspaceId = sel.value;
    await loadPendingFromBackend();
  }catch(e){
    sel.innerHTML = '<option value="">Falha ao carregar workspaces</option>';
  }
}

function pendOnWorkspaceChange(){
  const sel = document.getElementById('pendWorkspaceSelect');
  pendWorkspaceId = sel ? sel.value : '';
  loadPendingFromBackend();
}

async function loadPendingFromBackend(){
  const grid = document.getElementById('pendingGrid');
  if(!pendWorkspaceId){
    PENDING_ASSETS = [];
    if(grid) grid.innerHTML = '<div style="grid-column:1/-1;padding:30px;text-align:center;font-family:var(--mono);font-size:11px;color:var(--ink-muted)">Selecione um workspace acima</div>';
    renderPending();
    return;
  }
  if(grid) grid.innerHTML = '<div style="grid-column:1/-1;padding:30px;text-align:center;font-family:var(--mono);font-size:11px;color:var(--ink-muted)">Carregando fila de aprovação...</div>';
  try{
    const res = await fetch(API_BASE + '/desdobrador/pending?workspace_id=' + encodeURIComponent(pendWorkspaceId), { headers: authHeaders() });
    if(!res.ok) throw new Error('backend indisponível');
    const data = await res.json();
    // Mapeia a forma real (row_id, campaign_name, brand, source,
    // creative_type, creative_name, preview_url) pra forma que
    // renderPending()/approveAsset()/rejectAsset() já esperavam — id vira
    // o row_id (string, não numérico como no mock antigo).
    // Corrigido — antes forçava type:'image' pra TODO item, mesmo texto
    // (RSA, asset é .json) e vídeo (TikTok, asset é .mp4) — resultava em
    // <img src="...json"> ou <img src="...mp4"> sempre quebrada. Deriva
    // o tipo real: creative_type="text" → texto; source=tiktok (só cria
    // vídeo, ver arquitetura) ou creative_type mencionando "video" →
    // vídeo; resto → imagem.
    PENDING_ASSETS = (data.pending || []).map(p => {
      const ct = (p.creative_type || '').toLowerCase();
      const src = (p.source || '').toLowerCase();
      let type = 'image';
      if(ct === 'text') type = 'text';
      else if(src === 'tiktok' || ct.includes('video')) type = 'video';
      return {
        id: p.row_id,
        name: p.creative_name || p.row_id,
        camp: p.campaign_name || '—',
        plat: p.source || '—',
        type,
        date: '',
        img: p.preview_url || '',
        dims: '—',
        size: '—',
        fmt: '—',
        tags: [p.source, p.creative_type].filter(Boolean),
        submittedBy: 'Desdobrador',
        submittedAt: '',
      };
    });
  }catch(e){
    PENDING_ASSETS = [];
    if(grid) grid.innerHTML = '<div style="grid-column:1/-1;padding:30px;text-align:center;font-family:var(--mono);font-size:11px;color:var(--danger)">Não foi possível carregar a fila de aprovação — verifique login/conexão.</div>';
    return;
  }
  renderPending();
}
function renderPending(){
  const grid = document.getElementById('pendingGrid');
  const cnt = document.getElementById('pending-count');
  if(!grid) return;
  if(cnt) cnt.textContent = PENDING_ASSETS.length + ' aguardando';
  // Novo nesta sessão (pedido do Leonardo) — remove da seleção qualquer
  // id que não existe mais na lista (ex: depois de recarregar a fila).
  pendingSelectedIds = new Set([...pendingSelectedIds].filter(id => PENDING_ASSETS.some(a => a.id === id)));
  if(!PENDING_ASSETS.length){
    grid.innerHTML = '<div style="grid-column:1/-1;padding:30px;text-align:center;font-family:var(--mono);font-size:11px;color:var(--ink-muted)">Nada aguardando aprovação agora</div>';
    pendingUpdateBulkButtons();
    return;
  }
  grid.innerHTML = '';
  PENDING_ASSETS.forEach(a => {
    const div = document.createElement('div');
    div.className = 'repo-card';
    div.style.outline = '2px solid #f59e0b';
    div.style.outlineOffset = '-2px';
    const imgStyle = a.type === 'audio' ? 'filter:grayscale(1);opacity:.5;' : '';
    // Corrigido — antes sempre montava <img src="a.img">, mesmo pra
    // vídeo (.mp4, não renderiza como imagem) e texto/RSA (.json, não é
    // nem imagem nem vídeo) — ficava sempre quebrado. Agora ramifica por
    // tipo real (ver loadPendingFromBackend): vídeo usa <video>, texto
    // usa um placeholder que busca e mostra o headline/description de
    // verdade (pendingLoadTextPreview, chamado depois do grid montado).
    let thumbHtml;
    if(a.type === 'video'){
      thumbHtml = '<video class="repo-thumb" src="' + a.img + '" muted loop controls style="object-fit:cover" onerror="this.parentElement.style.background=\'var(--bg3)\'"></video>';
    } else if(a.type === 'text'){
      thumbHtml = '<div class="repo-thumb" id="pendingTextPreview_' + _escHtml(a.id) + '" style="display:flex;align-items:center;justify-content:center;padding:14px;text-align:left">'
        + '<span style="font-family:var(--mono);font-size:9px;color:var(--ink-muted)">Carregando prévia do RSA...</span></div>';
    } else {
      thumbHtml = '<img class="repo-thumb" src="' + a.img + '" alt="' + _escHtml(a.name) + '" loading="lazy" style="' + imgStyle + '" onerror="this.style.background=\'var(--bg3)\';this.src=\'\'">';
    }
    div.innerHTML =
      '<div class="repo-thumb-wrap">'
      + '<label style="position:absolute;top:8px;left:8px;z-index:2;background:rgba(13,13,13,.6);padding:4px;display:flex;cursor:pointer">'
      + '<input type="checkbox" ' + (pendingSelectedIds.has(a.id) ? 'checked' : '') + ' onclick="event.stopPropagation();pendingToggleCardSelect(\'' + _escJsAttr(a.id) + '\',this.checked)">'
      + '</label>'
      + thumbHtml
      + '<div class="type-tag">' + typeIcon(a.type) + ' ' + typeLabel(a.type) + '</div>'
      + '<div style="position:absolute;top:8px;right:8px;font-family:var(--mono);font-size:9px;letter-spacing:.08em;padding:3px 8px;background:#f59e0b;color:#fff">⏳ Pendente</div>'
      + '</div>'
      + '<div class="repo-info">'
      + '<div class="repo-name">' + _escHtml(a.name) + '</div>'
      + '<div class="repo-meta">' + _escHtml(a.plat) + ' · ' + _escHtml(a.camp) + '</div>'
      + '<div class="repo-tags">' + a.tags.map(t => '<span class="repo-tag">' + _escHtml(t) + '</span>').join('') + '</div>'
      + '<div style="display:flex;gap:6px;margin-top:12px">'
      + '<button onclick="approveAsset(\'' + _escJsAttr(a.id) + '\', this)" style="flex:1;padding:8px;background:var(--ink);color:#fff;border:none;font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer">✓ Aprovar</button>'
      + '<button onclick="rejectAsset(\'' + _escJsAttr(a.id) + '\', this)" style="flex:1;padding:8px;background:transparent;color:var(--danger);border:1px solid #fecaca;font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer">✕ Reprovar</button>'
      + '</div></div>';
    grid.appendChild(div);
    if(a.type === 'text' && a.img) pendingLoadTextPreview(a.id, a.img);
  });
  pendingUpdateBulkButtons();
}

// Busca o JSON de verdade (headlines/descriptions) do asset de um RSA
// pendente — preview_url é uma signed URL do GCS, funciona com fetch()
// normal (sem authHeaders(), é assinada pelo backend pra acesso direto).
// Mostra as 3 primeiras headlines + 2 primeiras descriptions como prévia
// real do anúncio, em vez de tentar (e falhar) carregar isso como imagem.
async function pendingLoadTextPreview(rowId, url){
  const el = document.getElementById('pendingTextPreview_' + rowId);
  if(!el) return;
  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const headlines = (data.headlines || []).slice(0, 3);
    const descriptions = (data.descriptions || []).slice(0, 2);
    if(!headlines.length && !descriptions.length) throw new Error('sem conteúdo');
    el.style.display = 'block';
    el.style.padding = '12px';
    el.innerHTML = '<div style="font-family:var(--mono);font-size:10px;line-height:1.5">'
      + headlines.map(h => '<div style="font-weight:700;color:var(--ink)">' + _escHtml(h) + '</div>').join('')
      + descriptions.map(d => '<div style="color:var(--ink-muted);margin-top:3px">' + _escHtml(d) + '</div>').join('')
      + '</div>';
  }catch(e){
    el.innerHTML = '<span style="font-family:var(--mono);font-size:9px;color:var(--ink-muted)">RSA — prévia indisponível</span>';
  }
}

// ── Seleção + ações em massa (novo nesta sessão, pedido do Leonardo) ──
let pendingSelectedIds = new Set();

function pendingToggleSelectAll(checked){
  pendingSelectedIds = checked ? new Set(PENDING_ASSETS.map(a => a.id)) : new Set();
  renderPending();
}

function pendingToggleCardSelect(id, checked){
  if(checked) pendingSelectedIds.add(id);
  else pendingSelectedIds.delete(id);
  pendingUpdateBulkButtons();
  const allCb = document.getElementById('pendingSelectAllCheckbox');
  if(allCb) allCb.checked = PENDING_ASSETS.length > 0 && pendingSelectedIds.size === PENDING_ASSETS.length;
}

function pendingUpdateBulkButtons(){
  const n = pendingSelectedIds.size;
  const cntEl = document.getElementById('pendingSelectedCount');
  if(cntEl) cntEl.textContent = n + ' selecionado(s)';
  const approveBtn = document.getElementById('pendingBulkApproveBtn');
  const rejectBtn = document.getElementById('pendingBulkRejectBtn');
  if(approveBtn){ approveBtn.disabled = n === 0; approveBtn.textContent = '✓ Aprovar selecionados'; }
  if(rejectBtn){ rejectBtn.disabled = n === 0; rejectBtn.textContent = '✕ Reprovar selecionados'; }
  const allCb = document.getElementById('pendingSelectAllCheckbox');
  if(allCb) allCb.checked = PENDING_ASSETS.length > 0 && n === PENDING_ASSETS.length;
}

async function pendingBulkApprove(){
  const ids = [...pendingSelectedIds];
  if(!ids.length) return;
  if(!confirm(`Aprovar ${ids.length} peça(s) selecionada(s)? Isso sobe o ad de verdade em cada plataforma.`)) return;
  // Fix desta sessão (pedido do Leonardo) — feedback visual de que a ação
  // está em andamento, igual já existia no upfSubmit/desdSubmit.
  const btn = document.getElementById('pendingBulkApproveBtn');
  if(btn){ btn.disabled = true; btn.textContent = 'Aprovando...'; }
  // Fix desta sessão (pedido do Leonardo): antes só contava ok/fail, sem
  // dizer em qual ferramenta/plataforma cada peça subiu (ou falhou) —
  // agora coleta o detalhe de cada uma (mesmo padrão do campRunResult,
  // usado em Campanhas) e mostra abaixo dos botões.
  const created = [], errors = [];
  for(const id of ids){
    const asset = PENDING_ASSETS.find(a => a.id === id);
    const label = (asset && asset.name) || id;
    try{
      const res = await fetch(API_BASE + '/desdobrador/' + encodeURIComponent(id) + '/approve?workspace_id=' + encodeURIComponent(pendWorkspaceId), { method: 'POST', headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if(res.ok){
        created.push({ name: label, source: data.source || (asset && asset.plat) || '—', platform_ad_id: data.platform_ad_id || '—' });
      }else{
        errors.push({ name: label, error: data.detail || ('HTTP ' + res.status) });
      }
    }catch(e){ errors.push({ name: label, error: e.message || 'falha de rede' }); }
  }
  renderPendingRunResult(created, errors);
  toast(`✓ ${created.length} aprovada(s)` + (errors.length ? `, ✕ ${errors.length} falhou(aram)` : ''), errors.length ? 'er' : 'ok');
  pendingSelectedIds = new Set();
  loadPendingFromBackend(); // já reseta o texto do botão via pendingUpdateBulkButtons()
}

function renderPendingRunResult(created, errors){
  const el = document.getElementById('pendingRunResult');
  if(!el) return;
  let html = '';
  if(created.length){
    html += '<div style="margin-bottom:10px">'
      + '<div style="font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--success);margin-bottom:4px">✓ Subiram</div>'
      + created.map(c => '<div style="font-size:12px;padding:4px 0">' + _escHtml(c.name) + ' — <span style="text-transform:uppercase">' + _escHtml(c.source) + '</span> — ad_id <span class="td-mono">' + _escHtml(c.platform_ad_id) + '</span></div>').join('')
      + '</div>';
  }
  if(errors.length){
    html += '<div>'
      + '<div style="font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--danger);margin-bottom:4px">✕ Erros</div>'
      + errors.map(e => '<div style="font-size:12px;padding:4px 0;color:var(--danger)">' + _escHtml(e.name) + ' — ' + _escHtml(e.error) + '</div>').join('')
      + '</div>';
  }
  el.innerHTML = html;
}

async function pendingBulkReject(){
  const ids = [...pendingSelectedIds];
  if(!ids.length) return;
  if(!confirm(`Reprovar ${ids.length} peça(s) selecionada(s)?`)) return;
  // Fix desta sessão (pedido do Leonardo) — mesmo feedback visual do
  // aprovar em massa.
  const btn = document.getElementById('pendingBulkRejectBtn');
  if(btn){ btn.disabled = true; btn.textContent = 'Reprovando...'; }
  let ok = 0, fail = 0;
  for(const id of ids){
    try{
      const res = await fetch(API_BASE + '/desdobrador/' + encodeURIComponent(id) + '/reject', {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
        body: JSON.stringify({ reason: '', workspace_id: pendWorkspaceId }),
      });
      if(res.ok) ok++; else fail++;
    }catch(e){ fail++; }
  }
  toast(`✕ ${ok} reprovada(s)` + (fail ? `, ${fail} falhou(aram)` : ''), 'er');
  pendingSelectedIds = new Set();
  loadPendingFromBackend(); // já reseta o texto do botão via pendingUpdateBulkButtons()
}

async function approveAsset(rowId, btnEl){
  // Fix desta sessão (pedido do Leonardo) — feedback visual no botão
  // individual do card, igual ao dos botões em massa.
  if(btnEl){ btnEl.disabled = true; btnEl.textContent = 'Aprovando...'; }
  try{
    const res = await fetch(API_BASE + '/desdobrador/' + encodeURIComponent(rowId) + '/approve?workspace_id=' + encodeURIComponent(pendWorkspaceId), {
      method: 'POST', headers: authHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if(!res.ok) throw new Error(data.detail || 'falha ao aprovar');
    toast('✓ [' + (data.source || '?').toUpperCase() + '] Ad criado (' + (data.platform_ad_id || '—') + ') — status "implemented"', 'ok');
  }catch(e){
    toast('✕ ' + (e.message || 'Não foi possível aprovar'), 'er');
  }
  loadPendingFromBackend(); // recarrega o card (ou some da lista se deu certo) — não precisa reverter o texto manualmente
}
async function rejectAsset(rowId, btnEl){
  // Fix desta sessão (pedido do Leonardo) — mesmo feedback visual.
  if(btnEl){ btnEl.disabled = true; btnEl.textContent = 'Reprovando...'; }
  try{
    const res = await fetch(API_BASE + '/desdobrador/' + encodeURIComponent(rowId) + '/reject', {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
      body: JSON.stringify({ reason: '', workspace_id: pendWorkspaceId }),
    });
    if(!res.ok){ const err = await res.json().catch(() => ({})); throw new Error(err.detail || 'falha ao reprovar'); }
    toast('✕ Peça reprovada', 'er');
  }catch(e){
    toast('✕ ' + (e.message || 'Não foi possível reprovar'), 'er');
  }
  loadPendingFromBackend();
}
function openDetail(id){
  const a = REPO_ASSETS.find(x => x.id === id);
  if(!a) return;
  document.getElementById('dm-title').textContent = a.name;
  document.getElementById('dm-meta').textContent = a.plat + ' · ' + a.camp + ' · ' + a.version.toUpperCase();
  const img = document.getElementById('dm-img');
  img.src = a.img; img.alt = a.name;
  img.style.filter = a.type === 'audio' ? 'grayscale(1)' : '';
  const specs1 = [{l:'Dimensões',v:a.dims},{l:'Formato',v:a.fmt},{l:'Tamanho',v:a.size}];
  const specs2 = [{l:'KV Origem',v:a.kv},{l:'Versão',v:a.version.toUpperCase()},{l:'Upload',v:a.date}];
  document.getElementById('dm-specs').innerHTML = specs1.map(s =>
    '<div class="detail-spec"><div class="detail-spec-lbl">' + s.l + '</div><div class="detail-spec-val">' + s.v + '</div></div>'
  ).join('');
  document.getElementById('dm-specs2').innerHTML = specs2.map(s =>
    '<div class="detail-spec"><div class="detail-spec-lbl">' + s.l + '</div><div class="detail-spec-val">' + s.v + '</div></div>'
  ).join('');
  document.getElementById('dm-actions').innerHTML =
    '<button class="detail-btn" onclick="downloadAsset(' + id + ')">↓ Download</button>'
    + '<button class="detail-btn ghost" onclick="copyLink(' + id + ')">⎘ Copiar link</button>'
    + '<button class="detail-btn ghost" onclick="sendToPlatform(' + id + ')">↑ Enviar para ' + a.plat + '</button>';
  document.getElementById('detailModal').classList.add('open');
}
function closeDetail(e){if(e.target===document.getElementById('detailModal'))closeDetailBtn();}
function closeDetailBtn(){document.getElementById('detailModal').classList.remove('open');}
function downloadAsset(id){const a=REPO_ASSETS.find(x=>x.id===id);toast('Baixando '+a.name,'ok');}
function copyLink(id){const a=REPO_ASSETS.find(x=>x.id===id);toast('Link copiado: '+a.name,'ok');}
function sendToPlatform(id){const a=REPO_ASSETS.find(x=>x.id===id);toast('Enviando para '+a.plat+'...','ok');}
// ── UPLOAD DIRETO (novo nesta sessão) ──────────────────────────────────
// Espelha o padrão da fila do Desdobrador, mas com include_media=true (a
// query já exclui vídeo/áudio por padrão pro fluxo de IA — aqui é
// justamente o oposto, o motivo de existir essa área) e sem geração
// nenhuma: o arquivo escolhido é enviado tal como está pra
// POST /desdobrador/upload-finished.
let UPF_QUEUE = [];
let upfWorkspaceId = '';
let upfSelectedRowIds = new Set();
let upfFile = null;

async function upfLoadWorkspaces(){
  const sel = document.getElementById('upfWorkspaceSelect');
  if(!sel) return;
  const prev = sel.value || upfWorkspaceId;
  sel.innerHTML = '<option value="">Carregando...</option>';
  try{
    const res = await fetch(API_BASE + '/plan/workspaces', { headers: authHeaders() });
    if(!res.ok) throw new Error('sem acesso ao backend');
    const list = await res.json();
    if(!list.length){ sel.innerHTML = '<option value="">Nenhum workspace encontrado</option>'; upfWorkspaceId = ''; return; }
    sel.innerHTML = list.map(w =>
      '<option value="' + w.workspace_id + '">' + _escHtml(w.client_name || w.workspace_id) + '</option>'
    ).join('');
    if(prev && list.some(w => w.workspace_id === prev)) sel.value = prev;
    upfWorkspaceId = sel.value;
    await upfLoadQueue();
  }catch(e){
    sel.innerHTML = '<option value="">Falha ao carregar workspaces</option>';
  }
}

function upfOnWorkspaceChange(){
  const sel = document.getElementById('upfWorkspaceSelect');
  upfWorkspaceId = sel ? sel.value : '';
  upfLoadQueue();
}

async function upfLoadQueue(){
  const tbody = document.getElementById('upfQueueTable');
  if(!upfWorkspaceId){
    UPF_QUEUE = [];
    if(tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--ink-muted);font-family:var(--mono);font-size:11px;padding:20px">Selecione um workspace acima</td></tr>';
    return;
  }
  if(tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--ink-muted);font-family:var(--mono);font-size:11px;padding:20px">Carregando fila...</td></tr>';
  try{
    const res = await fetch(API_BASE + '/desdobrador/queue?workspace_id=' + encodeURIComponent(upfWorkspaceId) + '&include_media=true', { headers: authHeaders() });
    if(!res.ok) throw new Error('backend indisponível');
    const data = await res.json();
    UPF_QUEUE = data.queue || [];
  }catch(e){
    UPF_QUEUE = [];
    if(tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--danger);font-family:var(--mono);font-size:11px;padding:20px">Não foi possível carregar a fila — verifique login/conexão.</td></tr>';
    return;
  }
  renderUpfQueue();
}

function renderUpfQueue(){
  const tbody = document.getElementById('upfQueueTable');
  if(!tbody) return;
  const allCb = document.getElementById('upfSelectAllCheckbox');
  if(allCb) allCb.checked = UPF_QUEUE.length > 0 && UPF_QUEUE.every(r => upfSelectedRowIds.has(r.row_id));
  if(!UPF_QUEUE.length){
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--ink-muted);font-family:var(--mono);font-size:11px;padding:20px">Fila vazia — nada pendente de criativo neste workspace</td></tr>';
    return;
  }
  tbody.innerHTML = UPF_QUEUE.map(r => `
    <tr class="desd-queue-row${upfSelectedRowIds.has(r.row_id)?' active':''}" onclick="upfToggleQueueRow('${r.row_id}')">
      <td><input type="checkbox" class="desd-queue-check" ${upfSelectedRowIds.has(r.row_id)?'checked':''} onclick="event.stopPropagation();upfToggleQueueRow('${r.row_id}')"></td>
      <td class="td-bold">${_escHtml(r.campaign_name)}</td>
      <td class="td-mono">${_escHtml(r.brand)}</td>
      <td class="td-mono">${_escHtml(r.source)}</td>
      <td class="td-mono">${_escHtml(r.creative_size)}</td>
      <td class="td-mono">${_escHtml(r.delivery_date || '')}</td>
    </tr>`).join('');
}

// Novo nesta sessão (pedido do Leonardo) — checkbox "selecionar tudo".
function upfToggleSelectAll(checked){
  if(checked) UPF_QUEUE.forEach(r => upfSelectedRowIds.add(r.row_id));
  else upfSelectedRowIds.clear();
  renderUpfQueue();
  upfUpdateSubmitButtonState();
}

function upfToggleQueueRow(rowId){
  if(upfSelectedRowIds.has(rowId)) upfSelectedRowIds.delete(rowId);
  else upfSelectedRowIds.add(rowId);
  renderUpfQueue();
  upfUpdateSubmitButtonState();
}

function upfOnFileSelected(evt){
  const file = evt.target.files[0];
  if(!file) return;
  upfFile = file;
  document.getElementById('upfUzText').textContent = file.name;
  upfUpdateSubmitButtonState();
}

function upfUpdateSubmitButtonState(){
  const btn = document.getElementById('upfSubmitBtn');
  if(!btn) return;
  const nameEl = document.getElementById('upfCreativeName');
  const hasName = nameEl && nameEl.value.trim().length > 0;
  btn.disabled = !upfFile || !hasName || !upfSelectedRowIds.size;
}

async function upfSubmit(){
  if(!upfFile){ toast('Selecione um arquivo antes de enviar', 'er'); return; }
  const rowIds = Array.from(upfSelectedRowIds);
  if(!rowIds.length){ toast('Marque ao menos uma linha da fila pra atender', 'er'); return; }
  const creativeName = (document.getElementById('upfCreativeName').value || '').trim();
  if(!creativeName){ toast('Informe um nome pro criativo antes de enviar', 'er'); return; }

  const btn = document.getElementById('upfSubmitBtn');
  if(btn){ btn.disabled = true; btn.textContent = 'Enviando...'; }
  try{
    const form = new FormData();
    form.append('file', upfFile);
    form.append('row_ids', JSON.stringify(rowIds));
    form.append('creative_name', creativeName);
    form.append('workspace_id', upfWorkspaceId);
    const res = await fetch(API_BASE + '/desdobrador/upload-finished', {
      method: 'POST', headers: authHeaders(), body: form,
    });
    const data = await res.json().catch(() => ({}));
    if(!res.ok) throw new Error(data.detail || 'backend recusou o upload');
    toast('✓ ' + (data.total || rowIds.length) + ' peça(s) enviada(s) — na fila real de Aguardando Aprovação', 'ok');
    upfFile = null;
    upfSelectedRowIds = new Set();
    document.getElementById('upfCreativeName').value = '';
    document.getElementById('upfUzText').textContent = 'Clique ou arraste o arquivo pronto';
    document.getElementById('upfFileInput').value = '';
    await upfLoadQueue();
    loadPendingFromBackend(); // a peça enviada já aparece na fila de aprovação
  }catch(e){
    toast('✕ ' + (e.message || 'Falha ao enviar pra aprovação'), 'er');
  }
  if(btn){ btn.textContent = 'Enviar para Aprovação →'; }
  upfUpdateSubmitButtonState();
}

function upfSetupDropzone(){
  const zone = document.getElementById('upfDropzone');
  const input = document.getElementById('upfFileInput');
  if(!zone) return;
  ['dragenter','dragover'].forEach(evt => zone.addEventListener(evt, e => {
    e.preventDefault(); e.stopPropagation(); zone.style.borderColor = 'var(--ink)';
  }));
  ['dragleave','drop'].forEach(evt => zone.addEventListener(evt, e => {
    e.preventDefault(); e.stopPropagation(); zone.style.borderColor = '';
  }));
  zone.addEventListener('drop', e => {
    const file = e.dataTransfer.files[0];
    if(!file) return;
    input.files = e.dataTransfer.files;
    upfOnFileSelected({target:{files:[file]}});
  });
}
// ── INIT (Criativos) ──
RU.ready(() => {
  if(window.__oauthReturnHandled) return;
  RU.trackPage('criativos');
  renderRepo(REPO_ASSETS); // já atualiza repo-count e repo-count-header
  upfSetupDropzone();
  pendLoadWorkspaces();
  upfLoadWorkspaces();
});

/* Rise Up MTech — Campanhas (gerado da separação do operations.html em páginas, 18/nov/2026) */


// ── RESUMO DE IMPLEMENTAÇÃO + CAMPANHAS DO PLANO (dados reais: GET /status/campaigns) ──
let CAMP_ROWS = [], CAMP_STATE = 'loading'; // loading | ok | error | nows
function campMsg(){
  if(CAMP_STATE === 'loading') return 'Carregando…';
  if(CAMP_STATE === 'error') return 'Não foi possível carregar os dados agora. Tente atualizar a página.';
  if(CAMP_STATE === 'nows') return 'Nenhum plano de mídia criado ainda. Use "Subir novo plano" ao lado.';
  return 'Nenhuma linha de implementação neste plano ainda.';
}
function campEmptyRow(cols){ return '<tr><td colspan="' + cols + '" style="padding:22px 20px;font-family:var(--mono);font-size:10px;color:var(--ink-muted);line-height:1.6">' + campMsg() + '</td></tr>'; }
function renderCampOverview(){
  const n = st => CAMP_ROWS.length ? CAMP_ROWS.filter(s => s.status === st).length : '—';
  document.getElementById('ov-stI').textContent = n('implemented');
  document.getElementById('ov-stP').textContent = n('pending');
  document.getElementById('ov-stE').textContent = n('error');
  document.getElementById('ov-stS').textContent = n('stand_by');
  // Uma linha por campanha (agrupa as linhas de criativo do plano).
  const groups = {};
  CAMP_ROWS.forEach(r => { (groups[r.camp + '||' + r.plat] = groups[r.camp + '||' + r.plat] || { camp: r.camp, plat: r.plat, rows: [] }).rows.push(r); });
  const list = Object.values(groups);
  const body = document.getElementById('campTable');
  if(!list.length){ body.innerHTML = campEmptyRow(6); }
  else{
    body.innerHTML = list.map(g => {
      const c = st => g.rows.filter(r => r.status === st).length;
      const overall = c('error') ? 'error' : c('pending') ? 'pending' : c('stand_by') ? 'stand_by' : c('implemented') ? 'implemented' : 'finished';
      const starts = g.rows.map(r => RU.parseDate(r.start)).filter(Boolean), ends = g.rows.map(r => RU.parseDate(r.end)).filter(Boolean);
      const f = d => d ? RU.fmtDate(d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0')) : '—';
      return '<tr><td class="td-bold" style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _escHtml(g.camp) + '</td>'
        + '<td class="td-mono">' + _escHtml(g.plat) + '</td>'
        + '<td>' + badgeH(overall) + '</td>'
        + '<td class="td-mono">' + g.rows.length + ' linha' + (g.rows.length > 1 ? 's' : '') + ' · ' + c('implemented') + ' no ar</td>'
        + '<td class="td-mono">' + f(starts.length ? new Date(Math.min(...starts)) : null) + '</td>'
        + '<td class="td-mono">' + f(ends.length ? new Date(Math.max(...ends)) : null) + '</td></tr>';
    }).join('');
  }
  const recent = CAMP_ROWS.slice(0, 8);
  document.getElementById('ov-statusTable').innerHTML = recent.length
    ? recent.map(s => '<tr><td class="td-bold">' + _escHtml(s.criativo) + '</td><td class="td-mono">' + _escHtml(s.plat) + '</td>'
        + '<td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _escHtml(s.camp) + '</td>'
        + '<td title="' + _escHtml(s.rawStatus) + '">' + badgeH(s.status) + '</td></tr>').join('')
    : campEmptyRow(4);
}
async function campLoadOverview(){
  const sel = document.getElementById('campWorkspaceSelect');
  const workspaceId = sel ? sel.value : '';
  if(!workspaceId){ CAMP_ROWS = []; CAMP_STATE = (sel && /Falha/.test(sel.options[sel.selectedIndex]?.text || '')) ? 'error' : 'nows'; renderCampOverview(); return; }
  CAMP_ROWS = []; CAMP_STATE = 'loading'; renderCampOverview();
  const r = await RU.loadImpl(workspaceId);
  if(sel.value !== workspaceId) return;
  CAMP_ROWS = r.rows; CAMP_STATE = r.ok ? 'ok' : 'error';
  renderCampOverview();
}

// ── Seletores de conta por plataforma (topo da aba) ────────────────────
// Adicionado nesta sessão — antes só existia um botão "Contas" que mostrava
// um toast com a lista, sem jeito nenhum de ESCOLHER qual conta usar (o
// pipeline de campanhas quebrava com "act_None" na Meta por causa disso:
// OAuth conecta, mas sem selecionar a conta de anúncio o resto não
// funciona). Um seletor compacto por plataforma, ao lado do de workspace —
// pedido explícito do Leonardo. Meta precisa de TRÊS seleções (conta de
// anúncio, Página do Facebook, conta do Instagram — cada uma é uma
// entidade separada na API do Meta), as outras só uma.
const _CONN_ACCOUNT_MOUNTS = [
  { platform: 'google_ads', mountId: 'acctMount-google_ads', field: null,                    kindFilter: null },
  { platform: 'meta',       mountId: 'acctMount-meta-ad_account_id',        field: 'ad_account_id',        kindFilter: 'ad_account' },
  { platform: 'meta',       mountId: 'acctMount-meta-page_id',              field: 'page_id',              kindFilter: 'page' },
  { platform: 'meta',       mountId: 'acctMount-meta-instagram_account_id', field: 'instagram_account_id', kindFilter: 'instagram_account' },
  { platform: 'tiktok',     mountId: 'acctMount-tiktok', field: null,       kindFilter: null },
];
const _pendingHtml = '<span style="font-family:var(--mono);font-size:9px;color:var(--warn);letter-spacing:.04em">conexão pendente</span>';
// Guarda a última resposta de /connect/accounts/meta em escopo de módulo —
// usada por connOnMetaPageChange pra re-filtrar o seletor de Instagram sem
// precisar buscar de novo no backend toda vez que a Página muda.
let _metaAccountsCache = null;

async function connRenderAccountMounts(workspaceId, backendStatus){
  if(!workspaceId){
    _CONN_ACCOUNT_MOUNTS.forEach(m => {
      const el = document.getElementById(m.mountId);
      if(el) el.innerHTML = '<span style="font-family:var(--mono);font-size:9px;color:var(--ink-muted)">—</span>';
    });
    return;
  }
  // Bug real corrigido nesta sessão: trocar de workspace rapidamente (ou
  // uma chamada de campLoadWorkspaces() disparada por troca de aba ainda
  // em andamento quando o usuário já escolheu outro workspace na mão)
  // podia deixar duas consultas "correndo" ao mesmo tempo — se a do
  // workspace ANTIGO (sem conexão, por exemplo) terminasse DEPOIS da do
  // workspace novo, ela sobrescrevia a tela por último, mostrando
  // "conexão pendente" pro workspace certo só porque a resposta errada
  // chegou atrasada. Trava: sempre que for escrever na tela, confere se
  // o seletor ainda está no mesmo workspace que esta chamada começou —
  // se mudou, essa chamada é obsoleta e desiste silenciosamente (uma
  // chamada mais nova já está cuidando da renderização certa).
  const _isStale = () => document.getElementById('campWorkspaceSelect')?.value !== workspaceId;
  if(_isStale()) return;
  // Uma chamada por plataforma só (não por mount — Meta tem 3 mounts mas
  // usa a mesma resposta de /connect/accounts/meta).
  const accountsCache = {};
  async function fetchAccountsOnce(platform){
    if(platform in accountsCache) return accountsCache[platform];
    try{
      const res = await _fetchWithRetry(API_BASE + '/connect/accounts/' + platform + '?workspace_id=' + encodeURIComponent(workspaceId), { headers: authHeaders() });
      accountsCache[platform] = (res && res.ok) ? await res.json() : null;
    }catch(e){
      accountsCache[platform] = null;
    }
    if(platform === 'meta') _metaAccountsCache = accountsCache[platform];
    return accountsCache[platform];
  }

  for(const m of _CONN_ACCOUNT_MOUNTS){
    if(_isStale()) return; // outro workspace já foi selecionado — abandona o resto do loop
    const el = document.getElementById(m.mountId);
    if(!el) continue;
    const isConnected = backendStatus ? !!backendStatus[m.platform] : false;
    if(!isConnected){
      el.innerHTML = _pendingHtml;
      continue;
    }
    const data = await fetchAccountsOnce(m.platform);
    if(_isStale()) return; // idem — o fetch acima pode ter demorado o suficiente pra ficar obsoleto
    if(!data){
      el.innerHTML = _pendingHtml;
      continue;
    }
    const allAccounts = data.accounts || [];
    let accounts = m.kindFilter ? allAccounts.filter(a => a.kind === m.kindFilter) : allAccounts;
    // Instagram — pedido do Leonardo: a conta de Instagram sempre pertence
    // a UMA Página específica do Facebook, não é uma escolha independente.
    // Filtra pra só mostrar as contas de Instagram vinculadas à Página
    // atualmente selecionada, evitando uma combinação inválida (Página A +
    // Instagram vinculado à Página B). Se a Página ainda não tiver sido
    // escolhida nesta sessão de tela, cai no page_id já salvo (data.selected).
    if(m.field === 'instagram_account_id'){
      const pageSelEl = document.getElementById('acctSel-acctMount-meta-page_id');
      const currentPageId = (pageSelEl && pageSelEl.value) || (data.selected || {}).page_id || null;
      if(currentPageId) accounts = accounts.filter(a => a.page_id === currentPageId);
    }
    if(!accounts.length){
      el.innerHTML = '<span style="font-family:var(--mono);font-size:9px;color:var(--ink-muted)">'
        + (m.field === 'instagram_account_id' ? 'sem Instagram vinculado a essa Página' : 'nenhuma conta encontrada')
        + '</span>';
      continue;
    }
    const selectedVal = m.field ? (data.selected || {})[m.field] : Object.values(data.selected || {})[0];
    const selectId = 'acctSel-' + m.mountId;
    const onchangeCall = m.field === 'page_id'
      ? 'connOnMetaPageChange(\'' + workspaceId + '\',this)'
      : (m.platform === 'tiktok' && m.mountId === 'acctMount-tiktok')
      ? 'connOnTiktokAdvertiserChange(\'' + workspaceId + '\',this)'
      : 'connSaveAccountSelection(\'' + m.platform + '\',' + (m.field ? "'" + m.field + "'" : 'null') + ',\'' + workspaceId + '\',this.value,this)';
    el.innerHTML = '<select class="fs_" id="' + selectId + '" style="font-size:10px;padding:6px 22px 6px 8px" '
      + 'onchange="' + onchangeCall + '">'
      + '<option value="">Selecione…</option>'
      + accounts.map(a => '<option value="' + a.id + '"' + (a.id === selectedVal ? ' selected' : '') + '>' + _escHtml(a.name || a.id) + '</option>').join('')
      + '</select>';
  }
  // TikTok — carrega o seletor de Perfil/Identidade depois do loop
  // principal, já que ele usa uma fonte de dados diferente (GET
  // /connect/accounts/tiktok/identities, chamada dinâmica na API do
  // TikTok, não o que veio estático em fetchAccountsOnce('tiktok')).
  // Mesma ideia do Instagram do Meta (depende de outra seleção primeiro),
  // pedido do Leonardo nesta sessão.
  if(backendStatus && backendStatus.tiktok && !_isStale()){
    const tiktokData = await fetchAccountsOnce('tiktok');
    const advertiserId = (tiktokData && tiktokData.selected || {}).advertiser_id
      || document.getElementById('acctSel-acctMount-tiktok')?.value || null;
    await connLoadTiktokIdentities(workspaceId, advertiserId);
  }
}

// Advertiser TikTok mudou — salva a seleção (igual antes) E recarrega o
// seletor de Perfil/Identidade, filtrado pro advertiser novo (mesma ideia
// do connOnMetaPageChange, mas a lista de identidades é buscada ao vivo
// na API do TikTok, não filtrada de uma lista já carregada).
async function connOnTiktokAdvertiserChange(workspaceId, selectEl){
  await connSaveAccountSelection('tiktok', 'advertiser_id', workspaceId, selectEl.value, selectEl);
  await connLoadTiktokIdentities(workspaceId, selectEl.value);
}

async function connLoadTiktokIdentities(workspaceId, advertiserId){
  const el = document.getElementById('acctMount-tiktok-identity_id');
  if(!el) return;
  if(!advertiserId){
    el.innerHTML = '<span style="font-family:var(--mono);font-size:9px;color:var(--ink-muted)">selecione a conta TikTok primeiro</span>';
    return;
  }
  el.innerHTML = '<span style="font-family:var(--mono);font-size:9px;color:var(--ink-muted)">carregando…</span>';
  try{
    const res = await _fetchWithRetry(API_BASE + '/connect/accounts/tiktok/identities?workspace_id=' + encodeURIComponent(workspaceId), { headers: authHeaders() });
    const data = (res && res.ok) ? await res.json() : null;
    if(!data) throw new Error('falha ao carregar identidades');
    const identities = data.identities || [];
    if(!identities.length){
      // Fix desta sessão (pedido do Leonardo): /identity/get/ pode estar
      // bloqueado por permissão de escopo do app no TikTok for
      // Developers, então a lista vem vazia mesmo com identidade
      // configurada — nesse caso mostra a que já está salva (se tiver, a
      // aprovação de anúncio já usa ela direto, sem depender dessa lista)
      // e oferece criar uma nova direto (POST /identity/create/,
      // contorna o bloqueio de leitura via uma ação de escrita).
      const savedNote = data.selected
        ? '<div style="font-family:var(--mono);font-size:9px;color:var(--ink-mid);margin-bottom:6px">já configurada: <span class="td-mono">' + _escHtml(data.selected) + '</span> (lista bloqueada por permissão, mas a aprovação já usa essa)</div>'
        : '<div style="font-family:var(--mono);font-size:9px;color:var(--ink-muted);margin-bottom:6px">nenhuma identidade encontrada (ou lista bloqueada por permissão)</div>';
      el.innerHTML = savedNote
        + '<input class="fi" id="tiktokIdentityName-' + workspaceId + '" placeholder="Nome de exibição (ex: Rise Up)" style="font-size:10px;padding:6px 8px;margin-bottom:4px;width:100%">'
        + '<input type="file" id="tiktokIdentityAvatar-' + workspaceId + '" accept="image/png,image/jpeg" style="font-size:9px;margin-bottom:4px;width:100%">'
        + '<button class="btn-sm" style="width:100%" onclick="connCreateTiktokIdentity(\'' + workspaceId + '\')">+ Criar identidade</button>';
      return;
    }
    const selectedVal = data.selected;
    const selectedIdentity = identities.find(i => i.id === selectedVal);
    // Aviso visível quando a identidade JÁ selecionada é uma
    // CUSTOMIZED_USER — não basta desabilitar a opção pra frente, se o
    // workspace já está com uma configurada, a pessoa precisa ver que
    // está quebrada e trocar (foi exatamente o caso que gerou esse fix:
    // workspace configurado antes do TikTok descontinuar Custom Identity).
    const deprecatedWarning = (selectedIdentity && selectedIdentity.identity_type === 'CUSTOMIZED_USER')
      ? '<div style="font-family:var(--mono);font-size:9px;color:var(--danger);margin-bottom:4px">⚠ identidade atual é Custom Identity — o TikTok não aceita mais isso pra publicar anúncio. Escolha outra abaixo.</div>'
      : '';
    el.innerHTML = deprecatedWarning
      + '<select class="fs_" id="acctSel-acctMount-tiktok-identity_id" style="font-size:10px;padding:6px 22px 6px 8px" '
      + 'onchange="connSaveTiktokIdentity(\'' + workspaceId + '\',this)">'
      + '<option value="">Selecione…</option>'
      // Fix desta sessão (pedido do Leonardo): identidades CUSTOMIZED_USER
      // aparecem desabilitadas no dropdown, com nota explicando o motivo —
      // o TikTok confirmou ao vivo que Custom Identity não é mais aceito
      // pra publicar anúncio nenhum (erro real da API: "Custom identities
      // are no longer supported"), então deixar essa opção selecionável
      // sem aviso só engana quem for escolher (ia falhar sempre, sem
      // pista do motivo). Não removida da lista de propósito — se o
      // TikTok um dia reverter essa política, só tirar o disabled aqui.
      + identities.map(i => {
          const isDeprecated = i.identity_type === 'CUSTOMIZED_USER';
          const label = isDeprecated ? _escHtml(i.name || i.id) + ' (Custom Identity — não suportado mais pelo TikTok)' : _escHtml(i.name || i.id);
          return '<option value="' + i.id + '" data-identity-type="' + _escHtml(i.identity_type) + '" data-identity-bc-id="' + _escHtml(i.identity_authorized_bc_id || '') + '"'
            + (i.id === selectedVal ? ' selected' : '')
            + (isDeprecated ? ' disabled' : '')
            + '>' + label + '</option>';
        }).join('')
      + '</select>';
  }catch(e){
    el.innerHTML = '<span style="font-family:var(--mono);font-size:9px;color:var(--ink-muted)">falha ao carregar identidades</span>';
  }
}

// Salvar identidade TikTok — precisa mandar identity_type E
// identity_authorized_bc_id juntos (cada <option> já carrega os dois num
// data-attribute, vindo direto do GET /connect/accounts/tiktok/identities).
//
// BUG REAL corrigido nesta sessão, achado ao vivo (pedido do Leonardo:
// "escolhi o perfil no seletor e não deveria precisar digitar nada no
// Console"): esta função só mandava identity_type, NUNCA
// identity_authorized_bc_id — mesmo o backend já sabendo lidar com isso
// desde uma sessão anterior. Resultado: escolher a identidade pela tela
// parecia funcionar (toast de sucesso), mas o approve de peça TikTok
// continuava rejeitando com "Custom identities are no longer supported"
// porque o campo obrigatório pra identity_type=BC_AUTH_TT nunca chegava
// salvo — só funcionava mesmo digitando o fetch manual no Console. Agora
// a tela sozinha já resolve isso, sem precisar de mais nenhum comando manual.
async function connSaveTiktokIdentity(workspaceId, selectEl){
  const identityId = selectEl.value;
  if(!identityId) return;
  const opt = selectEl.selectedOptions[0];
  const identityType = opt?.dataset.identityType || 'CUSTOMIZED_USER';
  const identityAuthorizedBcId = opt?.dataset.identityBcId || '';
  selectEl.disabled = true;
  try{
    const body = { account_id: identityId, field: 'identity_id', identity_type: identityType };
    if(identityType === 'BC_AUTH_TT' && identityAuthorizedBcId) body.identity_authorized_bc_id = identityAuthorizedBcId;
    const res = await fetch(API_BASE + '/connect/accounts/tiktok/select?workspace_id=' + encodeURIComponent(workspaceId), {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if(!res.ok) throw new Error(data.detail || 'falha ao salvar');
    toast('✓ Identidade selecionada', 'ok');
  }catch(e){
    toast('✕ ' + (e.message || 'Não foi possível salvar a identidade'), 'er');
  }
  selectEl.disabled = false;
}

// Cria uma identidade TikTok nova (avatar + nome) direto pela API,
// contornando /identity/get/ bloqueado por permissão — pedido do
// Leonardo nesta sessão. Já salva como selecionada pro workspace
// automaticamente (o backend faz isso no mesmo passo).
async function connCreateTiktokIdentity(workspaceId){
  const nameEl = document.getElementById('tiktokIdentityName-' + workspaceId);
  const fileEl = document.getElementById('tiktokIdentityAvatar-' + workspaceId);
  const displayName = (nameEl && nameEl.value || '').trim();
  const file = fileEl && fileEl.files[0];
  if(!displayName){ toast('Informe um nome de exibição', 'er'); return; }
  if(!file){ toast('Selecione uma imagem de avatar', 'er'); return; }

  const form = new FormData();
  form.append('display_name', displayName);
  form.append('file', file);
  try{
    const res = await fetch(API_BASE + '/connect/accounts/tiktok/identities/create?workspace_id=' + encodeURIComponent(workspaceId), {
      method: 'POST', headers: authHeaders(), body: form,
    });
    const data = await res.json().catch(() => ({}));
    if(!res.ok) throw new Error(data.detail || 'falha ao criar identidade');
    toast('✓ Identidade "' + displayName + '" criada e selecionada', 'ok');
    await connLoadTiktokIdentities(workspaceId, document.getElementById('acctSel-acctMount-tiktok')?.value);
  }catch(e){
    toast('✕ ' + (e.message || 'Não foi possível criar a identidade'), 'er');
  }
}

// Página do Facebook mudou — salva a seleção (igual antes) E re-renderiza
// só o mount do Instagram, filtrado pra essa página nova.
async function connOnMetaPageChange(workspaceId, selectEl){
  await connSaveAccountSelection('meta', 'page_id', workspaceId, selectEl.value, selectEl);
  const igEl = document.getElementById('acctMount-meta-instagram_account_id');
  if(!igEl || !_metaAccountsCache) return;
  const igAccounts = (_metaAccountsCache.accounts || [])
    .filter(a => a.kind === 'instagram_account' && a.page_id === selectEl.value);
  if(!igAccounts.length){
    igEl.innerHTML = '<span style="font-family:var(--mono);font-size:9px;color:var(--ink-muted)">sem Instagram vinculado a essa Página</span>';
    return;
  }
  const selectedVal = (_metaAccountsCache.selected || {}).instagram_account_id;
  igEl.innerHTML = '<select class="fs_" id="acctSel-acctMount-meta-instagram_account_id" style="font-size:10px;padding:6px 22px 6px 8px" '
    + 'onchange="connSaveAccountSelection(\'meta\',\'instagram_account_id\',\'' + workspaceId + '\',this.value,this)">'
    + '<option value="">Selecione…</option>'
    + igAccounts.map(a => '<option value="' + a.id + '"' + (a.id === selectedVal ? ' selected' : '') + '>' + _escHtml(a.name || a.id) + '</option>').join('')
    + '</select>';
}

async function connSaveAccountSelection(platform, field, workspaceId, accountId, selectEl){
  if(!accountId) return;
  if(selectEl) selectEl.disabled = true;
  try{
    const body = { account_id: accountId };
    if(field) body.field = field;
    const res = await fetch(API_BASE + '/connect/accounts/' + platform + '/select?workspace_id=' + encodeURIComponent(workspaceId), {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if(!res.ok) throw new Error(data.detail || 'falha ao salvar');
    toast('✓ Conta selecionada', 'ok');
  }catch(e){
    toast('✕ ' + (e.message || 'Não foi possível salvar a seleção'), 'er');
  }
  if(selectEl) selectEl.disabled = false;
}

// ── CAMPANHAS — rodar pipeline (POST /campaigns/run) ──────────────────────
// Adicionado nesta sessão. Precisa de workspace_id explícito (o backend só
// ganhou esse parâmetro agora — antes rodava sempre no "primeiro workspace
// encontrado" do usuário, o que ficou ambíguo assim que um operador passou
// a ter vários workspaces de teste ativos ao mesmo tempo). Reaproveita
// GET /plan/workspaces, a mesma fonte de dados da aba Planilha.
async function campLoadWorkspaces(){
  const sel = document.getElementById('campWorkspaceSelect');
  const btn = document.getElementById('campRunBtn');
  if(!sel) return;
  // Bug real corrigido nesta sessão: perdia a seleção atual toda vez que
  // recarregava (pulava pro primeiro workspace da lista sempre) —
  // parecia que "as conexões caíam" quando na real o seletor tinha
  // silenciosamente trocado de workspace por baixo dos panos. Mesmo
  // padrão de preservar `prev` que connLoadWorkspaceSelect já usava.
  const prev = sel.value;
  sel.innerHTML = '<option value="">Carregando...</option>';
  if(btn) btn.disabled = true;
  try{
    const res = await fetch(API_BASE + '/plan/workspaces', { headers: authHeaders() });
    if(!res.ok) throw new Error('sem acesso ao backend');
    const list = await res.json();
    if(!list.length){
      sel.innerHTML = '<option value="">Nenhum workspace encontrado</option>';
      connRenderAccountMounts(null);
      campLoadOverview();
      return;
    }
    sel.innerHTML = list.map(w =>
      '<option value="' + w.workspace_id + '">' + _escHtml(w.client_name || w.workspace_id) + '</option>'
    ).join('');
    const _want = prev || RU.getWs();
    if(_want && list.some(w => w.workspace_id === _want)) sel.value = _want;
    if(btn) btn.disabled = false;
    // Carrega a conta/página salva pro workspace automaticamente — sem
    // clique manual (pedido do Leonardo: workspace e conta/página são
    // independentes, mas a exibição da conta/página certa pro workspace
    // escolhido tem que ser automática). Robustecido nesta sessão com
    // trava de obsolescência (ver connRenderAccountMounts) + retry em
    // falha de rede passageira (ver _fetchWithRetry) — os dois bugs
    // reais que causavam "conexão pendente" por engano.
    await campOnWorkspaceChange();
  }catch(e){
    sel.innerHTML = '<option value="">Falha ao carregar workspaces</option>';
    connRenderAccountMounts(null);
    campLoadOverview();
  }
}

// Adicionado nesta sessão — os seletores de conta/página (Google Ads,
// Meta×3, TikTok) foram movidos da aba Conexões pra cá, junto do botão de
// rodar o pipeline (pedido do Leonardo: "ali [Conexões] é exclusivo pra
// conexões mesmo"). Reaproveita connRenderAccountMounts, que já existia
// pra isso — só troca quem chama. Dispara automaticamente quando o
// workspace muda (sem clique manual) — robustecido com trava de
// obsolescência + retry, ver connRenderAccountMounts/_fetchWithRetry.
async function campOnWorkspaceChange(){
  const sel = document.getElementById('campWorkspaceSelect');
  const workspaceId = sel ? sel.value : '';
  if(workspaceId) RU.setWs(workspaceId);
  campLoadOverview();
  if(!workspaceId){ connRenderAccountMounts(null); return; }
  let backendStatus = null;
  try{
    const res = await _fetchWithRetry(API_BASE + '/connect/status?workspace_id=' + encodeURIComponent(workspaceId), { headers: authHeaders() });
    if(res && res.ok) backendStatus = await res.json();
  }catch(e){ /* connRenderAccountMounts já trata backendStatus null como tudo pendente */ }
  // Trava de obsolescência — se o usuário já trocou de workspace de novo
  // enquanto esse fetch estava em andamento, essa chamada é descartada (a
  // mais nova já cuida disso).
  if(sel.value !== workspaceId) return;
  connRenderAccountMounts(workspaceId, backendStatus);
}

async function campRunPipeline(){
  const sel = document.getElementById('campWorkspaceSelect');
  const workspaceId = sel ? sel.value : '';
  if(!workspaceId){ toast('Selecione um workspace primeiro', 'er'); return; }

  const btn = document.getElementById('campRunBtn');
  const resultEl = document.getElementById('campRunResult');
  if(btn){ btn.disabled = true; btn.textContent = 'Rodando...'; }
  if(resultEl) resultEl.innerHTML = '';

  // O sync (com verificação de consistência planilha <-> BigQuery, com
  // retry) agora roda DENTRO do backend, no início de
  // services/campaigns_engine.run_campaigns_pipeline — tirado daqui pra
  // não duplicar a chamada (era redundante ter os dois). Ver
  // services/plan_sync.sync_and_verify().
  try{
    const res = await fetch(API_BASE + '/campaigns/run?workspace_id=' + encodeURIComponent(workspaceId), {
      method: 'POST', headers: authHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if(!res.ok) throw new Error(data.detail || 'Falha ao rodar o pipeline');
    campRenderRunResult(data);
    const nCreated = (data.created || []).length;
    toast(nCreated ? ('✓ ' + nCreated + ' campanha(s) criada(s)') : '✓ Rodou — nenhuma campanha nova (ver detalhe abaixo)', 'ok');
  }catch(e){
    toast('✕ ' + (e.message || 'Falha ao rodar o pipeline'), 'er');
  }

  if(btn){ btn.disabled = false; btn.textContent = '▶ Rodar Campanhas'; }
}

function campRenderRunResult(data){
  const el = document.getElementById('campRunResult');
  if(!el) return;
  const created = data.created || [], skipped = data.skipped || [], errors = data.errors || [];
  let html = '<div style="font-family:var(--mono);font-size:10px;color:var(--ink-muted);margin-bottom:8px">'
    + (data.groups_total || 0) + ' grupo(s) analisado(s) · ' + created.length + ' criado(s) · '
    + skipped.length + ' pulado(s) · ' + errors.length + ' erro(s)</div>';

  if(created.length){
    html += '<div style="margin-bottom:10px">'
      + '<div style="font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--success);margin-bottom:4px">✓ Criadas</div>'
      + created.map(c => '<div style="font-size:12px;padding:4px 0">' + _escHtml(c.group) + ' — campaign_id <span class="td-mono">' + _escHtml(c.campaign_id) + '</span> (' + c.rows + ' linha' + (c.rows !== 1 ? 's' : '') + ')</div>').join('')
      + '</div>';
  }
  if(skipped.length){
    html += '<div style="margin-bottom:10px">'
      + '<div style="font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-muted);margin-bottom:4px">— Puladas</div>'
      + skipped.map(s => '<div style="font-size:12px;padding:4px 0;color:var(--ink-mid)">' + _escHtml(s.group) + ' — ' + _escHtml(s.reason) + '</div>').join('')
      + '</div>';
  }
  if(errors.length){
    html += '<div>'
      + '<div style="font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--danger);margin-bottom:4px">✕ Erros</div>'
      + errors.map(e => '<div style="font-size:12px;padding:4px 0;color:var(--danger)">' + _escHtml(e.group || '') + ' — ' + _escHtml(e.error || '') + '</div>').join('')
      + '</div>';
  }
  el.innerHTML = html;
}
// ── INIT (Campanhas) ──
RU.ready(() => {
  if(window.__oauthReturnHandled) return;
  RU.trackPage('campanhas');
  renderCampOverview();
  RU.workspaceRefreshers.push(campLoadWorkspaces);
  RU.oauthListeners.push(() => { if(document.getElementById('campWorkspaceSelect')) campOnWorkspaceChange(); });
  campLoadWorkspaces();
});

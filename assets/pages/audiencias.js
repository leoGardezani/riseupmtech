/* Rise Up MTech — Audiências (gerado da separação do operations.html em páginas, 18/nov/2026) */

let audWorkspaceId = '';
let audLastSuggestion = null;  // guarda a última sugestão gerada — útil quando a Fase 2 (criação real) for implementada, pra não precisar gerar de novo.
let audLastPromptText = '';    // novo nesta sessão — prompt original, mandado de volta como contexto em cada ajuste (POST /audiences/refine).

// Fix desta sessão (pedido do Leonardo): antes era um dropdown com
// opções fixas fake ("Produto A Ltda"/"Produto B Ltda"). Agora carrega
// os workspaces reais, mesmo padrão de desdLoadWorkspaces().
async function audLoadWorkspaces(){
  const sel = document.getElementById('audWorkspaceSelect');
  if(!sel) return;
  const prev = sel.value || audWorkspaceId;
  sel.innerHTML = '<option value="">Carregando...</option>';
  try{
    const res = await fetch(API_BASE + '/plan/workspaces', { headers: authHeaders() });
    if(!res.ok) throw new Error('sem acesso ao backend');
    const list = await res.json();
    if(!list.length){ sel.innerHTML = '<option value="">Nenhum workspace encontrado</option>'; audWorkspaceId = ''; return; }
    sel.innerHTML = list.map(w =>
      '<option value="' + w.workspace_id + '">' + _escHtml(w.client_name || w.workspace_id) + '</option>'
    ).join('');
    if(prev && list.some(w => w.workspace_id === prev)) sel.value = prev;
    audWorkspaceId = sel.value;
  }catch(e){
    sel.innerHTML = '<option value="">Falha ao carregar workspaces</option>';
  }
  audLoadTargets();  // novo — carrega campanhas/ad groups reais (BQ) desse workspace
  audLoadPresets();  // novo — carrega audiências já criadas/persistidas (Firestore) desse workspace
}

function audOnWorkspaceChange(){
  const sel = document.getElementById('audWorkspaceSelect');
  audWorkspaceId = sel ? sel.value : '';
  audLoadTargets();
  audLoadPresets();
}

// Novo nesta sessão (pedido do Leonardo: "guardar essas configs pra caso
// o usuário queira aplicá-las de novo") — substitui o estado
// local-de-sessão que a tabela de "Audiências Criadas" usava antes
// (sumia com F5). Lê do Firestore via GET /audiences/list.
async function audLoadPresets(){
  if(!audWorkspaceId){ AUD_CREATED_SESSION = []; renderAudCreatedTable(); return; }
  try{
    const res = await fetch(API_BASE + '/audiences/list?workspace_id=' + encodeURIComponent(audWorkspaceId), { headers: authHeaders() });
    if(!res.ok) throw new Error('falha ao carregar audiências salvas');
    const data = await res.json();
    const sel = document.getElementById('audWorkspaceSelect');
    const wsName = sel && sel.selectedOptions[0] ? sel.selectedOptions[0].textContent : audWorkspaceId;
    AUD_CREATED_SESSION = (data.presets || []).map(p => ({
      name: p.name,
      platform: p.platform,
      platformLabel: p.platform === 'meta' ? 'Meta' : p.platform === 'google_ads' ? 'Google Ads' : 'TikTok',
      description: p.description,
      workspaceId: p.workspace_id,
      workspaceName: wsName,
      createdBy: p.created_by,
      implementedIn: p.implemented_in || [],
      statusBadge: p.status_ok ? '<span class="badge b-g">OK</span>' : '<span class="badge b-r">falhou</span>',
      creationOk: p.status_ok,
      criada: p.created_at_iso ? new Date(p.created_at_iso).toLocaleString('pt-BR') : '—',
      suggestion: p.suggestion,
      applied: p.applied || null,
      googleCustomAudienceResourceName: p.google_custom_audience_resource_name || null,
      presetId: p.id,
    }));
  }catch(e){
    AUD_CREATED_SESSION = [];
    // Fix desta sessão, achado ao vivo (Leonardo reportou: audiências
    // criadas não aparecem depois de F5) — antes essa falha era 100%
    // silenciosa (só limpava a lista, sem pista nenhuma do motivo). Agora
    // mostra o erro real — se for 404, o mais provável é o backend
    // (api/audiences.py com o endpoint /list novo) ainda não ter sido
    // deployado junto com este HTML.
    console.error('[audLoadPresets] falha ao carregar audiências salvas:', e);
    toast('✕ Falha ao carregar audiências salvas — ' + (e.message || 'ver Console (F12) para detalhes'), 'er');
  }
  renderAudCreatedTable();
}

// ── Seletor em cascata de campanhas/ad groups existentes (pedido do
// Leonardo) — GET /audiences/targets lê do BigQuery (set-implementation),
// não da planilha (sobrevive se a planilha for excluída). Marca
// campanha(s) primeiro; só os ad groups/ad sets DAQUELAS campanhas ficam
// disponíveis pra marcar (cascata de verdade, não é só um filtro visual).
let audTargetsData = { meta: {campaigns:[], ad_groups:[]}, google_ads: {campaigns:[], ad_groups:[]}, google_ads_search: {campaigns:[], ad_groups:[]}, tiktok: {campaigns:[], ad_groups:[]} };
let audSelectedTargets = {
  meta: { campaigns: new Set(), ad_groups: new Set() },
  google_ads: { campaigns: new Set(), ad_groups: new Set() },
  google_ads_search: { campaigns: new Set(), ad_groups: new Set() },
  tiktok: { campaigns: new Set(), ad_groups: new Set() },
};

async function audLoadTargets(){
  audSelectedTargets = {
    meta: { campaigns: new Set(), ad_groups: new Set() },
    google_ads: { campaigns: new Set(), ad_groups: new Set() },
    google_ads_search: { campaigns: new Set(), ad_groups: new Set() },
    tiktok: { campaigns: new Set(), ad_groups: new Set() },
  };
  if(!audWorkspaceId){
    audTargetsData = { meta: {campaigns:[], ad_groups:[]}, google_ads: {campaigns:[], ad_groups:[]}, google_ads_search: {campaigns:[], ad_groups:[]}, tiktok: {campaigns:[], ad_groups:[]} };
    ['meta','google_ads','google_ads_search','tiktok'].forEach(p => { audRenderCampaignCheckboxes(p); audRenderAdGroupCheckboxes(p); audUpdateDropdownLabel(p); });
    return;
  }
  try{
    const res = await fetch(API_BASE + '/audiences/targets?workspace_id=' + encodeURIComponent(audWorkspaceId), { headers: authHeaders() });
    if(!res.ok) throw new Error('falha ao carregar campanhas/ad groups');
    audTargetsData = await res.json();
  }catch(e){
    audTargetsData = { meta: {campaigns:[], ad_groups:[]}, google_ads: {campaigns:[], ad_groups:[]}, google_ads_search: {campaigns:[], ad_groups:[]}, tiktok: {campaigns:[], ad_groups:[]} };
  }
  ['meta','google_ads','google_ads_search','tiktok'].forEach(p => { audRenderCampaignCheckboxes(p); audRenderAdGroupCheckboxes(p); audUpdateDropdownLabel(p); });
}

function audRenderCampaignCheckboxes(platform){
  const el = document.getElementById('audCampaignList_' + platform);
  if(!el) return;
  const campaigns = (audTargetsData[platform] || {}).campaigns || [];
  if(!campaigns.length){ el.innerHTML = '<div style="font-family:var(--mono);font-size:9px;color:var(--ink-muted)">nenhuma campanha encontrada</div>'; return; }
  el.innerHTML = campaigns.map(c => `
    <label style="display:flex;align-items:center;gap:6px;padding:3px 0;font-size:11px;cursor:pointer">
      <input type="checkbox" onchange="audToggleCampaignSelection('${platform}','${_escHtml(c.id)}',this.checked)">
      ${_escHtml(c.name)}
    </label>`).join('');
}

function audRenderAdGroupCheckboxes(platform){
  const el = document.getElementById('audAdGroupList_' + platform);
  if(!el) return;
  const selectedCampaigns = audSelectedTargets[platform].campaigns;
  const adGroups = ((audTargetsData[platform] || {}).ad_groups || []).filter(a => selectedCampaigns.has(a.campaign_id));
  if(!selectedCampaigns.size){ el.innerHTML = '<div style="font-family:var(--mono);font-size:9px;color:var(--ink-muted)">marque uma campanha acima primeiro</div>'; return; }
  if(!adGroups.length){ el.innerHTML = '<div style="font-family:var(--mono);font-size:9px;color:var(--ink-muted)">nenhum ad group encontrado pras campanhas marcadas</div>'; return; }
  el.innerHTML = adGroups.map(a => `
    <label style="display:flex;align-items:center;gap:6px;padding:3px 0;font-size:11px;cursor:pointer">
      <input type="checkbox" ${audSelectedTargets[platform].ad_groups.has(a.id) ? 'checked' : ''} onchange="audToggleAdGroupSelection('${platform}','${_escHtml(a.id)}',this.checked)">
      ${_escHtml(a.name)}
    </label>`).join('');
}

function audToggleCampaignSelection(platform, campaignId, checked){
  const set = audSelectedTargets[platform].campaigns;
  if(checked) set.add(campaignId); else set.delete(campaignId);
  // Desmarcar uma campanha também derruba os ad groups dela já
  // marcados — evita mandar um ad_group_id cuja campanha-pai não está
  // mais selecionada (a cascata precisa valer nos dois sentidos).
  if(!checked){
    const stillValid = new Set(((audTargetsData[platform] || {}).ad_groups || []).filter(a => set.has(a.campaign_id)).map(a => a.id));
    audSelectedTargets[platform].ad_groups.forEach(id => { if(!stillValid.has(id)) audSelectedTargets[platform].ad_groups.delete(id); });
  }
  audRenderAdGroupCheckboxes(platform);
  audUpdateDropdownLabel(platform);
}

function audToggleAdGroupSelection(platform, adGroupId, checked){
  if(checked) audSelectedTargets[platform].ad_groups.add(adGroupId);
  else audSelectedTargets[platform].ad_groups.delete(adGroupId);
  audUpdateDropdownLabel(platform);
}

function audUpdateDropdownLabel(platform){
  const btn = document.getElementById('audDropdownBtn_' + platform);
  if(!btn) return;
  const nCamp = audSelectedTargets[platform].campaigns.size;
  const nAg = audSelectedTargets[platform].ad_groups.size;
  btn.textContent = nCamp ? `${nCamp} campanha(s), ${nAg} ad group(s) selecionado(s)` : 'Selecionar campanhas…';
}

// Novo (pedido do Leonardo, achado ao vivo) — o painel virou
// position:absolute pra flutuar por cima do conteúdo em vez de
// empurrar o layout, mas isso tem um efeito colateral: ficando FORA do
// fluxo normal, ele não conta mais pra altura rolável da página. Se o
// botão está perto do fim da tela, o painel abre pra baixo e uma parte
// fica inalcançável — não dá pra rolar a página até lá, porque a
// página não "sabe" que precisa de mais espaço.
//
// Fix desta sessão, achado ao vivo: a primeira versão usava um limite
// fixo (280px) pra decidir cima/baixo — não bastava, porque a altura
// do painel também era fixa (260px via CSS) e não se ajustava ao
// espaço real; com a página rolada até o fim, sobrava pouco dos dois
// lados e o painel ainda cortava. Agora sempre escolhe o lado com MAIS
// espaço livre (nunca fixo) E ajusta a altura máxima do painel pro que
// sobrar de verdade (com teto de 320px, piso de 120px) — garante que
// ele sempre caiba inteiro na tela visível, não importa a posição de
// scroll da página.
function _audPositionDropdown(btn, panel){
  const margin = 12; // folga da borda da janela
  const rect = btn.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom - margin;
  const spaceAbove = rect.top - margin;
  const openBelow = spaceBelow >= spaceAbove;
  const available = Math.max(120, Math.min(320, openBelow ? spaceBelow : spaceAbove));
  panel.style.maxHeight = available + 'px';
  if(openBelow){
    panel.style.top = 'calc(100% + 4px)';
    panel.style.bottom = 'auto';
  } else {
    panel.style.top = 'auto';
    panel.style.bottom = 'calc(100% + 4px)';
  }
}

function audToggleDropdown(platform){
  ['meta','google_ads','google_ads_search','tiktok'].forEach(p => {
    const panel = document.getElementById('audDropdown_' + p);
    const btn = document.getElementById('audDropdownBtn_' + p);
    if(!panel) return;
    const opening = p === platform && panel.style.display === 'none';
    panel.style.display = opening ? 'block' : 'none';
    if(opening && btn) _audPositionDropdown(btn, panel);
  });
}
document.addEventListener('click', (e) => {
  ['meta','google_ads','google_ads_search','tiktok'].forEach(p => {
    const panel = document.getElementById('audDropdown_' + p);
    const btn = document.getElementById('audDropdownBtn_' + p);
    if(!panel || panel.style.display === 'none') return;
    if(!panel.contains(e.target) && e.target !== btn) panel.style.display = 'none';
  });
});

// ── Modal "Implementar audiência existente" (pedido do Leonardo) —
// mesmo seletor em cascata campanha→ad group, mas reaproveitando uma
// audiência JÁ CRIADA (ver AUD_CREATED_SESSION) em vez de gerar uma
// nova. Estado próprio (audImpl*), independente do seletor principal
// (audSelectedTargets/audTargetsData), porque o workspace da audiência
// clicada pode não ser o mesmo que está selecionado no formulário
// principal agora.
let audImplementContext = null;
let audImplementTargetsData = { meta:{campaigns:[],ad_groups:[]}, google_ads:{campaigns:[],ad_groups:[]}, tiktok:{campaigns:[],ad_groups:[]} };
let audImplementSelected = { meta:{campaigns:new Set(),ad_groups:new Set()}, google_ads:{campaigns:new Set(),ad_groups:new Set()}, tiktok:{campaigns:new Set(),ad_groups:new Set()} };

function _audPlatformLabel(p){ return p === 'meta' ? 'Meta — Ad Sets' : p === 'google_ads' ? 'Google Ads — Ad Groups' : 'TikTok — Ad Groups'; }

async function audOpenImplementModal(idx){
  const entry = AUD_CREATED_SESSION[idx];
  if(!entry) return;
  audImplementContext = entry;
  audImplementSelected = { meta:{campaigns:new Set(),ad_groups:new Set()}, google_ads:{campaigns:new Set(),ad_groups:new Set()}, google_ads_search:{campaigns:new Set(),ad_groups:new Set()}, tiktok:{campaigns:new Set(),ad_groups:new Set()} };

  // Fix desta sessão (pedido do Leonardo, achado ao vivo) — pra uma
  // audiência de Google Ads, o modal precisa mostrar os DOIS seletores
  // (Display E Search), já que uma audiência pode ser implementada em
  // ad groups de qualquer um dos dois — não são a mesma coisa na API.
  const implPlatforms = entry.platform === 'google_ads' ? ['google_ads', 'google_ads_search'] : [entry.platform];

  document.getElementById('audImplementModalTitle').textContent = 'Implementar "' + entry.name + '" em outras campanhas';
  document.getElementById('audImplementStatus').innerHTML = '';
  document.getElementById('audImplementPlatforms').innerHTML = implPlatforms.map(p => `
    <div style="margin-bottom:14px;position:relative">
      <div style="font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-muted);margin-bottom:6px">${_audPlatformLabel(p)}</div>
      <button class="fi" style="text-align:left;cursor:pointer" onclick="audToggleImplementDropdown('${p}')" id="audImplDropdownBtn_${p}">Selecionar campanhas…</button>
      <div id="audImplDropdown_${p}" class="aud-dropdown-panel" style="display:none;position:static;max-height:none;overflow-y:visible;box-shadow:none;margin-top:4px">
        <div style="font-family:var(--mono);font-size:9px;color:var(--ink-muted);text-transform:uppercase;margin-bottom:4px">Campanhas</div>
        <div id="audImplCampaignList_${p}"></div>
        <div style="font-family:var(--mono);font-size:9px;color:var(--ink-muted);text-transform:uppercase;margin:10px 0 4px;border-top:1px solid var(--border);padding-top:8px">Ad Groups/Ad Sets (das campanhas marcadas acima)</div>
        <div id="audImplAdGroupList_${p}"></div>
      </div>
    </div>`).join('');

  document.getElementById('audImplementModalOverlay').style.display = 'flex';

  try{
    const res = await fetch(API_BASE + '/audiences/targets?workspace_id=' + encodeURIComponent(entry.workspaceId), { headers: authHeaders() });
    audImplementTargetsData = res.ok ? await res.json() : audImplementTargetsData;
  }catch(e){ /* segue com listas vazias, os selects mostram "nenhuma campanha encontrada" */ }

  implPlatforms.forEach(p => { audRenderImplCampaignCheckboxes(p); audRenderImplAdGroupCheckboxes(p); });
}

function audCloseImplementModal(){
  document.getElementById('audImplementModalOverlay').style.display = 'none';
  audImplementContext = null;
}

function audRenderImplCampaignCheckboxes(platform){
  const el = document.getElementById('audImplCampaignList_' + platform);
  if(!el) return;
  const campaigns = (audImplementTargetsData[platform] || {}).campaigns || [];
  if(!campaigns.length){ el.innerHTML = '<div style="font-family:var(--mono);font-size:9px;color:var(--ink-muted)">nenhuma campanha encontrada</div>'; return; }
  el.innerHTML = campaigns.map(c => `
    <label style="display:flex;align-items:center;gap:6px;padding:3px 0;font-size:11px;cursor:pointer">
      <input type="checkbox" onchange="audToggleImplCampaignSelection('${platform}','${_escHtml(c.id)}',this.checked)">
      ${_escHtml(c.name)}
    </label>`).join('');
}

function audRenderImplAdGroupCheckboxes(platform){
  const el = document.getElementById('audImplAdGroupList_' + platform);
  if(!el) return;
  const selectedCampaigns = audImplementSelected[platform].campaigns;
  const adGroups = ((audImplementTargetsData[platform] || {}).ad_groups || []).filter(a => selectedCampaigns.has(a.campaign_id));
  if(!selectedCampaigns.size){ el.innerHTML = '<div style="font-family:var(--mono);font-size:9px;color:var(--ink-muted)">marque uma campanha acima primeiro</div>'; return; }
  if(!adGroups.length){ el.innerHTML = '<div style="font-family:var(--mono);font-size:9px;color:var(--ink-muted)">nenhum ad group encontrado pras campanhas marcadas</div>'; return; }
  el.innerHTML = adGroups.map(a => `
    <label style="display:flex;align-items:center;gap:6px;padding:3px 0;font-size:11px;cursor:pointer">
      <input type="checkbox" ${audImplementSelected[platform].ad_groups.has(a.id) ? 'checked' : ''} onchange="audToggleImplAdGroupSelection('${platform}','${_escHtml(a.id)}',this.checked)">
      ${_escHtml(a.name)}
    </label>`).join('');
}

function audToggleImplCampaignSelection(platform, campaignId, checked){
  const set = audImplementSelected[platform].campaigns;
  if(checked) set.add(campaignId); else set.delete(campaignId);
  if(!checked){
    const stillValid = new Set(((audImplementTargetsData[platform] || {}).ad_groups || []).filter(a => set.has(a.campaign_id)).map(a => a.id));
    audImplementSelected[platform].ad_groups.forEach(id => { if(!stillValid.has(id)) audImplementSelected[platform].ad_groups.delete(id); });
  }
  audRenderImplAdGroupCheckboxes(platform);
  audUpdateImplDropdownLabel(platform);
}

function audToggleImplAdGroupSelection(platform, adGroupId, checked){
  if(checked) audImplementSelected[platform].ad_groups.add(adGroupId);
  else audImplementSelected[platform].ad_groups.delete(adGroupId);
  audUpdateImplDropdownLabel(platform);
}

function audUpdateImplDropdownLabel(platform){
  const btn = document.getElementById('audImplDropdownBtn_' + platform);
  if(!btn) return;
  const nCamp = audImplementSelected[platform].campaigns.size;
  const nAg = audImplementSelected[platform].ad_groups.size;
  btn.textContent = nCamp ? `${nCamp} campanha(s), ${nAg} ad group(s) selecionado(s)` : 'Selecionar campanhas…';
}

function audToggleImplementDropdown(platform){
  const implPlatforms = audImplementContext.platform === 'google_ads' ? ['google_ads', 'google_ads_search'] : [audImplementContext.platform];
  implPlatforms.forEach(p => {
    const panel = document.getElementById('audImplDropdown_' + p);
    if(!panel) return;
    panel.style.display = (p === platform && panel.style.display === 'none') ? 'block' : 'none';
  });
}

// Envia a atribuição pras campanhas/ad groups marcadas no modal — chama
// o MESMO POST /audiences/create, reaproveitando a suggestion original
// (e o custom_audience_resource_name do Google, se já existir, pra não
// recriar o Custom Audience à toa — ver docstring de create_audience em
// api/audiences.py sobre reuso).
async function audSubmitImplement(){
  const entry = audImplementContext;
  if(!entry) return;
  const statusEl = document.getElementById('audImplementStatus');
  const implBtn = document.getElementById('audSubmitImplementBtn');
  statusEl.innerHTML = '';

  const metaIds = Array.from(audImplementSelected.meta.ad_groups);
  // Fix desta sessão — Display e Search são seletores separados na tela,
  // mas o backend espera uma lista SÓ (google_ad_group_resource_names) e
  // decide sozinho, por ad group, qual mecanismo usar (keyword vs Custom
  // Audience) — ver get_channel_type_for_ad_group em
  // services/google_ads_engine.py.
  const googleIds = Array.from(audImplementSelected.google_ads.ad_groups).concat(Array.from(audImplementSelected.google_ads_search.ad_groups));
  const tiktokIds = Array.from(audImplementSelected.tiktok.ad_groups);
  if(!metaIds.length && !googleIds.length && !tiktokIds.length){
    toast('Marque ao menos um ad group/ad set antes de implementar', 'er');
    return;
  }

  _setBtnProgress(implBtn, true, 'Implementando...');

  try{
    const res = await fetch(API_BASE + '/audiences/create', {
      method: 'POST',
      headers: Object.assign({'Content-Type': 'application/json'}, authHeaders()),
      body: JSON.stringify({
        workspace_id: entry.workspaceId,
        name: entry.name,
        suggestion: entry.suggestion,
        platforms: [entry.platform],
        is_new_preset: false,
        preset_ids: entry.presetId ? { [entry.platform]: entry.presetId } : {},
        meta_ad_set_ids: metaIds,
        google_ad_group_resource_names: googleIds,
        google_custom_audience_resource_name: entry.googleCustomAudienceResourceName || null,
        tiktok_adgroup_ids: tiktokIds,
        target_names: _audBuildTargetNamesMap(audImplementTargetsData),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if(!res.ok) throw new Error(data.detail || 'backend recusou a implementação');

    const r = data.results || {};
    const newImplemented = [];
    ['meta','google_ads','tiktok'].forEach(p => {
      const selectedIds = p === 'meta' ? metaIds : p === 'google_ads' ? googleIds : tiktokIds;
      selectedIds.forEach(id => {
        // Fix desta sessão — googleIds agora mistura Display+Search, o
        // nome pode estar em qualquer um dos dois buckets de targets.
        const found = p === 'google_ads'
          ? ((audImplementTargetsData.google_ads || {}).ad_groups || []).concat((audImplementTargetsData.google_ads_search || {}).ad_groups || []).find(a => a.id === id)
          : ((audImplementTargetsData[p] || {}).ad_groups || []).find(a => a.id === id);
        newImplemented.push((found ? found.name : id) + ' (' + (p === 'meta' ? 'Meta' : p === 'google_ads' ? 'Google Ads' : 'TikTok') + ')');
      });
    });
    entry.implementedIn = (entry.implementedIn || []).concat(newImplemented);
    renderAudCreatedTable();
    audLoadPresets();  // recarrega do Firestore — reflete o implemented_in persistido de verdade
    toast('✓ Audiência implementada em ' + newImplemented.length + ' campanha(s)/ad group(s)', 'ok');
    audCloseImplementModal();
  }catch(e){
    statusEl.innerHTML = '<div style="color:var(--danger)">✕ ' + _escHtml(e.message || 'Falha ao implementar') + '</div>';
  }
  _setBtnProgress(implBtn, false, '✓ Implementar nas campanhas marcadas');
}
// Renderiza uma lista de tags (span.repo-tag) num container — usado pra
// todas as seções da sugestão (interesses, behaviors, keywords, urls).
// `items` pode ser lista de strings OU lista de {name, reasoning} — nesse
// segundo caso o reasoning vira o `title` (tooltip) da tag.
// Novo nesta sessão (pedido do Leonardo: "Implementado em" deve mostrar
// o NOME da campanha/ad group, não o ID) — monta um mapa id→nome a
// partir de um objeto de targets (audTargetsData ou
// audImplementTargetsData, mesmo formato dos dois: {platform:
// {ad_groups: [{id,name,...}]}}), pra mandar junto na criação — o
// backend não tem como saber o nome sozinho sem isso.
function _audBuildTargetNamesMap(targetsData){
  const map = {};
  ['meta', 'google_ads', 'google_ads_search', 'tiktok'].forEach(p => {
    ((targetsData[p] || {}).ad_groups || []).forEach(a => { map[a.id] = a.name; });
  });
  return map;
}

// Botão-com-progresso (pedido do Leonardo) — em vez de só trocar o texto
// pra "Criando...", o botão vira visualmente uma barra de progresso
// (listras animadas, indeterminada — /audiences/create é uma chamada só,
// sem progresso incremental real por plataforma vindo do servidor, não
// finge saber uma % que não temos). `active=true` entra no modo
// progresso com o `label` dado; `active=false` sai do modo e volta pro
// `label` (ou pro texto original salvo, se nenhum for passado).
function _setBtnProgress(btn, active, label){
  if(!btn) return;
  if(active){
    if(btn.dataset.origHtml === undefined) btn.dataset.origHtml = btn.innerHTML;
    btn.classList.add('btn-progress');
    btn.innerHTML = '<span>' + _escHtml(label || 'Processando...') + '</span>';
  } else {
    btn.classList.remove('btn-progress');
    btn.innerHTML = label != null ? label : (btn.dataset.origHtml || btn.innerHTML);
    delete btn.dataset.origHtml;
  }
}

function audRenderTags(containerId, items){
  const el = document.getElementById(containerId);
  if(!el) return;
  if(!items || !items.length){ el.innerHTML = '<span style="font-family:var(--mono);font-size:9px;color:var(--ink-muted)">nenhuma sugestão</span>'; return; }
  el.innerHTML = items.map(item => {
    if(typeof item === 'string') return '<span class="repo-tag">' + _escHtml(item) + '</span>';
    const title = item.reasoning ? ' title="' + _escHtml(item.reasoning) + '"' : '';
    return '<span class="repo-tag"' + title + '>' + _escHtml(item.name || '') + '</span>';
  }).join('');
}

// Formata o bloco de demografia (idade/gênero/localização) — usado pros
// cards de Meta e TikTok. Novo nesta sessão (pedido do Leonardo): esse
// dado já vinha do backend mas nunca era mostrado na tela.
function audFormatDemographics(dem){
  if(!dem) return '';
  const genderLabel = { all: 'Todos', male: 'Homens', female: 'Mulheres' };
  const rows = [];
  if(dem.age_min != null || dem.age_max != null){
    rows.push('<div><strong>Idade:</strong> ' + (dem.age_min ?? '?') + ' – ' + (dem.age_max ?? '?') + ' anos</div>');
  }
  if(dem.genders && dem.genders.length){
    rows.push('<div><strong>Gênero:</strong> ' + dem.genders.map(g => genderLabel[g] || g).join(', ') + '</div>');
  }
  if(dem.locations && dem.locations.length){
    rows.push('<div><strong>Local:</strong> ' + dem.locations.map(l => _escHtml(l)).join(', ') + '</div>');
  }
  return rows.join('');
}

// Baixa as palavras-chave de Search como .txt — pedido do Leonardo: com
// 100+ itens, mostrar como tags na tela ficava ilegível; um arquivo
// pra colar direto no Google Ads Keyword Planner/Custom Segment é bem
// mais útil que uma parede de tags.
function audDownloadKeywords(){
  const keywords = (audLastSuggestion && audLastSuggestion.google_ads && audLastSuggestion.google_ads.search_keywords) || [];
  if(!keywords.length){ toast('Nenhuma palavra-chave gerada ainda', 'er'); return; }
  const name = (document.getElementById('audNameInput').value || 'audiencia').trim() || 'audiencia';
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'audiencia';
  const blob = new Blob([keywords.join('\n')], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'keywords_' + slug + '.txt';
  a.click();
  toast('✓ ' + keywords.length + ' palavra(s)-chave baixada(s)', 'ok');
}

// ── AUDIÊNCIAS — Fase 1 (sugestão via IA) e Fase 2 (criação real nas
// plataformas, POST /audiences/create) já são reais. Fase 3 (presets
// persistidos no Firestore, com histórico entre sessões) ainda não
// existe — a lista abaixo é só estado local desta sessão (some se
// recarregar a página). ──
let AUD_CREATED_SESSION = [];
function renderAudCreatedTable(){
  const tbody = document.getElementById('audCreatedTable');
  if(!tbody) return;
  if(!AUD_CREATED_SESSION.length){
    // A mensagem fica centralizada na área visível do quadro (mesmo quando a tabela é mais larga e rola).
    const box = tbody.closest('.tbox');
    const w = box ? box.clientWidth : 0;
    tbody.innerHTML = '<tr><td colspan="9" style="padding:0"><div style="position:sticky;left:0;box-sizing:border-box;' + (w ? 'width:' + w + 'px;' : '') + 'font-family:var(--mono);font-size:10px;color:var(--ink-muted);text-align:center;padding:16px">nenhuma audiência criada nesta sessão ainda</div></td></tr>';
    return;
  }
  tbody.innerHTML = AUD_CREATED_SESSION.map((a, idx) => `
    <tr class="desd-queue-row" onclick="audOpenDetailModal(${idx})" title="Clique pra ver o que foi implementado de verdade">
      <td class="td-bold">${_escHtml(a.name)}</td>
      <td class="td-mono">${_escHtml(a.platformLabel || '')}</td>
      <td style="font-size:11px;color:var(--ink-mid);max-width:220px" title="${_escHtml(a.description || '')}">${_escHtml((a.description || '').length > 60 ? a.description.slice(0,60) + '…' : (a.description || '—'))}</td>
      <td class="td-mono">${_escHtml(a.workspaceName || '')}</td>
      <td class="td-mono">${_escHtml(a.createdBy || '—')}</td>
      <td class="td-mono" style="font-size:10px">${a.implementedIn && a.implementedIn.length ? _escHtml(a.implementedIn.join(', ')) : '<span style="color:var(--ink-muted)">nenhuma ainda</span>'}</td>
      <td class="td-mono">${a.statusBadge}</td>
      <td class="td-mono" style="color:var(--ink-muted)">${_escHtml(a.criada)}</td>
      <td onclick="event.stopPropagation()">
        <div style="display:flex;gap:6px">
          ${a.creationOk ? '<button class="btn-sm ghost" style="padding:5px 10px;font-size:9px;white-space:nowrap" onclick="audOpenImplementModal(' + idx + ')">+ Implementar</button>' : ''}
          <button class="btn-sm ghost" style="padding:5px 10px;font-size:9px;white-space:nowrap;color:var(--danger);border-color:#fecaca" onclick="audDeletePreset(${idx})" title="Remove só o registro/rastreamento — não desfaz nada já aplicado nas plataformas">✕ Excluir</button>
        </div>
      </td>
    </tr>`).join('');
}

// Novo (pedido do Leonardo, achado ao vivo — o backend já tinha o
// endpoint DELETE /audiences/{preset_id} pronto, o botão no frontend
// nunca tinha sido conectado). Remove só o REGISTRO/rastreamento
// (Firestore) — não desfaz nada já aplicado de verdade nas plataformas
// (Custom Audience no Google, targeting já aplicado no ad set/ad group
// do Meta/TikTok continuam intactos), mesmo aviso que já está na
// docstring do endpoint no backend.
async function audDeletePreset(idx){
  const entry = AUD_CREATED_SESSION[idx];
  if(!entry) return;
  if(!entry.presetId){
    toast('Essa linha ainda não tem um registro salvo pra excluir (recarregue a lista)', 'er');
    return;
  }
  if(!confirm(`Excluir o registro de "${entry.name}"? Isso NÃO desfaz nada já aplicado nas plataformas — só remove da lista de rastreamento.`)) return;
  try{
    const res = await fetch(API_BASE + '/audiences/' + encodeURIComponent(entry.presetId) + '?workspace_id=' + encodeURIComponent(entry.workspaceId || audWorkspaceId), {
      method: 'DELETE', headers: authHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if(!res.ok) throw new Error(data.detail || 'falha ao excluir');
    toast('✓ Registro removido', 'ok');
    await audLoadPresets();
  }catch(e){
    toast('✕ ' + (e.message || 'Não foi possível excluir'), 'er');
  }
}

// Modal de detalhe da audiência (pedido do Leonardo) — mostra o que foi
// REALMENTE aplicado na plataforma (entry.applied, gravado no /create),
// não a sugestão bruta. Reaproveita o visual de "repo-tag" já usado na
// tela de sugestão, mas como HTML montado direto (não injetado num
// container fixo via audRenderTags, já que esse conteúdo é todo
// dinâmico por plataforma).
function _audTagsHtml(items){
  if(!items || !items.length) return '<span style="font-family:var(--mono);font-size:9px;color:var(--ink-muted)">nenhum</span>';
  // Novo (pedido do Leonardo) — listas longas (ex: 50-100 keywords)
  // ganham scroll próprio em vez de esticar o modal inteiro na
  // vertical; abaixo de ~15 itens não vale a pena limitar a altura.
  const style = items.length > 15 ? ' style="max-height:220px;overflow-y:auto;padding-right:4px"' : '';
  return '<div class="repo-tags"' + style + '>' + items.map(t => '<span class="repo-tag">' + _escHtml(t) + '</span>').join('') + '</div>';
}

function _audDemographicsHtml(applied){
  const rows = [];
  if(applied.age_min != null || applied.age_max != null){
    rows.push('<div><strong>Idade:</strong> ' + (applied.age_min ?? '?') + ' – ' + (applied.age_max ?? '?') + ' anos</div>');
  }
  if(applied.genders && applied.genders.length){
    rows.push('<div><strong>Gênero:</strong> ' + applied.genders.map(g => _escHtml(g)).join(', ') + '</div>');
  }
  if(applied.locations && applied.locations.length){
    rows.push('<div><strong>Local:</strong> ' + applied.locations.map(l => _escHtml(l)).join(', ') + '</div>');
  }
  return rows.length ? rows.join('') : '<span style="font-family:var(--mono);font-size:9px;color:var(--ink-muted)">nenhuma sobrescrita</span>';
}

// Um card por seção (mesmo padrão visual dos cards de "Sugestão da IA")
// — `sections` é uma lista de {label, html}.
function _audDetailCardHtml(sections){
  return '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1px;background:var(--border);margin-bottom:16px">'
    + sections.map(s => '<div style="background:var(--bg);padding:16px 18px">'
      + '<div class="desd-format-group-lbl" style="margin-top:0">' + _escHtml(s.label) + '</div>'
      + s.html
      + '</div>').join('')
    + '</div>';
}

// Novo (pedido do Leonardo) — mostra a Estimativa Geral (universo/
// impressões/frequência/cobertura) no modal de detalhe. Esse dado já
// era salvo — faz parte do objeto `suggestion` inteiro que sempre foi
// gravado no preset (campo estimated_metrics, no nível raiz da
// sugestão, igual aparece na tela de "Sugestão da IA") — só faltava
// exibir aqui. É a mesma estimativa pras 3 plataformas (é uma soma
// única, não por plataforma), então aparece igual em qualquer preset
// dessa mesma audiência.
function _audEstimatedMetricsHtml(suggestion){
  const em = (suggestion || {}).estimated_metrics;
  if(!em) return '';
  return '<div style="background:var(--bg2);border:1px solid var(--border);padding:16px 18px;margin-bottom:16px">'
    + '<div class="desd-format-group-lbl" style="margin-top:0">Estimativa Geral (soma das 3 plataformas + Search)</div>'
    + '<div class="pacing-grid" style="grid-template-columns:repeat(4,1fr);background:var(--bg2);margin-top:8px">'
    + '<div class="pacing-card" style="padding:12px 14px;background:var(--bg)"><div class="kpi-lbl">Universo estimado</div><div class="kpi-val" style="font-size:16px">' + _escHtml(em.audience_size_estimate || '—') + '</div></div>'
    + '<div class="pacing-card" style="padding:12px 14px;background:var(--bg)"><div class="kpi-lbl">Impressões no período (est.)</div><div class="kpi-val" style="font-size:16px">' + _escHtml(em.estimated_impressions_for_period || '—') + '</div></div>'
    + '<div class="pacing-card" style="padding:12px 14px;background:var(--bg)"><div class="kpi-lbl">Frequência ao fim (est.)</div><div class="kpi-val" style="font-size:16px">' + _escHtml(em.estimated_frequency_for_period || '—') + '</div></div>'
    + '<div class="pacing-card" style="padding:12px 14px;background:var(--bg)"><div class="kpi-lbl">Cobertura ao fim (est.)</div><div class="kpi-val" style="font-size:16px">' + _escHtml(em.estimated_coverage_pct || '—') + '</div></div>'
    + '</div>'
    + (em.campaign_days ? '<div style="font-family:var(--mono);font-size:9px;color:var(--ink-muted);margin-top:8px">// baseado num período de ' + _escHtml(String(em.campaign_days)) + ' dia(s)</div>' : '')
    + (em.caveat ? '<div style="font-family:var(--mono);font-size:9px;color:var(--warn);margin-top:4px;line-height:1.6">⚠ ' + _escHtml(em.caveat) + '</div>' : '')
    + '</div>';
}

function audOpenDetailModal(idx){
  const entry = AUD_CREATED_SESSION[idx];
  if(!entry) return;

  document.getElementById('audDetailModalTitle').textContent = entry.name;
  document.getElementById('audDetailModalSubtitle').textContent =
    entry.platformLabel + ' · ' + (entry.workspaceName || '') + ' · criada ' + (entry.criada || '');

  const bodyEl = document.getElementById('audDetailModalBody');
  const applied = entry.applied;

  if(!applied){
    // Preset salvo antes do campo `applied` existir (ou plataforma que
    // falhou na implementação) — cai pra mostrar a sugestão original,
    // com aviso de que pode não refletir o que foi de fato aplicado.
    const raw = (entry.suggestion || {})[entry.platform] || {};
    let html = _audEstimatedMetricsHtml(entry.suggestion)
      + '<div style="background:#fef9c3;border:1px solid #fde68a;padding:10px 14px;margin-bottom:16px;font-family:var(--mono);font-size:10px;color:#854d0e;letter-spacing:.04em">'
      + '// audiência criada antes desse detalhe existir (ou a implementação não teve sucesso) — mostrando a sugestão original, pode não refletir exatamente o que foi aplicado na plataforma.</div>';
    if(entry.platform === 'meta'){
      html += _audDetailCardHtml([
        {label: 'Interesses (sugestão)', html: _audTagsHtml((raw.interests || []).map(i => i.name || i))},
        {label: 'Comportamentos (sugestão)', html: _audTagsHtml((raw.behaviors || []).map(b => b.name || b))},
        {label: 'Demografia (sugestão)', html: _audDemographicsHtml(raw.demographics || {})},
      ]);
    } else if(entry.platform === 'google_ads'){
      html += _audDetailCardHtml([
        {label: 'Custom Segment — keywords (sugestão)', html: _audTagsHtml(raw.custom_segment_keywords || [])},
        {label: 'Custom Segment — URLs (sugestão)', html: _audTagsHtml(raw.custom_segment_urls || [])},
        {label: 'Search — keywords (sugestão, ' + ((raw.search_keywords || []).length) + ')', html: _audTagsHtml((raw.search_keywords || []).slice(0, 30))},
        {label: 'Afinidade (sugestão)', html: _audTagsHtml((raw.affinity_segments || []).map(i => i.name || i))},
        {label: 'No Mercado (sugestão)', html: _audTagsHtml((raw.in_market_segments || []).map(i => i.name || i))},
        {label: 'Demografia Detalhada (sugestão)', html: _audTagsHtml((raw.detailed_demographics || []).map(i => i.name || i))},
      ]);
    } else {
      html += _audDetailCardHtml([
        {label: 'Categorias de interesse (sugestão)', html: _audTagsHtml((raw.interest_categories || []).map(i => i.name || i))},
        {label: 'Categorias de comportamento (sugestão)', html: _audTagsHtml((raw.behavior_categories || []).map(b => b.name || b))},
        {label: 'Demografia (sugestão)', html: _audDemographicsHtml(raw.demographics || {})},
      ]);
    }
    bodyEl.innerHTML = html;
    document.getElementById('audDetailModalOverlay').style.display = 'flex';
    return;
  }

  let html = _audEstimatedMetricsHtml(entry.suggestion);
  if(entry.platform === 'meta'){
    html += _audDetailCardHtml([
      {label: 'Interesses aplicados (' + (applied.interests || []).length + ')', html: _audTagsHtml(applied.interests)},
      {label: 'Comportamentos aplicados (' + (applied.behaviors || []).length + ')', html: _audTagsHtml(applied.behaviors)},
      {label: 'Demografia/geo aplicada', html: _audDemographicsHtml(applied)},
    ]);
  } else if(entry.platform === 'google_ads'){
    html += _audDetailCardHtml([
      {label: 'Custom Segment — keywords (' + (applied.custom_segment_keywords || []).length + ')', html: _audTagsHtml(applied.custom_segment_keywords)},
      {label: 'Custom Segment — URLs (' + (applied.custom_segment_urls || []).length + ')', html: _audTagsHtml(applied.custom_segment_urls)},
      {label: 'Search — keywords aplicadas (' + (applied.search_keywords || []).length + ')', html: _audTagsHtml((applied.search_keywords || []).slice(0, 50))},
      {label: 'Afinidade aplicada (' + (applied.affinity_segments || []).length + ')', html: _audTagsHtml(applied.affinity_segments)},
      {label: 'No Mercado aplicado (' + (applied.in_market_segments || []).length + ')', html: _audTagsHtml(applied.in_market_segments)},
      {label: 'Demografia Detalhada aplicada (' + (applied.detailed_demographics || []).length + ')', html: _audTagsHtml(applied.detailed_demographics)},
      {label: 'Demografia/geo aplicada', html: _audDemographicsHtml(applied)},
    ]);
    if((applied.search_keywords || []).length > 50){
      html += '<div style="font-family:var(--mono);font-size:9px;color:var(--ink-muted);margin-top:-8px;margin-bottom:16px">// mostrando as 50 primeiras de ' + applied.search_keywords.length + ' keywords aplicadas</div>';
    }
  } else {
    html += _audDetailCardHtml([
      {label: 'Categorias de interesse aplicadas (' + (applied.interest_categories || []).length + ')', html: _audTagsHtml(applied.interest_categories)},
      {label: 'Categorias de comportamento aplicadas (' + (applied.behavior_categories || []).length + ')', html: _audTagsHtml(applied.behavior_categories)},
      {label: 'Demografia/geo aplicada', html: _audDemographicsHtml(applied)},
    ]);
  }
  bodyEl.innerHTML = html;
  document.getElementById('audDetailModalOverlay').style.display = 'flex';
}

function audCloseDetailModal(){
  document.getElementById('audDetailModalOverlay').style.display = 'none';
}

// Resumo da validação feita pelo backend contra as plataformas: avisa o que NÃO foi validado e o que foi removido.
function audValidationNote(v){
  v = v || {};
  const nomes = {meta:'Meta', tiktok:'TikTok', google_ads:'Google Ads'};
  const linhas = [];
  Object.keys(nomes).forEach(function(k){
    const r = v[k]; if(!r) return;
    if(r.checked === false) linhas.push('⚠ ' + nomes[k] + ' sem validação: ' + (r.reason || 'não foi possível conferir com a plataforma') + '. Confira antes de implementar.');
    const rem = (r.removed || []).concat(r.removed_irrelevant || []);
    if(rem.length) linhas.push('· ' + nomes[k] + ': ' + rem.length + ' item(ns) removido(s) por não existir ou não combinar com o público (' + rem.slice(0,4).join(', ') + (rem.length > 4 ? '…' : '') + ').');
  });
  return linhas;
}

async function audGenerateSuggestion(){
  const btn = document.getElementById('audGenerateBtn');
  const box = document.getElementById('audResultBox');
  const statusEl = document.getElementById('audGenerateStatus');
  const promptText = (document.getElementById('audPromptText').value || '').trim();
  if(!promptText){ toast('Descreva a audiência antes de gerar', 'er'); return; }
  if(!audWorkspaceId){ toast('Selecione um workspace antes de gerar', 'er'); return; }

  btn.disabled = true; btn.textContent = 'Gerando (pode levar alguns segundos)...';
  box.style.display = 'none';
  if(statusEl) statusEl.innerHTML = '';
  // Reseta o estado do botão de download — evita baixar keywords de uma
  // geração anterior enquanto a nova ainda está carregando.
  const dlBtnReset = document.getElementById('audDownloadKeywordsBtn');
  if(dlBtnReset) dlBtnReset.disabled = true;

  try{
    const startDate = document.getElementById('audStartDate').value || null;
    const endDate = document.getElementById('audEndDate').value || null;
    const productUrl = (document.getElementById('audProductUrl').value || '').trim() || null;
    const res = await fetch(API_BASE + '/audiences/suggest', {
      method: 'POST',
      headers: Object.assign({'Content-Type': 'application/json'}, authHeaders()),
      body: JSON.stringify({ workspace_id: audWorkspaceId, prompt: promptText, start_date: startDate, end_date: endDate, product_url: productUrl }),
    });
    const data = await res.json().catch(() => ({}));
    if(!res.ok) throw new Error(data.detail || 'backend recusou a geração');

    audLastPromptText = promptText;  // guardado pra dar contexto nos ajustes (ver audApplyRefinement)
    document.getElementById('audNameInput').value = '';
    audRenderSuggestion(data.suggestions);
    const vNotes = audValidationNote(data.validation);

    box.style.display = 'block';
    box.scrollIntoView({behavior:'smooth', block:'nearest'});
    if(statusEl) statusEl.innerHTML = '<div style="font-family:var(--mono);font-size:10px;color:var(--success)">✓ Sugestão gerada — revise antes de aprovar</div>'
      + vNotes.map(function(l){ return '<div style="font-family:var(--mono);font-size:10px;color:var(--warn,#b8860b);margin-top:3px">' + _escHtml(l) + '</div>'; }).join('');
  }catch(e){
    if(statusEl) statusEl.innerHTML = '<div style="font-family:var(--mono);font-size:10px;color:var(--danger)">✕ ' + _escHtml(e.message || 'Falha ao gerar sugestão') + '</div>';
  }

  btn.disabled = false; btn.textContent = '✦ Gerar audiência com IA';
}

// Extraído nesta sessão (pedido do Leonardo, feature de ajuste
// incremental) — antes essa renderização inteira vivia dentro de
// audGenerateSuggestion(); agora é uma função própria pra
// audApplyRefinement() (POST /audiences/refine) poder reaproveitar sem
// duplicar código. NÃO mexe no campo de nome (audNameInput) — quem
// chama decide se limpa ou não (geração nova limpa; ajuste preserva o
// nome que a pessoa já tinha digitado).
function audRenderSuggestion(suggestions){
  audLastSuggestion = suggestions;
  const s = suggestions || {};
  document.getElementById('audSummaryText').textContent = s.summary || '';

  const meta = s.meta || {};
  audRenderTags('audMetaInterestsTags', meta.interests);
  audRenderTags('audMetaBehaviorsTags', meta.behaviors);
  document.getElementById('audMetaDemographics').innerHTML = audFormatDemographics(meta.demographics);
  const lookalikeEl = document.getElementById('audMetaLookalikeText');
  lookalikeEl.textContent = meta.lookalike_suggestion ? '// Lookalike sugerido: ' + meta.lookalike_suggestion : '';

  const ga = s.google_ads || {};
  audRenderTags('audGoogleKeywordsTags', ga.custom_segment_keywords);
  audRenderTags('audGoogleUrlsTags', ga.custom_segment_urls);
  audRenderTags('audGoogleAffinityTags', ga.affinity_segments);
  audRenderTags('audGoogleInMarketTags', ga.in_market_segments);
  audRenderTags('audGoogleDemographicsTags', ga.detailed_demographics);
  const searchKeywords = ga.search_keywords || [];
  document.getElementById('audSearchKeywordsCount').textContent = searchKeywords.length || '—';
  audRenderTags('audSearchKeywordsTags', searchKeywords);
  const dlBtn = document.getElementById('audDownloadKeywordsBtn');
  if(dlBtn) dlBtn.disabled = !searchKeywords.length;

  const tt = s.tiktok || {};
  audRenderTags('audTiktokInterestsTags', tt.interest_categories);
  audRenderTags('audTiktokBehaviorsTags', tt.behavior_categories);
  document.getElementById('audTiktokDemographics').innerHTML = audFormatDemographics(tt.demographics);

  // Métricas estimadas (pedido do Leonardo) — SEMPRE deixa claro que é
  // estimativa de IA, não dado real de plataforma (ver caveat
  // obrigatório vindo do backend). Campos refletem "no período da
  // campanha" (escalam pela duração real informada em audStartDate/
  // audEndDate) em vez de "por mês".
  const em = s.estimated_metrics || {};
  document.getElementById('audMetricUniverse').textContent = em.audience_size_estimate || '—';
  document.getElementById('audMetricImpressions').textContent = em.estimated_impressions_for_period || '—';
  document.getElementById('audMetricFrequency').textContent = em.estimated_frequency_for_period || '—';
  document.getElementById('audMetricCoverage').textContent = em.estimated_coverage_pct || '—';
  document.getElementById('audMetricsDays').textContent = em.campaign_days ? '// baseado num período de ' + em.campaign_days + ' dia(s)' : '';
  document.getElementById('audMetricsCaveat').textContent = em.caveat ? '⚠ ' + em.caveat : '';
}

// Novo nesta sessão (pedido do Leonardo) — ajuste incremental: "adiciona
// interesse em perfumaria", "tira X", etc. Manda a sugestão ATUAL de
// volta pro backend (POST /audiences/refine) junto da instrução, em vez
// de reformular o prompt inteiro do zero — preserva o que já estava bom.
async function audApplyRefinement(){
  const input = document.getElementById('audRefineInput');
  const instruction = (input.value || '').trim();
  if(!instruction){ toast('Descreva o ajuste desejado (ex: "adiciona perfumaria")', 'er'); return; }
  if(!audLastSuggestion){ toast('Gere uma sugestão antes de ajustar', 'er'); return; }

  const btn = document.getElementById('audRefineBtn');
  const statusEl = document.getElementById('audGenerateStatus');
  btn.disabled = true; btn.textContent = 'Aplicando ajuste...';

  try{
    const res = await fetch(API_BASE + '/audiences/refine', {
      method: 'POST',
      headers: Object.assign({'Content-Type': 'application/json'}, authHeaders()),
      body: JSON.stringify({
        workspace_id: audWorkspaceId,
        current_suggestion: audLastSuggestion,
        refinement_instruction: instruction,
        original_prompt: audLastPromptText,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if(!res.ok) throw new Error(data.detail || 'backend recusou o ajuste');

    audRenderSuggestion(data.suggestions);
    input.value = '';
    toast('✓ Ajuste aplicado', 'ok');
    const rNotes = audValidationNote(data.validation);
    if(statusEl && rNotes.length) statusEl.innerHTML = rNotes.map(function(l){ return '<div style="font-family:var(--mono);font-size:10px;color:var(--warn,#b8860b);margin-top:3px">' + _escHtml(l) + '</div>'; }).join('');
  }catch(e){
    toast('✕ ' + (e.message || 'Falha ao aplicar o ajuste'), 'er');
  }

  btn.disabled = false; btn.textContent = '↻ Aplicar ajuste';
}

// Fase 2 real — chama POST /audiences/create de verdade (Custom
// Audience/Saved Audience no Meta, Custom Audience no Google Ads,
// interest/action categories no TikTok) + atribuição aos ad groups/ad
// sets marcados no seletor em cascata (ver audSelectedTargets acima).
// NÃO TESTADO AO VIVO ainda (ver docstring de create_audience em
// api/audiences.py) — erros de uma plataforma não travam as outras, a
// resposta sempre reporta cada uma separadamente.
async function audApprove(){
  const name = (document.getElementById('audNameInput').value || '').trim();
  if(!name){ toast('Dê um nome pra audiência antes de aprovar', 'er'); return; }
  if(!audLastSuggestion){ toast('Nenhuma sugestão carregada', 'er'); return; }

  // Novo (pedido do Leonardo, achado ao vivo — esqueceu de marcar o ad
  // set do Meta e a audiência simplesmente pulou essa plataforma sem
  // avisar nada, só apareceu faltando depois). Antes de submeter,
  // confere se alguma plataforma que TEM ad group/ad set disponível pra
  // escolher (ou seja, está conectada e tem opções na tela) ficou com
  // ZERO selecionado. Google Ads conta Display+Search juntos, já que na
  // tela são dois seletores mas o backend trata como uma coisa só (ver
  // google_ad_group_resource_names na chamada abaixo). Não bloqueia —
  // deixar uma plataforma de fora às vezes é intencional — só confirma.
  const audPlatformGroups = [
    {label: 'Meta', available: (audTargetsData.meta.ad_groups || []).length, selected: audSelectedTargets.meta.ad_groups.size},
    {label: 'Google Ads', available: (audTargetsData.google_ads.ad_groups || []).length + (audTargetsData.google_ads_search.ad_groups || []).length, selected: audSelectedTargets.google_ads.ad_groups.size + audSelectedTargets.google_ads_search.ad_groups.size},
    {label: 'TikTok Ads', available: (audTargetsData.tiktok.ad_groups || []).length, selected: audSelectedTargets.tiktok.ad_groups.size},
  ];
  const audMissingPlatforms = audPlatformGroups.filter(p => p.available > 0 && p.selected === 0).map(p => p.label);
  if(audMissingPlatforms.length){
    const proceed = confirm(`Nenhum ad group/ad set selecionado em: ${audMissingPlatforms.join(', ')}. Essa(s) plataforma(s) vão ficar de fora da audiência. Continuar mesmo assim?`);
    if(!proceed) return;
  }

  const statusEl = document.getElementById('audApproveStatus');
  const btns = document.querySelectorAll('#audResultBox .btn-sm');
  btns.forEach(b => b.disabled = true);
  const approveBtn = document.getElementById('audApproveBtn');
  _setBtnProgress(approveBtn, true, 'Criando nas plataformas...');
  if(statusEl) statusEl.innerHTML = '';

  try{
    const res = await fetch(API_BASE + '/audiences/create', {
      method: 'POST',
      headers: Object.assign({'Content-Type': 'application/json'}, authHeaders()),
      body: JSON.stringify({
        workspace_id: audWorkspaceId,
        name: name,
        suggestion: audLastSuggestion,
        description: audLastPromptText,
        is_new_preset: true,
        meta_ad_set_ids: Array.from(audSelectedTargets.meta.ad_groups),
        // Fix desta sessão — Display e Search são seletores separados na
        // tela, mas o backend espera uma lista só e decide sozinho, por
        // ad group, qual mecanismo usar (keyword vs Custom Audience).
        google_ad_group_resource_names: Array.from(audSelectedTargets.google_ads.ad_groups).concat(Array.from(audSelectedTargets.google_ads_search.ad_groups)),
        tiktok_adgroup_ids: Array.from(audSelectedTargets.tiktok.ad_groups),
        target_names: _audBuildTargetNamesMap(audTargetsData),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if(!res.ok) throw new Error(data.detail || 'backend recusou a criação');

    const r = data.results || {};
    const platformLabels = [];
    const lines = [];
    ['meta', 'google_ads', 'tiktok'].forEach(key => {
      const label = key === 'meta' ? 'Meta' : key === 'google_ads' ? 'Google Ads' : 'TikTok';
      const info = r[key];
      if(!info) return;
      if(info.ok){
        platformLabels.push(label);
        // Fix desta sessão: TikTok não cria um objeto de audiência
        // separado (diferente de Meta/Google) — "ok" ali só significa
        // "disponível", não "criado". Mensagem ajustada pra não afirmar
        // "criado com sucesso" quando não teve atribuição nenhuma ainda,
        // e pra deixar vermelho se TODAS as atribuições tentadas
        // falharam (mesmo a plataforma continuando "disponível" pra
        // tentar de novo depois, por isso platformLabels ainda inclui).
        const nAttach = (info.attachments || []).length;
        const nOk = (info.attachments || []).filter(a => a.ok).length;
        let msg, color;
        if(key === 'tiktok' && nAttach === 0){ msg = 'pronto (nenhum ad group selecionado ainda pra atribuir)'; color = 'var(--success)'; }
        else if(nAttach && nOk === 0){ msg = `criado, mas 0/${nAttach} atribuição(ões) funcionou (ver detalhe no ad group)`; color = 'var(--danger)'; }
        else if(nAttach){ msg = `criado com sucesso · ${nOk}/${nAttach} atribuição(ões) OK`; color = 'var(--success)'; }
        else { msg = 'criado com sucesso'; color = 'var(--success)'; }
        lines.push(`<div style="color:${color}">${color === 'var(--success)' ? '✓' : '⚠'} ${label}: ${msg}</div>`);
      }
      else{ lines.push(`<div style="color:var(--danger)">✕ ${label}: ${_escHtml(info.error || 'falhou')}</div>`); }
    });

    if(statusEl) statusEl.innerHTML = lines.join('');

    // Fix desta sessão (pedido do Leonardo): antes uma linha só juntava
    // as 3 plataformas — agora cada plataforma vira sua PRÓPRIA linha na
    // tabela de Audiências Criadas, com a descrição (prompt original)
    // salva junto, pra identificar mais fácil o que tem dentro de cada
    // uma sem precisar reabrir a sugestão.
    const wsSel = document.getElementById('audWorkspaceSelect');
    const wsName = wsSel && wsSel.selectedOptions[0] ? wsSel.selectedOptions[0].textContent : audWorkspaceId;
    let createdBy = '';
    try{ createdBy = (JSON.parse(localStorage.getItem('riseup_user') || 'null') || {}).name || ''; }catch(e){}

    ['meta', 'google_ads', 'tiktok'].forEach(key => {
      const info = r[key];
      if(!info) return;
      const label = key === 'meta' ? 'Meta' : key === 'google_ads' ? 'Google Ads' : 'TikTok';
      // Fix desta sessão — pra Google Ads, os ad groups selecionados
      // podem estar espalhados entre os buckets "google_ads" (Display) e
      // "google_ads_search" — junta os dois pra montar o "implementado em".
      const selectedIdsForKey = key === 'google_ads'
        ? Array.from(audSelectedTargets.google_ads.ad_groups).concat(Array.from(audSelectedTargets.google_ads_search.ad_groups))
        : Array.from(audSelectedTargets[key].ad_groups);
      const implementedIn = selectedIdsForKey.map(id => {
        const found = key === 'google_ads'
          ? ((audTargetsData.google_ads || {}).ad_groups || []).concat((audTargetsData.google_ads_search || {}).ad_groups || []).find(a => a.id === id)
          : ((audTargetsData[key] || {}).ad_groups || []).find(a => a.id === id);
        return found ? found.name : id;
      });
      const nAttach = (info.attachments || []).length;
      const nOk = (info.attachments || []).filter(a => a.ok).length;
      let statusBadge;
      if(!info.ok) statusBadge = '<span class="badge b-r">falhou</span>';
      else if(nAttach && nOk === 0) statusBadge = '<span class="badge b-y">criada, atribuição falhou</span>';
      else if(nAttach && nOk < nAttach) statusBadge = '<span class="badge b-y">parcial</span>';
      else statusBadge = '<span class="badge b-g">OK</span>';

      AUD_CREATED_SESSION.unshift({
        name,
        platform: key,
        platformLabel: label,
        description: audLastPromptText,
        workspaceId: audWorkspaceId,
        workspaceName: wsName,
        createdBy,
        implementedIn,
        statusBadge,
        creationOk: info.ok,
        criada: 'agora',
        suggestion: audLastSuggestion,
        applied: info.applied || null,
        googleCustomAudienceResourceName: key === 'google_ads' ? (info.custom_audience_resource_name || null) : null,
        // Novo — id do documento salvo no Firestore (ver
        // /audiences/list) — precisa disso pro "Implementar" saber qual
        // preset atualizar em vez de duplicar.
        presetId: (data.preset_ids || {})[key] || null,
      });
    });
    renderAudCreatedTable();
    audLoadPresets();  // recarrega do Firestore — garante que a linha reflita o que foi persistido de verdade, não só o estado otimista local

    if(platformLabels.length){
      toast('✓ Audiência "' + name + '" criada em: ' + platformLabels.join(', '), 'ok');
      document.getElementById('audResultBox').style.display = 'none';
      document.getElementById('audPromptText').value = '';
    } else {
      toast('✕ Falha nas 3 plataformas — ver detalhes acima', 'er');
    }
  }catch(e){
    if(statusEl) statusEl.innerHTML = '<div style="color:var(--danger)">✕ ' + _escHtml(e.message || 'Falha ao criar a audiência') + '</div>';
    toast('✕ ' + (e.message || 'Falha ao criar a audiência'), 'er');
  }

  btns.forEach(b => b.disabled = false);
  _setBtnProgress(approveBtn, false, '✓ Aprovar e criar nas plataformas');
  if(approveBtn) approveBtn.textContent = '✓ Aprovar e criar nas plataformas';
}
function audDiscard(){
  document.getElementById('audResultBox').style.display = 'none';
  toast('Sugestão descartada', '');
}
// ── AUDIENCE DATA ──
// Performance por audiência × criativo: ainda não há fonte no backend (precisa de métricas de mídia
// no BigQuery). Sem exemplos inventados: vazio até existir dado real.
const AUD_DATA=[];
const HEATMAP_CREATIVES=[];
const HEATMAP_DATA=[];
const HEATMAP_AUDS=[];
const AUD_NO_PERF = '<div style="padding:22px 20px;font-family:var(--mono);font-size:10px;color:var(--ink-muted);line-height:1.7">Sem dados de desempenho ainda. Aparece aqui quando as métricas das plataformas forem integradas.</div>';
function renderAudHeatmap(){
  const el = document.getElementById('audHeatmap');
  if(!el) return;
  if(!HEATMAP_DATA.length){ el.innerHTML = '<tbody><tr><td>' + AUD_NO_PERF + '</td></tr></tbody>'; return; }
  const maxVal = 7.5;
  function cellColor(v){
    if(v === null) return 'background:var(--bg3);color:var(--ink-muted)';
    const t = v / maxVal;
    const g = Math.round(255 * (1 - t));
    const bg = 'rgb(' + Math.round(13+g) + ',' + Math.round(13+g) + ',' + Math.round(13+g) + ')';
    return 'background:' + bg + ';color:' + (t > 0.5 ? '#fff' : '#0d0d0d');
  }
  let html = '<thead><tr><th style="min-width:160px">Audiência</th>';
  HEATMAP_CREATIVES.forEach(h => { html += '<th>' + h + '</th>'; });
  html += '<th>Melhor criativo</th></tr></thead><tbody>';
  HEATMAP_DATA.forEach((row, i) => {
    const vals = row.filter(v => v !== null);
    const best = vals.length ? Math.max(...vals) : null;
    const bestIdx = row.indexOf(best);
    html += '<tr><td style="font-weight:600;white-space:nowrap">' + HEATMAP_AUDS[i] + '</td>';
    row.forEach((v, j) => {
      const style = cellColor(v) + ';text-align:center;font-family:var(--mono);font-size:11px;padding:10px 8px';
      const txt = v !== null ? (j === bestIdx ? '<strong>' + v + '%</strong>' : v + '%') : '—';
      html += '<td style="' + style + '">' + txt + '</td>';
    });
    const bestName = bestIdx >= 0 ? HEATMAP_CREATIVES[bestIdx] : '—';
    const bestTxt = best ? '<div style="color:var(--ink-muted);font-size:9px">CTR ' + best + '%</div>' : '';
    html += '<td style="font-family:var(--mono);font-size:10px;color:var(--ink-soft)">' + bestName + bestTxt + '</td></tr>';
  });
  html += '</tbody>';
  el.innerHTML = html;
}
function renderAudCards(){
  const el = document.getElementById('audCards');
  if(!el) return;
  el.innerHTML = '';
  if(!AUD_DATA.length){ el.innerHTML = '<div style="background:var(--bg)">' + AUD_NO_PERF + '</div>'; return; }
  AUD_DATA.forEach(a => {
    const best = [...a.criativos].sort((x,y) => y.score - x.score)[0];
    const div = document.createElement('div');
    div.style.cssText = 'background:var(--bg);padding:20px 22px';
    const criRows = a.criativos.map(cr => {
      const clr = cr.score >= 90 ? 'var(--success)' : cr.score >= 65 ? 'var(--warn)' : 'var(--ink-muted)';
      return '<div style="margin-bottom:8px">'
        + '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">'
        + '<span style="font-size:12px;font-weight:500">' + cr.name + '</span>'
        + '<span style="font-family:var(--mono);font-size:10px;color:var(--ink-mid)">CTR ' + cr.ctr + '</span>'
        + '</div>'
        + '<div style="display:flex;gap:8px;align-items:center">'
        + '<div style="flex:1;height:3px;background:var(--bg3);position:relative">'
        + '<div style="width:' + cr.score + '%;height:100%;background:' + clr + ';position:absolute;top:0;left:0"></div>'
        + '</div>'
        + '<span style="font-family:var(--mono);font-size:9px;color:var(--ink-muted);width:60px;text-align:right">' + cr.leads + ' leads</span>'
        + '</div></div>';
    }).join('');
    div.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">'
      + '<div>'
      + '<div style="font-family:var(--fh);font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:.04em">' + a.name + '</div>'
      + '<div style="font-family:var(--mono);font-size:9px;color:var(--ink-muted);letter-spacing:.08em;margin-top:3px">' + a.plat + ' · ' + a.size + '</div>'
      + '</div>'
      + '<div style="font-family:var(--mono);font-size:9px;padding:3px 10px;background:var(--bg3);color:var(--ink-mid)">' + a.criativos.length + ' criativos</div>'
      + '</div>'
      + '<div>' + criRows + '</div>'
      + '<div style="margin-top:14px;padding-top:10px;border-top:1px solid var(--border-d)">'
      + '<div style="font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-muted);margin-bottom:4px">// melhor combinação</div>'
      + '<div style="font-size:12px;font-weight:600">' + best.name + '</div>'
      + '<div style="display:flex;gap:12px;margin-top:6px">'
      + '<div><div style="font-family:var(--mono);font-size:8px;color:var(--ink-muted)">CTR</div><div style="font-family:var(--fh);font-weight:700;font-size:16px">' + best.ctr + '</div></div>'
      + '<div><div style="font-family:var(--mono);font-size:8px;color:var(--ink-muted)">LEADS</div><div style="font-family:var(--fh);font-weight:700;font-size:16px">' + best.leads + '</div></div>'
      + '<div><div style="font-family:var(--mono);font-size:8px;color:var(--ink-muted)">CPM</div><div style="font-family:var(--fh);font-weight:700;font-size:16px">' + best.cpm + '</div></div>'
      + '</div></div>';
    el.appendChild(div);
  });
}
// ── INIT (Audiências) ──
RU.ready(() => {
  if(window.__oauthReturnHandled) return;
  RU.trackPage('audiencias');
  renderAudCreatedTable();
  renderAudHeatmap();
  renderAudCards();
  RU.workspaceRefreshers.push(audLoadWorkspaces);
  audLoadWorkspaces();
});

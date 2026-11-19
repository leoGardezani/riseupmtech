/* Rise Up MTech — Desdobrador (gerado da separação do operations.html em páginas, 18/nov/2026) */


// Fila real de material-request "ready to setup" sem creative_name ainda —
// carregada de GET /desdobrador/queue. Cada item tem: row_id,
// campaign_name, brand, source, creative_type, creative_size,
// creative_width, creative_title, creative_description, request_date,
// delivery_date.
let DESD_QUEUE = [];
// Novo (21/set/2026, pedido do Leonardo): quantas variações de IA gerar por
// grupo (chave = desdGroupKey), vindo de GET /desdobrador/variant-counts —
// que lê o media-plan fresco (ver plan_sync.get_variant_counts_by_key no
// backend), o MAIOR `volume` entre as linhas que caem em cada chave, não a
// soma. Carregado junto com a fila (desdLoadQueue); se a chamada falhar ou
// uma chave não aparecer aqui, o fallback é group.rows.length (ver uso em
// desdGenerateAiVariants).
let DESD_VARIANT_COUNTS = {};
let desdWorkspaceId = '';

let desdState = {
  kvDataUrl: null,     // preview local (FileReader) — só pra mostrar o KV enviado
  blobPath: null,       // preenchido se o upload real pro backend funcionar — obrigatório pra gerar/enviar
  selectedRowIds: new Set(),
  // Fix desta sessão (pedido do Leonardo, resolve o bug de "duas peças
  // duplicadas quando seleciona uma variação"): `aiVariants`/
  // `chosenVariantIndex` (globais, um valor só pro lote inteiro) viraram
  // `groups` — um objeto por chave de grupo (mesma campanha+source+
  // medium+creative_type; ver desdGroupKey). Cada grupo tem sua própria
  // leva de variações (uma por linha do grupo) e sua própria atribuição
  // linha→variação, em vez de uma escolha única aplicada a tudo.
  // Formato de cada entrada: { rowIds: [...], kind: 'image'|'video',
  // variants: [...], assignments: {row_id: variantIndex} }
  groups: {},
  ctaText: 'Saiba mais',
  ctaColor: '#0d0d0d',
};

// Chave de agrupamento — os mesmos 4 campos que já formam o row_id (ver
// generate_row_id em services/row_id.py): linhas idênticas nesses 4
// campos são o MESMO slot de formato, repetido N vezes pela coluna
// `volume` do media-plan (ver _explode_media_plans em plan_sync.py), e
// precisam de N variações DIFERENTES da IA — não a mesma peça repetida.
function desdGroupKey(row){
  return [row.campaign_name, row.source, row.medium, row.creative_type].join('|');
}

// Agrupa as linhas atualmente marcadas na fila pela chave acima. Retorna
// um array de {key, rows, isTikTok} — um item por grupo distinto entre as
// linhas selecionadas (normalmente só 1 grupo, mas o desdobrador permite
// marcar linhas de formatos/plataformas diferentes juntas no mesmo KV).
function desdComputeGroups(){
  const rows = DESD_QUEUE.filter(r => desdState.selectedRowIds.has(r.row_id));
  const byKey = {};
  rows.forEach(r => {
    const key = desdGroupKey(r);
    if(!byKey[key]) byKey[key] = [];
    byKey[key].push(r);
  });
  return Object.keys(byKey).map(key => ({
    key,
    rows: byKey[key],
    isTikTok: (byKey[key][0].source || '').trim().toLowerCase() === 'tiktok',
    // Novo (Search/RSA): creative_type="text" vem do material-request
    // (medium="search") — mesmo campo que já compõe a chave de
    // agrupamento (desdGroupKey), então linhas de texto já formam grupo
    // próprio, nunca misturado com imagem/vídeo.
    isText: (byKey[key][0].creative_type || '').trim().toLowerCase() === 'text',
  }));
}

// Novo (Search/RSA) — true quando TODOS os grupos da seleção atual são de
// texto. Usado pra pular a exigência de KV (imagem) inteiramente: RSA não
// tem peça visual nenhuma, só headline/description.
function desdIsAllTextSelected(){
  const groups = desdComputeGroups();
  return groups.length > 0 && groups.every(g => g.isText);
}

function desdParseSize(sizeStr){
  const m = /(\d+)\s*[x×X]\s*(\d+)/.exec(sizeStr || '');
  return m ? {w: +m[1], h: +m[2]} : {w: 1080, h: 1080};
}

// Carrega os workspaces no seletor da aba Desdobrador (mesma fonte que
// Campanhas/Conexões — GET /plan/workspaces) e dispara o load da fila
// pro workspace selecionado.
async function desdLoadWorkspaces(){
  const sel = document.getElementById('desdWorkspaceSelect');
  if(!sel) return;
  // Mesmo bug/fix de campLoadWorkspaces: preserva a seleção atual em vez
  // de sempre pular pro primeiro workspace da lista ao recarregar.
  const prev = sel.value || desdWorkspaceId;
  sel.innerHTML = '<option value="">Carregando...</option>';
  try{
    const res = await fetch(API_BASE + '/plan/workspaces', { headers: authHeaders() });
    if(!res.ok) throw new Error('sem acesso ao backend');
    const list = await res.json();
    if(!list.length){ sel.innerHTML = '<option value="">Nenhum workspace encontrado</option>'; desdWorkspaceId = ''; return; }
    sel.innerHTML = list.map(w =>
      '<option value="' + w.workspace_id + '">' + _escHtml(w.client_name || w.workspace_id) + '</option>'
    ).join('');
    if(prev && list.some(w => w.workspace_id === prev)) sel.value = prev;
    desdWorkspaceId = sel.value;
    await desdLoadQueue();
  }catch(e){
    sel.innerHTML = '<option value="">Falha ao carregar workspaces</option>';
  }
}

function desdOnWorkspaceChange(){
  const sel = document.getElementById('desdWorkspaceSelect');
  desdWorkspaceId = sel ? sel.value : '';
  desdLoadQueue();
}

// GET /desdobrador/queue — linhas reais de material-request "ready to
// setup" ainda sem creative_name. Fix desta sessão: BUG real — o
// endpoint não filtrava por workspace (misturava linhas de todos os
// workspaces, mesma tabela BQ compartilhada) — agora exige
// workspace_id explícito, mesmo padrão de /campaigns/run.
async function desdLoadQueue(){
  const tbody = document.getElementById('desdQueueTable');
  if(!desdWorkspaceId){
    DESD_QUEUE = [];
    if(tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--ink-muted);font-family:var(--mono);font-size:11px;padding:20px">Selecione um workspace acima</td></tr>';
    return;
  }
  if(tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--ink-muted);font-family:var(--mono);font-size:11px;padding:20px">Carregando fila...</td></tr>';
  try{
    const res = await fetch(API_BASE + '/desdobrador/queue?workspace_id=' + encodeURIComponent(desdWorkspaceId), { headers: authHeaders() });
    if(!res.ok) throw new Error('backend indisponível');
    const data = await res.json();
    DESD_QUEUE = data.queue || [];
  }catch(e){
    DESD_QUEUE = [];
    if(tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--danger);font-family:var(--mono);font-size:11px;padding:20px">Não foi possível carregar a fila — verifique login/conexão.</td></tr>';
    return;
  }
  // Não bloqueia a fila se essa chamada falhar — fallback pro group.rows.length
  // de sempre (ver desdGenerateAiVariants).
  try{
    const vcRes = await fetch(API_BASE + '/desdobrador/variant-counts?workspace_id=' + encodeURIComponent(desdWorkspaceId), { headers: authHeaders() });
    DESD_VARIANT_COUNTS = vcRes.ok ? ((await vcRes.json()).counts || {}) : {};
  }catch(e){
    DESD_VARIANT_COUNTS = {};
  }
  renderDesdQueue();
  desdRenderSelectedSummary();
}

function renderDesdQueue(){
  const tbody = document.getElementById('desdQueueTable');
  if(!tbody) return;
  const allCb = document.getElementById('desdSelectAllCheckbox');
  if(allCb) allCb.checked = DESD_QUEUE.length > 0 && DESD_QUEUE.every(r => desdState.selectedRowIds.has(r.row_id));
  if(!DESD_QUEUE.length){
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--ink-muted);font-family:var(--mono);font-size:11px;padding:20px">Fila vazia — todas as peças pendentes já foram desdobradas</td></tr>';
    return;
  }
  tbody.innerHTML = DESD_QUEUE.map(r => `
    <tr class="desd-queue-row${desdState.selectedRowIds.has(r.row_id)?' active':''}" onclick="desdToggleQueueRow('${r.row_id}')">
      <td><input type="checkbox" class="desd-queue-check" ${desdState.selectedRowIds.has(r.row_id)?'checked':''} onclick="event.stopPropagation();desdToggleQueueRow('${r.row_id}')"></td>
      <td class="td-bold" data-label="Campanha">${_escHtml(r.campaign_name)}</td>
      <td class="td-mono" data-label="Marca">${_escHtml(r.brand)}</td>
      <td class="td-mono" data-label="Plataforma">${_escHtml(r.source)}</td>
      <td class="td-mono" data-label="Formato pedido">${_escHtml(r.creative_size)}</td>
      <td class="td-mono" data-label="Entrega">${_escHtml(r.delivery_date || '')}</td>
    </tr>`).join('');
}

// Novo nesta sessão (pedido do Leonardo) — checkbox "selecionar tudo" no
// cabeçalho da fila.
function desdToggleSelectAll(checked){
  if(checked) DESD_QUEUE.forEach(r => desdState.selectedRowIds.add(r.row_id));
  else desdState.selectedRowIds.clear();
  const first = DESD_QUEUE.find(r => desdState.selectedRowIds.has(r.row_id));
  if(first){
    document.getElementById('desdCampaignName').value = first.campaign_name;
    document.getElementById('desdBrand').value = first.brand;
  }
  desdState.groups = {};
  renderDesdQueue();
  desdRenderSelectedSummary();
  desdRenderCtaCharHint();
  desdRenderAiVariantGrid();
  desdUpdateSubmitButtonState();
  desdUpdateKvStepVisibility();
}

function desdToggleQueueRow(rowId){
  if(desdState.selectedRowIds.has(rowId)) desdState.selectedRowIds.delete(rowId);
  else desdState.selectedRowIds.add(rowId);

  // preenche campanha/marca com a primeira linha marcada, só de referência
  const first = DESD_QUEUE.find(r => desdState.selectedRowIds.has(r.row_id));
  if(first){
    document.getElementById('desdCampaignName').value = first.campaign_name;
    document.getElementById('desdBrand').value = first.brand;
  }
  // Trocar quais linhas estão marcadas muda o formato de referência da
  // pré-visualização por IA (usa a primeira linha marcada) — variações já
  // geradas ficam obsoletas, força gerar de novo pra evitar confusão.
  desdState.groups = {};
  renderDesdQueue();
  desdRenderSelectedSummary();
  desdRenderCtaCharHint();
  desdRenderAiVariantGrid();
  desdUpdateSubmitButtonState();
  desdUpdateKvStepVisibility();
}

// Novo nesta sessão (pedido do Leonardo) — mostra o limite de caracteres
// do CTA (creative_max_char, vem da aba de specs da planilha via
// ARRAYFORMULA) baseado na PRIMEIRA linha marcada, só como orientação
// visual — a validação de verdade é sempre no backend (/submit), que
// confere linha por linha (podem ter limites diferentes se você marcar
// linhas de formatos diferentes no mesmo envio).
function desdRenderCtaCharHint(){
  const el = document.getElementById('desdCtaCharHint');
  if(!el) return;
  const first = DESD_QUEUE.find(r => desdState.selectedRowIds.has(r.row_id));
  const maxChar = first ? parseInt(first.creative_max_char, 10) : NaN;
  if(!first || isNaN(maxChar)){
    el.textContent = '';
    return;
  }
  const cur = (document.getElementById('desdCtaText').value || '').length;
  el.textContent = `${cur} / ${maxChar} caracteres (limite da linha "${first.campaign_name}")`;
  el.style.color = cur > maxChar ? 'var(--danger)' : 'var(--ink-muted)';
}

// Novo (Search/RSA) — esconde o passo de KV quando a seleção atual é só
// de linhas de texto (RSA não tem peça visual).
function desdUpdateKvStepVisibility(){
  const allText = desdIsAllTextSelected();
  const kvWrap = document.getElementById('desdKvStepWrap');
  const note = document.getElementById('desdTextModeNote');
  const promptWrap = document.getElementById('desdPromptStepWrap');
  const promptNote = document.getElementById('desdTextPromptNote');
  if(kvWrap) kvWrap.style.display = allText ? 'none' : '';
  if(note) note.style.display = allText ? '' : 'none';
  if(promptWrap) promptWrap.style.display = allText ? 'none' : '';
  if(promptNote) promptNote.style.display = allText ? '' : 'none';
}

function desdRenderSelectedSummary(){
  const el = document.getElementById('desdSelectedRowsSummary');
  if(!el) return;
  const rows = DESD_QUEUE.filter(r => desdState.selectedRowIds.has(r.row_id));
  if(!rows.length){
    el.innerHTML = '<div style="font-family:var(--mono);font-size:10px;color:var(--ink-muted)">Nenhuma linha marcada na fila acima ainda</div>';
    return;
  }
  el.innerHTML = rows.map(r => `<span class="desd-selected-pill">${_escHtml(r.campaign_name)} · ${_escHtml(r.creative_size)} · ${_escHtml(r.source)}</span>`).join('');
}

// ── Upload do KV ──
function desdOnFileSelected(evt){
  const file = evt.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    desdState.kvDataUrl = reader.result;
    document.getElementById('desdUzText').textContent = file.name;
    const wrap = document.getElementById('desdKvPreviewWrap');
    const img = document.getElementById('desdKvPreviewImg');
    if(wrap && img){ img.src = reader.result; wrap.style.display = 'block'; }
    // Trocar o KV invalida qualquer variação já gerada com o KV anterior.
    desdState.groups = {};
    renderDesdQueue();
    desdRenderAiVariantGrid();
    desdUpdateSubmitButtonState();
    desdUploadKvToBackend(file);
  };
  reader.readAsDataURL(file);
}

async function desdUploadKvToBackend(file){
  const statusEl = document.getElementById('desdAiStatus');
  try{
    const form = new FormData();
    form.append('file', file);
    form.append('workspace_id', desdWorkspaceId);
    const res = await fetch(API_BASE + '/desdobrador/kv', {method:'POST', headers: authHeaders(), body: form});
    const data = await res.json().catch(() => ({}));
    if(!res.ok) throw new Error(data.detail || ('HTTP ' + res.status));
    desdState.blobPath = data.blob_path;
  }catch(e){
    desdState.blobPath = null;
    // Fix desta sessão: bug real — antes mostrava uma mensagem genérica
    // fixa, sem o motivo de verdade (ex: bucket do GCS não existe,
    // permissão negada pra service account, etc.), o que impedia
    // diagnosticar o erro real na hora.
    toast('✕ Falha ao subir o KV: ' + (e.message || 'erro desconhecido'), 'er');
  }
}

// ── CTA (texto + cor) — sempre embaixo, largura total, 15% de altura;
// desenhado por código (Pillow no backend, Canvas aqui só pro preview),
// nunca pela IA — garante posição/cor exatas. ──
function desdOnCtaInputsChanged(){
  desdState.ctaText = document.getElementById('desdCtaText').value;
  desdState.ctaColor = document.getElementById('desdCtaBg').value;
  desdRenderCtaCharHint();
  desdRenderAiVariantGrid(); // redesenha só o overlay do CTA nas variações já geradas, sem chamar a IA de novo
}

function desdDrawCtaBarOnCanvas(ctx, w, h, text, color){
  if(!text || !text.trim()) return;
  const barH = h * 0.15;
  const y0 = h - barH;
  ctx.fillStyle = color || '#0d0d0d';
  ctx.fillRect(0, y0, w, barH);
  const fontSize = Math.max(8, Math.round(barH * 0.42));
  ctx.font = `700 ${fontSize}px Arial, Helvetica, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, y0 + barH / 2 + 1);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
}

// ── Geração via IA (POST /desdobrador/ai-preview) — NÃO persiste nada,
// só gera variações (sem CTA) pro usuário revisar/ajustar por linha. ──
// Fix desta sessão (pedido do Leonardo, resolve o bug de "duas peças
// duplicadas quando seleciona uma variação"): antes chamava /ai-preview
// UMA vez pro lote inteiro (usando a primeira linha marcada como
// referência de formato) e aplicava a MESMA variação escolhida em todas
// as linhas selecionadas. Agora chama /ai-preview UMA VEZ POR GRUPO (ver
// desdComputeGroups) — linhas idênticas em campanha+source+medium+
// creative_type (repetidas pela coluna `volume` do media-plan) formam um
// grupo e recebem N variações DIFERENTES (N = tamanho do grupo),
// distribuídas uma por linha automaticamente.
// Novo (Search/RSA, pedido do Leonardo) — busca as keywords que já foram
// IMPLEMENTADAS de verdade (não só sugeridas) na aba Audiências pra uma
// campanha específica, reaproveitando GET /audiences/list (mesmo
// endpoint que a aba Audiências usa pra "Audiências Criadas"). Um preset
// conta como "implementado nessa campanha" quando: (1) é da plataforma
// google_ads, (2) tem search_keywords não vazio, (3) o nome da campanha
// da linha do Desdobrador aparece (contém/é contido) em algum item de
// implemented_in — que guarda o NOME do ad group na plataforma, não
// necessariamente idêntico ao nome interno da linha, por isso o match é
// por substring nos dois sentidos, não igualdade exata.
// NÃO TESTADO ainda contra dado real — se o match não achar nada na
// prática (nomes muito diferentes), a solução é ajustar o critério aqui,
// não trocar o endpoint.
async function desdFetchImplementedKeywords(campaignName){
  if(!desdWorkspaceId || !campaignName) return [];
  try{
    const res = await fetch(API_BASE + '/audiences/list?workspace_id=' + encodeURIComponent(desdWorkspaceId), { headers: authHeaders() });
    if(!res.ok) return [];
    const data = await res.json();
    const presets = data.presets || [];
    const needle = campaignName.trim().toLowerCase();
    const match = presets.find(p => {
      if(p.platform !== 'google_ads') return false;
      const kws = (p.suggestion && p.suggestion.google_ads && p.suggestion.google_ads.search_keywords) || [];
      if(!kws.length) return false;
      return (p.implemented_in || []).some(name => {
        const n = (name || '').toLowerCase();
        return n && (n.includes(needle) || needle.includes(n));
      });
    });
    if(!match) return [];
    const kws = (match.suggestion.google_ads.search_keywords || []);
    return kws.map(k => (typeof k === 'string' ? k : (k.text || k.keyword || ''))).filter(Boolean);
  }catch(e){
    return [];
  }
}

async function desdGenerateAiVariants(){
  const statusEl = document.getElementById('desdAiStatus');
  const btn = document.getElementById('desdGenerateBtn');
  const groups = desdComputeGroups();
  if(!groups.length){ toast('Marque ao menos uma linha da fila (define o(s) formato(s) da pré-visualização)', 'er'); return; }
  // Vídeo TikTok (Veo 3.1, 6s — único valor validado ao vivo) é gerado
  // por IA normalmente aqui, a partir do mesmo KV. 15s ficou de fora
  // (nunca testado contra a API real) — por isso não existe seletor de
  // duração no desdobrador, o backend sempre usa 6s por padrão pra
  // grupos TikTok. Upload Direto (aba Criativos) continua existindo como
  // alternativa pra quando o vídeo já vem pronto por fora, não é mais a
  // única opção pro TikTok.
  // KV só é exigido se pelo menos um grupo selecionado NÃO for de texto —
  // RSA (Search) não tem peça visual nenhuma, só headline/description.
  const needsKv = groups.some(g => !g.isText);
  if(needsKv && !desdState.blobPath){ toast('Envie um KV antes de gerar variações', 'er'); return; }

  const promptText = document.getElementById('desdPromptText').value || '';
  if(btn){ btn.disabled = true; btn.textContent = 'Gerando (pode levar 1-2 min por grupo)...'; }
  desdState.groups = {};
  desdRenderAiVariantGrid();
  desdUpdateSubmitButtonState();

  let okGroups = 0;
  let failMsgs = [];

  for(const group of groups){
    if(statusEl) statusEl.innerHTML = `<div style="font-family:var(--mono);font-size:10px;color:var(--ink-muted)">Grupo "${_escHtml(group.rows[0].campaign_name)}" (${group.rows.length} linha(s)${group.isTikTok ? ', vídeo TikTok' : ''}${group.isText ? ', texto/RSA' : ''}) — ${group.isText ? 'buscando keywords implementadas...' : 'chamando a IA...'}</div>`;
    try{
      let searchKeywords = null;
      if(group.isText){
        // Search/RSA: nada de prompt livre — a IA usa as keywords JÁ
        // IMPLEMENTADAS na aba Audiências pra essa campanha (ver
        // desdFetchImplementedKeywords). Sem keyword implementada, nem
        // vale chamar /ai-preview — é melhor avisar aqui do que deixar o
        // backend gerar algo genérico/sem relação com o que foi de fato
        // implementado.
        searchKeywords = await desdFetchImplementedKeywords(group.rows[0].campaign_name);
        if(!searchKeywords.length){
          failMsgs.push(`"${group.rows[0].campaign_name}": nenhuma keyword implementada encontrada na aba Audiências pra essa campanha — implemente a audiência de Search primeiro`);
          desdState.groups[group.key] = { rows: group.rows, isTikTok: false, isText: true, kind: 'text', headlines: [], descriptions: [], headlineMaxChars: 30, descriptionMaxChars: 90, selectedHeadlines: [], selectedDescriptions: [] };
          desdRenderAiVariantGrid();
          continue;
        }
        if(statusEl) statusEl.innerHTML = `<div style="font-family:var(--mono);font-size:10px;color:var(--ink-muted)">Grupo "${_escHtml(group.rows[0].campaign_name)}" — ${searchKeywords.length} keyword(s) implementada(s) encontrada(s), chamando a IA...</div>`;
      }

      const body = {
        row_ids: group.rows.map(r => r.row_id),
        workspace_id: desdWorkspaceId,
      };
      // blob_path só faz sentido pra grupo com peça visual — grupo de
      // texto não manda esse campo (backend não precisa dele pra gerar
      // headline/description).
      if(group.isText){
        // Corrigido — confirmado lendo creative_deploy.py: AiPreviewRequest
        // NÃO tem campo de keywords nenhum, e generate_text_ad_variations()
        // só aceita brand_instructions/headline_max_chars/description_max_chars.
        // Não dá pra mandar as keywords separadas — a solução é montar a
        // própria brand_instructions automaticamente a partir delas, sem
        // expor prompt livre nenhum pro usuário (ele nunca vê/edita esse
        // texto, só o resultado final).
        body.brand_instructions = `Gere headlines e descriptions de anúncio de pesquisa (Google Ads Search) altamente relevantes para estas palavras-chave, sem inventar tema fora delas: ${searchKeywords.join(', ')}.`;
      } else {
        body.blob_path = desdState.blobPath;
        body.brand_instructions = promptText;
        // Fix 21/set/2026 (pedido do Leonardo): duas linhas DISTINTAS do
        // media-plan podem cair no mesmo grupo (mesma campanha/source/
        // medium/creative_type, ex: dois públicos diferentes) — gerar uma
        // variação por RÉPLICA (soma dos volumes das linhas) gera peça
        // demais. Usa o MAIOR volume entre as linhas do grupo, vindo de
        // GET /desdobrador/variant-counts (lê o media-plan fresco, ver
        // DESD_VARIANT_COUNTS). Fallback pro comportamento de sempre
        // (uma por linha) se a chave não aparecer lá por algum motivo.
        body.n_variants = DESD_VARIANT_COUNTS[group.key] || group.rows.length;
        // TikTok sempre gera vídeo via Veo — fixo em 6s (único valor
        // validado ao vivo; 15s fica de fora até ser testado contra a
        // API real). O backend já teria esse default sozinho, mas manda
        // explícito aqui pra deixar claro no payload o que está sendo
        // pedido.
        if(group.isTikTok){ body.duration_seconds = 6; }
      }

      const res = await fetch(API_BASE + '/desdobrador/ai-preview', {
        method: 'POST',
        headers: Object.assign({'Content-Type': 'application/json'}, authHeaders()),
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if(!res.ok) throw new Error(data.detail || 'backend recusou a geração');

      if(group.isText || data.kind === 'text'){
        // ── Fluxo RSA/texto — NÃO TESTADO ainda contra a API real nesta
        // sessão: assume que /ai-preview devolve {kind:"text",
        // headlines:[...], descriptions:[...], headline_max_chars,
        // description_max_chars} — cada item de headlines/descriptions
        // pode vir como string solta OU {text:"..."}, tratado defensivo
        // abaixo. Se o formato real vier diferente, ajustar aqui depois
        // do primeiro teste ao vivo.
        const toText = x => (typeof x === 'string' ? x : (x && x.text) || '');
        const headlines = (data.headlines || []).map((h, i) => ({ index: i, text: toText(h) }));
        const descriptions = (data.descriptions || []).map((d, i) => ({ index: i, text: toText(d) }));
        const headlineMaxChars = data.headline_max_chars || 30;
        const descriptionMaxChars = data.description_max_chars || 90;

        // Simplificação pedida pelo Leonardo: a seleção de headline/
        // description é ÚNICA por grupo (não mais uma por linha/anúncio
        // RSA) — todo anúncio do grupo usa o MESMO conjunto escolhido.
        // Clique no card seleciona/deseleciona, sem lista duplicada.
        // Auto-seleção inicial: primeiras 3 headlines / 2 descriptions
        // (mínimo exigido pelo RSA) — usuário ajusta clicando.
        desdState.groups[group.key] = {
          rows: group.rows,
          isTikTok: false,
          isText: true,
          kind: 'text',
          headlines,
          descriptions,
          headlineMaxChars,
          descriptionMaxChars,
          selectedHeadlines: headlines.slice(0, Math.min(3, headlines.length)).map(h => h.index),
          selectedDescriptions: descriptions.slice(0, Math.min(2, descriptions.length)).map(d => d.index),
        };
        if(headlines.length >= 3 && descriptions.length >= 2) okGroups++;
        else failMsgs.push(`"${group.rows[0].campaign_name}": a IA gerou candidatos insuficientes (mínimo 3 headlines / 2 descriptions)`);
        desdRenderAiVariantGrid();
        continue;
      }

      const variants = data.variants || [];
      // Auto-atribuição sequencial: variação i vai pra linha i do grupo,
      // ciclando se vieram menos variações OK do que linhas (ex: várias
      // linhas reaproveitando o mesmo conjunto menor de N variações — ver
      // n_variants/DESD_VARIANT_COUNTS acima — ou alguma variação falhou).
      // O usuário pode reatribuir manualmente pelo seletor de cada linha
      // depois (ver desdAssignVariantToRow).
      const okVariants = variants.filter(v => v.data_base64);
      const assignments = {};
      group.rows.forEach((row, i) => {
        if(okVariants.length) assignments[row.row_id] = okVariants[i % okVariants.length].index;
      });

      desdState.groups[group.key] = {
        rows: group.rows,
        isTikTok: group.isTikTok,
        kind: data.kind || (group.isTikTok ? 'video' : 'image'),
        durationSeconds: data.duration_seconds || null,
        variants,
        assignments,
      };
      if(okVariants.length) okGroups++;
      else failMsgs.push(`"${group.rows[0].campaign_name}": nenhuma variação gerou com sucesso`);
    }catch(e){
      failMsgs.push(`"${group.rows[0].campaign_name}": ${e.message || 'falha ao gerar'}`);
      desdState.groups[group.key] = group.isText
        ? { rows: group.rows, isTikTok: false, isText: true, kind: 'text', headlines: [], descriptions: [], headlineMaxChars: 30, descriptionMaxChars: 90, selectedHeadlines: [], selectedDescriptions: [] }
        : { rows: group.rows, isTikTok: group.isTikTok, kind: group.isTikTok ? 'video' : 'image', variants: [], assignments: {} };
    }
    desdRenderAiVariantGrid();
  }

  if(statusEl){
    statusEl.innerHTML = (okGroups === groups.length
      ? `<div style="font-family:var(--mono);font-size:10px;color:var(--success)">✓ ${okGroups} de ${groups.length} grupo(s) gerado(s) com sucesso — revise a atribuição de cada linha abaixo</div>`
      : `<div style="font-family:var(--mono);font-size:10px;color:var(--danger)">${okGroups} de ${groups.length} grupo(s) OK. ${_escHtml(failMsgs.join(' | '))}</div>`);
  }

  if(btn){ btn.disabled = false; btn.textContent = '✦ Gerar variações com IA'; }
  desdUpdateSubmitButtonState();
}

// Renderiza um bloco por grupo: grid de variações (imagem via Canvas+CTA
// preview, ou vídeo via <video> nativo pra grupos TikTok) + a lista de
// linhas do grupo, cada uma com um <select> mostrando/permitindo trocar
// qual variação está atribuída a ela.
function desdRenderAiVariantGrid(){
  const container = document.getElementById('desdAiGroupsContainer');
  if(!container) return;
  const keys = Object.keys(desdState.groups);
  if(!keys.length){ container.innerHTML = ''; return; }

  container.innerHTML = keys.map(key => {
    const g = desdState.groups[key];
    if(g.kind === 'text') return desdRenderTextGroupHtml(key, g);
    const isVideo = g.kind === 'video';
    const cardsHtml = g.variants.map(v => {
      if(!v.data_base64){
        return `<div class="desd-preview-card" style="aspect-ratio:${isVideo?'9/16':'1/1'};display:flex;align-items:center;justify-content:center;background:var(--bg3);color:var(--danger);font-family:var(--mono);font-size:9px;padding:10px;text-align:center">${_escHtml(v.error || 'falhou')}</div>`;
      }
      // Botão "⤢" novo nesta sessão (pedido do Leonardo) — abre a peça
      // ampliada em modal (desdOpenVariantModal), com toggle Desktop/
      // Mobile pra revisar copy/imagem com mais espaço. Fica como botão
      // separado (não a peça inteira clicável) porque em vídeo o card já
      // usa clique nativo pra play/pause do <video controls> — um botão
      // dedicado evita esse conflito.
      const expandBtn = `<button onclick="desdOpenVariantModal('${_escHtml(key)}', ${v.index})" title="Ver ampliado" style="position:absolute;top:6px;right:6px;width:26px;height:26px;border-radius:50%;border:none;background:rgba(13,13,13,.7);color:#fff;font-size:13px;cursor:pointer;z-index:2;display:flex;align-items:center;justify-content:center">⤢</button>`;
      if(isVideo){
        return `<div class="desd-preview-card" data-key="${_escHtml(key)}" data-idx="${v.index}" style="position:relative">
          ${expandBtn}
          <video src="data:video/mp4;base64,${v.data_base64}" controls muted loop style="width:100%;aspect-ratio:9/16;background:#000"></video>
          <div class="desd-preview-lbl">Variação ${v.index + 1}${g.durationSeconds ? ' · ' + g.durationSeconds + 's' : ''}</div>
        </div>`;
      }
      return `<div class="desd-preview-card" data-key="${_escHtml(key)}" data-idx="${v.index}" style="position:relative">
        ${expandBtn}
        <canvas id="desdAiVariant_${_escHtml(key)}_${v.index}"></canvas>
        <div class="desd-preview-lbl">Variação ${v.index + 1}</div>
      </div>`;
    }).join('');

    // Fix 21/set/2026 (pedido do Leonardo — tela carregada demais): rótulo
    // por linha não repete mais campanha inteira (já está no tbox-title
    // acima, uma vez só) — só "Linha N · tamanho", e o layout virou grade
    // (.desd-assign-grid) com as MESMAS colunas da grade de miniaturas
    // logo acima, em vez de uma lista vertical de itens full-width — cada
    // seletor fica alinhado embaixo da miniatura correspondente.
    const rowsHtml = g.rows.map((row, i) => {
      const okVariants = g.variants.filter(v => v.data_base64);
      const optionsHtml = okVariants.map(v =>
        `<option value="${v.index}" ${g.assignments[row.row_id] === v.index ? 'selected' : ''}>Variação ${v.index + 1}</option>`
      ).join('');
      return `<div class="desd-assign-cell">
        <span class="desd-assign-lbl" title="${_escHtml(row.campaign_name)} · ${_escHtml(row.creative_size || '')}">→ Anúncio ${i + 1}</span>
        ${okVariants.length
          ? `<select class="fs_" style="font-size:10px;padding:4px 8px;width:100%" onchange="desdAssignVariantToRow('${_escHtml(key)}','${row.row_id}', parseInt(this.value,10))">${optionsHtml}</select>`
          : `<span style="font-family:var(--mono);font-size:9px;color:var(--danger)">sem variação</span>`}
      </div>`;
    }).join('');

    return `<div class="tbox" style="margin-bottom:16px">
      <div class="tbox-head">
        <div class="tbox-title">${_escHtml(g.rows[0].campaign_name)} · ${_escHtml(g.rows[0].source)}${isVideo ? ' · vídeo' : ''} · ${g.rows.length} linha(s)</div>
      </div>
      <div class="desd-preview-grid" style="padding:12px 20px 0">${cardsHtml}</div>
      <div class="desd-assign-grid" style="padding:8px 20px 14px">${rowsHtml}</div>
    </div>`;
  }).join('');

  // Desenha as variações de IMAGEM nos canvas (com overlay de CTA só pra
  // preview local — o CTA real é desenhado no backend, no /submit). Vídeo
  // já tocou direto via <video src="data:...">, e texto/RSA não tem
  // canvas nenhum — nenhum dos dois precisa desse loop.
  keys.forEach(key => {
    const g = desdState.groups[key];
    if(g.kind === 'video' || g.kind === 'text') return;
    g.variants.forEach(v => {
      if(!v.data_base64) return;
      const canvas = document.getElementById(`desdAiVariant_${key}_${v.index}`);
      if(!canvas) return;
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        desdDrawCtaBarOnCanvas(ctx, img.width, img.height, desdState.ctaText, desdState.ctaColor);
      };
      img.src = 'data:image/png;base64,' + v.data_base64;
    });
  });
}

// ── Grupo de texto (Search/RSA) — NÃO TESTADO ainda contra a API real
// nesta sessão. Renderiza: (1) os candidatos de headline/description
// gerados pela IA, editáveis com contador de caractere; (2) por linha
// (=cada anúncio RSA distinto do grupo), checkboxes pra escolher quais
// desses candidatos entram naquele anúncio específico (mínimo 3
// headlines / 2 descriptions, regra real do RSA). ──
function desdRenderTextGroupHtml(key, g){
  const hOk = g.selectedHeadlines.length >= 3;
  const dOk = g.selectedDescriptions.length >= 2;

  // Card clicável — igual ao padrão dos cards de imagem/vídeo (clique em
  // QUALQUER parte, inclusive o texto, seleciona/deseleciona; borda +
  // fundo destacam o estado). O <input> fica readonly + pointer-events:
  // none por padrão (clique nele "atravessa" pro card por trás, em vez
  // de focar o campo) — pra editar o texto, clica no ✎, que destrava só
  // aquele campo (desdEnableHeadlineEdit/desdEnableDescriptionEdit) e
  // trava de novo ao sair do campo (onblur).
  const headlinesHtml = g.headlines.map(h => {
    const selected = g.selectedHeadlines.includes(h.index);
    const id = `desdHL_${_escHtml(key)}_${h.index}`;
    return `<div onclick="desdToggleHeadline('${_escHtml(key)}', ${h.index})" style="display:flex;align-items:center;gap:8px;padding:8px 10px;margin-bottom:6px;border:1px solid ${selected ? 'var(--ink)' : 'var(--line)'};background:${selected ? 'var(--bg3)' : 'transparent'};cursor:pointer;border-radius:2px">
      <span style="font-size:14px;line-height:1">${selected ? '✓' : '○'}</span>
      <input class="fi" id="${id}" readonly style="font-size:11px;flex:1;border:none;background:transparent;padding:2px 0;pointer-events:none;cursor:pointer" value="${_escHtml(h.text)}" oninput="desdEditHeadlineText('${_escHtml(key)}', ${h.index}, this.value)" onblur="desdLockTextField('${id}')">
      <span id="desdHLCount_${_escHtml(key)}_${h.index}" style="font-family:var(--mono);font-size:9px;color:${h.text.length > g.headlineMaxChars ? 'var(--danger)' : 'var(--ink-muted)'};min-width:40px;text-align:right">${h.text.length}/${g.headlineMaxChars}</span>
      <button onclick="event.stopPropagation();desdUnlockTextField('${id}')" title="Editar texto" style="border:none;background:none;cursor:pointer;color:var(--ink-muted);font-size:12px;padding:2px 4px;flex-shrink:0">✎</button>
    </div>`;
  }).join('');

  const descriptionsHtml = g.descriptions.map(d => {
    const selected = g.selectedDescriptions.includes(d.index);
    const id = `desdDESC_${_escHtml(key)}_${d.index}`;
    return `<div onclick="desdToggleDescription('${_escHtml(key)}', ${d.index})" style="display:flex;align-items:center;gap:8px;padding:8px 10px;margin-bottom:6px;border:1px solid ${selected ? 'var(--ink)' : 'var(--line)'};background:${selected ? 'var(--bg3)' : 'transparent'};cursor:pointer;border-radius:2px">
      <span style="font-size:14px;line-height:1">${selected ? '✓' : '○'}</span>
      <input class="fi" id="${id}" readonly style="font-size:11px;flex:1;border:none;background:transparent;padding:2px 0;pointer-events:none;cursor:pointer" value="${_escHtml(d.text)}" oninput="desdEditDescriptionText('${_escHtml(key)}', ${d.index}, this.value)" onblur="desdLockTextField('${id}')">
      <span id="desdDESCCount_${_escHtml(key)}_${d.index}" style="font-family:var(--mono);font-size:9px;color:${d.text.length > g.descriptionMaxChars ? 'var(--danger)' : 'var(--ink-muted)'};min-width:40px;text-align:right">${d.text.length}/${g.descriptionMaxChars}</span>
      <button onclick="event.stopPropagation();desdUnlockTextField('${id}')" title="Editar texto" style="border:none;background:none;cursor:pointer;color:var(--ink-muted);font-size:12px;padding:2px 4px;flex-shrink:0">✎</button>
    </div>`;
  }).join('');

  // Um conjunto só, compartilhado por todos os anúncios RSA do grupo
  // (simplificação pedida pelo Leonardo — antes tinha uma seleção por
  // linha, duplicando a lista inteira de candidatos por anúncio).
  const rowNames = g.rows.map(r => _escHtml(r.campaign_name)).join(', ');

  return `<div class="tbox" style="margin-bottom:16px">
    <div class="tbox-head">
      <div class="tbox-title">${_escHtml(g.rows[0].campaign_name)} · ${_escHtml(g.rows[0].source)} · texto/RSA · ${g.rows.length} anúncio(s)</div>
    </div>
    <div style="padding:12px 20px 0">
      <div style="font-family:var(--mono);font-size:9px;color:var(--ink-muted);margin-bottom:10px;line-height:1.6">// mesma seleção vale pros ${g.rows.length} anúncio(s) deste grupo: ${rowNames}</div>
      <div class="desd-step-lbl" style="margin-top:0;font-size:11px;color:${hOk ? 'var(--success)' : 'var(--danger)'}">Headlines — ${g.selectedHeadlines.length} selecionada(s) (mín. 3) <span style="font-weight:400;color:var(--ink-muted)">— clique em qualquer parte do card pra marcar/desmarcar; clique no ✎ pra editar o texto</span></div>
      ${headlinesHtml}
      <div class="desd-step-lbl" style="font-size:11px;margin-top:14px;color:${dOk ? 'var(--success)' : 'var(--danger)'}">Descriptions — ${g.selectedDescriptions.length} selecionada(s) (mín. 2)</div>
      ${descriptionsHtml}
    </div>
  </div>`;
}

// Edita o texto de um candidato (headline/description) — atualiza o
// estado e o contador de caractere direto (sem re-render completo, pra
// não perder o foco do campo enquanto digita).
// Destrava/trava um campo de texto de candidato pra edição — por padrão
// o input é readonly + pointer-events:none (clique "atravessa" pro card
// por trás e conta como seleção); clicar no ✎ chama isso pra poder
// digitar, e sair do campo (blur) trava de novo.
function desdUnlockTextField(inputId){
  const el = document.getElementById(inputId);
  if(!el) return;
  el.readOnly = false;
  el.style.pointerEvents = 'auto';
  el.style.cursor = 'text';
  el.focus();
  el.select();
}

function desdLockTextField(inputId){
  const el = document.getElementById(inputId);
  if(!el) return;
  el.readOnly = true;
  el.style.pointerEvents = 'none';
  el.style.cursor = 'pointer';
}

function desdEditHeadlineText(groupKey, index, value){
  const g = desdState.groups[groupKey];
  if(!g) return;
  const h = g.headlines.find(x => x.index === index);
  if(!h) return;
  h.text = value;
  const countEl = document.getElementById(`desdHLCount_${groupKey}_${index}`);
  if(countEl){
    countEl.textContent = `${value.length}/${g.headlineMaxChars}`;
    countEl.style.color = value.length > g.headlineMaxChars ? 'var(--danger)' : 'var(--ink-muted)';
  }
}

function desdEditDescriptionText(groupKey, index, value){
  const g = desdState.groups[groupKey];
  if(!g) return;
  const d = g.descriptions.find(x => x.index === index);
  if(!d) return;
  d.text = value;
  const countEl = document.getElementById(`desdDESCCount_${groupKey}_${index}`);
  if(countEl){
    countEl.textContent = `${value.length}/${g.descriptionMaxChars}`;
    countEl.style.color = value.length > g.descriptionMaxChars ? 'var(--danger)' : 'var(--ink-muted)';
  }
}

// Marca/desmarca um candidato de headline/description pro grupo inteiro
// (seleção única compartilhada por todos os anúncios RSA do grupo — ver
// desdRenderTextGroupHtml). Clique no card chama isso direto, sem
// checkbox.
function desdToggleHeadline(groupKey, index){
  const g = desdState.groups[groupKey];
  if(!g) return;
  const pos = g.selectedHeadlines.indexOf(index);
  if(pos === -1) g.selectedHeadlines.push(index);
  else g.selectedHeadlines.splice(pos, 1);
  desdRenderAiVariantGrid();
  desdUpdateSubmitButtonState();
}

function desdToggleDescription(groupKey, index){
  const g = desdState.groups[groupKey];
  if(!g) return;
  const pos = g.selectedDescriptions.indexOf(index);
  if(pos === -1) g.selectedDescriptions.push(index);
  else g.selectedDescriptions.splice(pos, 1);
  desdRenderAiVariantGrid();
  desdUpdateSubmitButtonState();
}

// Troca manualmente qual variação está atribuída a uma linha específica
// dentro de um grupo — chamado pelo <select> de cada linha em
// desdRenderAiVariantGrid.
function desdAssignVariantToRow(groupKey, rowId, variantIndex){
  const g = desdState.groups[groupKey];
  if(!g) return;
  g.assignments[rowId] = variantIndex;
  desdUpdateSubmitButtonState();
}

// ── Modal de peça ampliada (pedido do Leonardo) — clica no "⤢" de um
// card de variação e abre isso: peça em tamanho grande, com toggle
// Desktop/Mobile pra revisar copy/imagem com mais espaço. ──
let desdModalState = { key: null, index: null, device: 'mobile' };

function desdOpenVariantModal(key, index){
  desdModalState = { key, index, device: desdModalState.device || 'mobile' };
  desdRenderVariantModal();
  document.getElementById('desdModalOverlay').style.display = 'flex';
}

function desdCloseVariantModal(){
  document.getElementById('desdModalOverlay').style.display = 'none';
  // Vídeo continua tocando em background se não pausar ao fechar.
  const wrap = document.getElementById('desdModalMediaWrap');
  const video = wrap && wrap.querySelector('video');
  if(video) video.pause();
}

function desdSetModalDevice(device){
  desdModalState.device = device;
  desdRenderVariantModal();
}

function desdRenderVariantModal(){
  const g = desdState.groups[desdModalState.key];
  if(!g) return;
  const v = g.variants.find(x => x.index === desdModalState.index);
  if(!v || !v.data_base64) return;

  const isMobile = desdModalState.device === 'mobile';
  const deskBtn = document.getElementById('desdModalDeskBtn');
  const mobBtn = document.getElementById('desdModalMobileBtn');
  if(deskBtn) deskBtn.style.background = isMobile ? '#fff' : 'var(--ink)';
  if(deskBtn) deskBtn.style.color = isMobile ? 'var(--ink)' : '#fff';
  if(mobBtn) mobBtn.style.background = isMobile ? 'var(--ink)' : '#fff';
  if(mobBtn) mobBtn.style.color = isMobile ? '#fff' : 'var(--ink)';

  const wrap = document.getElementById('desdModalMediaWrap');
  // Mobile: moldura estreita tipo celular (bordas grossas arredondadas),
  // simula como a peça fica num feed de verdade. Desktop: só maior, sem
  // moldura, largura livre — pra avaliar detalhe/legibilidade do copy.
  const frameStyle = isMobile
    ? 'max-width:380px;width:100%;border:10px solid #0d0d0d;border-radius:36px;box-shadow:0 12px 40px rgba(0,0,0,.35);display:block'
    : 'max-width:900px;width:100%;border:1px solid var(--line);box-shadow:0 12px 40px rgba(0,0,0,.15);display:block';

  if(g.kind === 'video'){
    wrap.innerHTML = `<video src="data:video/mp4;base64,${v.data_base64}" controls autoplay loop muted style="${frameStyle};aspect-ratio:9/16"></video>`;
  } else {
    wrap.innerHTML = `<canvas id="desdModalCanvas" style="${frameStyle}"></canvas>`;
    const canvas = document.getElementById('desdModalCanvas');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      // Mesmo overlay de preview de CTA usado nos cards pequenos — o CTA
      // real só é desenhado de verdade no /submit (ver desdSubmit).
      desdDrawCtaBarOnCanvas(ctx, img.width, img.height, desdState.ctaText, desdState.ctaColor);
    };
    img.src = 'data:image/png;base64,' + v.data_base64;
  }

  const metaEl = document.getElementById('desdModalMeta');
  if(metaEl){
    const durationPart = (g.kind === 'video' && g.durationSeconds) ? ` · ${g.durationSeconds}s` : '';
    metaEl.textContent = `${g.rows[0].campaign_name} · Variação ${desdModalState.index + 1}${durationPart} · ${g.rows.length} linha(s) neste grupo`;
  }
}

function desdUpdateSubmitButtonState(){
  const btn = document.getElementById('desdSubmitBtn');
  if(!btn) return;
  const nameEl = document.getElementById('desdCreativeName');
  const hasName = nameEl && nameEl.value.trim().length > 0;
  const keys = Object.keys(desdState.groups);
  // Só habilita quando TODA linha selecionada (em TODOS os grupos) já
  // tem uma variação atribuída (imagem/vídeo) ou já bate o mínimo de
  // seleção do RSA — 3 headlines/2 descriptions (texto) — evita enviar
  // submit parcial sem perceber.
  const allAssigned = keys.length > 0 && keys.every(key => {
    const g = desdState.groups[key];
    if(g.kind === 'text') return g.selectedHeadlines.length >= 3 && g.selectedDescriptions.length >= 2;
    return g.rows.every(row => g.assignments[row.row_id] !== undefined);
  });
  // Backend só aceita um conjunto de text_ad_headlines/descriptions por
  // submit inteiro — mais de um grupo de texto junto não tem como ir no
  // mesmo envio (ver desdSubmit).
  const tooManyTextGroups = keys.filter(key => desdState.groups[key].kind === 'text').length > 1;
  btn.disabled = !allAssigned || tooManyTextGroups || !desdState.selectedRowIds.size || !hasName;
}

// ── Envio pra aprovação — 100% backend real (POST /desdobrador/submit) ──
// Fix desta sessão: `ai_variant_base64` (um valor pro lote inteiro) virou
// `ai_variants` (lista, um item por row_id) — ver AiVariantAssignment em
// api/creative_deploy.py. Monta essa lista a partir de
// desdState.groups[*].assignments, juntando todos os grupos.
async function desdSubmit(){
  const keys = Object.keys(desdState.groups);
  if(!keys.length){ toast('Você precisa gerar as peças com IA antes de enviar para aprovação', 'er'); return; }

  const aiVariants = [];
  const rowIds = [];
  let missing = false;

  // Corrigido — confirmado lendo creative_deploy.py: text_ad_headlines/
  // text_ad_descriptions são campos ÚNICOS no SubmitRequest (não uma
  // lista por linha/grupo) — o backend aplica o MESMO conjunto a toda
  // linha creative_type="text" do envio. Isso bate com a simplificação
  // que já tínhamos feito no frontend (seleção única por grupo), só que
  // agora também precisa ser única pro SUBMIT INTEIRO: se houver mais de
  // um grupo de texto com keywords/seleção diferentes marcados juntos,
  // não tem como mandar os dois certos na mesma chamada — bloqueia e
  // pede pra enviar em submits separados, em vez de aplicar a seleção
  // errada numa das campanhas sem o usuário perceber.
  const textGroups = keys.filter(key => desdState.groups[key].kind === 'text');
  let textAdHeadlines = null;
  let textAdDescriptions = null;
  if(textGroups.length > 1){
    toast('Você marcou mais de uma campanha de Search/RSA com keywords diferentes — envie cada uma em um submit separado (só é possível enviar um conjunto de headlines/descriptions por envio)', 'er');
    return;
  }
  if(textGroups.length === 1){
    const g = desdState.groups[textGroups[0]];
    if(g.selectedHeadlines.length < 3 || g.selectedDescriptions.length < 2){ missing = true; }
    textAdHeadlines = g.selectedHeadlines.map(i => (g.headlines.find(h => h.index === i) || {}).text || '');
    textAdDescriptions = g.selectedDescriptions.map(i => (g.descriptions.find(d => d.index === i) || {}).text || '');
  }

  keys.forEach(key => {
    const g = desdState.groups[key];
    g.rows.forEach(row => {
      rowIds.push(row.row_id);
      if(g.kind === 'text') return; // já resolvido acima (textAdHeadlines/Descriptions)
      const idx = g.assignments[row.row_id];
      if(idx === undefined){ missing = true; return; }
      const v = g.variants.find(x => x.index === idx);
      if(!v || !v.data_base64){ missing = true; return; }
      aiVariants.push({ row_id: row.row_id, data_base64: v.data_base64, content_type: v.content_type || (g.kind === 'video' ? 'video/mp4' : 'image/png') });
    });
  });
  if(missing){ toast('Alguma linha ainda está sem variação/seleção completa — confira cada linha antes de enviar', 'er'); return; }

  const creativeName = (document.getElementById('desdCreativeName').value || '').trim();
  if(!creativeName){ toast('Informe um nome pro criativo antes de enviar', 'er'); return; }

  const btn = document.getElementById('desdSubmitBtn');
  if(btn){ btn.disabled = true; btn.textContent = 'Enviando...'; }

  try{
    const res = await fetch(API_BASE + '/desdobrador/submit', {
      method: 'POST',
      headers: Object.assign({'Content-Type': 'application/json'}, authHeaders()),
      body: JSON.stringify({
        // blob_path fica null quando o envio é só de anúncios de texto
        // (RSA nunca teve KV) — o backend não tenta baixar KV nenhum
        // quando ai_variants vem vazio e blob_path vem null (ver guarda
        // em submit_pieces, creative_deploy.py).
        blob_path: desdState.blobPath,
        row_ids: rowIds,
        workspace_id: desdWorkspaceId,
        creative_name: creativeName,
        ai_variants: aiVariants,
        text_ad_headlines: textAdHeadlines,
        text_ad_descriptions: textAdDescriptions,
        ai_cta_text: desdState.ctaText || '',
        ai_cta_color: desdState.ctaColor || '#0d0d0d',
      }),
    });
    const data = await res.json().catch(() => ({}));
    if(!res.ok) throw new Error(data.detail || 'backend recusou o submit');
    toast('✓ ' + (data.total || rowIds.length) + ' peça(s) enviada(s) — na fila real de Aguardando Aprovação', 'ok');
    rowIds.forEach(rid => desdState.selectedRowIds.delete(rid));
    desdState.groups = {};
    document.getElementById('desdCreativeName').value = '';
    await desdLoadQueue();
    desdRenderAiVariantGrid();
    desdUpdateKvStepVisibility();
  }catch(e){
    toast('✕ ' + (e.message || 'Falha ao enviar pra aprovação'), 'er');
  }
  if(btn) btn.textContent = 'Enviar para Aprovação →';
  desdUpdateSubmitButtonState();
}

function desdSetupDropzone(){
  const zone = document.getElementById('desdDropzone');
  const input = document.getElementById('desdFileInput');
  if(!zone) return;
  ['dragenter','dragover'].forEach(evt => zone.addEventListener(evt, e => {
    e.preventDefault(); e.stopPropagation(); zone.style.borderColor = 'var(--ink)';
  }));
  ['dragleave','drop'].forEach(evt => zone.addEventListener(evt, e => {
    e.preventDefault(); e.stopPropagation(); zone.style.borderColor = '';
  }));
  zone.addEventListener('drop', e => {
    const file = e.dataTransfer.files[0];
    if(!file || !file.type.startsWith('image/')) return;
    input.files = e.dataTransfer.files;
    desdOnFileSelected({target:{files:[file]}});
  });
}
// ── INIT (Desdobrador) ──
RU.ready(() => {
  if(window.__oauthReturnHandled) return;
  RU.trackPage('desdobrador');
  desdRenderSelectedSummary();
  desdUpdateSubmitButtonState();
  desdUpdateKvStepVisibility();
  desdSetupDropzone();
  RU.workspaceRefreshers.push(desdLoadWorkspaces);
  desdLoadWorkspaces();
});

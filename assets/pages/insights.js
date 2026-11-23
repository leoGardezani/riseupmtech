/* Rise Up MTech — Insights: lista e decisão (aceitar/recusar) a partir de GET /insights e POST /insights/{id}/decision.
   Os textos são montados aqui a partir dos números do algoritmo (nada inventado); "aceitar" por enquanto só registra. */

let INS = [], INS_STATE = 'loading'; // loading | ok | error | nows

const inMoney = v => (v == null ? '—' : 'R$ ' + Number(v).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
const inNum = (v, d) => (v == null ? '—' : Number(v).toLocaleString('pt-BR', {maximumFractionDigits: d == null ? 0 : d}));
const inDate = s => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || '')); return m ? m[3] + '/' + m[2] + '/' + m[1].slice(2) : '—'; };
const inSrc = s => ({google: 'Google Ads', google_ads: 'Google Ads', meta: 'Meta Ads', tiktok: 'TikTok Ads'}[String(s || '').toLowerCase()] || s || '—');
const IN_METRIC = {cpm: 'CPM', cpv: 'CPV', cpc: 'CPC', cpl: 'CPL (custo por lead)', cpa: 'CPA (custo por conversão)'};
const IN_CONF = {high: 'Confiança alta', medium: 'Confiança média', low: 'Confiança baixa'};
const IN_SEV = {alerta: 'Alerta', atencao: 'Atenção', oportunidade: 'Oportunidade'};

function inEmpty(msg){ return '<div class="h-empty" style="padding:24px 20px;font-family:var(--mono);font-size:10px;color:var(--ink-muted);letter-spacing:.04em;line-height:1.6">' + msg + '</div>'; }
function inMessage(){
  const st = document.getElementById('insStatus').value;
  if(INS_STATE === 'loading') return 'Carregando…';
  if(INS_STATE === 'error') return 'Não foi possível carregar os insights agora. Tente atualizar a página.';
  if(INS_STATE === 'nows') return 'Nenhum plano de mídia criado ainda. Crie um em Campanhas → "Subir novo plano".';
  if(st === 'novo') return 'Nenhum insight aguardando decisão. Eles aparecem aqui depois que as métricas das plataformas são coletadas e analisadas.';
  return 'Nada nesta lista.';
}

function inReasons(n){
  const out = [];
  (n.reasons || []).forEach(r => {
    const m = /^limiar_(\d+)$/.exec(r);
    if(m) out.push('o gasto chegou a ' + m[1] + '% do investimento do plano (' + inMoney(n.spend) + ' de ' + inMoney(n.budget) + ')');
    else if(r === 'esgota_antes_do_fim') out.push('no ritmo dos últimos dias (' + inMoney(n.recent_daily_spend) + ' por dia) a verba acaba em cerca de ' + inNum(n.days_left_money, 1) + ' dias, e ainda faltam ' + inNum(n.days_left_plan) + ' dias de campanha');
    else if(r === 'ritmo_acima_do_plano') out.push('o gasto diário (' + inMoney(n.recent_daily_spend) + ') está acima do planejado (' + inMoney(n.planned_daily) + ')');
  });
  return out;
}

function inBody(i){
  const f = i.fact || {}, n = f.numbers || {}, e = f.estimates || {};
  if(i.type === 'M1_pausar'){
    const lbl = IN_METRIC[n.metric] || n.metric;
    return '<div class="ins-body">O <b>' + _escHtml(lbl) + '</b> desta campanha está em <b>' + inMoney(n.cost) + '</b>, '
      + inNum(n.ratio, 1) + '× a mediana de campanhas parecidas (' + inMoney(n.reference_median) + '), e isso se repete há pelo menos '
      + inNum(n.persist_days) + ' dias. Ela tem ' + inNum(n.days_active) + ' dias de entrega e gasta cerca de ' + inMoney(n.daily_spend) + ' por dia.</div>';
  }
  if(i.type === 'M4_budget'){
    const rs = inReasons(n);
    return '<div class="ins-body">' + (rs.length ? '<ul>' + rs.map(r => '<li>' + _escHtml(r.charAt(0).toUpperCase() + r.slice(1)) + '.</li>').join('') + '</ul>' : '') + '</div>';
  }
  return '';
}

function inTitle(i){
  const n = (i.fact || {}).numbers || {};
  if(i.type === 'M1_pausar') return 'Considere pausar: custo acima do esperado';
  if(i.type === 'M4_budget') return n.threshold_pct === 100 ? 'Budget do plano esgotado' : 'Atenção ao budget do plano';
  return i.type;
}

function inReference(i){
  const r = (i.fact || {}).reference || {};
  if(r.level !== 'campanhas_comparaveis') return '';
  const band = Math.round((r.band || 0.2) * 100);
  const peers = r.peers || [];
  return '<div class="ins-block"><div class="ins-lbl">Base da comparação</div>'
    + 'Comparado a ' + inNum(r.n) + ' campanhas parecidas (mesmo objetivo, budget diário e total dentro de ±' + band + '%'
    + (r.same_platform ? ', mesma plataforma' : '') + ').'
    + (peers.length ? '<table class="ins-peers" style="margin-top:8px"><thead><tr><th>Campanha</th><th>Plataforma</th><th>Período</th><th>Por dia</th><th>Total</th><th>Custo</th></tr></thead><tbody>'
      + peers.map(p => '<tr><td>' + _escHtml(p.campaign_name || '—') + '</td><td>' + _escHtml(inSrc(p.source)) + '</td><td>' + inDate(p.first_date) + ' → ' + inDate(p.last_date) + '</td><td>' + inMoney(p.daily_spend) + '</td><td>' + inMoney(p.spend) + '</td><td>' + inMoney(p.cost) + '</td></tr>').join('')
      + '</tbody></table>' + (r.more ? '<div class="ins-sub">+ ' + inNum(r.more) + ' outras</div>' : '') : '')
    + '</div>';
}

function inEstimate(i){
  const e = (i.fact || {}).estimates || {};
  if(!e.horizon_days) return '';
  const v = e.volume_given_up || {};
  return '<div class="ins-block"><div class="ins-lbl">O que esperar se aceitar · estimativa</div>'
    + 'Pausando por ' + inNum(e.horizon_days) + ' dias: libera cerca de <b>' + inMoney(e.budget_freed_brl) + '</b> de verba; '
    + 'o excesso de custo evitado é de cerca de <b>' + inMoney(e.excess_cost_brl) + '</b>; deixam de vir cerca de <b>' + inNum(v.value) + ' ' + _escHtml(v.name || '') + '</b> ao custo atual. '
    + '<span class="ins-sub">O custo de referência é o das campanhas comparadas.</span></div>';
}

function inCard(i){
  const open = i.status === 'novo';
  const tags = '<span class="ins-tag">' + _escHtml(IN_SEV[i.severity] || i.severity) + '</span>'
    + '<span class="ins-tag">' + _escHtml(IN_CONF[i.confidence] || i.confidence) + '</span>'
    + (i.impact_brl ? '<span class="ins-tag">Impacto ' + inMoney(i.impact_brl) + '</span>' : '');
  const actions = open
    ? '<div class="ins-actions"><button class="ins-btn" data-ins="' + _escHtml(i.insight_id) + '" data-d="aceitar">Aceitar</button>'
      + '<button class="ins-btn ghost" data-ins="' + _escHtml(i.insight_id) + '" data-d="recusar">Recusar</button>'
      + '<span class="note">// por enquanto, aceitar só registra a sua decisão: a mudança na plataforma ainda é feita por você</span></div>'
    : '<div class="ins-actions"><span class="ins-done">' + _escHtml(({aceito: 'Aceito', recusado: 'Recusado', expirado: 'Expirado: o problema deixou de aparecer'})[i.status] || i.status)
      + (i.decided_by ? ' por ' + _escHtml(i.decided_by) : '') + (i.decided_at ? ' em ' + inDate(i.decided_at) : '') + '</span></div>';
  return '<div class="ins-card sev-' + _escHtml(i.severity) + '">'
    + '<div class="ins-head"><div><div class="ins-title">' + _escHtml(inTitle(i)) + '</div>'
    + '<div class="ins-sub">' + _escHtml(i.campaign_name || i.campaign_id) + ' · ' + _escHtml(inSrc(i.source)) + ' · gerado em ' + inDate(i.created_at) + '</div></div>'
    + '<div class="ins-tags">' + tags + '</div></div>'
    + inBody(i) + inReference(i) + inEstimate(i) + actions + '</div>';
}

function inRender(){
  const box = document.getElementById('insList');
  box.innerHTML = INS.length ? INS.map(inCard).join('') : '<div class="tbox">' + inEmpty(inMessage()) + '</div>';
  document.getElementById('insN').textContent = INS_STATE === 'ok' ? INS.length : '—';
  document.getElementById('insA').textContent = INS_STATE === 'ok' ? INS.filter(i => i.severity === 'alerta').length : '—';
  const imp = INS.reduce((s, i) => s + (Number(i.impact_brl) || 0), 0);
  document.getElementById('insI').textContent = INS_STATE === 'ok' && INS.length ? inMoney(imp) : '—';
}

async function inLoad(workspaceId, why){
  if(!workspaceId){ INS = []; INS_STATE = why === 'error' ? 'error' : 'nows'; inRender(); return; }
  INS_STATE = 'loading'; INS = []; inRender();
  const st = document.getElementById('insStatus').value;
  let ok = false, items = [];
  try{
    const res = await fetch(API_BASE + '/insights?workspace_id=' + encodeURIComponent(workspaceId) + '&status=' + encodeURIComponent(st), {headers: authHeaders()});
    if(res.ok){ items = (await res.json()).insights || []; ok = true; }
  }catch(e){}
  if(document.getElementById('insWorkspace').value !== workspaceId || document.getElementById('insStatus').value !== st) return; // troca rápida
  INS = items; INS_STATE = ok ? 'ok' : 'error'; inRender();
}

async function inDecide(btn){
  const id = btn.getAttribute('data-ins'), d = btn.getAttribute('data-d'), ws = document.getElementById('insWorkspace').value;
  if(!id || !ws) return;
  const card = btn.closest('.ins-card');
  card.querySelectorAll('.ins-btn').forEach(b => { b.disabled = true; });
  try{
    const res = await fetch(API_BASE + '/insights/' + encodeURIComponent(id) + '/decision?workspace_id=' + encodeURIComponent(ws), {
      method: 'POST', headers: Object.assign({'Content-Type': 'application/json'}, authHeaders()), body: JSON.stringify({decision: d})});
    if(res.ok){ toast(d === 'aceitar' ? 'Decisão registrada: aceito' : 'Decisão registrada: recusado', 'ok'); INS = INS.filter(i => i.insight_id !== id); inRender(); return; }
    toast(res.status === 403 ? 'Só editores e admins podem decidir um insight.' : res.status === 404 ? 'Este insight já foi decidido ou não existe mais.' : 'Não foi possível registrar agora. Tente de novo.', 'er');
  }catch(e){ toast('Não foi possível registrar agora. Tente de novo.', 'er'); }
  card.querySelectorAll('.ins-btn').forEach(b => { b.disabled = false; });
}

// ── INIT (Insights) ──
RU.ready(() => {
  if(window.__oauthReturnHandled) return;
  RU.trackPage('insights');
  document.getElementById('insList').addEventListener('click', ev => { const b = ev.target.closest('.ins-btn[data-ins]'); if(b) inDecide(b); });
  document.getElementById('insStatus').addEventListener('change', () => inLoad(document.getElementById('insWorkspace').value));
  RU.initWorkspaceSelect(document.getElementById('insWorkspace'), inLoad);
});

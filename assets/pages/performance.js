/* Rise Up MTech — Performance: métricas e pacing a partir de GET /performance/summary. */

let PF = null, PF_STATE = 'loading', PF_CHART = null; // loading | ok | error | nows | nodata

const pfInt = v => (v == null ? '—' : Math.round(v).toLocaleString('pt-BR'));
const pfMoney = v => (v == null ? '—' : 'R$ ' + Number(v).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
const pfPct = v => (v == null ? '—' : (v * 100).toLocaleString('pt-BR', {maximumFractionDigits: 2}) + '%');
const pfDec = v => (v == null ? '—' : Number(v).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
const pfDiv = (a, b) => (b ? a / b : null);
const pfSrc = s => ({google: 'Google Ads', meta: 'Meta Ads', tiktok: 'TikTok Ads'}[String(s || '').toLowerCase()] || s || '—');

function pfMessage(){
  if(PF_STATE === 'loading') return 'Carregando…';
  if(PF_STATE === 'error') return 'Não foi possível carregar a performance agora. Tente atualizar a página.';
  if(PF_STATE === 'nows') return 'Nenhum plano de mídia criado ainda. Crie um em Campanhas → "Subir novo plano".';
  return 'Ainda não há dados de desempenho para este plano no período. Eles aparecem aqui quando as métricas das plataformas chegarem.';
}

function pfPacing(p){
  if(p == null) return '<span style="color:var(--ink-muted)">—</span>';
  const col = p < 0.85 ? '#b45309' : (p > 1.15 ? '#b91c1c' : '#15803d');
  const lbl = p < 0.85 ? 'abaixo' : (p > 1.15 ? 'acima' : 'no ritmo');
  return '<span style="color:' + col + ';font-weight:600">' + pfPct(p) + '</span> <span style="font-size:9px;color:var(--ink-muted)">' + lbl + '</span>';
}

const PF_METRICS = [['spend','Investimento',pfMoney],['impressions','Impressões',pfInt],['reach','Alcance',pfInt],
  ['clicks','Cliques',pfInt],['video_views','Views de vídeo',pfInt],['leads','Leads',pfInt],['conversions','Conversões',pfInt]];

function pfRow(r, first){
  return first
    + '<td class="td-mono">' + pfMoney(r.spend) + '</td>'
    + '<td class="td-mono">' + pfInt(r.impressions) + '</td>'
    + '<td class="td-mono">' + pfInt(r.reach) + '</td>'
    + '<td class="td-mono">' + pfDec(pfDiv(r.impressions, r.reach)) + '</td>'
    + '<td class="td-mono">' + pfInt(r.clicks) + '</td>'
    + '<td class="td-mono">' + pfPct(pfDiv(r.clicks, r.impressions)) + '</td>';
}

// Mesma ordem de colunas de pfRow, sem fechar a linha (a tabela de criativo/audiência acrescenta CPC e leads).
function pfRow2(r, first){ return pfRow(r, first); }

function pfRender(){
  const ok = PF_STATE === 'ok';
  const msg = document.getElementById('pfMsg');
  msg.innerHTML = ok ? '' : '<div style="padding:24px 0;font-family:var(--mono);font-size:10px;color:var(--ink-muted);letter-spacing:.04em;line-height:1.6">' + pfMessage() + '</div>';
  const set = (id, v) => { document.getElementById(id).textContent = v; };
  const empty = '<tr><td colspan="10"><div style="padding:24px 20px;font-family:var(--mono);font-size:10px;color:var(--ink-muted)">' + pfMessage() + '</div></td></tr>';
  if(!ok){
    ['k-spend','k-imp','k-reach','k-freq','k-clk','k-ctr','k-cpm','k-cpc','k-vv','k-leads','k-conv','k-pace'].forEach(id => set(id, '—'));
    document.getElementById('pfSource').innerHTML = empty;
    document.getElementById('pfCamp').innerHTML = empty;
    document.getElementById('pfPacing').innerHTML = empty;
    document.getElementById('pfMatrix').innerHTML = empty;
    document.getElementById('pfCreative').innerHTML = empty;
    document.getElementById('pfAudience').innerHTML = empty;
    if(PF_CHART){ PF_CHART.destroy(); PF_CHART = null; }
    return;
  }
  const sum = k => PF.daily.reduce((a, d) => a + (Number(d[k]) || 0), 0);
  const t = {spend: sum('spend'), imp: sum('impressions'), reach: sum('reach'), clk: sum('clicks'),
             vv: sum('video_views'), leads: sum('leads'), conv: sum('conversions')};
  set('k-spend', pfMoney(t.spend)); set('k-imp', pfInt(t.imp)); set('k-reach', pfInt(t.reach));
  set('k-freq', pfDec(pfDiv(t.imp, t.reach))); set('k-clk', pfInt(t.clk));
  set('k-ctr', pfPct(pfDiv(t.clk, t.imp)));
  set('k-cpm', pfMoney(pfDiv(t.spend * 1000, t.imp))); set('k-cpc', pfMoney(pfDiv(t.spend, t.clk)));
  set('k-vv', pfInt(t.vv)); set('k-leads', pfInt(t.leads)); set('k-conv', pfInt(t.conv));
  const po = PF.pacing_overall || {};
  set('k-pace', po.spend && po.spend.pacing != null ? pfPct(po.spend.pacing) : '—');
  const prow = PF_METRICS.filter(m => po[m[0]]).map(m => {
    const o = po[m[0]];
    return '<tr><td class="td-bold">' + m[1] + '</td><td class="td-mono">' + m[2](o.goal) + '</td><td class="td-mono">' + m[2](o.expected)
      + '</td><td class="td-mono">' + m[2](o.actual) + '</td><td>' + pfPacing(o.pacing) + '</td></tr>';
  });
  document.getElementById('pfPacing').innerHTML = prow.length ? prow.join('')
    : '<tr><td colspan="5"><div style="padding:24px 20px;font-family:var(--mono);font-size:10px;color:var(--ink-muted)">Nenhuma meta cadastrada para este plano ainda.</div></td></tr>';
  document.getElementById('pfMatrix').innerHTML = PF.by_campaign.map(c => {
    const pm = c.pacing_by_metric || {};
    return '<tr><td class="td-bold">' + _escHtml(c.campaign_name || '—') + '</td><td class="td-mono">' + _escHtml(pfSrc(c.source)) + '</td>'
      + PF_METRICS.map(m => '<td>' + pfPacing(pm[m[0]]) + '</td>').join('') + '</tr>';
  }).join('');

  document.getElementById('pfSource').innerHTML = PF.by_source.map(s =>
    pfRow(s, '<tr><td class="td-bold">' + _escHtml(pfSrc(s.source)) + '</td>')
    + '<td class="td-mono">' + pfMoney(pfDiv(s.spend, s.clicks)) + '</td></tr>').join('');
  document.getElementById('pfCamp').innerHTML = PF.by_campaign.map(c =>
    '<tr><td class="td-bold">' + _escHtml(c.campaign_name || '—') + '</td><td class="td-mono">' + _escHtml(pfSrc(c.source)) + '</td>'
    + '<td class="td-mono">' + pfMoney(c.spend) + '</td><td class="td-mono">' + pfMoney(c.planned) + '</td>'
    + '<td class="td-mono">' + pfInt(c.impressions) + '</td><td class="td-mono">' + pfInt(c.reach) + '</td>'
    + '<td class="td-mono">' + pfDec(pfDiv(c.impressions, c.reach)) + '</td><td class="td-mono">' + pfInt(c.clicks) + '</td>'
    + '<td class="td-mono">' + pfPct(pfDiv(c.clicks, c.impressions)) + '</td><td>' + pfPacing(c.pacing) + '</td></tr>').join('');
  const tail = r => '<td class="td-mono">' + pfMoney(pfDiv(r.spend, r.clicks)) + '</td><td class="td-mono">' + pfInt(r.leads) + '</td></tr>';
  const lst = (arr, f) => arr && arr.length ? arr.map(f).join('') : '<tr><td colspan="12"><div style="padding:24px 20px;font-family:var(--mono);font-size:10px;color:var(--ink-muted)">Sem dados no período.</div></td></tr>';
  document.getElementById('pfCreative').innerHTML = lst(PF.by_creative, r =>
    pfRow2(r, '<tr><td class="td-bold">' + _escHtml(r.creative_name || '—') + '</td><td class="td-mono">' + _escHtml(r.creative_type || '—')
      + '</td><td>' + _escHtml(r.campaign_name || '—') + '</td><td class="td-mono">' + _escHtml(pfSrc(r.source)) + '</td>') + tail(r));
  document.getElementById('pfAudience').innerHTML = lst(PF.by_audience, r =>
    pfRow2(r, '<tr><td class="td-bold">' + _escHtml(r.audience || '—') + '</td><td class="td-mono">' + _escHtml(pfSrc(r.source)) + '</td>') + tail(r));
  pfChart();
}

const PF_LABEL = {impressions:'Impressões', reach:'Alcance', clicks:'Cliques', spend:'Investimento', video_views:'Views de vídeo', leads:'Leads', conversions:'Conversões'};

function pfChart(){
  if(PF_STATE !== 'ok') return;
  const mb = document.getElementById('pfMetricBar').value, ml = document.getElementById('pfMetricLine').value;
  const labels = PF.daily.map(d => RU.fmtDate(d.date));
  const vals = m => PF.daily.map(d => Number(d[m]) || 0);
  if(PF_CHART) PF_CHART.destroy();
  PF_CHART = new Chart(document.getElementById('pfChart'), {
    data: {labels, datasets: [
      {type: 'bar', label: PF_LABEL[mb], data: vals(mb), backgroundColor: 'rgba(17,17,17,.18)', yAxisID: 'y', order: 2},
      {type: 'line', label: PF_LABEL[ml], data: vals(ml), borderColor: '#111', backgroundColor: '#111', tension: .25, pointRadius: 0, borderWidth: 2, yAxisID: 'y1', order: 1}
    ]},
    options: {responsive: true, maintainAspectRatio: false, interaction: {mode: 'index', intersect: false},
      plugins: {legend: {display: true, position: 'bottom', labels: {boxWidth: 12, font: {size: 10}}}},
      scales: {x: {grid: {display: false}, ticks: {maxTicksLimit: 10}},
        y: {beginAtZero: true, position: 'left', title: {display: true, text: PF_LABEL[mb], font: {size: 10}}},
        y1: {beginAtZero: true, position: 'right', grid: {drawOnChartArea: false}, title: {display: true, text: PF_LABEL[ml], font: {size: 10}}}}}
  });
}

async function pfLoad(wsId, why){
  if(!wsId){ PF_STATE = why === 'error' ? 'error' : 'nows'; PF = null; pfRender(); return; }
  PF_STATE = 'loading'; pfRender();
  try{
    const days = document.getElementById('pfDays').value;
    const res = await fetch(API_BASE + '/performance/summary?workspace_id=' + encodeURIComponent(wsId) + '&days=' + days, {headers: authHeaders()});
    if(!res.ok) throw new Error(res.status);
    PF = await res.json();
    PF_STATE = PF.has_data ? 'ok' : 'nodata';
  }catch(e){ PF = null; PF_STATE = 'error'; }
  pfRender();
}

document.getElementById('pfMetricBar').addEventListener('change', pfChart);
document.getElementById('pfMetricLine').addEventListener('change', pfChart);
document.getElementById('pfDays').addEventListener('change', () => pfLoad(document.getElementById('pfWorkspace').value));
RU.initWorkspaceSelect(document.getElementById('pfWorkspace'), pfLoad);

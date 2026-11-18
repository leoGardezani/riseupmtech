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

function pfRow(r, first){
  return first
    + '<td class="td-mono">' + pfMoney(r.spend) + '</td>'
    + '<td class="td-mono">' + pfInt(r.impressions) + '</td>'
    + '<td class="td-mono">' + pfInt(r.reach) + '</td>'
    + '<td class="td-mono">' + pfDec(pfDiv(r.impressions, r.reach)) + '</td>'
    + '<td class="td-mono">' + pfInt(r.clicks) + '</td>'
    + '<td class="td-mono">' + pfPct(pfDiv(r.clicks, r.impressions)) + '</td>';
}

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
  const spent = PF.by_campaign.reduce((a, c) => a + (Number(c.spent_total) || 0), 0);
  const exp = PF.by_campaign.reduce((a, c) => a + (c.pacing ? (Number(c.spent_total) || 0) / c.pacing : 0), 0);
  set('k-pace', exp ? pfPct(spent / exp) : '—');

  document.getElementById('pfSource').innerHTML = PF.by_source.map(s =>
    pfRow(s, '<tr><td class="td-bold">' + _escHtml(pfSrc(s.source)) + '</td>')
    + '<td class="td-mono">' + pfMoney(pfDiv(s.spend, s.clicks)) + '</td></tr>').join('');
  document.getElementById('pfCamp').innerHTML = PF.by_campaign.map(c =>
    '<tr><td class="td-bold">' + _escHtml(c.campaign_name || '—') + '</td><td class="td-mono">' + _escHtml(pfSrc(c.source)) + '</td>'
    + '<td class="td-mono">' + pfMoney(c.spend) + '</td><td class="td-mono">' + pfMoney(c.planned) + '</td>'
    + '<td class="td-mono">' + pfInt(c.impressions) + '</td><td class="td-mono">' + pfInt(c.reach) + '</td>'
    + '<td class="td-mono">' + pfDec(pfDiv(c.impressions, c.reach)) + '</td><td class="td-mono">' + pfInt(c.clicks) + '</td>'
    + '<td class="td-mono">' + pfPct(pfDiv(c.clicks, c.impressions)) + '</td><td>' + pfPacing(c.pacing) + '</td></tr>').join('');
  pfChart();
}

function pfChart(){
  if(PF_STATE !== 'ok') return;
  const m = document.getElementById('pfMetric').value;
  const labels = PF.daily.map(d => RU.fmtDate(d.date));
  const data = PF.daily.map(d => Number(d[m]) || 0);
  if(PF_CHART) PF_CHART.destroy();
  PF_CHART = new Chart(document.getElementById('pfChart'), {
    type: 'line',
    data: {labels, datasets: [{data, borderColor: '#111', backgroundColor: 'rgba(17,17,17,.06)', fill: true, tension: .25, pointRadius: 0, borderWidth: 2}]},
    options: {responsive: true, maintainAspectRatio: false, plugins: {legend: {display: false}},
              scales: {x: {grid: {display: false}, ticks: {maxTicksLimit: 10}}, y: {beginAtZero: true}}}
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

document.getElementById('pfMetric').addEventListener('change', pfChart);
document.getElementById('pfDays').addEventListener('change', () => pfLoad(document.getElementById('pfWorkspace').value));
RU.initWorkspaceSelect(document.getElementById('pfWorkspace'), pfLoad);

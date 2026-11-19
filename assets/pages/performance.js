/* Rise Up MTech — Performance: métricas e pacing a partir de GET /performance/summary. */

let PF_PREV = null; // somas do período anterior (mesmo tamanho), só para comparação
let PF = null, PF_STATE = 'loading', PF_CHART = null; // loading | ok | error | nows | nodata | soon

const pfInt = v => (v == null ? '—' : Math.round(v).toLocaleString('pt-BR'));
const pfMoney = v => (v == null ? '—' : 'R$ ' + Number(v).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
const pfPct = v => (v == null ? '—' : (v * 100).toLocaleString('pt-BR', {maximumFractionDigits: 2}) + '%');
const pfDec = v => (v == null ? '—' : Number(v).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
const pfDiv = (a, b) => (b ? a / b : null);
const pfSrc = s => ({google: 'Google Ads', meta: 'Meta Ads', tiktok: 'TikTok Ads'}[String(s || '').toLowerCase()] || s || '—');

function pfMessage(){
  if(PF_STATE === 'loading') return 'Carregando…';
  if(PF_STATE === 'soon') return 'Os dados de performance ainda não foram ativados para a sua conta. Assim que forem, eles aparecem aqui.';
  if(PF_STATE === 'error') return 'Não foi possível carregar a performance agora. Tente atualizar a página.';
  if(PF_STATE === 'nows') return 'Nenhum plano de mídia criado ainda. Crie um em Campanhas → "Subir novo plano".';
  return 'Ainda não há dados de desempenho para este plano no período. Eles aparecem aqui quando as métricas das plataformas chegarem.';
}

// Acima do esperado = vermelho, dentro (±15%) = verde, abaixo do esperado = amarelo.
function pfPaceInfo(p){
  const diff = Math.abs(p - 1) * 100, n = diff.toLocaleString('pt-BR', {maximumFractionDigits: 1});
  if(p > 1.15) return {col: '#b91c1c', arrow: '▲', txt: n + '% acima do esperado', short: n + '% acima'};
  if(p < 0.85) return {col: '#b45309', arrow: '▼', txt: n + '% abaixo do esperado', short: n + '% abaixo'};
  return {col: '#15803d', arrow: '●', txt: 'dentro do esperado' + (diff >= 0.05 ? ' (' + (p > 1 ? '+' : '−') + n + '%)' : ''), short: 'no ritmo'};
}
function pfPacing(p){
  if(p == null) return '<span style="color:var(--ink-muted)">—</span>';
  const i = pfPaceInfo(p);
  return '<span style="color:' + i.col + ';font-weight:600">' + pfPct(p) + '</span> <span style="font-size:9px;color:' + i.col + '">' + i.arrow + ' ' + i.short + '</span>';
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
    document.querySelectorAll('[id^="d-"]').forEach(e => { e.textContent = ''; });
    document.getElementById('pfSource').innerHTML = empty;
    document.getElementById('pfCamp').innerHTML = empty;
    document.getElementById('pfMatrix').innerHTML = empty;
    document.getElementById('pfCreative').innerHTML = empty;
    document.getElementById('pfAudience').innerHTML = empty;
    document.getElementById('pfSide').innerHTML = '';
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
  // comparação com o período anterior de mesmo tamanho
  const sumP = k => (PF_PREV || []).reduce((a, d) => a + (Number(d[k]) || 0), 0);
  const pv = PF_PREV ? {spend: sumP('spend'), imp: sumP('impressions'), reach: sumP('reach'), clk: sumP('clicks'), vv: sumP('video_views'), leads: sumP('leads'), conv: sumP('conversions')} : null;
  const delta = (id, cur, prev, mode) => { // mode: 'neutral' | 'up' (maior é melhor) | 'down' (menor é melhor)
    const el = document.getElementById(id); if(!el) return;
    if(!pv || prev == null || cur == null || !isFinite(prev) || !isFinite(cur) || prev === 0){ el.textContent = pv ? 'sem base anterior' : ''; el.className = 'kpi-delta'; el.style.color = 'var(--ink-muted)'; return; }
    const ch = (cur - prev) / Math.abs(prev), up = ch > 0.0005, dn = ch < -0.0005;
    el.textContent = (up ? '▲ ' : dn ? '▼ ' : '= ') + (Math.abs(ch) * 100).toLocaleString('pt-BR', {maximumFractionDigits: 1}) + '% vs. anterior';
    const good = mode === 'neutral' ? null : (mode === 'up' ? up : dn), bad = mode === 'neutral' ? null : (mode === 'up' ? dn : up);
    el.className = 'kpi-delta'; el.style.color = good ? 'var(--success)' : bad ? 'var(--danger)' : 'var(--ink-muted)';
  };
  delta('d-spend', t.spend, pv && pv.spend, 'neutral'); delta('d-imp', t.imp, pv && pv.imp, 'up'); delta('d-reach', t.reach, pv && pv.reach, 'up');
  delta('d-freq', pfDiv(t.imp, t.reach), pv && pfDiv(pv.imp, pv.reach), 'neutral'); delta('d-clk', t.clk, pv && pv.clk, 'up');
  delta('d-ctr', pfDiv(t.clk, t.imp), pv && pfDiv(pv.clk, pv.imp), 'up');
  delta('d-cpm', pfDiv(t.spend * 1000, t.imp), pv && pfDiv(pv.spend * 1000, pv.imp), 'down'); delta('d-cpc', pfDiv(t.spend, t.clk), pv && pfDiv(pv.spend, pv.clk), 'down');
  delta('d-vv', t.vv, pv && pv.vv, 'up'); delta('d-leads', t.leads, pv && pv.leads, 'up'); delta('d-conv', t.conv, pv && pv.conv, 'up');
  const pp = po.spend && po.spend.pacing != null ? po.spend.pacing : null, pe = document.getElementById('k-pace'), pd = document.getElementById('d-pace');
  set('k-pace', pp != null ? pfPct(pp) : '—');
  if(pp != null){ const i = pfPaceInfo(pp); pe.style.color = i.col; pd.style.color = i.col; pd.textContent = i.arrow + ' ' + i.txt; }
  else { pe.style.color = ''; pd.textContent = ''; }
  const totalRow = '<tr style="background:var(--bg-soft,#f7f7f5)"><td class="td-bold">Total do plano</td><td class="td-mono">—</td>'
    + PF_METRICS.map(m => '<td>' + pfPacing(po[m[0]] ? po[m[0]].pacing : null) + '</td>').join('') + '</tr>';
  document.getElementById('pfMatrix').innerHTML = totalRow + PF.by_campaign.map(c => {
    const pm = c.pacing_by_metric || {};
    return '<tr><td class="td-bold">' + _escHtml(c.campaign_name || '—') + '</td><td class="td-mono">' + _escHtml(pfSrc(c.source)) + '</td>'
      + PF_METRICS.map(m => '<td>' + pfPacing(pm[m[0]]) + '</td>').join('') + '</tr>';
  }).join('');
  const none = '<tr><td colspan="12"><div style="padding:24px 20px;font-family:var(--mono);font-size:10px;color:var(--ink-muted)">Sem dados no período.</div></td></tr>';
  document.getElementById('pfSource').innerHTML = PF.by_source && PF.by_source.length ? PF.by_source.map(r =>
    pfRow(r, '<tr><td class="td-bold">' + _escHtml(pfSrc(r.source)) + '</td>') + '<td class="td-mono">' + pfMoney(pfDiv(r.spend, r.clicks)) + '</td></tr>').join('') : none;
  document.getElementById('pfCamp').innerHTML = PF.by_campaign && PF.by_campaign.length ? PF.by_campaign.map(c =>
    '<tr><td class="td-bold">' + _escHtml(c.campaign_name || '—') + '</td><td class="td-mono">' + _escHtml(pfSrc(c.source)) + '</td>'
    + '<td class="td-mono">' + pfMoney(c.spend) + '</td><td class="td-mono">' + pfMoney(c.planned) + '</td>'
    + '<td class="td-mono">' + pfInt(c.impressions) + '</td><td class="td-mono">' + pfInt(c.reach) + '</td>'
    + '<td class="td-mono">' + pfDec(pfDiv(c.impressions, c.reach)) + '</td><td class="td-mono">' + pfInt(c.clicks) + '</td>'
    + '<td class="td-mono">' + pfPct(pfDiv(c.clicks, c.impressions)) + '</td></tr>').join('') : none;
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

// Valor de um indicador (bruto ou derivado) para um conjunto de somas.
function pfVal(k, t){
  if(k === 'freq') return pfDec(pfDiv(t.impressions, t.reach));
  if(k === 'ctr') return pfPct(pfDiv(t.clicks, t.impressions));
  if(k === 'cpc') return pfMoney(pfDiv(t.spend, t.clicks));
  if(k === 'cpm') return pfMoney(pfDiv(t.spend * 1000, t.impressions));
  return (k === 'spend' ? pfMoney : pfInt)(t[k]);
}
const PF_ALL = [['spend','Investimento'],['impressions','Impressões'],['reach','Alcance'],['freq','Frequência'],['clicks','Cliques'],
  ['ctr','CTR'],['cpc','CPC'],['cpm','CPM'],['video_views','Views de vídeo'],['leads','Leads'],['conversions','Conversões']];
function pfTotals(){
  const t = {}; ['spend','impressions','reach','clicks','video_views','leads','conversions'].forEach(k => { t[k] = PF.daily.reduce((a, d) => a + (Number(d[k]) || 0), 0); });
  return t;
}
function pfSide(){
  const d = PF_SEL != null && PF.daily[PF_SEL];
  let t, title;
  if(d){ t = {}; Object.keys(d).forEach(k => { t[k] = Number(d[k]) || 0; }); title = 'Dia ' + RU.fmtDate(d.date); }
  else{ t = pfTotals(); title = 'Totais do período'; }
  document.getElementById('pfSide').innerHTML = '<div class="pf-side-t">' + title + '</div>'
    + PF_ALL.map(m => '<div class="pf-side-row"><span>' + m[1] + '</span><b>' + pfVal(m[0], t) + '</b></div>').join('');
}

// Seleção de um dia: os "Totais do período" passam a mostrar o dia (hover no desktop, toque no celular) e a barra fica destacada.
let PF_SEL = null;
function pfSelect(i){
  if(i === PF_SEL) return;
  PF_SEL = i; pfSide();
  if(PF_CHART && PF){
    const n = PF.daily.length;
    PF_CHART.data.datasets[0].backgroundColor = Array.from({length: n}, (_, k) => k === i ? 'rgba(17,17,17,.6)' : 'rgba(17,17,17,.18)');
    PF_CHART.data.datasets[1].pointRadius = Array.from({length: n}, (_, k) => k === i ? 4 : 0);
    PF_CHART.update('none');
  }
}
document.addEventListener('click', e => { if(PF_SEL != null && !e.target.closest('#pfChart')) pfSelect(null); });

function pfChart(){
  if(PF_STATE !== 'ok') return;
  const mb = document.getElementById('pfMetricBar').value, ml = document.getElementById('pfMetricLine').value;
  const narrow = window.innerWidth < 700;
  const labels = PF.daily.map(d => { const m = String(d.date).slice(0, 10).split('-'); return m.length === 3 ? m[2] + '/' + m[1] : RU.fmtDate(d.date); });
  const vals = m => PF.daily.map(d => Number(d[m]) || 0);
  PF_SEL = null;
  pfSide();
  if(PF_CHART) PF_CHART.destroy();
  PF_CHART = new Chart(document.getElementById('pfChart'), {
    data: {labels, datasets: [
      {type: 'bar', label: PF_LABEL[mb], data: vals(mb), backgroundColor: 'rgba(17,17,17,.18)', yAxisID: 'y', order: 2},
      {type: 'line', label: PF_LABEL[ml], data: vals(ml), borderColor: '#111', backgroundColor: '#111', tension: .25, pointRadius: 0, borderWidth: 2, yAxisID: 'y1', order: 1}
    ]},
    options: {responsive: true, maintainAspectRatio: false, interaction: {mode: 'index', intersect: false},
      onClick: (ev, els, chart) => { const h = chart.getElementsAtEventForMode(ev, 'index', {intersect: false}, false); pfSelect(h.length ? h[0].index : null); },
      plugins: {legend: {display: true, position: 'bottom', labels: {boxWidth: 12, font: {size: 10}}},
        tooltip: {enabled: false, filter: i => i.datasetIndex === 0, displayColors: false, padding: 12, bodyFont: {family: 'monospace', size: 11}, titleFont: {size: 12},
          callbacks: {
            label: () => [],
            title: items => items.length ? RU.fmtDate(PF.daily[items[0].dataIndex].date) : '',
            afterBody: items => { if(!items.length) return []; const d = PF.daily[items[0].dataIndex]; const t = {};
              Object.keys(d).forEach(k => { t[k] = Number(d[k]) || 0; });
              return PF_ALL.map(m => m[1] + ': ' + pfVal(m[0], t)); } } }},
      scales: {x: {grid: {display: false}, ticks: {maxTicksLimit: narrow ? 5 : 10, maxRotation: 0, minRotation: 0, autoSkip: true, font: {size: narrow ? 9 : 11}}},
        y: {beginAtZero: true, position: 'left', ticks: {font: {size: narrow ? 9 : 11}, maxTicksLimit: 5}, title: {display: !narrow, text: PF_LABEL[mb], font: {size: 10}}},
        y1: {beginAtZero: true, position: 'right', grid: {drawOnChartArea: false}, ticks: {font: {size: narrow ? 9 : 11}, maxTicksLimit: 5}, title: {display: !narrow, text: PF_LABEL[ml], font: {size: 10}}}}}
  });
  const cv = document.getElementById('pfChart');
  cv.onmousemove = e => { if(narrow || !PF_CHART) return; const h = PF_CHART.getElementsAtEventForMode(e, 'index', {intersect: false}, false); pfSelect(h.length ? h[0].index : null); };
  cv.onmouseleave = () => { if(!narrow) pfSelect(null); };
}

async function pfLoad(wsId, why){
  if(!wsId){ PF_STATE = why === 'error' ? 'error' : 'nows'; PF = null; pfRender(); return; }
  PF_STATE = 'loading'; pfRender();
  try{
    const days = document.getElementById('pfDays').value;
    const res = await fetch(API_BASE + '/performance/summary?workspace_id=' + encodeURIComponent(wsId) + '&days=' + days, {headers: authHeaders()});
    if(res.status === 404){ PF = null; PF_STATE = 'soon'; pfRender(); return; }
    if(!res.ok) throw new Error(res.status);
    PF = await res.json();
    PF_STATE = PF.has_data ? 'ok' : 'nodata';
    PF_PREV = null;
    try{ // período anterior: busca o dobro de dias e separa pelo calendário (sem mudar o serviço)
      const r2 = await fetch(API_BASE + '/performance/summary?workspace_id=' + encodeURIComponent(wsId) + '&days=' + (days * 2), {headers: authHeaders()});
      if(r2.ok){
        const d2 = await r2.json();
        const cut = new Date(); cut.setHours(0,0,0,0); cut.setDate(cut.getDate() - (Number(days) - 1));
        const iso = x => x.getFullYear() + '-' + String(x.getMonth()+1).padStart(2,'0') + '-' + String(x.getDate()).padStart(2,'0');
        const c = iso(cut);
        const prev = (d2.daily || []).filter(d => String(d.date).slice(0,10) < c);
        PF_PREV = prev.length ? prev : null;
      }
    }catch(e){ PF_PREV = null; }
  }catch(e){ PF = null; PF_STATE = 'error'; }
  pfRender();
}

document.getElementById('pfMetricBar').addEventListener('change', pfChart);
document.getElementById('pfMetricLine').addEventListener('change', pfChart);
document.getElementById('pfDays').addEventListener('change', () => pfLoad(document.getElementById('pfWorkspace').value));
RU.initWorkspaceSelect(document.getElementById('pfWorkspace'), pfLoad);

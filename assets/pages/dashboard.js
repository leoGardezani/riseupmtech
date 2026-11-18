/* Rise Up MTech — Overview (gerado da separação do operations.html em páginas, 18/nov/2026) */

const TOP3_AUD=[
  {name:'Carrossel_V2',plat:'Meta Ads',img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop',audience:'Remarketing — Site',aud_size:'180k pessoas',ctr:'7,2%',cpm:'R$18',leads:'920',score:99,insight:'Melhor combinação do período. Alta intenção + formato carrossel geram CTR 3× acima da média.'},
  {name:'Feed_1080x1080',plat:'Meta Ads',img:'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=400&fit=crop',audience:'Remarketing — Site',aud_size:'180k pessoas',ctr:'6,8%',cpm:'R$19',leads:'840',score:99,insight:'Feed estático performa bem em audiências quentes de remarketing.'},
  {name:'Carrossel_V2',plat:'Meta Ads',img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop',audience:'Interesse — Tecnologia',aud_size:'2,4M pessoas',ctr:'5,1%',cpm:'R$10',leads:'510',score:95,insight:'Melhor custo-benefício: audiência grande + CPM baixo + CTR alto. Alto potencial de escala.'},
];
const KPI_DATA=[
  {lbl:'Investimento',val:'R$284k',delta:'↑ 12%',dir:'up',target:'Meta R$310k · 91,6%',feat:true},
  {lbl:'Impressões',  val:'18,4M', delta:'↑ 8%', dir:'up',target:'Meta 20M · 92%'},
  {lbl:'Cliques',     val:'342k',  delta:'↓ 3%', dir:'dn',target:'Meta 380k · 90%'},
  {lbl:'Leads',       val:'4.820', delta:'↑ 18%',dir:'up',target:'Meta 5.000 · 96,4%'},
  {lbl:'CPL',         val:'R$58,9',delta:'↑ efic.',dir:'up',target:'Meta R$65'},
  {lbl:'ROAS',        val:'3,4x',  delta:'↑ 0,4x',dir:'up',target:'Meta 3,0x ✓'},
];
function renderOverviewKPIs(){
  const el=document.getElementById('ov-kpis');
  if(!el) return;
  el.innerHTML=KPI_DATA.map(k=>`<div class="kpi ${k.feat?'feat':''}"><div class="kpi-lbl">${k.lbl}</div><div class="kpi-val">${k.val}</div><div class="kpi-delta ${k.dir}">${k.delta}</div><div class="kpi-target">${k.target}</div></div>`).join('');
}
function renderOverviewTop3(){
  const el=document.getElementById('ov-top3');
  if(!el) return;
  const cards = TOP3_AUD.map((t,i)=>{
    const d=document.createElement('div');
    d.style.cssText='background:var(--bg);overflow:hidden';
    d.innerHTML=[
      '<div style="position:relative">',
        '<img src="'+t.img+'" style="width:100%;aspect-ratio:16/9;object-fit:cover;display:block" loading="lazy">',
        '<div style="position:absolute;top:10px;left:10px;background:var(--ink);color:#fff;font-family:var(--mono);font-size:10px;letter-spacing:.08em;padding:3px 10px">#'+(i+1)+'</div>',
        '<div style="position:absolute;top:10px;right:10px;background:var(--bg);font-family:var(--mono);font-size:9px;color:var(--ink);padding:3px 8px;border:1px solid var(--border)">Score '+t.score+'</div>',
      '</div>',
      '<div style="padding:18px 20px">',
        '<div style="font-family:var(--fh);font-weight:700;font-size:16px;text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px">'+t.name+'</div>',
        '<div style="font-family:var(--mono);font-size:9px;color:var(--ink-muted);letter-spacing:.08em;margin-bottom:12px">'+t.plat+'</div>',
        '<div style="background:var(--bg2);padding:10px 12px;margin-bottom:12px;border-left:2px solid var(--ink)">',
          '<div style="font-family:var(--mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-muted);margin-bottom:4px">// audiência</div>',
          '<div style="font-size:12px;font-weight:600">'+t.audience+'</div>',
          '<div style="font-family:var(--mono);font-size:9px;color:var(--ink-muted);margin-top:2px">'+t.aud_size+'</div>',
        '</div>',
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px">',
          '<div style="background:var(--bg2);padding:8px 10px"><div style="font-family:var(--mono);font-size:8px;color:var(--ink-muted)">CTR</div><div style="font-family:var(--fh);font-weight:700;font-size:18px">'+t.ctr+'</div></div>',
          '<div style="background:var(--bg2);padding:8px 10px"><div style="font-family:var(--mono);font-size:8px;color:var(--ink-muted)">LEADS</div><div style="font-family:var(--fh);font-weight:700;font-size:18px">'+t.leads+'</div></div>',
          '<div style="background:var(--bg2);padding:8px 10px"><div style="font-family:var(--mono);font-size:8px;color:var(--ink-muted)">CPM</div><div style="font-family:var(--fh);font-weight:700;font-size:18px">'+t.cpm+'</div></div>',
        '</div>',
        '<div style="font-size:12px;color:var(--ink-soft);line-height:1.6;border-top:1px solid var(--border-d);padding-top:10px">'+t.insight+'</div>',
      '</div>'
    ].join('');
    return d;
  });
  el.innerHTML='';
  cards.forEach(card=>el.appendChild(card));
}
function renderOverviewStatus(){
  document.getElementById('ov-stI').textContent=STATUS_DATA.filter(s=>s.status==='implemented').length;
  document.getElementById('ov-stP').textContent=STATUS_DATA.filter(s=>s.status==='pending').length;
  document.getElementById('ov-stE').textContent=STATUS_DATA.filter(s=>s.status==='error').length;
  document.getElementById('ov-stS').textContent=STATUS_DATA.filter(s=>s.status==='stand_by').length;
  const recent=STATUS_DATA.slice(0,6);
  document.getElementById('ov-statusTable').innerHTML=recent.map(s=>`
    <tr>
      <td class="td-bold">${s.criativo}</td>
      <td class="td-mono">${s.plat}</td>
      <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.camp}</td>
      <td>${badgeH(s.status)}</td>
      <td class="td-mono" style="color:var(--ink-muted)">${s.upd}</td>
    </tr>`).join('');
}
function initCharts(){
  initChartsDash();
}
const imp30  = [0.4,0.5,0.4,0.6,0.6,0.6,0.7,0.5,0.7,0.8,0.7,0.6,0.9,0.8,0.7,1.0,0.9,0.8,1.1,1.0,0.9,1.1,1.1,1.0,1.2,1.1,1.0,1.3,1.2,1.1];
const leads30= [84,98,76,120,134,128,148,110,138,160,150,118,172,156,140,188,170,152,204,184,164,218,198,178,232,212,190,248,226,204];
function initChartsDash(){
  const dashEl = document.getElementById('chartDash');
  const barEl  = document.getElementById('chartBar');
  if(!dashEl || !barEl || dashEl._inited) return;
  dashEl._inited = true;
  new Chart(dashEl, {
    type: 'line',
    data: {labels: labels30, datasets: [
      {label:'Investimento (R$k)', data:inv30,  borderColor:'#0d0d0d', backgroundColor:'rgba(13,13,13,.06)', tension:.4, pointRadius:0, pointHoverRadius:4, fill:true, yAxisID:'y'},
      {label:'Impressões (M)',     data:imp30,  borderColor:'#888', backgroundColor:'transparent', tension:.4, pointRadius:0, pointHoverRadius:4, borderDash:[5,3], yAxisID:'y1'},
      {label:'Leads (÷10)',        data:leads30.map(v => +(v/10).toFixed(1)), borderColor:'#bbb', backgroundColor:'transparent', tension:.4, pointRadius:0, pointHoverRadius:4, borderDash:[2,4], yAxisID:'y1'},
    ]},
    options: Object.assign({}, chartBaseOpts(), chartScales('R$k', 'M / x10'))
  });
  new Chart(barEl, {
    type: 'bar',
    data: {
      labels: ['Google','Meta','TikTok','YouTube','LinkedIn','DV360'],
      datasets: [
        {label:'Realizado (R$k)', data:[82,84,28,15,18,0],  backgroundColor:'#0d0d0d', borderRadius:0},
        {label:'Meta (R$k)',      data:[90,94,30,18,22,36], backgroundColor:'#e8e8e4', borderRadius:0},
      ]
    },
    options: Object.assign({}, chartBaseOpts(), {
      plugins: {legend:{labels:{font:{family:'Share Tech Mono',size:10}, boxWidth:10}}},
      scales: {
        x: {grid:{display:false}, ticks:{font:MONO_FONT, color:'#888'}},
        y: {grid:{color:GRID_COLOR}, ticks:{font:MONO_FONT, color:'#bbb'}, title:{display:true, text:'R$k', font:MONO_FONT, color:'#bbb'}}
      }
    })
  });
}
// ── INIT (Overview) ──
RU.ready(() => {
  if(window.__oauthReturnHandled) return;
  RU.trackPage('dashboard');
  renderOverviewKPIs();
  renderOverviewTop3();
  renderOverviewStatus();
  setTimeout(() => { initCharts(); }, 80);
  setupChartResize();
});

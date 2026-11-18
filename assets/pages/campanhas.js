/* Rise Up MTech — Campanhas (gerado da separação do operations.html em páginas, 18/nov/2026) */


// ── DATA ──
const PACING=[
  {metric:'Investimento',cur:'R$284k',tgt:'R$310k',pct:91.6,expected:77,unit:'R$'},
  {metric:'Impressões',cur:'18,4M',tgt:'20M',pct:92,expected:77,unit:''},
  {metric:'Cliques',cur:'342k',tgt:'380k',pct:90,expected:77,unit:''},
  {metric:'Leads / Conv.',cur:'4.820',tgt:'5.000',pct:96.4,expected:77,unit:''},
  {metric:'Video Views',cur:'2,1M',tgt:'2,5M',pct:84,expected:77,unit:''},
  {metric:'Engajamentos',cur:'284k',tgt:'300k',pct:94.7,expected:77,unit:''},
];
const CAMPS=[
  {name:'Awareness Q1',plat:'Google Ads',status:'implemented',inv:'R$48.200',pct:'92%',imp:'3,2M',clk:'58k',ctr:'1,81%',cpm:'R$15,0',leads:'820',cpl:'R$58,8',
   detail:[{l:'CPC',v:'R$0,83'},{l:'Alcance',v:'1,8M'},{l:'Freq.',v:'1,8'},{l:'Conv.',v:'820'}]},
  {name:'Performance — Leads',plat:'Meta Ads',status:'implemented',inv:'R$62.500',pct:'89%',imp:'4,8M',clk:'92k',ctr:'1,92%',cpm:'R$13,0',leads:'2.100',cpl:'R$29,8',
   detail:[{l:'CPC',v:'R$0,68'},{l:'Alcance',v:'2,4M'},{l:'Freq.',v:'2,0'},{l:'Taxa Conv.',v:'2,28%'}]},
  {name:'Retargeting',plat:'Meta Ads',status:'implemented',inv:'R$21.000',pct:'95%',imp:'1,1M',clk:'38k',ctr:'3,45%',cpm:'R$19,0',leads:'940',cpl:'R$22,3',
   detail:[{l:'CPC',v:'R$0,55'},{l:'Alcance',v:'480k'},{l:'Freq.',v:'2,3'},{l:'ROAS',v:'4,2x'}]},
  {name:'Brand Search',plat:'Google Ads',status:'implemented',inv:'R$33.800',pct:'88%',imp:'980k',clk:'87k',ctr:'8,88%',cpm:'R$34,4',leads:'680',cpl:'R$49,7',
   detail:[{l:'CPC',v:'R$0,39'},{l:'IS',v:'72%'},{l:'Pos. Méd.',v:'1,4'},{l:'Conv.',v:'680'}]},
  {name:'Video Reach',plat:'YouTube',status:'stand_by',inv:'R$15.000',pct:'61%',imp:'2,1M',clk:'12k',ctr:'0,57%',cpm:'R$7,1',leads:'—',cpl:'—',
   detail:[{l:'Views',v:'820k'},{l:'VTR',v:'38%'},{l:'CPV',v:'R$0,18'},{l:'VCR',v:'22%'}]},
  {name:'TikTok — Gen Z',plat:'TikTok Ads',status:'implemented',inv:'R$28.400',pct:'94%',imp:'3,8M',clk:'44k',ctr:'1,16%',cpm:'R$7,4',leads:'280',cpl:'R$101',
   detail:[{l:'Views',v:'1,28M'},{l:'Eng.',v:'92k'},{l:'Taxa Eng.',v:'2,4%'},{l:'CPE',v:'R$0,31'}]},
  {name:'LinkedIn B2B',plat:'LinkedIn',status:'error',inv:'R$18.100',pct:'72%',imp:'310k',clk:'8k',ctr:'2,58%',cpm:'R$58,3',leads:'—',cpl:'—',
   detail:[{l:'Erro',v:'Budget'},{l:'Pausado',v:'há 2h'},{l:'Leads prev.',v:'240'},{l:'CPL prev.',v:'R$75'}]},
  {name:'Prospecting DV360',plat:'DV360',status:'pending',inv:'—',pct:'—',imp:'—',clk:'—',ctr:'—',cpm:'—',leads:'—',cpl:'—',
   detail:[{l:'Status',v:'Pendente'},{l:'Início',v:'Amanhã'},{l:'Budget',v:'R$36k'},{l:'Formato',v:'Display'}]},
];
const CREATIVES_GENERAL=[
  {name:'Banner_300x250_V1',plat:'Google Ads',img:'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop',m1:{l:'Impressões',v:'1,8M'},m2:{l:'CTR',v:'2,1%'},m3:{l:'CPC',v:'R$0,78'},m4:{l:'Conv.',v:'420'}},
  {name:'Stories_1080x1920',plat:'Meta Ads',img:'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=225&h=400&fit=crop',m1:{l:'Alcance',v:'1,2M'},m2:{l:'CTR',v:'1,4%'},m3:{l:'CPM',v:'R$11,2'},m4:{l:'Leads',v:'840'}},
  {name:'Feed_1080x1080',plat:'Meta Ads',img:'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=400&fit=crop',m1:{l:'Alcance',v:'980k'},m2:{l:'Eng.',v:'18k'},m3:{l:'CTR',v:'2,8%'},m4:{l:'CPC',v:'R$0,52'}},
  {name:'TopView_TK',plat:'TikTok Ads',img:'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=225&fit=crop',m1:{l:'Views',v:'620k'},m2:{l:'VTR',v:'42%'},m3:{l:'Eng.',v:'48k'},m4:{l:'CPE',v:'R$0,28'}},
  {name:'Banner_728x90',plat:'Google Ads',img:'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=100&fit=crop',m1:{l:'Impressões',v:'1,4M'},m2:{l:'CTR',v:'1,6%'},m3:{l:'CPC',v:'R$0,91'},m4:{l:'Conv.',v:'400'}},
  {name:'Carrossel_V2',plat:'Meta Ads',img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop',m1:{l:'Alcance',v:'480k'},m2:{l:'Swipes',v:'22k'},m3:{l:'CTR',v:'4,2%'},m4:{l:'CPC',v:'R$0,48'}},
  {name:'InFeed_TK_V1',plat:'TikTok Ads',img:'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=225&fit=crop',m1:{l:'Views',v:'660k'},m2:{l:'VTR',v:'38%'},m3:{l:'Eng.',v:'44k'},m4:{l:'CPV',v:'R$0,34'}},
  {name:'InMail_B2B',plat:'LinkedIn',img:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=225&fit=crop',m1:{l:'Enviados',v:'48k'},m2:{l:'Abertura',v:'38%'},m3:{l:'CTR',v:'3,1%'},m4:{l:'Status',v:'⚠ Erro'}},
];
const CREATIVES_VIDEO=[
  {name:'Video_15s_V2',plat:'YouTube',img:'https://images.unsplash.com/photo-1551817958-11e40576f80e?w=400&h=225&fit=crop',m1:{l:'Views',v:'480k'},m2:{l:'VTR',v:'41%'},m3:{l:'VCR',v:'19%'},m4:{l:'CPV',v:'R$0,20'}},
  {name:'Bumper_6s',plat:'YouTube',img:'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop',m1:{l:'Views',v:'340k'},m2:{l:'VCR',v:'98%'},m3:{l:'CPM',v:'R$6,4'},m4:{l:'Freq.',v:'2,1'}},
  {name:'TopView_TK',plat:'TikTok Ads',img:'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=225&fit=crop',m1:{l:'Views',v:'620k'},m2:{l:'VTR',v:'42%'},m3:{l:'Eng.',v:'48k'},m4:{l:'CPV',v:'R$0,18'}},
  {name:'InFeed_TK_V1',plat:'TikTok Ads',img:'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=225&fit=crop',m1:{l:'Views',v:'660k'},m2:{l:'VTR',v:'38%'},m3:{l:'Eng.',v:'44k'},m4:{l:'CPV',v:'R$0,34'}},
];
const CREATIVES_SOCIAL=[
  {name:'Stories_1080x1920',plat:'Meta Ads',img:'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=225&h=400&fit=crop',m1:{l:'Alcance',v:'1,2M'},m2:{l:'Eng.',v:'48k'},m3:{l:'Taxa Eng.',v:'4,0%'},m4:{l:'Saves',v:'3,2k'}},
  {name:'Feed_1080x1080',plat:'Meta Ads',img:'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=400&fit=crop',m1:{l:'Alcance',v:'980k'},m2:{l:'Likes',v:'82k'},m3:{l:'Coment.',v:'4,8k'},m4:{l:'Shares',v:'2,1k'}},
  {name:'Carrossel_V2',plat:'Meta Ads',img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop',m1:{l:'Alcance',v:'480k'},m2:{l:'Eng.',v:'28k'},m3:{l:'Taxa Eng.',v:'5,8%'},m4:{l:'Saves',v:'1,8k'}},
  {name:'TopView_TK',plat:'TikTok Ads',img:'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=225&fit=crop',m1:{l:'Eng.',v:'48k'},m2:{l:'Likes',v:'38k'},m3:{l:'Coment.',v:'2,4k'},m4:{l:'Shares',v:'7,6k'}},
  {name:'InFeed_TK_V1',plat:'TikTok Ads',img:'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=225&fit=crop',m1:{l:'Eng.',v:'44k'},m2:{l:'Likes',v:'34k'},m3:{l:'Coment.',v:'1,8k'},m4:{l:'Shares',v:'8,2k'}},
  {name:'InMail_B2B',plat:'LinkedIn',img:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=225&fit=crop',m1:{l:'Reações',v:'8,2k'},m2:{l:'Coment.',v:'480'},m3:{l:'Shares',v:'920'},m4:{l:'Follows',v:'340'}},
];
// ── RENDER PACING ──
function renderPacing(){
  const el = document.getElementById('pacingGrid');
  if(!el) return;
  el.innerHTML = PACING.map(p => {
    const cls = p.pct > 100 ? 'over' : p.pct >= p.expected * 0.95 ? 'ok' : p.pct >= p.expected * 0.8 ? 'warn' : '';
    return '<div class="pacing-card">'
      + '<div class="pacing-head"><span class="pacing-metric">' + p.metric + '</span><span class="pacing-pct">' + p.pct + '%</span></div>'
      + '<div class="pacing-nums"><span class="pacing-cur">' + p.cur + '</span><span class="pacing-tgt">Meta ' + p.tgt + '</span></div>'
      + '<div class="pacing-track">'
      + '<div class="pacing-fill ' + cls + '" style="width:' + Math.min(p.pct,100) + '%"></div>'
      + '<div class="pacing-mark" style="left:' + p.expected + '%"></div>'
      + '</div>'
      + '<div class="pacing-label"><span>0%</span><span style="position:absolute;left:' + p.expected + '%;transform:translateX(-50%);font-size:8px">Esperado</span><span>100%</span></div>'
      + '</div>';
  }).join('');
}
function renderCamps(){
  let rows = '';
  CAMPS.forEach((camp, i) => {
    rows += '<tr class="camp-row" onclick="toggleRow(' + i + ')" id="cr-' + i + '">'
      + '<td class="td-bold" style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'
      + '<span style="font-family:var(--mono);font-size:10px;color:var(--ink-muted);margin-right:6px">▶</span>' + camp.name
      + '</td>'
      + '<td class="td-mono">' + camp.plat + '</td>'
      + '<td>' + badgeH(camp.status) + '</td>'
      + '<td class="td-bold">' + camp.inv + '</td>'
      + '<td class="td-mono">' + camp.pct + '</td>'
      + '<td>' + camp.imp + '</td><td>' + camp.clk + '</td>'
      + '<td class="td-mono">' + camp.ctr + '</td>'
      + '<td class="td-mono">' + camp.cpm + '</td>'
      + '<td>' + camp.leads + '</td>'
      + '<td class="td-mono">' + camp.cpl + '</td>'
      + '</tr>';
    const detailCells = camp.detail.map(d =>
      '<div class="cd-item"><div class="cd-lbl">' + d.l + '</div><div class="cd-val">' + d.v + '</div></div>'
    ).join('');
    rows += '<tbody class="camp-expand" id="ce-' + i + '">'
      + '<tr><td colspan="11"><div class="camp-detail">' + detailCells + '</div></td></tr>'
      + '</tbody>';
  });
  document.getElementById('campTable').innerHTML = rows;
}
function toggleRow(i){
  const row=document.getElementById('cr-'+i);
  const exp=document.getElementById('ce-'+i);
  const arrow=row.querySelector('span');
  row.classList.toggle('open');
  exp.classList.toggle('show');
  arrow.textContent=row.classList.contains('open')?'▼':'▶';
}
// ── RENDER CREATIVES ──
function renderCreativeCard(c,aspect=''){
  return`<div class="creative-card">
    <img class="cc-thumb ${aspect}" src="${c.img}" alt="${c.name}" loading="lazy" onerror="this.style.background='var(--bg3)';this.src=''">
    <div class="cc-info">
      <div class="cc-name">${c.name}</div>
      <div class="cc-plat">${c.plat}</div>
      <div class="cc-metrics">
        <div class="cc-m"><div class="cc-m-lbl">${c.m1.l}</div><div class="cc-m-val">${c.m1.v}</div></div>
        <div class="cc-m"><div class="cc-m-lbl">${c.m2.l}</div><div class="cc-m-val">${c.m2.v}</div></div>
        <div class="cc-m"><div class="cc-m-lbl">${c.m3.l}</div><div class="cc-m-val">${c.m3.v}</div></div>
        <div class="cc-m"><div class="cc-m-lbl">${c.m4.l}</div><div class="cc-m-val">${c.m4.v}</div></div>
      </div>
    </div>
  </div>`;
}
function renderCreatives(){
  document.getElementById('creativeGeneral').innerHTML=CREATIVES_GENERAL.map(c=>renderCreativeCard(c)).join('');
  document.getElementById('creativeVideo').innerHTML=CREATIVES_VIDEO.map(c=>renderCreativeCard(c)).join('');
  document.getElementById('creativeSocial').innerHTML=CREATIVES_SOCIAL.map(c=>renderCreativeCard(c)).join('');
}
// ── VIDEO FUNNEL ──
function renderVideoFunnel(){
  const data=[
    {label:'Impressões',val:'5,5M',pct:100},{label:'Views',val:'2,1M',pct:38},
    {label:'Watch 25%',val:'1,4M',pct:25},{label:'Watch 50%',val:'980k',pct:18},
    {label:'Watch 75%',val:'620k',pct:11},{label:'Watch 95%',val:'380k',pct:7},{label:'Watch 100%',val:'220k',pct:4},
  ];
  document.getElementById('videoFunnel').innerHTML = data.map(d =>
    '<div class="vf-item">'
    + '<div class="vf-label">' + d.label + '</div>'
    + '<div class="vf-bar-wrap"><div class="vf-bar" style="width:' + d.pct + '%"></div></div>'
    + '<div><div class="vf-val">' + d.val + '</div><div class="vf-pct">' + d.pct + '%</div></div>'
    + '</div>'
  ).join('');
}
function renderSocialPyramid(){
  const data=[
    {label:'Impressões',val:'7,5M',pct:100},{label:'Alcance',val:'4,2M',pct:56},
    {label:'Engajamentos',val:'284k',pct:38},{label:'Likes',val:'198k',pct:26},
    {label:'Comentários',val:'12,4k',pct:9},{label:'Compartilhamentos',val:'9,8k',pct:7},{label:'Salvamentos',val:'8,2k',pct:6},
  ];
  document.getElementById('socialPyramid').innerHTML = data.map(d =>
    '<div class="sp-row">'
    + '<div class="sp-label">' + d.label + '</div>'
    + '<div class="sp-bar-wrap"><div class="sp-bar" style="width:' + d.pct + '%"></div></div>'
    + '<div style="width:80px;padding-left:12px"><div class="sp-val">' + d.val + '</div>'
    + '<div style="font-family:var(--mono);font-size:9px;color:var(--ink-muted)">' + d.pct + '%</div></div>'
    + '</div>'
  ).join('');
}
const TOP3_AUD=[
  {name:'Carrossel_V2',plat:'Meta Ads',img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop',audience:'Remarketing — Site',aud_size:'180k pessoas',ctr:'7,2%',cpm:'R$18',leads:'920',score:99,insight:'Melhor combinação do período. Alta intenção + formato carrossel geram CTR 3× acima da média.'},
  {name:'Feed_1080x1080',plat:'Meta Ads',img:'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=400&fit=crop',audience:'Remarketing — Site',aud_size:'180k pessoas',ctr:'6,8%',cpm:'R$19',leads:'840',score:99,insight:'Feed estático performa bem em audiências quentes de remarketing.'},
  {name:'Carrossel_V2',plat:'Meta Ads',img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop',audience:'Interesse — Tecnologia',aud_size:'2,4M pessoas',ctr:'5,1%',cpm:'R$10',leads:'510',score:95,insight:'Melhor custo-benefício: audiência grande + CPM baixo + CTR alto. Alto potencial de escala.'},
];
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
const MONO_FONT = {family:'Share Tech Mono', size:9};
const GRID_COLOR = '#f0f0ec';
const labels30 = Array.from({length:30}, (_,i) => (i+1)+' Mar');
const inv30  = [7.2,8.1,6.8,9.4,10.2,9.8,11.1,8.4,10.8,12.1,11.4,9.2,13.2,11.8,10.4,14.2,12.8,11.2,15.4,13.8,12.4,16.2,14.8,13.2,17.4,15.8,14.2,18.6,16.8,15.2];
const clk30  = [5.1,5.8,4.9,6.8,7.4,7.0,8.0,6.1,7.8,8.8,8.2,6.6,9.5,8.5,7.5,10.2,9.2,8.1,11.0,9.9,8.9,11.6,10.6,9.5,12.4,11.3,10.2,13.2,12.0,10.9];
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
function initChartsCamp(){
  const lineEl  = document.getElementById('chartLine');
  const doughEl = document.getElementById('chartDough');
  if(!lineEl || !doughEl || lineEl._inited) return;
  lineEl._inited = true;
  new Chart(lineEl, {
    type: 'line',
    data: {labels: labels30, datasets: [
      {label:'Investimento (R$k)', data:inv30, borderColor:'#0d0d0d', backgroundColor:'rgba(13,13,13,.06)', tension:.4, pointRadius:0, pointHoverRadius:4, fill:true, yAxisID:'y'},
      {label:'Cliques (k)',        data:clk30, borderColor:'#888', backgroundColor:'transparent', tension:.4, pointRadius:0, pointHoverRadius:4, borderDash:[4,3], yAxisID:'y1'},
    ]},
    options: Object.assign({}, chartBaseOpts(), chartScales('R$k', 'Cliques k'))
  });
  new Chart(doughEl, {
    type: 'doughnut',
    data: {
      labels: ['Google Ads','Meta Ads','TikTok Ads','YouTube','LinkedIn'],
      datasets: [{data:[82,84,28,15,18], backgroundColor:['#0d0d0d','#333','#666','#999','#ccc'], borderWidth:2, borderColor:'#fff', hoverOffset:6}]
    },
    options: Object.assign({}, chartBaseOpts(), {
      cutout: '60%',
      plugins: {legend:{position:'right', labels:{font:{family:'Share Tech Mono',size:9}, boxWidth:10, padding:10}}}
    })
  });
}
// ── CHART RESIZE ──
function setupChartResize(){
  if(!window.ResizeObserver) return;
  const obs = new ResizeObserver(()=>{
    Object.values(Chart.instances).forEach(ch=>ch.resize());
  });
  document.querySelectorAll('.chart-canvas-wrap').forEach(el=>obs.observe(el));
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
      return;
    }
    sel.innerHTML = list.map(w =>
      '<option value="' + w.workspace_id + '">' + _escHtml(w.client_name || w.workspace_id) + '</option>'
    ).join('');
    if(prev && list.some(w => w.workspace_id === prev)) sel.value = prev;
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
  renderOverviewStatus();
  renderOverviewTop3();
  renderPacing();
  renderCamps();
  renderCreatives();
  renderVideoFunnel();
  renderSocialPyramid();
  RU.workspaceRefreshers.push(campLoadWorkspaces);
  RU.oauthListeners.push(() => { if(document.getElementById('campWorkspaceSelect')) campOnWorkspaceChange(); });
  campLoadWorkspaces();
  setTimeout(() => { initChartsCamp(); }, 60);
  setupChartResize();
});

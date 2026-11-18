/* Rise Up MTech — Status (gerado da separação do operations.html em páginas, 18/nov/2026) */

function renderStatus(){
  document.getElementById('statusTable').innerHTML = STATUS_DATA.map(s =>
    '<tr>'
    + '<td class="td-bold">' + s.criativo + '</td>'
    + '<td class="td-mono">' + s.plat + '</td>'
    + '<td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + s.camp + '</td>'
    + '<td>' + badgeH(s.status) + '</td>'
    + '<td class="td-mono" style="color:var(--ink-muted)">' + s.id + '</td>'
    + '<td class="td-mono">' + s.start + '</td>'
    + '<td class="td-mono">' + s.end + '</td>'
    + '<td class="td-mono" style="color:var(--ink-muted)">' + s.upd + '</td>'
    + '</tr>'
  ).join('');
  document.getElementById('stI').textContent = STATUS_DATA.filter(s=>s.status==='implemented').length;
  document.getElementById('stP').textContent = STATUS_DATA.filter(s=>s.status==='pending').length;
  document.getElementById('stE').textContent = STATUS_DATA.filter(s=>s.status==='error').length;
  document.getElementById('stS').textContent = STATUS_DATA.filter(s=>s.status==='stand_by').length;
}
function renderGantt(){
  const days = [];
  const today = new Date();
  const start = new Date(today); start.setDate(today.getDate()-14);
  for(let i=0;i<31;i++){const d=new Date(start);d.setDate(start.getDate()+i);days.push(d);}
  const todayIdx = 14;
  const totalDays = 31;
  const todayPct = (todayIdx/totalDays)*100;
  const groups = {};
  STATUS_DATA.forEach(s => { if(!groups[s.camp]) groups[s.camp]=[]; groups[s.camp].push(s); });
  let html = '<div class="gantt-header"><div class="gantt-col-info">Criativo</div><div class="gantt-timeline">';
  days.forEach((d,i) => {
    const lbl = i===todayIdx ? 'HOJE' : d.getDate()+'/'+String(d.getMonth()+1).padStart(2,'0');
    html += '<div class="gantt-day' + (i===todayIdx?' today':'') + '">' + lbl + '</div>';
  });
  html += '</div></div>';
  Object.entries(groups).forEach(([camp, items]) => {
    html += '<div class="gantt-group-header"><div class="gg-title">' + camp + '</div>'
      + '<div class="gg-badge">' + items.length + ' criativo' + (items.length>1?'s':'') + '</div></div>';
    items.forEach(s => {
      const startDay = parseInt(s.start)||1;
      const endDay = parseInt(s.end)||30;
      const startPct = Math.max(0, Math.min(100, ((startDay-1)/30)*100*0.7));
      const endPct = Math.max(startPct+5, Math.min(100, (endDay/30)*100*0.7+30));
      const width = Math.max(8, endPct-startPct);
      html += '<div class="gantt-row">'
        + '<div class="gantt-row-info">'
        + '<div class="gr-name">' + s.criativo + '</div>'
        + '<div class="gr-meta"><span>' + s.plat + '</span>' + badgeH(s.status) + '</div>'
        + '</div>'
        + '<div class="gantt-bar-area">'
        + '<div class="gantt-today-line" style="left:' + todayPct + '%"></div>'
        + '<div class="gantt-bar ' + s.status + '" style="left:' + startPct + '%;width:' + width + '%">'
        + (s.id !== '—' ? s.id : s.status)
        + '</div></div></div>';
    });
  });
  html += '<div class="gantt-legend">'
    + '<div class="gl-item"><div class="gl-dot implemented"></div>Implementado</div>'
    + '<div class="gl-item"><div class="gl-dot pending"></div>Pendente</div>'
    + '<div class="gl-item"><div class="gl-dot stand_by"></div>Stand By</div>'
    + '<div class="gl-item"><div class="gl-dot error"></div>Erro</div>'
    + '</div>';
  document.getElementById('ganttWrap').innerHTML = html;
}
// ── INIT (Status) ──
RU.ready(() => {
  if(window.__oauthReturnHandled) return;
  RU.trackPage('status');
  renderStatus();
  renderGantt();
});

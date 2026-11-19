/* Rise Up MTech — Status: tabela e Gantt a partir de GET /status/campaigns (dados reais do workspace). */

let STATUS_ROWS = [];
let STATUS_STATE = 'loading'; // loading | ok | error | nows

function stEmpty(msg){ return '<div class="h-empty" style="padding:24px 20px;font-family:var(--mono);font-size:10px;color:var(--ink-muted);letter-spacing:.04em;line-height:1.6">' + msg + '</div>'; }
function stMessage(){
  if(STATUS_STATE === 'loading') return 'Carregando…';
  if(STATUS_STATE === 'error') return 'Não foi possível carregar o status agora. Tente atualizar a página.';
  if(STATUS_STATE === 'nows') return 'Nenhum plano de mídia criado ainda. Crie um em Campanhas → "Subir novo plano".';
  return 'Nenhuma linha de implementação neste plano ainda.';
}

function renderStatus(){
  const tb = document.getElementById('statusTable');
  if(!STATUS_ROWS.length){
    tb.innerHTML = '<tr><td colspan="7">' + stEmpty(stMessage()) + '</td></tr>';
  }else{
    tb.innerHTML = STATUS_ROWS.map(s =>
      '<tr>'
      + '<td class="td-bold" data-label="Criativo">' + _escHtml(s.criativo) + '</td>'
      + '<td class="td-mono" data-label="Plataforma">' + _escHtml(s.plat) + '</td>'
      + '<td data-label="Campanha" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _escHtml(s.camp) + '</td>'
      + '<td data-label="Status" title="' + _escHtml(s.rawStatus) + '">' + badgeH(s.status) + '</td>'
      + '<td data-label="ID na plataforma" class="td-mono" style="color:var(--ink-muted)">' + _escHtml(s.id) + '</td>'
      + '<td data-label="Início" class="td-mono">' + RU.fmtDate(s.start) + '</td>'
      + '<td data-label="Fim" class="td-mono">' + RU.fmtDate(s.end) + '</td>'
      + '</tr>'
    ).join('');
  }
  const n = st => STATUS_ROWS.length ? STATUS_ROWS.filter(s => s.status === st).length : '—';
  document.getElementById('stI').textContent = n('implemented');
  document.getElementById('stP').textContent = n('pending');
  document.getElementById('stE').textContent = n('error');
  document.getElementById('stS').textContent = n('stand_by');
}

function renderGantt(){
  const wrap = document.getElementById('ganttWrap');
  const dated = STATUS_ROWS.filter(s => RU.parseDate(s.start) && RU.parseDate(s.end));
  if(!dated.length){
    wrap.innerHTML = stEmpty(STATUS_ROWS.length ? 'Nenhuma linha com data de início e fim para mostrar na linha do tempo.' : stMessage());
    return;
  }
  const DAY = 86400000, TOTAL = 31, TODAY_IDX = 14;
  const t0 = new Date(); t0.setHours(0,0,0,0);
  const start0 = new Date(t0.getTime() - TODAY_IDX * DAY);
  const days = Array.from({length: TOTAL}, (_, i) => new Date(start0.getTime() + i * DAY));
  const todayPct = ((TODAY_IDX + 0.5) / TOTAL) * 100;
  const groups = {};
  dated.forEach(s => { (groups[s.camp] = groups[s.camp] || []).push(s); });
  let html = '<div class="gantt-header"><div class="gantt-col-info">Criativo</div><div class="gantt-timeline">';
  days.forEach((d, i) => {
    const lbl = i === TODAY_IDX ? 'HOJE' : d.getDate() + '/' + String(d.getMonth()+1).padStart(2,'0');
    html += '<div class="gantt-day' + (i === TODAY_IDX ? ' today' : '') + '">' + lbl + '</div>';
  });
  html += '</div></div>';
  Object.entries(groups).forEach(([camp, items]) => {
    html += '<div class="gantt-group-header"><div class="gg-title">' + _escHtml(camp) + '</div>'
      + '<div class="gg-badge">' + items.length + ' criativo' + (items.length > 1 ? 's' : '') + '</div></div>';
    items.forEach(s => {
      const a = (RU.parseDate(s.start) - start0) / DAY;
      const b = (RU.parseDate(s.end) - start0) / DAY + 1;
      const outside = b <= 0 || a >= TOTAL;
      const l = Math.max(0, Math.min(TOTAL, a)), r = Math.max(0, Math.min(TOTAL, b));
      const leftPct = (l / TOTAL) * 100, widthPct = Math.max(1.5, ((r - l) / TOTAL) * 100);
      html += '<div class="gantt-row">'
        + '<div class="gantt-row-info"><div class="gr-name">' + _escHtml(s.criativo) + '</div>'
        + '<div class="gr-meta"><span>' + _escHtml(s.plat) + '</span>' + badgeH(s.status) + '</div>'
        + '<div class="gr-dates">' + RU.fmtDate(s.start) + ' → ' + RU.fmtDate(s.end) + '</div></div>'
        + '<div class="gantt-bar-area"><div class="gantt-today-line" style="left:' + todayPct + '%"></div>'
        + (outside
            ? '<div style="position:absolute;left:8px;top:50%;transform:translateY(-50%);font-family:var(--mono);font-size:9px;color:var(--ink-muted)">fora da janela · ' + RU.fmtDate(s.start) + ' → ' + RU.fmtDate(s.end) + '</div>'
            : '<div class="gantt-bar ' + (s.status === 'finished' ? 'implemented' : s.status) + '" style="left:' + leftPct + '%;width:' + widthPct + '%">' + (s.id !== '—' ? _escHtml(s.id) : _escHtml(s.rawStatus || s.status)) + '</div>')
        + '</div></div>';
    });
  });
  html += '<div class="gantt-legend">'
    + '<div class="gl-item"><div class="gl-dot implemented"></div>Implementado</div>'
    + '<div class="gl-item"><div class="gl-dot pending"></div>Pendente</div>'
    + '<div class="gl-item"><div class="gl-dot stand_by"></div>Stand By</div>'
    + '<div class="gl-item"><div class="gl-dot error"></div>Erro</div>'
    + '</div>';
  wrap.innerHTML = html;
}

async function stLoad(workspaceId, why){
  if(!workspaceId){ STATUS_ROWS = []; STATUS_STATE = why === 'error' ? 'error' : 'nows'; renderStatus(); renderGantt(); return; }
  STATUS_STATE = 'loading'; STATUS_ROWS = []; renderStatus(); renderGantt();
  const r = await RU.loadImpl(workspaceId);
  if(document.getElementById('stWorkspace').value !== workspaceId) return; // troca rápida de plano
  STATUS_ROWS = r.rows; STATUS_STATE = r.ok ? 'ok' : 'error';
  renderStatus(); renderGantt();
}

// ── INIT (Status) ──
RU.ready(() => {
  if(window.__oauthReturnHandled) return;
  RU.trackPage('status');
  RU.initWorkspaceSelect(document.getElementById('stWorkspace'), stLoad);
});

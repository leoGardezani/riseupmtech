/* Rise Up MTech — Big Table: linhas reais do plano de mídia (GET /status/campaigns). */

let BT_ALL_DATA = [], btFiltered = [], btSortCol = null, btSortDir = 1, btState = 'loading';

function btMsg(){
  if(btState === 'loading') return 'Carregando…';
  if(btState === 'error') return 'Não foi possível carregar os dados agora. Tente atualizar a página.';
  if(btState === 'nows') return 'Nenhum plano de mídia criado ainda.';
  return 'Nenhuma linha neste plano ainda.';
}
function btFillFilters(){
  const uniq = k => [...new Set(BT_ALL_DATA.map(r => r[k]).filter(v => v && v !== '—'))].sort();
  const plat = document.getElementById('bt-fplat'), camp = document.getElementById('bt-fcamp');
  const pv = plat.value, cv = camp.value;
  plat.innerHTML = '<option value="">Todas as plataformas</option>' + uniq('plat').map(v => '<option>' + _escHtml(v) + '</option>').join('');
  camp.innerHTML = '<option value="">Todas as campanhas</option>' + uniq('camp').map(v => '<option>' + _escHtml(v) + '</option>').join('');
  if([...plat.options].some(o => o.value === pv)) plat.value = pv;
  if([...camp.options].some(o => o.value === cv)) camp.value = cv;
}
function btFilter(){
  const q = document.getElementById('btSearch').value.toLowerCase();
  const plat = document.getElementById('bt-fplat').value;
  const camp = document.getElementById('bt-fcamp').value;
  btFiltered = BT_ALL_DATA.filter(r => {
    const mQ = !q || [r.criativo, r.camp, r.plat, r.medium, r.id, r.row_id].some(v => String(v).toLowerCase().includes(q));
    return mQ && (!plat || r.plat === plat) && (!camp || r.camp === camp);
  });
  if(btSortCol) btApplySort();
  btRender();
}
function btSort(col){
  if(btSortCol === col) btSortDir *= -1; else { btSortCol = col; btSortDir = 1; }
  document.querySelectorAll('.bt-table thead th').forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
    if(th.getAttribute('onclick') === "btSort('" + col + "')") th.classList.add(btSortDir === 1 ? 'sort-asc' : 'sort-desc');
  });
  btApplySort(); btRender();
}
function btApplySort(){
  btFiltered.sort((a, b) => String(a[btSortCol] || '').localeCompare(String(b[btSortCol] || ''), 'pt-BR') * btSortDir);
}
function btRender(){
  const info = document.getElementById('bt-info');
  if(info) info.textContent = BT_ALL_DATA.length ? (btFiltered.length + ' / ' + BT_ALL_DATA.length + ' linhas') : '— linhas';
  const body = document.getElementById('btBody');
  if(!body) return;
  if(!btFiltered.length){
    body.innerHTML = '<tr><td colspan="9" style="padding:24px 20px;font-family:var(--mono);font-size:10px;color:var(--ink-muted)">' + (BT_ALL_DATA.length ? 'Nenhuma linha com esses filtros.' : btMsg()) + '</td></tr>';
    return;
  }
  body.innerHTML = btFiltered.map(r => '<tr>'
    + '<td>' + _escHtml(r.criativo) + '</td>'
    + '<td><span class="plat-tag">' + _escHtml(r.plat) + '</span></td>'
    + '<td class="tax" style="max-width:220px;overflow:hidden;text-overflow:ellipsis">' + _escHtml(r.camp) + '</td>'
    + '<td class="tax">' + _escHtml(r.medium) + '</td>'
    + '<td title="' + _escHtml(r.rawStatus) + '">' + badgeH(r.status) + '</td>'
    + '<td class="tax">' + _escHtml(r.id) + '</td>'
    + '<td class="tax">' + RU.fmtDate(r.start) + '</td>'
    + '<td class="tax">' + RU.fmtDate(r.end) + '</td>'
    + '<td class="tax" style="color:var(--ink-muted)">' + _escHtml(r.row_id || '—') + '</td>'
    + '</tr>').join('');
}
function btDownload(type){
  if(!btFiltered.length){ toast('Nada para exportar', 'er'); return; }
  const headers = ['Criativo','Plataforma','Campanha','Meio','Status','ID na plataforma','Início','Fim','Row ID'];
  const rows = btFiltered.map(r => [r.criativo, r.plat, r.camp, r.medium, r.rawStatus || r.status, r.id === '—' ? '' : r.id, r.start, r.end, r.row_id]);
  const esc = v => String(v == null ? '' : v);
  if(type === 'csv'){
    const csv = [headers, ...rows].map(r => r.map(v => '"' + esc(v).replace(/"/g, '""') + '"').join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], {type: 'text/csv;charset=utf-8'})); a.download = 'bigtable_riseup.csv'; a.click();
    toast('CSV exportado', 'ok');
  } else {
    const xls = '<html xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="UTF-8"></head><body><table>'
      + [headers, ...rows].map(r => '<tr>' + r.map(v => '<td>' + _escHtml(esc(v)) + '</td>').join('') + '</tr>').join('') + '</table></body></html>';
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([xls], {type: 'application/vnd.ms-excel'})); a.download = 'bigtable_riseup.xls'; a.click();
    toast('Excel exportado', 'ok');
  }
}
async function btLoad(workspaceId, why){
  if(!workspaceId){ BT_ALL_DATA = []; btFiltered = []; btState = why === 'error' ? 'error' : 'nows'; btFillFilters(); btRender(); return; }
  BT_ALL_DATA = []; btFiltered = []; btState = 'loading'; btRender();
  const r = await RU.loadImpl(workspaceId);
  if(document.getElementById('btWorkspace').value !== workspaceId) return;
  BT_ALL_DATA = r.rows; btState = r.ok ? 'ok' : 'error';
  btFillFilters(); btFilter();
}
// ── INIT (Big Table) ──
RU.ready(() => {
  if(window.__oauthReturnHandled) return;
  RU.trackPage('bigtable');
  RU.initWorkspaceSelect(document.getElementById('btWorkspace'), btLoad);
});

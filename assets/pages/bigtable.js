/* Rise Up MTech — Big Table (gerado da separação do operations.html em páginas, 18/nov/2026) */

function rnd(a,b){return+(a+(Math.random()*(b-a))).toFixed(2);}
function rndInt(a,b){return Math.floor(a+Math.random()*(b-a));}
const BT_COUNTRIES=['BR','AR','MX','CL','CO'];
const BT_BUS=['Performance','Brand','Digital'];
const BT_BRANDS=['Produto A','Produto B','Produto C'];
const BT_CAMP_TYPES=['awareness','consideration','conversion','retargeting'];
const BT_MEDIA=['Google Ads','Meta Ads','TikTok Ads','YouTube','LinkedIn','DV360'];
const BT_MEDIUMS=['cpc','cpm','cpv','cpe'];
const BT_AUDS=['Remarketing — Site','Lookalike 1%','Interesse — Tecnologia','In-Market B2B','Gen Z 18-24','Mulheres 25-34','Homens 35-44','Broad'];
const BT_CAMPS=['Awareness Q1','Performance — Leads','Retargeting','Brand Search','TikTok — Gen Z','LinkedIn B2B','Video Reach'];
const BT_CREATIVES=['Banner_300x250_V1','Banner_728x90_V1','Stories_1080x1920_V1','Feed_1080x1080_V1','Carrossel_1080x1080_V2','TopView_1080x1920_V1','InFeed_1080x1920_V1','Reels_1080x1920_V1','PreRoll_1920x1080_V1','Bumper_1920x1080_V1','Banner_160x600_V1','Responsive_HTML5_V1','OOH_Outdoor_6x3m','Radio_30s_V1'];
function genRow(id){
  const source=BT_MEDIA[rndInt(0,BT_MEDIA.length)];
  const imp=rndInt(80000,4000000);
  const reach=Math.floor(imp*rnd(0.4,0.9));
  const freq=+(imp/reach).toFixed(1);
  const inv=rndInt(2000,80000);
  const clicks=Math.floor(imp*rnd(0.005,0.09));
  const ctr=+((clicks/imp)*100).toFixed(2);
  const eng=Math.floor(clicks*rnd(0.3,2.5));
  const cpm=+((inv/imp)*1000).toFixed(2);
  const cpc=clicks>0?+(inv/clicks).toFixed(2):0;
  const leads=rndInt(0,Math.floor(clicks*0.15));
  const conv=Math.floor(leads*rnd(0.3,0.9));
  const cpl=leads>0?+(inv/leads).toFixed(2):null;
  const roas=+(rnd(0.8,6.5)).toFixed(1);
  const cpv=(source==='YouTube'||source==='TikTok Ads')?+(inv/Math.max(1,Math.floor(imp*rnd(0.1,0.45)))).toFixed(2):null;
  const cpe=eng>0?+(inv/eng).toFixed(2):null;
  const day=rndInt(1,28);
  return {id,creative_name:BT_CREATIVES[rndInt(0,BT_CREATIVES.length)],country:BT_COUNTRIES[rndInt(0,BT_COUNTRIES.length)],bu:BT_BUS[rndInt(0,BT_BUS.length)],brand:BT_BRANDS[rndInt(0,BT_BRANDS.length)],campaign_name:BT_CAMPS[rndInt(0,BT_CAMPS.length)],campaign_type:BT_CAMP_TYPES[rndInt(0,BT_CAMP_TYPES.length)],source,medium:BT_MEDIUMS[rndInt(0,BT_MEDIUMS.length)],audience:BT_AUDS[rndInt(0,BT_AUDS.length)],impressions:imp,reach,frequency:freq,investment:inv,start_date:`${String(day).padStart(2,'0')}/03/2025`,clicks,ctr,engagements:eng,cpm,cpc,cpv,cpe,leads,cpl,conversions:conv,roas};
}
const BT_ALL_DATA=Array.from({length:120},(_,i)=>genRow(i+1));
let btFiltered=[...BT_ALL_DATA];
let btSortCol=null,btSortDir=1;
function btFilter(){
  const q=document.getElementById('btSearch').value.toLowerCase();
  const plat=document.getElementById('bt-fplat').value;
  const camp=document.getElementById('bt-fcamp').value;
  btFiltered=BT_ALL_DATA.filter(r=>{
    const mQ=!q||r.creative_name.toLowerCase().includes(q)||r.campaign_name.toLowerCase().includes(q)||r.source.toLowerCase().includes(q)||r.audience.toLowerCase().includes(q)||r.brand.toLowerCase().includes(q);
    return mQ&&(!plat||r.source===plat)&&(!camp||r.campaign_name===camp);
  });
  if(btSortCol) btApplySort();
  btRender();
}
function btSort(col){
  if(btSortCol===col) btSortDir*=-1; else{btSortCol=col;btSortDir=1;}
  document.querySelectorAll('.bt-table thead th').forEach(th=>th.classList.remove('sort-asc','sort-desc'));
  document.querySelectorAll('.bt-table thead th').forEach(th=>{if(th.getAttribute('onclick')===`btSort('${col}')`)th.classList.add(btSortDir===1?'sort-asc':'sort-desc');});
  btApplySort(); btRender();
}
function btApplySort(){
  btFiltered.sort((a,b)=>{const va=a[btSortCol],vb=b[btSortCol];if(va===null&&vb===null)return 0;if(va===null)return 1;if(vb===null)return -1;return typeof va==='string'?va.localeCompare(vb)*btSortDir:(va-vb)*btSortDir;});
}
function dash(v,pre='',suf=''){return v===null||v===undefined?'<span style="color:var(--ink-muted)">—</span>':pre+v+suf;}
function btRender(){
  const info=document.getElementById('bt-info');
  if(info) info.textContent=btFiltered.length+' / '+BT_ALL_DATA.length+' linhas';
  const body=document.getElementById('btBody');
  if(!body) return;
  body.innerHTML=btFiltered.map(r=>`<tr>
    <td>${r.creative_name}</td>
    <td class="tax">${r.country}</td><td class="tax">${r.bu}</td><td class="tax">${r.brand}</td>
    <td class="tax" style="max-width:160px;overflow:hidden;text-overflow:ellipsis">${r.campaign_name}</td>
    <td class="tax"><span class="plat-tag">${r.campaign_type}</span></td>
    <td><span class="plat-tag">${r.source}</span></td>
    <td class="tax">${r.medium}</td>
    <td class="tax" style="max-width:140px;overflow:hidden;text-overflow:ellipsis">${r.audience}</td>
    <td class="num">${fmt(r.impressions)}</td><td class="num">${fmt(r.reach)}</td>
    <td class="num">${r.frequency}</td><td class="num">R$${fmt(r.investment)}</td>
    <td class="tax">${r.start_date}</td>
    <td class="num">${fmt(r.clicks)}</td><td class="num">${r.ctr}%</td><td class="num">${fmt(r.engagements)}</td>
    <td class="num">R$${r.cpm}</td><td class="num">R$${r.cpc}</td>
    <td class="num">${dash(r.cpv,'R$')}</td><td class="num">${dash(r.cpe,'R$')}</td>
    <td class="num">${r.leads}</td><td class="num">${dash(r.cpl,'R$')}</td>
    <td class="num">${r.conversions}</td><td class="num">${r.roas}x</td>
  </tr>`).join('');
}
function btDownload(type){
  const cols=['creative_name','country','bu','brand','campaign_name','campaign_type','source','medium','audience','impressions','reach','frequency','investment','start_date','clicks','ctr','engagements','cpm','cpc','cpv','cpe','leads','cpl','conversions','roas'];
  const headers=['Criativo','País','BU','Marca','Campanha','Tipo','Plataforma','Meio','Audiência','Impressões','Alcance','Frequência','Investimento','Início','Cliques','CTR','Engajamentos','CPM','CPC','CPV','CPE','Leads','CPL','Conversões','ROAS'];
  const rows=btFiltered.map(r=>cols.map(col=>r[col]===null?'':r[col]));
  if(type==='csv'){
    const csv=[headers,...rows].map(r=>r.map(v=>'"'+v+'"').join(',')).join('\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='bigtable_riseup.csv';a.click();
    toast('CSV exportado','ok');
  } else {
    const xls='<html xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="UTF-8"></head><body><table>'+[headers,...rows].map(r=>'<tr>'+r.map(v=>`<td>${v}</td>`).join('')+'</tr>').join('')+'</table></body></html>';
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([xls],{type:'application/vnd.ms-excel'}));a.download='bigtable_riseup.xls';a.click();
    toast('Excel exportado','ok');
  }
}
// ── INIT (Big Table) ──
RU.ready(() => {
  if(window.__oauthReturnHandled) return;
  RU.trackPage('bigtable');
  btRender();
});

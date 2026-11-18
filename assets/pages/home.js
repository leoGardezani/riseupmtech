/* Rise Up MTech — Yōkoso (Home): saudação, indicadores reais, o que precisa de atenção, atalhos. */
(function(){
  const PLAT = [
    { key: 'google_ads', name: 'Google Ads' },
    { key: 'meta',       name: 'Meta Ads' },
    { key: 'tiktok',     name: 'TikTok Ads' },
  ];
  const PAGE_META = {
    campanhas:   'Resultados, pacing e pipeline',
    audiencias:  'Sugerir e criar audiências',
    desdobrador: 'KV → todos os formatos',
    criativos:   'Aprovação e upload de peças',
    status:      'Implementação por linha',
    bigtable:    'Tabela completa de dados',
  };
  const esc = s => (typeof _escHtml === 'function' ? _escHtml(s) : String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])));
  const $ = id => document.getElementById(id);
  const pad = n => String(n).padStart(2, '0');

  async function getJson(path){
    try{
      const res = await fetch(API_BASE + path, { headers: authHeaders() });
      if(!res.ok) return { ok: false, data: null };
      return { ok: true, data: await res.json() };
    }catch(e){ return { ok: false, data: null }; }
  }

  function greeting(name){
    const h = new Date().getHours();
    const g = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    return g + (name ? ', ' + name : '');
  }
  function longDate(){
    const s = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function ago(ts){
    const m = Math.round((Date.now() - ts) / 60000);
    if(m < 1) return 'agora';
    if(m < 60) return 'há ' + m + ' min';
    const h = Math.round(m / 60);
    if(h < 24) return 'há ' + h + ' h';
    const d = Math.round(h / 24);
    return d === 1 ? 'ontem' : 'há ' + d + ' dias';
  }
  function openPanel(page){ return "togglePanel();openRpPage('" + page + "');return false;"; }

  // ── saudação (não depende do backend) ──
  function renderHello(attnCount){
    let first = '';
    try{
      const u = JSON.parse(localStorage.getItem('riseup_user') || 'null');
      const n = u && (u.name || u.email);
      if(n) first = String(n).split(/[ @]/)[0];
    }catch(e){}
    $('hHello').textContent = greeting(first);
    const parts = [longDate()];
    if(attnCount === null) parts.push('carregando seus dados…');
    else parts.push(attnCount === 0 ? 'nada pede sua atenção agora' : attnCount + (attnCount === 1 ? ' item pede sua atenção' : ' itens pedem sua atenção'));
    $('hHelloSub').textContent = parts.join(' · ');
  }

  // ── continue de onde parou (histórico local de páginas) ──
  function renderResume(){
    const box = $('hResume');
    let list = [];
    try{ list = JSON.parse(localStorage.getItem('riseup_recent_pages') || '[]'); }catch(e){}
    list = list.filter(x => x && x.id && x.id !== 'home' && RU.PAGE_FILES && RU.PAGE_FILES[x.id]).slice(0, 3);
    if(!list.length){
      box.innerHTML = '<div class="h-empty">Nada por aqui ainda. Abra uma das páginas abaixo e ela aparece aqui.</div>';
      return;
    }
    box.innerHTML = list.map(x =>
      '<a class="h-res" href="' + RU.PAGE_FILES[x.id] + '">'
      + '<div class="h-res-top"><span>' + esc(RU.PAGES[x.id] || x.id) + '</span><span>' + esc(ago(x.ts)) + '</span></div>'
      + '<div class="h-res-title">' + esc(RU.PAGES[x.id] || x.id) + '</div>'
      + '<div class="h-res-meta">' + esc(PAGE_META[x.id] || '') + '</div></a>'
    ).join('');
  }

  // ── dados reais ──
  async function load(){
    renderHello(null);
    renderResume();
    const [wsR, connR] = await Promise.all([getJson('/plan/workspaces'), getJson('/connect/company/status')]);
    const workspaces = (wsR.ok && Array.isArray(wsR.data)) ? wsR.data : [];
    const platforms = (connR.ok && connR.data && connR.data.platforms) || {};
    const canManage = !!(connR.ok && connR.data && connR.data.can_manage);

    // fila de desdobramento e aprovações pendentes, por workspace
    let dataErrors = (!wsR.ok ? 1 : 0) + (!connR.ok ? 1 : 0);
    const per = await Promise.all(workspaces.map(async w => {
      const id = encodeURIComponent(w.workspace_id);
      const [q, p] = await Promise.all([getJson('/desdobrador/queue?workspace_id=' + id), getJson('/desdobrador/pending?workspace_id=' + id)]);
      if(!q.ok) dataErrors++;
      if(!p.ok) dataErrors++;
      return { w, queue: q.ok ? ((q.data && q.data.queue) || []).length : null, pending: p.ok ? ((p.data && p.data.pending) || []).length : null };
    }));
    const sum = k => per.reduce((a, x) => a + (x[k] || 0), 0);
    const connected = PLAT.filter(p => platforms[p.key] && platforms[p.key].connected).length;

    // KPIs
    const now = new Date();
    const kpis = [
      { lbl: 'Planos de mídia', val: connR.ok || wsR.ok ? workspaces.length : '—', d: 'workspaces criados', feat: true },
      { lbl: 'Aguardando desdobramento', val: wsR.ok ? sum('queue') : '—', d: 'linhas sem criativo' },
      { lbl: 'Aguardando aprovação', val: wsR.ok ? sum('pending') : '—', d: 'criativos para revisar' },
      { lbl: 'Conexões saudáveis', val: connR.ok ? connected + '/' + PLAT.length : '—', d: 'Google, Meta e TikTok' },
      { lbl: 'Papel na conta', val: connR.ok ? (canManage ? 'Gestor' : 'Leitura') : '—', d: canManage ? 'pode conectar contas' : 'conectar exige editor ou admin' },
      { lbl: 'Atualizado às', val: pad(now.getHours()) + ':' + pad(now.getMinutes()), d: 'dados carregados agora' },
    ];
    $('hKpis').innerHTML = kpis.map(k =>
      '<div class="kpi' + (k.feat ? ' feat' : '') + '"><div class="kpi-lbl">' + esc(k.lbl) + '</div><div class="kpi-val">' + esc(k.val) + '</div><div class="kpi-delta">' + esc(k.d) + '</div></div>'
    ).join('');

    // atenção
    const rows = [];
    if(wsR.ok && !workspaces.length){
      rows.push({ lvl: 'o', item: 'Nenhum plano de mídia criado', sub: 'PLANO · COMECE POR AQUI', cli: '—', act: '<a class="btn-sm ghost" href="#" onclick="' + openPanel('planilha') + '">Criar plano</a>' });
    }
    if(connR.ok){
      PLAT.forEach(p => {
        if(!(platforms[p.key] && platforms[p.key].connected)){
          rows.push({ lvl: 'o', item: p.name + ' não está conectado', sub: 'CONEXÃO · CONECTE PARA SUBIR CAMPANHAS', cli: esc((connR.data && connR.data.company) || '—'),
            act: '<a class="btn-sm ghost" href="#" onclick="' + openPanel('conexoes') + '">Conectar</a>' });
        }
      });
    }
    per.forEach(x => {
      const cli = esc(x.w.client_name || 'Sem nome');
      if(x.pending){
        rows.push({ lvl: 'o', item: x.pending + (x.pending === 1 ? ' criativo aguardando aprovação' : ' criativos aguardando aprovação'), sub: 'APROVAÇÃO · CRIATIVOS', cli, act: '<a class="btn-sm ghost" href="criativos.html">Revisar</a>' });
      }
      if(x.queue){
        rows.push({ lvl: 'b', item: x.queue + (x.queue === 1 ? ' linha aguardando desdobramento' : ' linhas aguardando desdobramento'), sub: 'DESDOBRADOR · PLANO DE MÍDIA', cli, act: '<a class="btn-sm ghost" href="desdobrador.html">Desdobrar</a>' });
      }
    });
    if(dataErrors){
      rows.push({ lvl: 'r', item: 'Não foi possível carregar alguns dados', sub: 'BACKEND · TENTE ATUALIZAR A PÁGINA', cli: '—', act: '<a class="btn-sm ghost" href="operations.html">Atualizar</a>' });
    }
    const BADGE = { o: ['b-o', 'Atenção'], b: ['b-b', 'Fila'], r: ['b-r', 'Erro'], g: ['b-g', 'Em dia'] };
    const attn = rows.length;
    if(!rows.length) rows.push({ lvl: 'g', item: 'Tudo em dia', sub: 'NADA PENDENTE AGORA', cli: '—', act: '' });
    $('hAttn').innerHTML = rows.map(r =>
      '<tr><td><span class="badge ' + BADGE[r.lvl][0] + '">' + BADGE[r.lvl][1] + '</span></td>'
      + '<td><div class="td-bold">' + esc(r.item) + '</div><div class="td-mono" style="color:var(--ink-muted)">' + r.sub + '</div></td>'
      + '<td class="td-mono">' + r.cli + '</td><td>' + r.act + '</td></tr>'
    ).join('');

    // conexões
    const connCards = PLAT.map(p => {
      const on = !!(platforms[p.key] && platforms[p.key].connected);
      const badge = !connR.ok ? '<span class="badge b-gr">Sem dados</span>' : on ? '<span class="badge b-g">Conectado</span>' : '<span class="badge b-o">Não conectado</span>';
      return '<div class="h-conn"><b>' + p.name + '</b>' + badge + '</div>';
    });
    connCards.push('<div class="h-conn"><b>LinkedIn Ads</b><span class="badge b-y">Em teste</span><small>DEVELOPMENT TIER</small></div>');
    connCards.push('<div class="h-conn"><b>Amazon Ads</b><span class="badge b-gr">Indisponível</span></div>');
    $('hConns').innerHTML = connCards.join('');

    // clientes / planos de mídia
    if(!wsR.ok){
      $('hClients').innerHTML = '<div class="h-empty" style="grid-column:1/-1">Não foi possível carregar os planos de mídia agora.</div>';
    }else if(!per.length){
      $('hClients').innerHTML = '<div class="h-empty" style="grid-column:1/-1">Nenhum plano de mídia criado ainda. <a href="#" onclick="' + openPanel('planilha') + '" style="text-decoration:underline">Criar o primeiro</a>.</div>';
    }else{
      $('hClients').innerHTML = per.map(x => {
        const url = x.w.spreadsheet_url ? ' href="' + esc(x.w.spreadsheet_url) + '" target="_blank" rel="noopener"' : ' href="campanhas.html"';
        return '<a class="h-cl"' + url + '><div class="h-cl-head"><span class="h-cl-name">' + esc(x.w.client_name || 'Sem nome') + '</span><span class="h-cl-plat">PLANO DE MÍDIA ↗</span></div>'
          + '<div class="h-cl-nums"><div><span class="h-cl-lbl">Desdobrar</span><span class="h-cl-val">' + (x.queue === null ? '—' : x.queue) + '</span></div>'
          + '<div><span class="h-cl-lbl">Aprovar</span><span class="h-cl-val">' + (x.pending === null ? '—' : x.pending) + '</span></div></div></a>';
      }).join('');
    }
    renderHello(attn);
  }

  RU.PAGES.home = 'Yōkoso';
  RU.ready(function(){
    if(window.__oauthReturnHandled) return;
    renderHello(null);
    renderResume();         // lê o histórico ANTES de registrar esta visita
    RU.trackPage('home');
    load();
  });
})();

/* Rise Up MTech — seletor de cor: bolinhas de cores prontas + seletor completo (quadrado de cor + matiz) + campo hex.
   Uso: <div data-colorpicker="idDoInputHidden" data-onchange="nomeDaFuncao"></div> + <input type="hidden" id="idDoInputHidden" value="#0D0D0D"> */
(function(){
  var PRESETS = ['#0D0D0D','#FFFFFF','#E11D48','#F97316','#FACC15','#22C55E','#0EA5E9','#2563EB','#7C3AED','#EC4899'];
  function hex2rgb(h){ h = h.replace('#',''); if(h.length === 3) h = h.split('').map(function(c){ return c + c; }).join(''); var n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function rgb2hex(r, g, b){ return '#' + [r, g, b].map(function(v){ return Math.round(v).toString(16).padStart(2, '0'); }).join('').toUpperCase(); }
  function rgb2hsv(r, g, b){ r /= 255; g /= 255; b /= 255; var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0;
    if(d){ if(mx === r) h = ((g - b) / d) % 6; else if(mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; if(h < 0) h += 360; }
    return [h, mx ? d / mx : 0, mx]; }
  function hsv2rgb(h, s, v){ var c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c, r = 0, g = 0, b = 0;
    if(h < 60){ r = c; g = x; } else if(h < 120){ r = x; g = c; } else if(h < 180){ g = c; b = x; } else if(h < 240){ g = x; b = c; } else if(h < 300){ r = x; b = c; } else { r = c; b = x; }
    return [(r + m) * 255, (g + m) * 255, (b + m) * 255]; }
  function validHex(v){ v = String(v || '').trim().replace(/^#/, ''); return /^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v) ? '#' + v : null; }

  function mount(el){
    var input = document.getElementById(el.getAttribute('data-colorpicker'));
    if(!input) return;
    var cbName = el.getAttribute('data-onchange');
    var cur = (validHex(input.value) ? rgb2hex.apply(null, hex2rgb(validHex(input.value))) : PRESETS[0]);
    var hsv = rgb2hsv.apply(null, hex2rgb(cur));
    el.classList.add('cp');
    el.innerHTML = '<div class="cp-sws">' + PRESETS.map(function(c){ return '<button type="button" class="cp-sw" data-c="' + c + '" style="background:' + c + '" aria-label="Cor ' + c + '"></button>'; }).join('')
      + '<button type="button" class="cp-sw cp-custom" aria-label="Cor personalizada" title="Cor personalizada"></button></div>'
      + '<div class="cp-panel" hidden><div class="cp-sv"><i class="cp-knob"></i></div><div class="cp-hue"><i class="cp-knob"></i></div>'
      + '<div class="cp-row"><span class="cp-prev"></span><label class="cp-hexl">HEX <input class="cp-hex" maxlength="7" autocapitalize="characters" autocomplete="off" spellcheck="false"></label></div></div>';
    var panel = el.querySelector('.cp-panel'), sv = el.querySelector('.cp-sv'), hue = el.querySelector('.cp-hue'), hex = el.querySelector('.cp-hex'), prev = el.querySelector('.cp-prev');
    var svK = sv.firstChild, hueK = hue.firstChild;

    function paint(fromHex){
      var rgb = hsv2rgb(hsv[0], hsv[1], hsv[2]); cur = rgb2hex(rgb[0], rgb[1], rgb[2]);
      sv.style.background = 'linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,hsl(' + hsv[0] + ',100%,50%))';
      svK.style.left = (hsv[1] * 100) + '%'; svK.style.top = ((1 - hsv[2]) * 100) + '%'; svK.style.background = cur;
      hueK.style.left = (hsv[0] / 360 * 100) + '%'; hueK.style.background = 'hsl(' + hsv[0] + ',100%,50%)';
      prev.style.background = cur; if(!fromHex) hex.value = cur;
      el.querySelectorAll('.cp-sw[data-c]').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-c') === cur); });
      el.querySelector('.cp-custom').classList.toggle('on', !PRESETS.some(function(c){ return c === cur; }));
    }
    function commit(){
      input.value = cur;
      if(cbName && typeof window[cbName] === 'function') window[cbName]();
    }
    function drag(node, fn){
      node.style.touchAction = 'none';
      node.addEventListener('pointerdown', function(e){ node.setPointerCapture(e.pointerId); fn(e); node.onpointermove = fn; });
      node.addEventListener('pointerup', function(){ node.onpointermove = null; });
      node.addEventListener('pointercancel', function(){ node.onpointermove = null; });
    }
    function pos(node, e){ var r = node.getBoundingClientRect(); return [Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))]; }
    drag(sv, function(e){ var p = pos(sv, e); hsv[1] = p[0]; hsv[2] = 1 - p[1]; paint(); commit(); });
    drag(hue, function(e){ var p = pos(hue, e); hsv[0] = p[0] * 359.999; paint(); commit(); });
    el.querySelectorAll('.cp-sw[data-c]').forEach(function(b){ b.addEventListener('click', function(){ hsv = rgb2hsv.apply(null, hex2rgb(b.getAttribute('data-c'))); paint(); commit(); }); });
    el.querySelector('.cp-custom').addEventListener('click', function(){ panel.hidden = !panel.hidden; });
    hex.addEventListener('input', function(){
      var v = validHex(hex.value); hex.classList.toggle('bad', !v && hex.value.trim() !== '');
      if(v){ hsv = rgb2hsv.apply(null, hex2rgb(v)); paint(true); commit(); }
    });
    hex.addEventListener('blur', function(){ hex.classList.remove('bad'); hex.value = cur; });
    paint(); input.value = cur;
  }
  function init(){ document.querySelectorAll('[data-colorpicker]').forEach(mount); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

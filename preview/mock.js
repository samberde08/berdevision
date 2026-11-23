(function(){
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.work-item'));
  // ---- hover loops ----
  var loops = ['1249151789','1249151605','1249151719','1249151866','1249151733','1249151670','1249151833'];
  tiles.forEach(function(t){
    if (loops.indexOf(t.dataset.vimeo) === -1) return;
    var v = document.createElement('video');
    v.className = 'm-loop'; v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'metadata';
    v.src = 'loops/' + t.dataset.vimeo + '.mp4';
    t.insertBefore(v, t.querySelector('.work-overlay'));
    function on(){ t.classList.add('m-playing'); var p = v.play(); if (p && p.catch) p.catch(function(){}); }
    function off(){ t.classList.remove('m-playing'); v.pause(); }
    t.addEventListener('mouseenter', on); t.addEventListener('mouseleave', off);
    t._mOn = on;
  });
  // ---- hero ----
  var c = document.querySelector('.reel-center');
  if (c) {
    // stacked wordmark: both lines justified to one width, tight leading (same lockup as the About collage)
    var sl = c.querySelector('.reel-slogan'), lines = ['BERDE','VIS','ION'], els = [];
    if (sl) {
      sl.textContent = ''; sl.classList.add('m-lock'); sl.setAttribute('aria-label','BerdeVision');
      lines.forEach(function(t){ var d = document.createElement('span'); d.textContent = t; sl.appendChild(d); els.push(d); });
      var mc = document.createElement('canvas').getContext('2d');
      var fit = function(){
        var W = Math.min(window.innerWidth*(window.innerWidth<=768?0.58:0.74), window.innerHeight*0.5, 600);
        mc.font = "800 100px Manrope, 'DM Sans', sans-serif";
        els.forEach(function(d, i){ d.style.fontSize = (W / mc.measureText(lines[i]).width * 100).toFixed(1) + 'px'; });
      };
      fit(); window.addEventListener('resize', fit);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    }
    var s = document.createElement('div'); s.className = 'm-hero-sub'; s.textContent = 'Vision, elevated · Video + VFX · Dallas'; c.appendChild(s);
  }
  // ---- player credits ----
  var credits = {
    '1249151789': [['Role','Shot + Edited'],['Artist','Ye'],['Venue','AT&T Stadium, Dallas']],
    '1249151605': [['Role','VFX · SFX · Edit'],['Director / DP','Anthony Crouchelli'],['Brand','Storm Energy']],
    '1249151719': [['Role','VFX'],['Client','Lids x Street Fighter'],['With','Jared Ryder · Daniel Czerni (additional editing)']],
    '1249151866': [['Role','VFX'],['Creative Direction','Luke Abad']],
    '1249151733': [['Role','3D VFX'],['Director','Aficial Visuals'],['VFX Agency','This Was Major'],['EP','David Sosna']],
    '1249151670': [['Role','VFX'],['Director','Kiva Corshen'],['Production','BOUNDARY8'],['Client','Arran Studios']],
    '1249151833': [['Role','Shot · Edited · VFX'],['Artist','Esdeekid']]
  };
  var inner = document.querySelector('.lightbox-inner');
  var panel = document.createElement('div'); panel.className = 'm-credits'; inner.appendChild(panel);
  tiles.forEach(function(t){
    t.addEventListener('click', function(){
      var g = function(s){ var e = t.querySelector(s); return e ? e.textContent : ''; };
      var rows = credits[t.dataset.vimeo] || [];
      panel.innerHTML = '<div class="m-tag">' + g('.work-tag') + '</div><div class="m-title">' + g('.work-name') + '</div><div class="m-sub">' + g('.work-subtitle') + '</div><dl>' +
        rows.map(function(r){ return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('') + '</dl>';
    }, true);
  });
  // ---- stacked lockup helper: every line justified to the same width ----
  var mc2 = document.createElement('canvas').getContext('2d'), locks = [];
  function lockup(el, lines, widthFn){
    el.textContent = ''; el.classList.add('m-stack');
    var sp = lines.map(function(t){ var d = document.createElement('span'); d.textContent = t; el.appendChild(d); return d; });
    locks.push(function(){ var W = widthFn(); mc2.font = "800 100px Manrope, 'DM Sans', sans-serif";
      sp.forEach(function(d, i){ d.style.fontSize = (W / mc2.measureText(lines[i]).width * 100).toFixed(1) + 'px'; }); });
  }
  function fitLocks(){ locks.forEach(function(f){ f(); }); }
  // ---- about: stacked statement replaces the small BERDEVISION heading ----
  var ab = document.querySelector('.about-page .about-body');
  if (ab) { var lab = ab.querySelector('.work-label');
    if (lab) { var st = document.createElement('div'); st.className = 'm-statement'; st.setAttribute('aria-label','Every cut, every frame, every decision');
      lab.parentNode.replaceChild(st, lab);
      lockup(st, ['EVERY CUT','EVERY FRAME','EVERY DECISION'], function(){ return Math.min(ab.clientWidth*0.86, 560); }); } }
  // ---- client strip straight under the hero ----
  var tr = document.querySelector('#work .logo-track'), reel = document.querySelector('.reel-wrap');
  if (tr && reel) { var blk = tr.parentElement.parentElement; blk.classList.add('m-clients'); blk.removeAttribute('style');
    var l = blk.querySelector('.work-label'); if (l) l.textContent = 'Trusted by';
    reel.insertAdjacentElement('afterend', blk); }
  // ---- footer + contact block ----
  var ft = document.querySelector('footer');
  if (ft) { ft.classList.add('m-footer');
    ft.innerHTML = '<div class="m-f-mark"></div>' +
      '<div class="m-f-cols">' +
        '<div><div class="m-f-h">Contact</div><a href="mailto:samberde@gmail.com">samberde@gmail.com</a><a href="https://www.instagram.com/berdevision/" target="_blank" rel="noopener">Instagram · @berdevision</a></div>' +
        '<div><div class="m-f-h">Studio</div><span>Video · VFX · Post-production</span><span>Based in Dallas — Available worldwide</span></div>' +
        '<div><div class="m-f-h">Site</div><a href="#" data-page="home">Work</a><a href="#" data-page="about">About</a></div>' +
      '</div><div class="m-f-base">© 2026 Berdevision. All rights reserved.</div>';
    lockup(ft.querySelector('.m-f-mark'), ['BERDE','VISION'], function(){ return Math.min(ft.clientWidth - 48, 1500); });
    ft.querySelectorAll('a[data-page]').forEach(function(a){ a.addEventListener('click', function(e){ e.preventDefault();
      var n = document.querySelector('nav a[data-page="' + a.dataset.page + '"]'); if (n) n.click(); window.scrollTo(0,0); }); });
  }
  fitLocks(); window.addEventListener('resize', fitLocks);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitLocks);
  var pa = document.getElementById('page-about'); if (pa) new MutationObserver(fitLocks).observe(pa, {attributes:true, attributeFilter:['class']});
  // ---- small fixes ----
  document.querySelectorAll('footer p').forEach(function(p){ p.innerHTML = p.innerHTML.replace('2025','2026'); });
})();

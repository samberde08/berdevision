// Projects as a 3D wheel: every film has its own place on a ring; drag anywhere (or swipe, scroll sideways, use the arrows) to spin it.
// The film at the front plays; click it to open, click any other to bring it round.
// "All work" unfurls the wheel into a flat grid of every film; "Back to the wheel" rolls it up again.
(function(){
  var strip = document.querySelector('.work-strip'); if (!strip) return;
  var tiles = Array.prototype.slice.call(strip.querySelectorAll('.work-item')), n = tiles.length; if (n < 3) return;
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  strip.classList.add('m-wheel');
  // each film sits in its own slot; the slot is what moves, so the tile keeps its own hover behaviour
  var slots = tiles.map(function(t){
    var s = document.createElement('div'); s.className = 'm-slot'; strip.appendChild(s); s.appendChild(t);
    var veil = document.createElement('div'); veil.className = 'm-veil'; s.appendChild(veil);
    return { el: s, tile: t, veil: veil, shown: true };
  });
  var cap = document.createElement('div'); cap.className = 'm-wheel-cap';
  cap.innerHTML = '<div class="m-wc-tag"></div><div class="m-wc-name"></div><div class="m-wc-sub"></div>';
  strip.insertAdjacentElement('afterend', cap);
  var all = document.createElement('button'); all.type = 'button'; all.className = 'm-allwork'; all.textContent = 'All work';
  var bar = document.createElement('div'); bar.className = 'm-allwork-bar'; bar.appendChild(all);
  var counter = document.getElementById('workNavCounter'), prevB = document.getElementById('workPrev'), nextB = document.getElementById('workNext');
  (counter && counter.parentNode ? counter : cap).insertAdjacentElement('afterend', bar);

  var STEP = 24 * Math.PI / 180, W = 0, H = 0, R = 0, CY = 0, pos = 0, target = 0, front = -1, raf = 0, lastT = 0, mode = 'wheel', busy = 0;
  function count(){ if (counter && front >= 0) counter.textContent = (front < 9 ? '0' : '') + (front + 1) + ' / ' + n; }
  function size(){
    var vw = window.innerWidth, small = vw <= 768;
    W = small ? vw * 0.58 : Math.min(vw * 0.27, 540);                 // small enough to see two films either side of the front one
    H = W * 9 / 16; R = W * 2.55;                                      // ring wide enough that neighbouring films never cut into each other
    CY = H / 2 + (small ? 18 : 30);
    strip.style.setProperty('--ww', W.toFixed(1) + 'px'); strip.style.setProperty('--wh', H.toFixed(1) + 'px'); strip.style.setProperty('--cy', CY.toFixed(1) + 'px');
    strip.style.perspective = (W * 4.4).toFixed(0) + 'px'; strip.style.perspectiveOrigin = '50% ' + CY.toFixed(0) + 'px';
    if (mode === 'wheel') { strip.style.height = (2 * CY).toFixed(0) + 'px'; render(); } else layGrid();
  }
  function wrapD(d){ return ((d + n / 2) % n + n) % n - n / 2; }
  function wheelT(d){ return 'translate(-50%,-50%) translateZ(' + (-R).toFixed(1) + 'px) rotateY(' + (d * STEP * 180 / Math.PI).toFixed(2) + 'deg) translateZ(' + R.toFixed(1) + 'px)'; }
  function render(showAll){
    var f = ((Math.round(pos) % n) + n) % n;
    for (var i = 0; i < n; i++) {
      var s = slots[i], d = wrapD(i - pos), ad = Math.abs(d);
      if (ad > 3.6 && !showAll) { if (s.shown) { s.el.style.display = 'none'; s.shown = false; } continue; }
      if (!s.shown) { s.el.style.display = ''; s.shown = true; }
      s.el.style.transform = wheelT(Math.max(-3.7, Math.min(3.7, d)));
      s.el.style.zIndex = String(100 - Math.round(ad * 20));
      s.veil.style.opacity = Math.min(.78, Math.max(0, ad - .1) * .34).toFixed(3);            // films further round the wheel sit in shadow
      s.el.style.opacity = ad > 2.7 ? Math.max(0, (3.6 - ad) / .9).toFixed(3) : '1';
    }
    if (f !== front) setFront(f);
  }
  function play(s, on){ var t = s.tile, v = t.querySelector('video.m-loop'); if (!v) return;
    if (on) { t.classList.add('m-playing'); var p = v.play(); if (p && p.catch) p.catch(function(){}); }
    else if (!t.matches(':hover')) { t.classList.remove('m-playing'); v.pause(); } }
  function setFront(f){
    if (front >= 0) { slots[front].el.classList.remove('m-front'); play(slots[front], false); }
    front = f; var s = slots[f], t = s.tile; s.el.classList.add('m-front');
    var rgb = t.dataset.glowRGB; if (rgb) s.el.style.setProperty('--tile', rgb);
    if (mode === 'wheel') play(s, true);
    var g = function(q){ var e = t.querySelector(q); return e ? e.textContent : ''; };
    cap.classList.remove('m-in'); void cap.offsetWidth;
    cap.children[0].textContent = g('.work-tag'); cap.children[1].textContent = g('.work-name'); cap.children[2].textContent = g('.work-subtitle');
    cap.classList.add('m-in'); count();
    if (prevB) prevB.disabled = false; if (nextB) nextB.disabled = false;
    strip.dispatchEvent(new CustomEvent('m-spin'));
  }
  function loop(now){
    raf = 0; if (mode !== 'wheel') return;
    var dt = Math.min(50, lastT ? now - lastT : 16); lastT = now;
    var diff = target - pos;
    if (Math.abs(diff) < 0.0015) { pos = target; render(); lastT = 0; return; }
    pos += diff * (1 - Math.exp(-dt / (still ? 1 : 150)));                                  // eases towards where it should be, at any frame rate
    render(); raf = requestAnimationFrame(loop);
  }
  function kick(){ if (!raf) { lastT = 0; raf = requestAnimationFrame(loop); } }
  function goTo(p){ if (mode !== 'wheel') return; target = p; kick(); }

  // ---- all work: the wheel unfurls into a grid, and rolls back up ----
  function gridOf(){
    var SW = strip.clientWidth, vw = window.innerWidth, cols = vw <= 768 ? 2 : vw < 1100 ? 3 : 4, gap = vw <= 768 ? 8 : 12;
    var side = vw <= 768 ? 16 : Math.max(24, (SW - Math.min(SW - 48, 1500)) / 2);
    var cw = (SW - 2 * side - gap * (cols - 1)) / cols, ch = cw * 9 / 16;
    return { SW: SW, cols: cols, gap: gap, side: side, cw: cw, ch: ch, rows: Math.ceil(n / cols) };
  }
  function layGrid(){
    var G = gridOf(), sc = G.cw / W;
    for (var i = 0; i < n; i++) { var s = slots[i], c = i % G.cols, r = (i / G.cols) | 0;
      var x = G.side + c * (G.cw + G.gap) + G.cw / 2 - G.SW / 2, y = r * (G.ch + G.gap) + G.ch / 2 - CY;
      s.el.style.transform = 'translate(-50%,-50%) translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + sc.toFixed(4) + ')';
      s.el.style.opacity = '1'; s.veil.style.opacity = '0'; s.el.style.zIndex = '1'; }
    strip.style.height = (G.rows * (G.ch + G.gap) - G.gap).toFixed(0) + 'px';
  }
  function stagger(){ var f = front < 0 ? 0 : front;
    slots.forEach(function(s, i){ s.el.style.transitionDelay = still ? '0ms' : (Math.min(12, Math.abs(wrapD(i - f))) * 28).toFixed(0) + 'ms'; }); }
  function unfurl(){
    if (mode !== 'wheel' || busy) return; busy = 1;
    pos = target = Math.round(pos); render(true);                       // every film takes its place on the ring first, even those round the back
    if (front >= 0) play(slots[front], false);
    void strip.offsetWidth;
    mode = 'grid'; strip.classList.add('m-anim', 'm-grid'); stagger(); layGrid();
    cap.classList.add('m-gone'); all.textContent = 'Back to the wheel'; all.classList.add('m-on'); document.documentElement.classList.add('m-allwork-on');
    setTimeout(function(){ strip.classList.remove('m-anim'); slots.forEach(function(s){ s.el.style.transitionDelay = ''; }); busy = 0; }, still ? 60 : 1500);
    var top = strip.getBoundingClientRect().top + window.scrollY - 110; if (Math.abs(window.scrollY - top) > 40) window.scrollTo({ top: top, behavior: still ? 'auto' : 'smooth' });
  }
  function furl(){
    if (mode !== 'grid' || busy) return; busy = 1;
    strip.classList.add('m-anim'); stagger(); mode = 'wheel'; strip.classList.remove('m-grid');
    strip.style.height = (2 * CY).toFixed(0) + 'px'; render(true);
    cap.classList.remove('m-gone'); all.textContent = 'All work'; all.classList.remove('m-on'); document.documentElement.classList.remove('m-allwork-on');
    setTimeout(function(){ strip.classList.remove('m-anim'); slots.forEach(function(s){ s.el.style.transitionDelay = ''; }); busy = 0; render(); if (front >= 0) play(slots[front], true); }, still ? 60 : 1500);
    var top = strip.getBoundingClientRect().top + window.scrollY - 160; window.scrollTo({ top: top, behavior: still ? 'auto' : 'smooth' });
  }
  all.addEventListener('click', function(){ if (mode === 'wheel') unfurl(); else furl(); });

  // ---- drag anywhere on the wheel ----
  var down = false, moved = false, sx = 0, sy = 0, sp = 0, lx = 0, lt = 0, vel = 0, pid = null, decided = false;
  strip.addEventListener('pointerdown', function(e){
    if (mode !== 'wheel' || busy || (e.pointerType === 'mouse' && e.button !== 0)) return;
    down = true; moved = false; decided = false; sx = lx = e.clientX; sy = e.clientY; sp = target = pos; lt = performance.now(); vel = 0; pid = e.pointerId;
  });
  window.addEventListener('pointermove', function(e){
    if (!down || e.pointerId !== pid) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (!decided) { if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return; decided = true;
      if (Math.abs(dy) > Math.abs(dx) * 1.2) { down = false; return; }                      // an up-and-down swipe scrolls the page instead
      moved = true; strip.classList.add('m-drag'); try { strip.setPointerCapture(pid); } catch (x) {} }
    var now = performance.now(), ddt = Math.max(1, now - lt);
    vel = vel * .6 + ((lx - e.clientX) / (W * 1.04)) / ddt * .4; lx = e.clientX; lt = now;
    pos = target = sp - dx / (W * 1.04); render();                      // the film under your finger stays under your finger
  });
  function up(e){
    if (!down || (e && e.pointerId !== pid)) return; down = false; strip.classList.remove('m-drag');
    if (!moved) return;
    goTo(Math.round(pos + Math.max(-4, Math.min(4, vel * 260))));       // a quick flick carries on round
    setTimeout(function(){ moved = false; }, 0);
  }
  window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  // a drag never opens a film; on the wheel, a click on a film that is not at the front brings it round
  strip.addEventListener('click', function(e){
    if (moved || busy) { e.stopPropagation(); e.preventDefault(); return; }
    if (mode !== 'wheel') return;
    var sl = e.target.closest && e.target.closest('.m-slot'); if (!sl) return;
    var i = -1; for (var k = 0; k < n; k++) if (slots[k].el === sl) { i = k; break; }
    if (i >= 0 && i !== front) { e.stopPropagation(); e.preventDefault(); goTo(Math.round(pos) + Math.round(wrapD(i - Math.round(pos)))); }
  }, true);
  // sideways scroll (trackpad, shift + wheel) spins it; up-and-down scroll is left to the page
  var wt = 0;
  strip.addEventListener('wheel', function(e){
    if (mode !== 'wheel') return;
    var ax = Math.abs(e.deltaX), ay = Math.abs(e.deltaY);
    if (ax <= ay || ax < 2) return;
    e.preventDefault(); pos = target = pos + e.deltaX / (W * 1.4); render();
    clearTimeout(wt); wt = setTimeout(function(){ goTo(Math.round(pos)); }, 130);
  }, { passive: false });
  function step(dir){ return function(e){ e.preventDefault(); e.stopImmediatePropagation(); goTo(Math.round(target) + dir); }; }
  if (prevB) prevB.addEventListener('click', step(-1), true);
  if (nextB) nextB.addEventListener('click', step(1), true);
  strip.setAttribute('tabindex', '0'); strip.setAttribute('aria-label', 'Projects');
  strip.addEventListener('keydown', function(e){ if (e.key === 'ArrowRight') { goTo(Math.round(target) + 1); e.preventDefault(); } if (e.key === 'ArrowLeft') { goTo(Math.round(target) - 1); e.preventDefault(); } });
  strip.addEventListener('dragstart', function(e){ e.preventDefault(); });

  var rt = 0; window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(function(){ size(); count(); }, 120); });
  size();
  setTimeout(function(){ if (front >= 0) { var rgb = slots[front].tile.dataset.glowRGB; if (rgb) slots[front].el.style.setProperty('--tile', rgb); count(); } }, 1200);
  window.__wheel = { goTo: goTo, unfurl: unfurl, furl: furl, state: function(){ return { pos: pos, target: target, front: front, n: n, W: W, mode: mode, busy: busy }; } };
})();

// Projects as a 3D wheel: every film has its own place on a ring; drag anywhere (or swipe, scroll sideways, use the arrows) to spin it.
// The film at the front plays; click it to open, click any other to bring it round.
(function(){
  var strip = document.querySelector('.work-strip'); if (!strip) return;
  var tiles = Array.prototype.slice.call(strip.querySelectorAll('.work-item')), n = tiles.length; if (n < 3) return;
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  strip.classList.add('m-wheel');
  // each film sits in its own slot; the slot is what turns, so the tile keeps its own hover behaviour
  var slots = tiles.map(function(t, i){
    var s = document.createElement('div'); s.className = 'm-slot'; strip.appendChild(s); s.appendChild(t);
    var veil = document.createElement('div'); veil.className = 'm-veil'; s.appendChild(veil);
    return { el: s, tile: t, veil: veil, vid: null, shown: true };
  });
  var cap = document.createElement('div'); cap.className = 'm-wheel-cap';
  cap.innerHTML = '<div class="m-wc-tag"></div><div class="m-wc-name"></div><div class="m-wc-sub"></div>';
  strip.insertAdjacentElement('afterend', cap);
  var counter = document.getElementById('workNavCounter'), prevB = document.getElementById('workPrev'), nextB = document.getElementById('workNext');

  var STEP = 35 * Math.PI / 180, W = 0, R = 0, pos = 0, target = 0, front = -1, raf = 0, lastT = 0;
  function size(){
    var vw = window.innerWidth, small = vw <= 768;
    W = small ? vw * 0.76 : Math.min(vw * 0.5, 980);
    var H = W * 9 / 16; R = W * 1.78;                       // wide enough that neighbouring films never cut into each other
    strip.style.setProperty('--ww', W.toFixed(1) + 'px'); strip.style.setProperty('--wh', H.toFixed(1) + 'px');
    strip.style.perspective = (W * 2.1).toFixed(0) + 'px';
    render();
  }
  function wrapD(d){ d = ((d + n / 2) % n + n) % n - n / 2; return d; }
  function render(){
    var f = ((Math.round(pos) % n) + n) % n;
    for (var i = 0; i < n; i++) {
      var s = slots[i], d = wrapD(i - pos), ad = Math.abs(d);
      if (ad > 2.55) { if (s.shown) { s.el.style.display = 'none'; s.shown = false; } continue; }
      if (!s.shown) { s.el.style.display = ''; s.shown = true; }
      var a = d * STEP;
      s.el.style.transform = 'translate(-50%,-50%) translateZ(' + (-R).toFixed(1) + 'px) rotateY(' + (a * 180 / Math.PI).toFixed(2) + 'deg) translateZ(' + R.toFixed(1) + 'px)';
      s.el.style.zIndex = String(100 - Math.round(ad * 20));
      s.veil.style.opacity = Math.min(.8, Math.max(0, ad - .1) * .5).toFixed(3);          // films further round the wheel sit in shadow
      s.el.style.opacity = ad > 1.7 ? Math.max(0, (2.55 - ad) / .85).toFixed(3) : '1';
    }
    if (f !== front) setFront(f);
  }
  function setFront(f){
    if (front >= 0) { var o = slots[front]; o.el.classList.remove('m-front'); var ov = o.tile.querySelector('video.m-loop'); if (ov && !o.tile.matches(':hover')) { o.tile.classList.remove('m-playing'); ov.pause(); } }
    front = f; var s = slots[f], t = s.tile; s.el.classList.add('m-front');
    var rgb = t.dataset.glowRGB; if (rgb) s.el.style.setProperty('--tile', rgb);
    var v = t.querySelector('video.m-loop'); if (v) { t.classList.add('m-playing'); var p = v.play(); if (p && p.catch) p.catch(function(){}); }
    var g = function(q){ var e = t.querySelector(q); return e ? e.textContent : ''; };
    cap.classList.remove('m-in'); void cap.offsetWidth;
    cap.children[0].textContent = g('.work-tag'); cap.children[1].textContent = g('.work-name'); cap.children[2].textContent = g('.work-subtitle');
    cap.classList.add('m-in');
    if (counter) counter.textContent = (f < 9 ? '0' : '') + (f + 1) + ' / ' + n;
    if (prevB) prevB.disabled = false; if (nextB) nextB.disabled = false;
    strip.dispatchEvent(new CustomEvent('m-spin'));
  }
  function loop(now){
    raf = 0;
    var dt = Math.min(50, lastT ? now - lastT : 16); lastT = now;
    var diff = target - pos;
    if (Math.abs(diff) < 0.0015) { pos = target; render(); lastT = 0; return; }
    pos += diff * (1 - Math.exp(-dt / (still ? 1 : 150)));                                  // eases towards where it should be, at any frame rate
    render(); raf = requestAnimationFrame(loop);
  }
  function kick(){ if (!raf) { lastT = 0; raf = requestAnimationFrame(loop); } }
  function goTo(p){ target = p; kick(); }

  // ---- drag anywhere on the wheel ----
  var down = false, moved = false, sx = 0, sy = 0, sp = 0, lx = 0, lt = 0, vel = 0, pid = null, decided = false;
  strip.addEventListener('pointerdown', function(e){
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    down = true; moved = false; decided = false; sx = lx = e.clientX; sy = e.clientY; sp = target = pos; lt = performance.now(); vel = 0; pid = e.pointerId;
  });
  window.addEventListener('pointermove', function(e){
    if (!down || e.pointerId !== pid) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (!decided) { if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return; decided = true;
      if (Math.abs(dy) > Math.abs(dx) * 1.2) { down = false; return; }                      // an up-and-down swipe scrolls the page instead
      moved = true; strip.classList.add('m-drag'); try { strip.setPointerCapture(pid); } catch (x) {} }
    var now = performance.now(), ddt = Math.max(1, now - lt);
    vel = vel * .6 + ((lx - e.clientX) / (W * .62)) / ddt * .4; lx = e.clientX; lt = now;
    pos = target = sp - dx / (W * .62); render();
  });
  function up(e){
    if (!down || (e && e.pointerId !== pid)) return; down = false; strip.classList.remove('m-drag');
    if (!moved) return;
    var fling = Math.max(-3, Math.min(3, vel * 260));                                        // a quick flick carries on round
    goTo(Math.round(pos + fling));
    setTimeout(function(){ moved = false; }, 0);
  }
  window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  // a drag never opens a film; a click on a film that is not at the front brings it round
  strip.addEventListener('click', function(e){
    if (moved) { e.stopPropagation(); e.preventDefault(); return; }
    var sl = e.target.closest && e.target.closest('.m-slot'); if (!sl) return;
    var i = -1; for (var k = 0; k < n; k++) if (slots[k].el === sl) { i = k; break; }
    if (i >= 0 && i !== front) { e.stopPropagation(); e.preventDefault(); goTo(Math.round(pos) + Math.round(wrapD(i - Math.round(pos)))); }
  }, true);
  // sideways scroll (trackpad, shift + wheel) spins it; up-and-down scroll is left to the page
  var wt = 0;
  strip.addEventListener('wheel', function(e){
    var ax = Math.abs(e.deltaX), ay = Math.abs(e.deltaY);
    if (ax <= ay || ax < 2) return;
    e.preventDefault(); pos = target = pos + e.deltaX / (W * 1.1); render();
    clearTimeout(wt); wt = setTimeout(function(){ goTo(Math.round(pos)); }, 130);
  }, { passive: false });
  function step(dir){ return function(e){ e.preventDefault(); e.stopImmediatePropagation(); goTo(Math.round(target) + dir); }; }
  if (prevB) prevB.addEventListener('click', step(-1), true);
  if (nextB) nextB.addEventListener('click', step(1), true);
  strip.setAttribute('tabindex', '0'); strip.setAttribute('aria-label', 'Projects');
  strip.addEventListener('keydown', function(e){ if (e.key === 'ArrowRight') { goTo(Math.round(target) + 1); e.preventDefault(); } if (e.key === 'ArrowLeft') { goTo(Math.round(target) - 1); e.preventDefault(); } });
  strip.addEventListener('dragstart', function(e){ e.preventDefault(); });

  var rt = 0; window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(function(){ size(); if (front >= 0 && counter) counter.textContent = (front < 9 ? '0' : '') + (front + 1) + ' / ' + n; }, 120); });
  size();
  setTimeout(function(){ if (front >= 0) { var rgb = slots[front].tile.dataset.glowRGB; if (rgb) slots[front].el.style.setProperty('--tile', rgb); if (counter) counter.textContent = (front < 9 ? '0' : '') + (front + 1) + ' / ' + n; } }, 1200);
  window.__wheel = { goTo: goTo, state: function(){ return { pos: pos, target: target, front: front, n: n, W: W }; } };
})();

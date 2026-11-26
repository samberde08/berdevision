// Projects as a 3D wheel: every film has its own place on a ring; drag anywhere (or swipe, scroll sideways, use the arrows) to spin it.
// The film at the front plays; click it to open, click any other to bring it round.
// "All work" unfurls the wheel into a flat grid of every film; "Back to the wheel" rolls it up again.
(function(){
  var strip = document.querySelector('.work-strip'); if (!strip) return;
  var tiles = Array.prototype.slice.call(strip.querySelectorAll('.work-item')), n = tiles.length; if (n < 3) return;
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  strip.classList.add('m-wheel');
  // each film sits in its own slot; the slot is what moves, so the tile keeps its own hover behaviour
  // which kinds of work each film is (a film can be two)
  var CATS = {'1249151789':'music','1249151605':'brand sports','1249151719':'brand','1249151866':'music','1249151733':'sports','1249151670':'brand','1249151833':'music','1204418162':'music','1204561560':'brand','1203337382':'sports','1204589600':'music','1204409147':'sports','1204586020':'music','1204680193':'sports','1204548410':'music','1203340055':'sports','1204579585':'music','1203344844':'sports','1204398806':'sports','1204416675':'brand sports','1204403981':'sports','1204407984':'sports','1203256076':'personal','1204401806':'personal','1204593129':'personal'};
  var allSlots = tiles.map(function(t){
    var s = document.createElement('div'); s.className = 'm-slot'; strip.appendChild(s); s.appendChild(t);
    var veil = document.createElement('div'); veil.className = 'm-veil'; s.appendChild(veil);
    // in the All view each film carries its own title, set quietly in its lower corner
    var gt = function(q){ var e = t.querySelector(q); return e ? e.textContent : ''; };
    var gc = document.createElement('div'); gc.className = 'm-gcap'; gc.setAttribute('aria-hidden', 'true');
    var gn = document.createElement('div'); gn.className = 'm-gc-name'; gn.textContent = gt('.work-name'); gc.appendChild(gn);
    var gg = document.createElement('div'); gg.className = 'm-gc-tag'; gg.textContent = gt('.work-subtitle') || gt('.work-tag'); gc.appendChild(gg);
    s.appendChild(gc);
    return { el: s, tile: t, veil: veil, shown: true, cat: (CATS[t.dataset.vimeo] || '').split(' ') };
  });
  var slots = allSlots.slice();          // the films currently on the wheel (all of them, or one kind)
  var cap = document.createElement('div'); cap.className = 'm-wheel-cap';
  cap.innerHTML = '<div class="m-wc-tag"></div><div class="m-wc-name"></div><div class="m-wc-sub"></div>';
  strip.insertAdjacentElement('afterend', cap);
  // a quiet two-word switch beside the section title: Wheel / All
  var tog = document.createElement('div'); tog.className = 'm-viewtog'; tog.setAttribute('role', 'group'); tog.setAttribute('aria-label', 'How the projects are shown');
  tog.innerHTML = '<button type="button" data-v="wheel" class="m-on"><svg viewBox="0 0 16 16" aria-hidden="true"><ellipse cx="8" cy="8" rx="6.2" ry="3.4"/><path d="M8 4.6v6.8"/></svg>Wheel</button>' +
    '<button type="button" data-v="grid"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="2.5" width="5" height="4.6"/><rect x="9" y="2.5" width="5" height="4.6"/><rect x="2" y="8.9" width="5" height="4.6"/><rect x="9" y="8.9" width="5" height="4.6"/></svg>All <b class="m-cnt">' + n + '</b></button>';
  var hdr = document.querySelector('#work .work-header');
  // (the section title is hidden on this page, so the switch gets its own slim line directly above the films)
  // a small sorter: show every film, or one kind of work
  var cats = document.createElement('div'); cats.className = 'm-cats'; cats.setAttribute('role', 'group'); cats.setAttribute('aria-label', 'Kind of work');
  cats.innerHTML = [['all','All'],['music','Music'],['sports','Sports'],['brand','Brand'],['personal','Personal']].map(function(c, i){ return '<button type="button" data-c="' + c[0] + '"' + (i ? '' : ' class="m-on"') + '>' + c[1] + '</button>'; }).join('');
  var vbar = document.createElement('div'); vbar.className = 'm-viewbar'; vbar.appendChild(cats); vbar.appendChild(tog); strip.insertAdjacentElement('beforebegin', vbar); hdr = vbar;
  function togState(){ Array.prototype.forEach.call(tog.querySelectorAll('button'), function(b){ b.classList.toggle('m-on', b.dataset.v === mode); b.setAttribute('aria-pressed', b.dataset.v === mode ? 'true' : 'false'); }); }
  var counter = document.getElementById('workNavCounter'), prevB = document.getElementById('workPrev'), nextB = document.getElementById('workNext');

  var STEP = 2 * Math.PI / n, TILT = -7, BUMP = .22, W = 0, H = 0, R = 0, CY = 0, pos = 0, target = 0, front = -1, raf = 0, lastT = 0, mode = 'wheel', busy = 0;
  function count(){ if (counter && front >= 0) counter.textContent = (front < 9 ? '0' : '') + (front + 1) + ' / ' + n; }
  function size(){
    var vw = window.innerWidth, small = vw <= 768;
    STEP = 2 * Math.PI / allSlots.length;                               // the ring never changes size: a shorter list fills an arc of it, so the films keep their size and spacing
    W = small ? vw * 0.40 : Math.min(vw * 0.22, 430);                 // each film's width on the ring; the one at the front is pulled forward and reads larger
    H = W * 9 / 16; BUMP = small ? .62 : .78;                            // the front film is much larger and sits over the edges of its neighbours
    R = W / (2 * Math.tan(STEP / 2)) * 1.03;                           // the radius at which every film has its own place and none cuts into its neighbour
    CY = W * 0.30 + (small ? 10 : 14);                                 // the ring's centre line: the far side rises above it, the front hangs below
    strip.style.setProperty('--ww', W.toFixed(1) + 'px'); strip.style.setProperty('--wh', H.toFixed(1) + 'px'); strip.style.setProperty('--cy', CY.toFixed(1) + 'px');
    strip.style.perspective = (R * 0.7).toFixed(0) + 'px'; strip.style.perspectiveOrigin = '50% ' + CY.toFixed(0) + 'px';   // a closer viewpoint, so the ring's left and right turns fit inside the screen
    if (mode === 'wheel') { strip.style.height = (CY + W * (0.50 + 0.28 * (1 + BUMP)) + (small ? 10 : 16)).toFixed(0) + 'px'; render(); } else layGrid();
  }
  function wrapD(d){ return ((d + n / 2) % n + n) % n - n / 2; }
  // The whole wheel is drawn: a ring tipped slightly towards you, so the films on the far side are seen small, above and behind, travelling round.
  function wheelT(d){
    var a = d * STEP * 180 / Math.PI, far = Math.abs(a) > 90, k = Math.max(0, 1 - Math.abs(d)), sc = 1 + BUMP * k * k;
    // the ring is nudged towards you by a few pixels so the front film always sits in front of the wheel's own (invisible) plane and can be clicked
    var tr = Math.abs(TILT) * Math.PI / 180, dz = R * (1 - Math.cos(tr)) + H * 0.7 * Math.sin(tr) + 3;
    return 'translate(-50%,-50%) translateZ(' + (dz - R).toFixed(1) + 'px) rotateX(' + TILT + 'deg) rotateY(' + a.toFixed(2) + 'deg) translateZ(' + (R + W * 0.2 * k * k).toFixed(1) + 'px)' +
      (far ? ' rotateY(180deg)' : '') + (sc > 1.001 ? ' scale(' + sc.toFixed(4) + ')' : '');          // films on the far side turn to face you
  }
  function render(){
    var f = ((Math.round(pos) % n) + n) % n;
    for (var i = 0; i < n; i++) {
      var s = slots[i], d = wrapD(i - pos), ad = Math.abs(d), depth = (1 - Math.cos(d * STEP)) / 2;                // 0 at the front, 1 at the very back
      if (!s.shown) { s.el.style.display = ''; s.shown = true; }
      s.el.style.transform = wheelT(d);
      s.el.style.zIndex = String(100 - Math.round(depth * 90));
      s.veil.style.opacity = (ad < .5 ? ad * .12 : Math.min(.7, .06 + .68 * depth)).toFixed(3);                    // further round = deeper in shadow
      var seam = n < allSlots.length ? Math.max(0, Math.min(1, (n / 2 - ad) / 0.6)) : 1;                                       // on a short list, a film fades as it leaves one end and re-enters the other
      s.el.style.opacity = seam.toFixed(3);
      s.el.style.pointerEvents = (depth > .42 || seam < .5) ? 'none' : '';                                                        // only the near side can be clicked or hovered
    }
    if (f !== front) setFront(f);
  }
  var SHAPE = {'1204589600':426/234,'1204409147':240/300,'1204579585':300/240,'1203344844':300/240,'1204398806':292/240,'1204416675':240/426,'1203256076':322/240};
  // warm up the connection to the player so the first preview starts sooner
  ['https://player.vimeo.com', 'https://i.vimeocdn.com', 'https://f.vimeocdn.com'].forEach(function(h){ var l = document.createElement('link'); l.rel = 'preconnect'; l.href = h; l.crossOrigin = ''; document.head.appendChild(l); });
  function showEmb(s, fr){ if (s.fr !== fr || fr._on) return; fr._on = 1; fr._show = null; fr.style.opacity = 1; s.tile.classList.add('m-playing'); }
  function embed(s, on){
    var t = s.tile, id = t.dataset.vimeo; if (!id) return;
    if (!on) { clearTimeout(s.embT); s.embT = 0; if (s.fr) { var o = s.fr; s.fr = null; o.style.opacity = 0; if (!t.matches(':hover')) t.classList.remove('m-playing'); setTimeout(function(){ o.remove(); }, 380); } return; }
    if (s.fr || s.embT) return;
    s.embT = setTimeout(function(){ s.embT = 0;                         // only once the wheel has come to rest on this film
      if (mode !== 'wheel' || front < 0 || slots[front] !== s || s.fr) return;
      var fr = document.createElement('iframe'); fr.className = 'm-emb m-emb-w'; fr.setAttribute('allow', 'autoplay; fullscreen'); fr.setAttribute('tabindex', '-1'); fr.setAttribute('aria-hidden', 'true');
      fr.style.aspectRatio = String(SHAPE[id] || 16 / 9); fr._t0 = null;
      fr.src = 'https://player.vimeo.com/video/' + id + '?background=1&autoplay=1&loop=1&muted=1&playsinline=1&dnt=1' + (t.dataset.vimeoHash ? '&h=' + t.dataset.vimeoHash : '') + '#t=3s';
      var hear = function(){ try { ['playProgress', 'play', 'timeupdate'].forEach(function(ev){ fr.contentWindow.postMessage(JSON.stringify({ method: 'addEventListener', value: ev }), 'https://player.vimeo.com'); }); } catch (e) {} };
      fr._hear = hear;
      fr.addEventListener('load', function(){ hear(); setTimeout(function(){ showEmb(s, fr); }, 2600); });      // if the player never reports back, show it anyway
      t.insertBefore(fr, t.querySelector('.work-overlay')); s.fr = fr;
    }, 320);
  }
  // show a preview the moment its film is actually moving (not after a fixed wait)
  window.addEventListener('message', function(e){
    if (!/player\.vimeo\.com$/.test(e.origin || '')) return;
    var s = null; for (var i = 0; i < n; i++) if (slots[i].fr && slots[i].fr.contentWindow === e.source) { s = slots[i]; break; }
    if (!s) return;
    var d; try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (x) { return; }
    if (!d) return; var fr = s.fr;
    if (d.event === 'ready') { fr._hear(); return; }
    if (d.event === 'play') { setTimeout(function(){ showEmb(s, fr); }, 350); return; }
    if ((d.event === 'playProgress' || d.event === 'timeupdate') && d.data && typeof d.data.seconds === 'number') {
      if (fr._t0 === null) fr._t0 = d.data.seconds; else if (d.data.seconds - fr._t0 > 0.04) showEmb(s, fr); }
  });
  function play(s, on){ var t = s.tile, v = t.querySelector('video.m-loop'); if (!v) { embed(s, on); return; }
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
  // The All view: every film the same size, three across (two on a phone), with room between them.
  function cellsOf(){
    var SW = strip.clientWidth, vw = window.innerWidth, phone = vw <= 768, cols = phone ? 2 : 3, gap = phone ? 10 : 24;
    var maxW = Math.min(SW - (phone ? 32 : 96), 1360), side = (SW - maxW) / 2;
    var cw = (maxW - gap * (cols - 1)) / cols, ch = cw * 9 / 16, out = [], rows = Math.ceil(n / cols);
    for (var i = 0; i < n; i++) { var r = (i / cols) | 0, c = i % cols, inRow = (r === rows - 1) ? n - r * cols : cols;
      var x0 = side + (maxW - (inRow * cw + (inRow - 1) * gap)) / 2;                         // a short last row sits centred
      out.push({ x: x0 + c * (cw + gap), y: r * (ch + gap), w: cw, h: ch }); }
    return { cells: out, SW: SW, H: rows * (ch + gap) - gap };
  }
  function layGrid(){
    var G = cellsOf();
    for (var i = 0; i < n; i++) { var s = slots[i], c = G.cells[i], sc = c.w / W;
      var x = c.x + c.w / 2 - G.SW / 2, y = c.y + c.h / 2 - CY;
      s.el.style.transform = 'translate(-50%,-50%) translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + sc.toFixed(4) + ')';
      s.el.style.setProperty('--inv', (1 / sc).toFixed(4)); s.el.classList.remove('m-big');
      s.el.style.opacity = '1'; s.veil.style.opacity = '0'; s.el.style.zIndex = '1'; s.el.style.pointerEvents = ''; }
    strip.style.height = G.H.toFixed(0) + 'px';
  }
  function stagger(){ var f = front < 0 ? 0 : front;
    slots.forEach(function(s, i){ s.el.style.transitionDelay = still ? '0ms' : (Math.min(12, Math.abs(wrapD(i - f))) * 28).toFixed(0) + 'ms'; }); }
  function unfurl(){
    if (mode !== 'wheel' || busy) return; busy = 1;
    pos = target = Math.round(pos); render();
    if (front >= 0) play(slots[front], false);
    void strip.offsetWidth;
    mode = 'grid'; strip.classList.add('m-anim', 'm-grid'); stagger(); layGrid();
    cap.classList.add('m-gone'); togState(); document.documentElement.classList.add('m-allwork-on');
    setTimeout(function(){ strip.classList.remove('m-anim'); slots.forEach(function(s){ s.el.style.transitionDelay = ''; }); busy = 0; }, still ? 60 : 1500);
    var top = (hdr || strip).getBoundingClientRect().top + window.scrollY - 90; if (Math.abs(window.scrollY - top) > 40) window.scrollTo({ top: top, behavior: still ? 'auto' : 'smooth' });
  }
  function furl(){
    if (mode !== 'grid' || busy) return; busy = 1;
    strip.classList.add('m-anim'); stagger(); mode = 'wheel'; strip.classList.remove('m-grid');
    size();
    cap.classList.remove('m-gone'); togState(); document.documentElement.classList.remove('m-allwork-on');
    setTimeout(function(){ strip.classList.remove('m-anim'); slots.forEach(function(s){ s.el.style.transitionDelay = ''; }); busy = 0; render(); if (front >= 0) play(slots[front], true); }, still ? 60 : 1500);
    var top = (hdr || strip).getBoundingClientRect().top + window.scrollY - 90; window.scrollTo({ top: top, behavior: still ? 'auto' : 'smooth' });
  }
  function setFilter(c){
    if (busy) return;
    Array.prototype.forEach.call(cats.querySelectorAll('button'), function(b){ b.classList.toggle('m-on', b.dataset.c === c); b.setAttribute('aria-pressed', b.dataset.c === c ? 'true' : 'false'); });
    strip.classList.add('m-swap');
    setTimeout(function(){
      if (front >= 0 && slots[front]) { slots[front].el.classList.remove('m-front'); play(slots[front], false); }
      slots = allSlots.filter(function(s){ return c === 'all' || s.cat.indexOf(c) >= 0; }); n = slots.length;
      allSlots.forEach(function(s){ var on = slots.indexOf(s) >= 0; s.el.style.display = on ? '' : 'none'; s.shown = on; });
      front = -1; pos = target = 0; var cn = tog.querySelector('.m-cnt'); if (cn) cn.textContent = n;
      size(); strip.classList.remove('m-swap');
    }, still ? 0 : 190);
  }
  cats.addEventListener('click', function(e){ var b = e.target.closest && e.target.closest('button'); if (b && !b.classList.contains('m-on')) setFilter(b.dataset.c); });
  tog.addEventListener('click', function(e){ var b = e.target.closest && e.target.closest('button'); if (!b) return; if (b.dataset.v === 'grid') unfurl(); else furl(); });

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

  // the first time the wheel comes into view it rises and spins in from a few films away
  var spunIn = false;
  function spinIn(){ if (spunIn) return; spunIn = true; strip.classList.add('m-in'); if (mode === 'wheel' && !still && !down) { pos = target - 5; render(); goTo(target); } }
  if ('IntersectionObserver' in window && !still) new IntersectionObserver(function(en, io){ if (en[0].isIntersecting) { spinIn(); io.disconnect(); } }, { threshold: 0.35 }).observe(strip);
  else spinIn();
  // and as the page scrolls past, the ring tips: you look down into it when it is low on the screen, across it when it is high
  var tr = 0;
  function tip(){ tr = 0; if (mode !== 'wheel' || busy || still) return;
    var r = strip.getBoundingClientRect(), c = (r.top + r.height / 2) / window.innerHeight;
    var t = Math.max(-13, Math.min(-2.5, -7 - (c - 0.5) * 11)); if (Math.abs(t - TILT) > 0.05) { TILT = +t.toFixed(2); render(); } }
  window.addEventListener('scroll', function(){ if (!tr) tr = requestAnimationFrame(tip); }, { passive: true });
  var rt = 0; window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(function(){ size(); count(); }, 120); });
  size();
  setTimeout(function(){ if (front >= 0) { var rgb = slots[front].tile.dataset.glowRGB; if (rgb) slots[front].el.style.setProperty('--tile', rgb); count(); } }, 1200);
  window.__wheel = { goTo: goTo, unfurl: unfurl, furl: furl, filter: setFilter, state: function(){ return { pos: pos, target: target, front: front, n: n, W: W, mode: mode, busy: busy }; } };
})();

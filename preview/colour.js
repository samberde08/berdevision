// The page takes its colour from the hero reel, live. Hovering a project previews that project's colour.
// Opening a project floods the page with its colour from the panel outwards, and the page keeps it until another project is opened.
(function(){
  var root = document.documentElement, v = document.getElementById('reelVideo');
  var amb = document.createElement('div'); amb.className = 'm-amb'; amb.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(amb, document.body.firstChild);
  var cv = document.createElement('canvas'); cv.width = 16; cv.height = 12;
  var cx = cv.getContext('2d', { willReadFrequently: true });
  var NEUTRAL = [118, 116, 124], STICK_K = 2.3;
  var reel = NEUTRAL.slice(), reelK = 0.55, hover = null, stick = null, cur = NEUTRAL.slice(), curK = 0.55, last = '', ok = true;

  // push the saturation, then bring every colour to the same brightness so the glow never goes muddy
  function grade(r, g, b, k){
    var avg = (r + g + b) / 3;
    r = Math.max(0, avg + (r - avg) * k); g = Math.max(0, avg + (g - avg) * k); b = Math.max(0, avg + (b - avg) * k);
    var s = 210 / Math.max(r, g, b, 1);
    return [Math.min(255, r * s), Math.min(255, g * s), Math.min(255, b * s)];
  }
  function sample(){
    if (!ok || !v || v.readyState < 2 || v.paused || document.hidden) return;
    try {
      cx.drawImage(v, 0, 0, 16, 12);
      var d = cx.getImageData(0, 0, 16, 12).data, r = 0, g = 0, b = 0, n = 0, lumAll = 0;
      for (var i = 0; i < d.length; i += 4) {
        var l = d[i] * 0.3 + d[i+1] * 0.59 + d[i+2] * 0.11; lumAll += l;
        if (l > 22 && l < 236) { var w = 1 + (Math.max(d[i], d[i+1], d[i+2]) - Math.min(d[i], d[i+1], d[i+2])) / 40; r += d[i] * w; g += d[i+1] * w; b += d[i+2] * w; n += w; }
      }
      lumAll /= (d.length / 4);
      if (n < 8) { reel = NEUTRAL.slice(); reelK = 0.4; return; }
      reel = grade(r / n, g / n, b / n, 2.1);
      reelK = Math.max(0.45, Math.min(1, lumAll / 70));      // dark shots glow less, never off
    } catch (e) { ok = false; }                                // canvas blocked: stay neutral
  }
  setInterval(sample, 150);

  function rgbOf(c){ return Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]); }
  var prev = 0;
  function tick(now){
    var dt = Math.min(500, prev ? now - prev : 16); prev = now;
    // a hovered project previews its colour; otherwise the last opened project holds the page; before that, the reel
    var t = hover || stick || reel, k = hover ? (stick ? STICK_K : 1.55) : stick ? STICK_K : reelK;
    var e = 1 - Math.exp(-dt / (hover ? 220 : 320));           // timed, so it eases the same at any frame rate
    cur[0] += (t[0] - cur[0]) * e; cur[1] += (t[1] - cur[1]) * e; cur[2] += (t[2] - cur[2]) * e; curK += (k - curK) * e;
    var s = rgbOf(cur) + '|' + curK.toFixed(2);
    if (s !== last) { last = s; root.style.setProperty('--amb', s.split('|')[0]); root.style.setProperty('--amb-k', curK.toFixed(2)); }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  function tileColour(t){
    var c = t.dataset.glowRGB; if (!c) return null;
    c = c.split(',').map(Number); return grade(c[0], c[1], c[2], 1.25);
  }
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.work-item'));
  if (window.matchMedia && matchMedia('(hover: hover)').matches) {
    tiles.forEach(function(t){
      t.addEventListener('mouseenter', function(){ var c = tileColour(t); if (c) { hover = c; root.classList.add('m-amb-proj'); } });
      t.addEventListener('mouseleave', function(){ hover = null; root.classList.remove('m-amb-proj'); });
    });
  } else {
    // phones, before any project has been opened: the project in the middle of the strip sets the colour while the strip is on screen
    var strip = document.querySelector('.work-strip'), seen = false, raf = 0;
    var pick = function(){ raf = 0;
      if (stick || !seen || !strip) { hover = null; root.classList.remove('m-amb-proj'); return; }
      var sr = strip.getBoundingClientRect(), mid = sr.left + sr.width / 2, best = null, bd = 1e9;
      strip.querySelectorAll('.work-item').forEach(function(t){ var r = t.getBoundingClientRect(); if (!r.width) return;
        var dd = Math.abs(r.left + r.width / 2 - mid); if (dd < bd) { bd = dd; best = t; } });
      var c = best && tileColour(best); if (c) { hover = c; root.classList.add('m-amb-proj'); }
    };
    var ask = function(){ if (!raf) raf = requestAnimationFrame(pick); };
    if (strip && 'IntersectionObserver' in window) {
      new IntersectionObserver(function(en){ seen = en[0].isIntersecting && en[0].intersectionRatio > 0.6; ask(); }, { threshold: [0, 0.6, 1] }).observe(strip);
      strip.addEventListener('scroll', ask, { passive: true });
    }
  }

  // ---- opening a project ----
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SLOW = +((/[?&]slow=([\d.]+)/.exec(location.search) || [])[1]) || 1;   // ?slow=8 plays the opening in slow motion, for checking
  var lb = document.getElementById('lightbox'), SPREAD = 1700 * SLOW, EASE = 'cubic-bezier(.25,.6,.3,1)';
  function px(n){ return n.toFixed(1) + 'px'; }

  // the project's colour spreads out of its panel, in the panel's own shape, and stays
  function flood(r, c){
    var W = window.innerWidth, H = window.innerHeight, rgb = rgbOf(c);
    var done = function(){ stick = c; cur = c.slice(); curK = STICK_K; root.classList.add('m-amb-stick'); };
    if (still || !document.body.animate) { done(); return; }
    var mx = r.left + r.width / 2, my = r.top + r.height / 2;
    // grow the panel's rectangle about its own centre until it clears every corner of the screen
    var S = Math.max(Math.max(mx, W - mx) / (r.width / 2), Math.max(my, H - my) / (r.height / 2)) * 1.12;
    var from = { top: r.top, left: r.left, right: W - r.right, bottom: H - r.bottom };
    var to = { top: my - r.height / 2 * S, left: mx - r.width / 2 * S, right: W - (mx + r.width / 2 * S), bottom: H - (my + r.height / 2 * S) };
    var inset = function(o, rad){ return 'inset(' + px(Math.max(o.top, 0)) + ' ' + px(Math.max(o.right, 0)) + ' ' + px(Math.max(o.bottom, 0)) + ' ' + px(Math.max(o.left, 0)) + ' round ' + rad + 'px)'; };
    // 1. behind the page: the new colour is uncovered from the panel outwards, and it is what stays
    var under = document.createElement('div'); under.className = 'm-amb m-amb-new'; under.setAttribute('aria-hidden', 'true');
    under.style.setProperty('--amb', rgb); under.style.setProperty('--amb-k', String(STICK_K));
    amb.insertAdjacentElement('afterend', under);
    under.animate([{ clipPath: inset(from, 4) }, { clipPath: inset(to, 30) }], { duration: SPREAD, easing: EASE, fill: 'forwards' })
      .onfinish = function(){ done(); under.remove(); };
    // 2. over the page: a body of colour pushing out behind a bright rectangular front, then a second, softer front
    var box = document.createElement('div'); box.className = 'm-wave'; box.setAttribute('aria-hidden', 'true'); document.body.appendChild(box);
    // each front is drawn once at the panel's size and then only scaled, so the graphics card does all the work
    var rect = function(cls, dur, delay, op){
      var e = document.createElement('div'); e.className = cls; e.style.setProperty('--c', rgb);
      e.style.top = px(r.top); e.style.left = px(r.left); e.style.width = px(r.width); e.style.height = px(r.height); box.appendChild(e);
      e.animate([{ transform: 'scale(1)', opacity: op[0] }, { opacity: op[1], offset: .55 }, { transform: 'scale(' + S.toFixed(3) + ')', opacity: 0 }],
        { duration: dur, delay: delay, easing: EASE, fill: 'both' });
    };
    rect('m-flood', SPREAD, 0, [1, .85]);
    rect('m-flood m-flood-2', SPREAD + 350 * SLOW, 230 * SLOW, [.75, .5]);
    setTimeout(function(){ box.remove(); }, SPREAD + 700 * SLOW);
  }

  // the player grows out of the panel: the thumbnail lifts off, travels to the player's place and sharpens into it
  function materialise(t, r){
    var fr = lb && lb.querySelector('.lightbox-frame'), img = t.querySelector('img');
    if (still || !fr || !img || !document.body.animate) return;
    lb.classList.add('m-mat');
    var f = fr.getBoundingClientRect();
    var g = document.createElement('img'); g.className = 'm-ghost'; g.src = img.currentSrc || img.src; g.alt = '';
    g.style.objectPosition = getComputedStyle(img).objectPosition;
    document.body.appendChild(g);
    var D = 820 * SLOW;
    g.animate([
      { top: px(r.top), left: px(r.left), width: px(r.width), height: px(r.height), opacity: 1, filter: 'blur(0px) brightness(1.15)', borderRadius: '2px' },
      { opacity: 1, filter: 'blur(7px) brightness(1.5)', offset: .45 },
      { top: px(f.top), left: px(f.left), width: px(f.width), height: px(f.height), opacity: 1, filter: 'blur(0px) brightness(1)', borderRadius: '4px' }
    ], { duration: D, easing: 'cubic-bezier(.3,.05,.15,1)', fill: 'forwards' }).onfinish = function(){
      lb.classList.remove('m-mat');                                       // the real player fades up underneath
      g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 520 * SLOW, delay: 380 * SLOW, easing: 'ease', fill: 'forwards' }).onfinish = function(){ g.remove(); };
    };
  }
  tiles.forEach(function(t){
    t.addEventListener('click', function(){
      // only when the player really opens (a drag on the strip cancels the click)
      setTimeout(function(){ if (!lb || !lb.classList.contains('open')) return;
        var r = t.getBoundingClientRect(), c = tileColour(t) || reel.slice();
        materialise(t, r); flood(r, c); }, 0);
    });
  });
  if (lb) new MutationObserver(function(){ if (!lb.classList.contains('open')) { lb.classList.remove('m-mat'); document.querySelectorAll('.m-ghost').forEach(function(g){ g.remove(); }); } })
    .observe(lb, { attributes: true, attributeFilter: ['class'] });
  window.__amb = function(){ return { reel: reel, reelK: reelK, hover: hover, stick: stick, cur: cur, curK: curK, ok: ok }; };
})();

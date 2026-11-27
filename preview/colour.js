// The page takes its colour from the hero reel, live. Hovering a project previews that project's colour.
// Opening a project grows its panel into the player; the page eases into that project's colour and keeps it until another is opened.
(function(){
  var root = document.documentElement, v = document.getElementById('reelVideo');
  var amb = document.createElement('div'); amb.className = 'm-amb'; amb.setAttribute('aria-hidden', 'true');
  // the glow is four soft pools of colour that drift slowly, so the page is never still
  amb.innerHTML = '<div class="m-blob m-blob-a"></div><div class="m-blob m-blob-b"></div><div class="m-blob m-blob-c"></div><div class="m-blob m-blob-d"></div>';
  document.body.insertBefore(amb, document.body.firstChild);
  var cv = document.createElement('canvas'); cv.width = 16; cv.height = 12;
  var cx = cv.getContext('2d', { willReadFrequently: true });
  var NEUTRAL = [118, 116, 124], STICK_K = 2.3;
  var below = false, frontTile = null, wheelAt = 0, wasReel = null;
  var HOLD = 8, DRIFT = 1.5, stickAt = 0;          // an opened project's colour holds for 8 s, then its hue wanders 1.5 degrees a second
  // turn a colour's hue by some degrees, keeping how light and how strong it is
  function rot(c, deg){
    var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn, h = 0, sat = 0;
    if (d > 1e-4) { sat = d / (1 - Math.abs(2 * l - 1)); h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
    h = ((h + deg) % 360 + 360) % 360;
    var C = (1 - Math.abs(2 * l - 1)) * sat, X = C * (1 - Math.abs((h / 60) % 2 - 1)), m = l - C / 2, q = h < 60 ? [C, X, 0] : h < 120 ? [X, C, 0] : h < 180 ? [0, C, X] : h < 240 ? [0, X, C] : h < 300 ? [X, 0, C] : [C, 0, X];
    return [(q[0] + m) * 255, (q[1] + m) * 255, (q[2] + m) * 255];
  }
  var reel = NEUTRAL.slice(), reelK = 0.55, hover = null, stick = null, cur = NEUTRAL.slice(), curK = 0.55, last = '', ok = true;

  // push the saturation, then bring every colour to the same brightness so the glow never goes muddy
  function grade(r, g, b, k){
    var avg = (r + g + b) / 3;
    r = Math.max(0, avg + (r - avg) * k); g = Math.max(0, avg + (g - avg) * k); b = Math.max(0, avg + (b - avg) * k);
    var s = 210 / Math.max(r, g, b, 1);
    return [Math.min(255, r * s), Math.min(255, g * s), Math.min(255, b * s)];
  }
  // Reading the reel's colour means pulling a video frame back from the graphics card, which stalled the page for 50-90 ms each time
  // when done directly, 14 times a second. Now: only while the hero is the colour source, 4 times a second, and through an
  // off-thread bitmap where the browser has one, so a spin of the wheel is never interrupted by it.
  var sampling = false;
  function readPixels(){
    var d = cx.getImageData(0, 0, 16, 12).data, r = 0, g = 0, b = 0, n = 0, lumAll = 0;
    for (var i = 0; i < d.length; i += 4) {
      var l = d[i] * 0.3 + d[i+1] * 0.59 + d[i+2] * 0.11; lumAll += l;
      if (l > 22 && l < 236) { var w = 1 + (Math.max(d[i], d[i+1], d[i+2]) - Math.min(d[i], d[i+1], d[i+2])) / 40; r += d[i] * w; g += d[i+1] * w; b += d[i+2] * w; n += w; }
    }
    lumAll /= (d.length / 4);
    if (n < 8) { reel = NEUTRAL.slice(); reelK = 0.4; return; }
    reel = grade(r / n, g / n, b / n, 2.1);
    reelK = Math.max(0.45, Math.min(1, lumAll / 70));      // dark shots glow less, never off
  }
  function sample(){
    var sv = window.__reelLive || v;                       // the light intro clip while it is on screen, then the full reel
    if (!ok || sampling || below || !sv || sv.readyState < 2 || sv.paused || document.hidden) return;
    try {
      if (window.createImageBitmap) {
        sampling = true;
        createImageBitmap(sv, { resizeWidth: 16, resizeHeight: 12, resizeQuality: 'low' }).then(function(bm){
          try { cx.drawImage(bm, 0, 0, 16, 12); if (bm.close) bm.close(); readPixels(); } catch (e) { ok = false; }
          sampling = false;
        }, function(){ sampling = false; });
      } else { cx.drawImage(sv, 0, 0, 16, 12); readPixels(); }
    } catch (e) { ok = false; sampling = false; }          // canvas blocked: stay neutral
  }
  setInterval(sample, 240);

  function rgbOf(c){ return Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]); }
  var prev = 0;
  function tick(now){
    var dt = Math.min(500, prev ? now - prev : 16); prev = now;
    // ONE source at a time, decided by what is on screen:
    //   the hero reel while the hero is in view; below it, the film at the front of the wheel (or the last film opened, whichever is newer)
    var foc = null, focAt = 0, wc = frontTile ? tileColour(frontTile) : null;
    if (wc) { foc = wc; focAt = wheelAt; }
    if (stick && (!foc || stickAt >= wheelAt)) { foc = stick; focAt = stickAt; }
    if (foc && !hover) { var age = (now - focAt) / 1000; if (age > HOLD) foc = rot(foc, (age - HOLD) * DRIFT); }     // left alone, the hue wanders
    var useReel = !below || !(hover || foc);
    var t = useReel ? reel : (hover || foc), k = useReel ? reelK : STICK_K;
    if (useReel !== wasReel) { wasReel = useReel; root.classList.toggle('m-amb-stick', !useReel); }
    var e = 1 - Math.exp(-dt / (useReel ? 110 : hover ? 170 : 240));     // timed, so it eases the same at any frame rate
    cur[0] += (t[0] - cur[0]) * e; cur[1] += (t[1] - cur[1]) * e; cur[2] += (t[2] - cur[2]) * e; curK += (k - curK) * e;
    var s = rgbOf(cur) + '|' + curK.toFixed(2);
    var nowT = performance.now();
    // while the colour is only drifting slowly, the page is re-tinted twice a second; while it is moving to a new film or shot, about 14 times a second
    var moving = Math.abs(t[0] - cur[0]) + Math.abs(t[1] - cur[1]) + Math.abs(t[2] - cur[2]) > 6 || Math.abs(k - curK) > 0.04;
    if (s !== last && nowT - lastVarT > (moving ? 70 : 500)) { last = s; lastVarT = nowT; root.style.setProperty('--amb', s.split('|')[0]); root.style.setProperty('--amb-k', curK.toFixed(2));
      root.style.setProperty('--amb2', rgbOf(rot(cur, 34))); root.style.setProperty('--amb3', rgbOf(rot(cur, -30))); }   // neighbouring hues for the other pools
    if (nowT - lastDrawT > (moving ? 45 : 160)) { lastDrawT = nowT; drawAmb(nowT / 1000); }
    requestAnimationFrame(tick);
  }
  // The four drifting pools of colour are painted into one very small picture that the browser stretches over the page.
  // (As four page-sized layers they had to be repainted at full size on every colour change, which stalled the page.)
  var lastVarT = 0, lastDrawT = 0, ac = document.createElement('canvas'), actx = ac.getContext('2d');
  ac.className = 'm-amb-cv'; amb.appendChild(ac);
  function sizeAmb(){ ac.width = 128; ac.height = Math.max(40, Math.round(128 * window.innerHeight / Math.max(1, window.innerWidth))); }
  sizeAmb(); window.addEventListener('resize', sizeAmb);
  function pool(cx0, cy0, rx, ry, rgb, al){
    actx.save(); actx.translate(cx0, cy0); actx.scale(rx, ry);
    var g = actx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, 'rgba(' + rgb + ',' + (.95 * al).toFixed(3) + ')'); g.addColorStop(.38, 'rgba(' + rgb + ',' + (.5 * al).toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
    actx.fillStyle = g; actx.fillRect(-1, -1, 2, 2); actx.restore();
  }
  function drawAmb(t){
    var W = ac.width, H = ac.height, vw = window.innerWidth, vh = window.innerHeight, u = W / vw, vmax = Math.max(vw, vh) * u, k = curK;
    var c1 = rgbOf(cur), c2 = rgbOf(rot(cur, 34)), c3 = rgbOf(rot(cur, -30)), al = Math.min(1, .42 * k);
    actx.clearRect(0, 0, W, H);
    var base = actx.createLinearGradient(0, 0, 0, H); base.addColorStop(0, 'rgba(' + c1 + ',' + Math.min(1, .07 * k).toFixed(3) + ')'); base.addColorStop(1, 'rgba(' + c1 + ',' + Math.min(1, .045 * k).toFixed(3) + ')');
    actx.fillStyle = base; actx.fillRect(0, 0, W, H);
    var w = function(period, ph){ return .5 - .5 * Math.cos(Math.PI * 2 * t / period + ph); };     // slow drift, each pool on its own clock
    var vwu = vw * u / 100, vhu = vh * u / 100;
    pool(W / 2 + (-9 + 21 * w(74, 0)) * vwu, -34 * vmax / 100 + 45 * vmax / 100 + (-2 + 7 * w(37, 1)) * vhu, 60 * vmax / 100 * (1 + .1 * w(74, 2)), 45 * vmax / 100 * (1 + .1 * w(74, 2)), c1, al);
    pool(-38 * vmax / 100 + 42.5 * vmax / 100 + 16 * w(92, .6) * vwu, 22 * vhu + 42.5 * vmax / 100 + (-8 + 26 * w(92, 2.1)) * vhu, 42.5 * vmax / 100 * (1 + .15 * w(46, 0)), 42.5 * vmax / 100 * (1 + .15 * w(46, 0)), c2, al);
    pool(W + 40 * vmax / 100 - 45 * vmax / 100 - 14 * w(106, 1.2) * vwu, 38 * vhu + 45 * vmax / 100 + (-10 + 18 * w(106, .3)) * vhu, 45 * vmax / 100 * (1 + .12 * w(53, 1)), 45 * vmax / 100 * (1 + .12 * w(53, 1)), c3, al);
    pool(W / 2 + (-12 + 22 * w(82, 2.4)) * vwu, H + 40 * vmax / 100 - 35 * vmax / 100 + (-6 + 10 * w(41, .9)) * vhu, 55 * vmax / 100 * (1 + .1 * w(82, 0)), 35 * vmax / 100 * (1 + .1 * w(82, 0)), c1, al);
  }
  requestAnimationFrame(tick);

  function tileColour(t){
    var c = t.dataset.glowRGB; if (!c) return null;
    c = c.split(',').map(Number);
    if (Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2]) < 20) return [190, 204, 228];     // black-and-white project: cool white light, not grey
    return grade(c[0], c[1], c[2], 1.25);
  }
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.work-item'));
  // where we are on the page, and which film is at the front of the wheel
  var heroEl = document.querySelector('.reel-wrap'), stripEl = document.querySelector('.work-strip');
  var heroOut = false;
  function where(){
    if (!heroEl) { below = false; return; }
    var bot = heroEl.getBoundingClientRect().bottom;
    below = bot < window.innerHeight * 0.42;
    // the hero reel stops decoding once it has scrolled fully out of view, and picks up again when it comes back
    var out = bot < -60;
    if (out !== heroOut) { heroOut = out; var live = window.__reelLive; if (live && live === v) { if (out) v.pause(); else { var q = v.play(); if (q && q.catch) q.catch(function(){}); } } }
  }
  function spun(){ var f = stripEl && stripEl.querySelector('.m-slot.m-front .work-item'); if (f && f !== frontTile) { frontTile = f; wheelAt = performance.now(); } }
  window.addEventListener('scroll', where, { passive: true }); window.addEventListener('resize', where); where();
  if (stripEl) { stripEl.addEventListener('m-spin', spun); spun(); }
  // in the All work grid (no single front film), resting on a tile previews its colour
  if (window.matchMedia && matchMedia('(hover: hover)').matches) {
    tiles.forEach(function(t){
      t.addEventListener('mouseenter', function(){ if (!root.classList.contains('m-allwork-on')) return; var c = tileColour(t); if (c) hover = c; });
      t.addEventListener('mouseleave', function(){ hover = null; });
    });
  }

  // ---- opening a project ----
  // No added effects: the panel itself, still playing its loop, grows from where it sits into the player.
  // It stays on top until the real film is actually playing, then lets go. The page eases into the project's colour and keeps it.
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SLOW = +((/[?&]slow=([\d.]+)/.exec(location.search) || [])[1]) || 1;   // ?slow=8 plays the opening in slow motion, for checking
  var lb = document.getElementById('lightbox'), lbFrame = document.getElementById('lightboxIframe'), fxRun = 0, mover = null, release = null;
  function px(n){ return n.toFixed(1) + 'px'; }
  function hold(c){ stick = c; stickAt = performance.now(); hover = null; }
  function clearFx(){ fxRun++; release = null; mover = null;
    document.querySelectorAll('.m-grow, .m-lb-bg').forEach(function(e){ e.remove(); });
    if (lb && lb.classList.contains('m-mat')) lb.classList.remove('m-mat'); }

  function openFx(t, r, c){
    var fr = lb && lb.querySelector('.lightbox-frame'), img = t.querySelector('img');
    hold(c);
    if (still || !fr || !img || !document.body.animate) return;
    clearFx(); var run = fxRun;
    lb.classList.add('m-mat');                                       // the player's own frame stays hidden until the panel has arrived
    // behind the player the page is not a frozen dark sheet: the film's own loop (or the reel) keeps moving, soft and dim
    var bd = document.getElementById('lightboxBackdrop'), lp0 = t.querySelector('video.m-loop');
    if (bd) { var bg = document.createElement('video'); bg.className = 'm-lb-bg'; bg.muted = true; bg.loop = true; bg.playsInline = true; bg.setAttribute('playsinline', ''); bg.setAttribute('aria-hidden', 'true');
      bg.src = (lp0 && lp0.currentSrc) || 'hero/reel_clean_720.mp4?v=1';
      bg.addEventListener('loadeddata', function(){ if (!lp0 && v && v.currentTime) { try { bg.currentTime = v.currentTime; } catch (e) {} } var p = bg.play(); if (p && p.catch) p.catch(function(){}); bg.classList.add('m-on'); });
      bd.appendChild(bg); }
    var f = fr.getBoundingClientRect();
    var m = document.createElement('div'); m.className = 'm-grow'; m.setAttribute('aria-hidden', 'true');
    var pos = getComputedStyle(img).objectPosition;
    var still2 = document.createElement('img'); still2.alt = ''; still2.src = img.currentSrc || img.src; still2.style.objectPosition = pos; m.appendChild(still2);
    var loop = t.querySelector('video.m-loop');
    if (loop && loop.currentSrc) {                                   // carry the loop on, from the frame it was showing
      var v2 = document.createElement('video'); v2.muted = true; v2.loop = true; v2.playsInline = true; v2.setAttribute('playsinline', ''); v2.preload = 'auto';
      v2.src = loop.currentSrc; v2.style.objectPosition = pos; v2.style.opacity = 0;
      var at = loop.currentTime || 0;
      v2.addEventListener('loadeddata', function(){ try { v2.currentTime = at; } catch (e) {} var p = v2.play(); if (p && p.catch) p.catch(function(){}); v2.style.opacity = 1; });
      m.appendChild(v2);
    }
    document.body.appendChild(m); mover = m;
    var landed = false, playing = false;
    var go = function(){ if (run !== fxRun || !landed || !playing || !m.isConnected) return;
      m.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450 * SLOW, easing: 'ease', fill: 'forwards' }).onfinish = function(){ m.remove(); }; };
    release = function(){ playing = true; go(); };
    m.animate([
      { top: px(r.top), left: px(r.left), width: px(r.width), height: px(r.height), borderRadius: '2px' },
      { top: px(f.top), left: px(f.left), width: px(f.width), height: px(f.height), borderRadius: '4px' }
    ], { duration: 720 * SLOW, easing: 'cubic-bezier(.22,.8,.2,1)', fill: 'forwards' }).onfinish = function(){
      if (run !== fxRun) return;
      lb.classList.remove('m-mat'); landed = true; go();             // title, credits and close button come up around it
    };
    setTimeout(function(){ if (run === fxRun) { playing = true; go(); } }, (t.dataset.vimeo ? 5000 : 2200) * SLOW);       // never wait on the player for ever (YouTube does not report back, so it gets a short fixed wait)
  }
  // the player tells us when the film is really playing
  function listen(){ try { lbFrame.contentWindow.postMessage(JSON.stringify({ method: 'addEventListener', value: 'playProgress' }), 'https://player.vimeo.com'); } catch (e) {} }
  if (lbFrame) lbFrame.addEventListener('load', listen);
  window.addEventListener('message', function(e){ if (e.origin === location.origin && e.data && e.data.bvPlaying && release) { var rl = release; release = null; rl(); } });   // a film hosted on the site says when it is playing
  window.addEventListener('message', function(e){
    if (!lbFrame || e.source !== lbFrame.contentWindow || !/player\.vimeo\.com$/.test(e.origin || '')) return;
    var d; try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (x) { return; }
    if (!d) return;
    if (d.event === 'ready') listen();
    if ((d.event === 'playProgress' || d.event === 'timeupdate') && d.data && d.data.seconds > 0.12 && release) { var rl = release; release = null; rl(); }
  });
  tiles.forEach(function(t){
    t.addEventListener('click', function(){
      // only when the player really opens (a drag on the strip cancels the click)
      setTimeout(function(){ if (!lb || !lb.classList.contains('open')) return;
        openFx(t, t.getBoundingClientRect(), tileColour(t) || reel.slice()); }, 0);
    });
  });
  // tidy up once, at the moment the player closes (never on our own class changes, which would loop)
  var wasOpen = false;
  if (lb) new MutationObserver(function(){
    var isOpen = lb.classList.contains('open');
    if (wasOpen && !isOpen) clearFx();
    wasOpen = isOpen;
  }).observe(lb, { attributes: true, attributeFilter: ['class'] });
  window.__amb = function(){ return { reel: reel, reelK: reelK, hover: hover, stick: stick, cur: cur, curK: curK, ok: ok }; };
})();

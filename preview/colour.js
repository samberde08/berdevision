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
  setInterval(sample, 70);

  function rgbOf(c){ return Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]); }
  var prev = 0;
  function tick(now){
    var dt = Math.min(500, prev ? now - prev : 16); prev = now;
    // a hovered project previews its colour; otherwise the last opened project holds the page; before that, the reel
    var base = stick;
    if (stick && !hover) { var age = (now - stickAt) / 1000; if (age > HOLD) base = rot(stick, (age - HOLD) * DRIFT); }
    var t = hover || base || reel, k = hover ? (stick ? STICK_K : 1.55) : stick ? STICK_K : reelK;
    var e = 1 - Math.exp(-dt / (hover ? 170 : stick ? 260 : 110));     // following the reel: quick enough to land with the cut, still eased           // timed, so it eases the same at any frame rate
    cur[0] += (t[0] - cur[0]) * e; cur[1] += (t[1] - cur[1]) * e; cur[2] += (t[2] - cur[2]) * e; curK += (k - curK) * e;
    var s = rgbOf(cur) + '|' + curK.toFixed(2);
    if (s !== last) { last = s; root.style.setProperty('--amb', s.split('|')[0]); root.style.setProperty('--amb-k', curK.toFixed(2));
      root.style.setProperty('--amb2', rgbOf(rot(cur, 34))); root.style.setProperty('--amb3', rgbOf(rot(cur, -30))); }   // neighbouring hues for the other pools
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  function tileColour(t){
    var c = t.dataset.glowRGB; if (!c) return null;
    c = c.split(',').map(Number);
    if (Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2]) < 20) return [190, 204, 228];     // black-and-white project: cool white light, not grey
    return grade(c[0], c[1], c[2], 1.25);
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
      strip.addEventListener('m-spin', ask);
    }
  }

  // ---- opening a project ----
  // No added effects: the panel itself, still playing its loop, grows from where it sits into the player.
  // It stays on top until the real film is actually playing, then lets go. The page eases into the project's colour and keeps it.
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SLOW = +((/[?&]slow=([\d.]+)/.exec(location.search) || [])[1]) || 1;   // ?slow=8 plays the opening in slow motion, for checking
  var lb = document.getElementById('lightbox'), lbFrame = document.getElementById('lightboxIframe'), fxRun = 0, mover = null, release = null;
  function px(n){ return n.toFixed(1) + 'px'; }
  function hold(c){ stick = c; stickAt = performance.now(); root.classList.add('m-amb-stick');
    if (!(window.matchMedia && matchMedia('(hover: hover)').matches)) { hover = null; root.classList.remove('m-amb-proj'); } }   // phones: the strip's preview colour lets go
  function clearFx(){ fxRun++; release = null; mover = null;
    document.querySelectorAll('.m-grow').forEach(function(e){ e.remove(); });
    if (lb && lb.classList.contains('m-mat')) lb.classList.remove('m-mat'); }

  function openFx(t, r, c){
    var fr = lb && lb.querySelector('.lightbox-frame'), img = t.querySelector('img');
    hold(c);
    if (still || !fr || !img || !document.body.animate) return;
    clearFx(); var run = fxRun;
    lb.classList.add('m-mat');                                       // the player's own frame stays hidden until the panel has arrived
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
    setTimeout(function(){ if (run === fxRun) { playing = true; go(); } }, 5000 * SLOW);       // never wait on the player for ever
  }
  // the player tells us when the film is really playing
  function listen(){ try { lbFrame.contentWindow.postMessage(JSON.stringify({ method: 'addEventListener', value: 'playProgress' }), 'https://player.vimeo.com'); } catch (e) {} }
  if (lbFrame) lbFrame.addEventListener('load', listen);
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

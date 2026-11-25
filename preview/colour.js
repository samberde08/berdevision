// The page takes its colour from the hero reel, live. Hovering a project hands the page that project's colour instead.
(function(){
  var root = document.documentElement, v = document.getElementById('reelVideo');
  var amb = document.createElement('div'); amb.className = 'm-amb'; amb.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(amb, document.body.firstChild);
  var cv = document.createElement('canvas'); cv.width = 16; cv.height = 12;
  var cx = cv.getContext('2d', { willReadFrequently: true });
  var NEUTRAL = [118, 116, 124];
  var reel = NEUTRAL.slice(), reelK = 0.55, hover = null, cur = NEUTRAL.slice(), curK = 0.55, last = '', ok = true;

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

  var prev = 0;
  function tick(now){
    var dt = Math.min(500, prev ? now - prev : 16); prev = now;
    var t = hover || reel, k = hover ? 1.55 : reelK, e = 1 - Math.exp(-dt / (hover ? 220 : 320));   // timed, so it eases the same at any frame rate
    cur[0] += (t[0] - cur[0]) * e; cur[1] += (t[1] - cur[1]) * e; cur[2] += (t[2] - cur[2]) * e; curK += (k - curK) * e;
    var s = Math.round(cur[0]) + ',' + Math.round(cur[1]) + ',' + Math.round(cur[2]) + '|' + curK.toFixed(2);
    if (s !== last) { last = s; root.style.setProperty('--amb', s.split('|')[0]); root.style.setProperty('--amb-k', curK.toFixed(2)); }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // ---- a project takes over the page colour ----
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
    // phones: the project sitting in the middle of the strip sets the colour while the strip is on screen
    var strip = document.querySelector('.work-strip'), seen = false, raf = 0;
    var pick = function(){ raf = 0;
      if (!seen || !strip) { hover = null; root.classList.remove('m-amb-proj'); return; }
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
  window.__amb = function(){ return { reel: reel, reelK: reelK, hover: hover, cur: cur, ok: ok }; };
})();

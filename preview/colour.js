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
  // The thumbnail breaks into its own pixels, they swirl up out of the panel and settle into the player.
  // A wobbling front of light in the project's colour bursts from the panel's edges, throwing sparks, and the page keeps that colour.
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SLOW = +((/[?&]slow=([\d.]+)/.exec(location.search) || [])[1]) || 1;   // ?slow=8 plays the opening in slow motion, for checking
  var lb = document.getElementById('lightbox'), fxRun = 0;
  function hold(c){ stick = c; root.classList.add('m-amb-stick'); }
  function clearFx(){ fxRun++; document.querySelectorAll('.m-fx, .m-ghost, .m-amb-new').forEach(function(e){ e.remove(); }); if (lb) lb.classList.remove('m-mat'); }

  function openFx(t, r, c, cxk, cyk){
    var fr = lb && lb.querySelector('.lightbox-frame'), img = t.querySelector('img');
    hold(c);
    if (still || !fr || !img || !document.body.animate) { cur = c.slice(); curK = STICK_K; return; }
    clearFx(); var run = fxRun;
    lb.classList.add('m-mat');
    var W = window.innerWidth, H = window.innerHeight, small = W <= 768, f = fr.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, small ? 2 : 1.5);
    var cvs = document.createElement('canvas'); cvs.className = 'm-fx'; cvs.width = Math.round(W * dpr); cvs.height = Math.round(H * dpr);
    cvs.setAttribute('aria-hidden', 'true'); document.body.appendChild(cvs);
    var g = cvs.getContext('2d'); g.scale(dpr, dpr);
    var C0 = Math.round(c[0]), C1 = Math.round(c[1]), C2 = Math.round(c[2]);

    // the new colour comes up behind the page while the front travels across it
    var under = document.createElement('div'); under.className = 'm-amb m-amb-new'; under.setAttribute('aria-hidden', 'true');
    under.style.setProperty('--amb', C0 + ',' + C1 + ',' + C2); under.style.setProperty('--amb-k', String(STICK_K));
    amb.insertAdjacentElement('afterend', under);
    under.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1300 * SLOW, delay: 250 * SLOW, easing: 'ease-out', fill: 'both' })
      .onfinish = function(){ cur = c.slice(); curK = STICK_K; under.remove(); };

    // ---- the thumbnail as particles ----
    var GW = small ? 54 : 92, GH = small ? 30 : 52, n = GW * GH, pix = null;
    try {
      var sc = document.createElement('canvas'); sc.width = GW; sc.height = GH; var sg = sc.getContext('2d');
      var iw = img.naturalWidth, ih = img.naturalHeight, tw = Math.min(iw, ih * 16 / 9), th = tw * 9 / 16;
      var op = getComputedStyle(img).objectPosition.split(' '), oy = parseFloat(op[1]); if (isNaN(oy)) oy = 50;
      sg.drawImage(img, (iw - tw) / 2, (ih - th) * oy / 100, tw, th, 0, 0, GW, GH);
      pix = sg.getImageData(0, 0, GW, GH).data;
    } catch (e) { pix = null; }
    var P = new Float32Array(n * 9), mxc = r.left + r.width / 2, myc = r.top + r.height / 2;
    var far = Math.hypot(r.width, r.height);
    for (var i = 0; i < n; i++) {
      var gx = i % GW, gy = (i / GW) | 0, o = i * 9;
      var sx = r.left + (gx + .5) / GW * r.width, sy = r.top + (gy + .5) / GH * r.height;
      P[o] = sx; P[o+1] = sy;
      P[o+2] = f.left + (gx + .5) / GW * f.width; P[o+3] = f.top + (gy + .5) / GH * f.height;
      P[o+4] = Math.hypot(sx - cxk, sy - cyk) / far * 380 + Math.random() * 260;        // leaves later the further it is from the click
      P[o+5] = Math.atan2(sy - myc, sx - mxc) + (Math.random() - .5) * 1.2;             // where on the swirl it starts
      P[o+6] = (70 + Math.random() * Math.random() * 300) * (small ? .55 : 1);        // how wide it swings
      P[o+7] = .55 + Math.random() * 1.1;                                               // how many turns
      P[o+8] = 820 + Math.random() * 420;                                               // flight time
    }
    var cs = r.width / GW, ce = f.width / GW;

    // ---- sparks thrown off the panel's edge ----
    var NS = small ? 170 : 420, S = new Float32Array(NS * 7);
    for (var j = 0; j < NS; j++) {
      var u = Math.random() * 2 * (r.width + r.height), ex, ey, q = j * 7;
      if (u < r.width) { ex = r.left + u; ey = r.top; } else if (u < r.width + r.height) { ex = r.right; ey = r.top + (u - r.width); }
      else if (u < 2 * r.width + r.height) { ex = r.right - (u - r.width - r.height); ey = r.bottom; } else { ex = r.left; ey = r.bottom - (u - 2 * r.width - r.height); }
      var an = Math.atan2(ey - myc, ex - mxc) + (Math.random() - .5) * .9, sp = 180 + Math.random() * Math.random() * 1500;
      S[q] = ex; S[q+1] = ey; S[q+2] = Math.cos(an) * sp; S[q+3] = Math.sin(an) * sp;
      S[q+4] = .7 + Math.random() * 1.9; S[q+5] = Math.random() * 6.28; S[q+6] = Math.random() < .35 ? 1 : 0;      // life, twinkle phase, white-hot
    }
    // the front grows from the panel's own rectangle until it clears every corner of the screen
    var SC = Math.max(Math.max(mxc, W - mxc) / (r.width / 2), Math.max(myc, H - myc) / (r.height / 2)) * 1.25;
    var CHARGE = 170, LAND = 1500, END = 2500, ghost = null, t0 = performance.now(), lastEl = 0;
    function front(el, lag, wide, alpha){
      var tt = (el - CHARGE - lag) / 1500; if (tt <= 0 || tt >= 1) return;
      var e = 1 - Math.pow(1 - tt, 2.6), s = 1 + (SC - 1) * e, pw = .16 + .5 * e, fade = Math.pow(1 - tt, 1.4) * alpha, T = el / 1000;
      g.beginPath();
      for (var k = 0; k <= 120; k++) { var a = k / 120 * 6.2832, ca = Math.cos(a), sa = Math.sin(a);
        var wob = 1 + (.035 * Math.sin(a * 5 + T * 4 + lag) + .028 * Math.sin(a * 9 - T * 3) + .02 * Math.sin(a * 14 + T * 6)) * Math.min(1, e * 3);
        var x = mxc + r.width / 2 * s * wob * (ca < 0 ? -1 : 1) * Math.pow(Math.abs(ca), pw), y = myc + r.height / 2 * s * wob * (sa < 0 ? -1 : 1) * Math.pow(Math.abs(sa), pw);
        if (k) g.lineTo(x, y); else g.moveTo(x, y); }
      g.closePath();
      g.fillStyle = 'rgba(' + C0 + ',' + C1 + ',' + C2 + ',' + (.10 * fade).toFixed(3) + ')'; g.fill();     // the body of colour behind the front
      g.lineJoin = 'round';
      g.strokeStyle = 'rgba(' + C0 + ',' + C1 + ',' + C2 + ',' + (.16 * fade).toFixed(3) + ')'; g.lineWidth = wide * 4.5; g.stroke();
      g.strokeStyle = 'rgba(' + C0 + ',' + C1 + ',' + C2 + ',' + (.42 * fade).toFixed(3) + ')'; g.lineWidth = wide * 1.5; g.stroke();
      g.strokeStyle = 'rgba(255,255,255,' + (.9 * fade).toFixed(3) + ')'; g.lineWidth = Math.max(1, wide * .14); g.stroke();
    }
    function frame(now){
      if (run !== fxRun) return;
      var el = (now - t0) / SLOW, dt = Math.min(.05, (el - lastEl) / 1000); lastEl = el;
      g.clearRect(0, 0, W, H);
      g.globalCompositeOperation = 'lighter';
      // charge: the panel's edge tightens and brightens, then lets go
      if (el < CHARGE + 260) { var ch = Math.min(1, el / CHARGE), rel = Math.max(0, (el - CHARGE) / 260), k2 = 1 - .05 * ch * (1 - rel), a2 = ch * (1 - rel);
        var w2 = r.width * k2, h2 = r.height * k2;
        g.strokeStyle = 'rgba(255,255,255,' + (.95 * a2).toFixed(3) + ')'; g.lineWidth = 2; g.strokeRect(mxc - w2 / 2, myc - h2 / 2, w2, h2);
        g.strokeStyle = 'rgba(' + C0 + ',' + C1 + ',' + C2 + ',' + (.5 * a2).toFixed(3) + ')'; g.lineWidth = 12; g.strokeRect(mxc - w2 / 2, myc - h2 / 2, w2, h2);
        var rg = g.createRadialGradient(mxc, myc, 0, mxc, myc, r.width * (.7 + rel * 1.6));
        rg.addColorStop(0, 'rgba(255,255,255,' + (.55 * a2 + .5 * rel * (1 - rel)).toFixed(3) + ')'); rg.addColorStop(.4, 'rgba(' + C0 + ',' + C1 + ',' + C2 + ',' + (.35 * (a2 + rel * (1 - rel))).toFixed(3) + ')'); rg.addColorStop(1, 'rgba(' + C0 + ',' + C1 + ',' + C2 + ',0)');
        g.fillStyle = rg; g.fillRect(0, 0, W, H); }
      front(el, 0, 9, 1); front(el, 190, 6, .6); front(el, 430, 4, .35);
      // sparks
      if (el > CHARGE) { var se = (el - CHARGE) / 1000, drag = Math.exp(-1.9 * dt);
        for (var j = 0; j < NS; j++) { var q = j * 7, life = S[q+4]; if (se > life) continue;
          var px0 = S[q], py0 = S[q+1], sw = Math.sin(se * 5 + S[q+5]) * 60;
          S[q+2] = (S[q+2] - S[q+3] * .9 * dt) * drag; S[q+3] = (S[q+3] + S[q+2] * .9 * dt) * drag - 14 * dt;      // slight curl, slight lift
          S[q] += (S[q+2] + sw * dt * 8) * dt; S[q+1] += S[q+3] * dt;
          var al = Math.pow(1 - se / life, 1.5) * (.55 + .45 * Math.sin(se * 22 + S[q+5]));
          g.strokeStyle = S[q+6] ? 'rgba(255,255,255,' + al.toFixed(3) + ')' : 'rgba(' + C0 + ',' + C1 + ',' + C2 + ',' + al.toFixed(3) + ')';
          g.lineWidth = S[q+6] ? 1.4 : 2.2; g.beginPath(); g.moveTo(px0, py0); g.lineTo(S[q], S[q+1]); g.stroke();
          if (S[q+6]) { g.fillStyle = 'rgba(255,255,255,' + (al * .9).toFixed(3) + ')'; g.fillRect(S[q] - 1, S[q+1] - 1, 2, 2); } } }
      // the thumbnail's pixels
      g.globalCompositeOperation = 'source-over';
      var out = el > LAND ? Math.max(0, 1 - (el - LAND) / 320) : 1;
      if (out > 0) for (var i = 0; i < n; i++) { var o = i * 9, tt = (el - CHARGE - P[o+4]) / P[o+8];
        if (tt <= 0) continue; if (tt > 1) tt = 1;
        var e2 = tt < .5 ? 4 * tt * tt * tt : 1 - Math.pow(-2 * tt + 2, 3) / 2, arc = Math.sin(Math.PI * tt);
        var th2 = P[o+5] + (1 - e2) * P[o+7] * 6.2832, rad = P[o+6] * arc;
        var x = P[o] + (P[o+2] - P[o]) * e2 + Math.cos(th2) * rad, y = P[o+1] + (P[o+3] - P[o+1]) * e2 + Math.sin(th2) * rad * .8 - arc * 46;
        var sz = (cs + (ce - cs) * e2) * (1 - .62 * arc) + .6, wv = arc * .55;
        var pr = pix ? pix[i*4] : C0, pg = pix ? pix[i*4+1] : C1, pb = pix ? pix[i*4+2] : C2;
        g.fillStyle = 'rgba(' + ((pr + (255 - pr) * wv) | 0) + ',' + ((pg + (255 - pg) * wv) | 0) + ',' + ((pb + (255 - pb) * wv) | 0) + ',' + (out * Math.min(1, tt * 6)).toFixed(3) + ')';
        g.fillRect(x - sz / 2, y - sz / 2, sz, sz); }
      // the settled pixels sharpen into the real frame, then the player comes up under it
      if (!ghost && el > LAND - 420) { ghost = document.createElement('img'); ghost.className = 'm-ghost'; ghost.alt = ''; ghost.src = img.currentSrc || img.src;
        ghost.style.cssText = 'top:' + f.top + 'px;left:' + f.left + 'px;width:' + f.width + 'px;height:' + f.height + 'px;object-position:' + getComputedStyle(img).objectPosition;
        document.body.appendChild(ghost);
        var gh = ghost; gh.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420 * SLOW, easing: 'ease-out', fill: 'forwards' }).onfinish = function(){
          if (run === fxRun) lb.classList.remove('m-mat');
          gh.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600 * SLOW, delay: 350 * SLOW, easing: 'ease', fill: 'forwards' }).onfinish = function(){ gh.remove(); }; }; }
      if (el < END + 900) requestAnimationFrame(frame); else cvs.remove();
    }
    requestAnimationFrame(frame);
  }
  tiles.forEach(function(t){
    t.addEventListener('click', function(ev){
      var kx = ev.clientX, ky = ev.clientY;
      // only when the player really opens (a drag on the strip cancels the click)
      setTimeout(function(){ if (!lb || !lb.classList.contains('open')) return;
        var r = t.getBoundingClientRect(), c = tileColour(t) || reel.slice();
        openFx(t, r, c, kx || r.left + r.width / 2, ky || r.top + r.height / 2); }, 0);
    });
  });
  if (lb) new MutationObserver(function(){ if (!lb.classList.contains('open')) { clearFx(); if (stick) { cur = stick.slice(); curK = STICK_K; } } })
    .observe(lb, { attributes: true, attributeFilter: ['class'] });
  window.__amb = function(){ return { reel: reel, reelK: reelK, hover: hover, stick: stick, cur: cur, curK: curK, ok: ok }; };
})();

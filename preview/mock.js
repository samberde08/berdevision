(function(){
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.work-item'));
  // ---- hover loops ----
  var loops = ['1249151789','1249151605','1249151719','1249151866','1249151733','1249151670','1249151833',
    '1204589600','1204398806','1204401806','1204409147','1204586020','1204561560', 'ladybird', 'something-special', 'distant-lover', 'breakdown',
    '1204418162','1203337382','1204680193','1204548410','1203340055','1204579585','1203344844','1204416675','1204403981','1204407984','1203256076','1204593129'];   // + the last 12, cut from Sam's own Vimeo files: every film now has a local clip   // + older films cut from their masters (DANNA, Embrace the Madness, Underwater, Noah Lyles, Madison Beer, Bronco)
  tiles.forEach(function(t){
    var lid = t.dataset.vimeo || t.dataset.key; if (loops.indexOf(lid) === -1) return;
    var v = document.createElement('video');
    v.className = 'm-loop'; v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'metadata';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', ''); v.disableRemotePlayback = true;   // iPhone only autoplays inline when these are attributes
    v.src = 'loops/' + lid + '.mp4';
    t.insertBefore(v, t.querySelector('.work-overlay'));
    function on(){ t.classList.add('m-playing'); var p = v.play(); if (p && p.catch) p.catch(function(){}); }
    function off(){ t.classList.remove('m-playing'); v.pause(); }
    if (!(window.matchMedia && matchMedia('(hover: none)').matches)) { t.addEventListener('mouseenter', on); t.addEventListener('mouseleave', off); }   // a phone has no hover: the wheel alone decides what plays
    t._mOn = on;
  });
  // ---- hover previews for the older tiles: the Vimeo film itself plays, muted, inside the tile ----
  var shape = {'1204589600':426/234,'1204409147':240/300,'1204579585':300/240,'1203344844':300/240,'1204398806':292/240,'1204416675':240/426,'1203256076':322/240};
  if (window.matchMedia && matchMedia('(hover: hover)').matches) tiles.forEach(function(t){
    var id = t.dataset.vimeo; if (!id || loops.indexOf(id) !== -1) return;
    var fr = null, timer = 0;
    t.addEventListener('mouseenter', function(){
      clearTimeout(timer);
      timer = setTimeout(function(){
        if (fr) return;
        fr = document.createElement('iframe'); fr.className = 'm-emb'; fr.setAttribute('allow','autoplay'); fr.setAttribute('tabindex','-1'); fr.setAttribute('aria-hidden','true');
        fr.style.aspectRatio = String(shape[id] || 16/9);
        fr.src = 'https://player.vimeo.com/video/' + id + '?background=1&autoplay=1&loop=1&muted=1&dnt=1#t=3s';
        var me = fr;
        // stay hidden behind the thumbnail until Vimeo reports the film is really playing (no spinner on black)
        me._show = function(){ if (fr === me) { me.style.opacity = 1; t.classList.add('m-playing'); } };
        fr.addEventListener('load', function(){ try { me.contentWindow.postMessage(JSON.stringify({method:'addEventListener', value:'playProgress'}), 'https://player.vimeo.com'); } catch(e){} });
        t.insertBefore(fr, t.querySelector('.work-overlay'));
      }, 220);                                    // only start if the pointer actually rests on the tile
    });
    t.addEventListener('mouseleave', function(){ clearTimeout(timer); t.classList.remove('m-playing'); if (fr) { var old = fr; fr = null; old.style.opacity = 0; setTimeout(function(){ old.remove(); }, 350); } });
  });
  window.addEventListener('message', function(e){
    if (!/player\.vimeo\.com$/.test(e.origin || '')) return;
    var d; try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch(x){ return; }
    if (!d) return;
    var frames = document.querySelectorAll('iframe.m-emb');
    for (var i=0;i<frames.length;i++) { var f = frames[i]; if (f.contentWindow !== e.source) continue;
      if (d.event === 'ready') { try { f.contentWindow.postMessage(JSON.stringify({method:'addEventListener', value:'playProgress'}), 'https://player.vimeo.com'); } catch(x){} }
      if ((d.event === 'timeupdate' || d.event === 'playProgress') && d.data && d.data.seconds > 3.15 && f._show) { f._show(); f._show = null; } }
  });
  // ---- hero ----
  var c = document.querySelector('.reel-center');
  if (c) {
    // stacked wordmark: both lines justified to one width, tight leading (same lockup as the About collage)
    var sl = c.querySelector('.reel-slogan');
    if (sl) {
      // wordmark starts as a straight stacked lockup and jumbles (tilt + mixed sizes) as you scroll
      var HL = ['BERDE','VISION'], SJ = [1,.8,1.1,.86,1.16,.82,1.06,.9,1.12,.84,1], TJ = [-5,4,-3,6,-4,3,-5,4,-2,5,-4], YJ = [0,-.08,.05,-.06,.07,.06,-.05,.08,-.04,.06,-.07];
      sl.textContent = ''; sl.classList.add('m-jumble'); sl.setAttribute('aria-label','BerdeVision');
      var rows = [], all = [], kk = 0;
      HL.forEach(function(t){ var r = document.createElement('div'); r.className = 'm-jrow'; sl.appendChild(r);
        var ls = t.split('').map(function(ch){ var d = document.createElement('span'); d.textContent = ch; r.appendChild(d); var q = kk++;
          var o = {el:d, ch:ch, sc:SJ[q % SJ.length], rot:TJ[q % TJ.length], dy:YJ[q % YJ.length]}; all.push(o); return o; });
        rows.push(ls); });
      var mc = document.createElement('canvas').getContext('2d');
      var fit = function(){
        var W = Math.min(window.innerWidth*(window.innerWidth<=768?0.8:0.62), window.innerHeight*1.0, 980);
        mc.font = "800 100px Manrope, 'DM Sans', sans-serif";
        rows.forEach(function(ls){ var w = 0; ls.forEach(function(l){ w += mc.measureText(l.ch).width; });
          var F = W / w * 100; ls.forEach(function(l){ l.el.style.fontSize = F.toFixed(1) + 'px'; }); });
      };
      var jraf = 0, still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      var jum = function(){ jraf = 0;
        var p = still ? 0 : Math.max(0, Math.min(1, window.scrollY / (window.innerHeight * 0.2))); p = p*p*(3-2*p);
        all.forEach(function(l){ l.el.style.transform = 'translateY(' + (l.dy*p).toFixed(3) + 'em) rotate(' + (l.rot*p).toFixed(2) + 'deg) scale(' + (1+(l.sc-1)*p).toFixed(3) + ')'; }); };
      fit(); jum(); window.addEventListener('resize', fit);
      window.addEventListener('scroll', function(){ if (!jraf) jraf = requestAnimationFrame(jum); }, {passive:true});
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
    '1249151833': [['Role','Shot · Edited · VFX'],['Artist','Esdeekid']],
    'ladybird': [['Role','Editor · VFX'],['Client','Lady Bird']],
    'something-special': [['Role','VFX'],['Artists','Khalid · Ahn Hyo-seop'],['Label','FANDOM']],
    'distant-lover': [['Role','VFX'],['Artists','JIHYO · Shenseea'],['Label','FANDOM']],
    // roles below are taken from Sam's own Instagram captions for each film
    '1204418162': [['Role','Edit · VFX'],['Artist','Lihtz'],['Director','feltonamus']],
    '1204589600': [['Role','Edit'],['Artist','DANNA']],
    '1204586020': [['Role','Editing'],['Artist','Madison Beer']],
    '1204680193': [['Role','VFX · Animated intro'],['Client','Dallas Wings']],
    '1203340055': [['Role','Director · Writer · Voice'],['Client','Mississippi State Men\'s Basketball']],
    '1204398806': [['Role','3D · Edit · Comp'],['Tools','Blender · Premiere · After Effects']],
    // roles below are as Sam gave them (Nov 26)
    '1204561560': [['Role','Edit']],
    '1203337382': [['Role','Edit · VFX'],['Client','Seattle Seahawks']],
    '1204409147': [['Role','Co-director · Edit · VFX'],['Athlete','Noah Lyles']],
    '1204548410': [['Role','Edit · VFX'],['Artist','2Hollis']],
    '1204579585': [['Role','Edit'],['Artist','Molly Santana']],
    '1203344844': [['Role','Shot · Edit'],['Client','Mississippi State Football']],
    '1204416675': [['Role','VFX'],['Client','Hoka']],
    '1204403981': [['Role','Shot · Edit · VFX'],['Client','Mississippi State']],
    '1204407984': [['Role','Shot · Edit · VFX'],['Client','Mississippi State Football']],
    '1203256076': [['Role','Director · Actor · Shot · Edit · VFX']],
    '1204401806': [['Role','Director · Actor · Shot · Edit · VFX']],
    '1204593129': [['Role','Director · Actor · Shot · Edit · VFX']]
  };
  var inner = document.querySelector('.lightbox-inner');
  var panel = document.createElement('div'); panel.className = 'm-credits'; inner.appendChild(panel);
  tiles.forEach(function(t){
    t.addEventListener('click', function(){
      var g = function(s){ var e = t.querySelector(s); return e ? e.textContent : ''; };
      var rows = credits[t.dataset.vimeo || t.dataset.key] || [];
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
    if (lab) { var st = document.createElement('div'); st.className = 'm-statement'; st.setAttribute('aria-label','Every frame, every cut, every vision');
      lab.parentNode.replaceChild(st, lab);
      lockup(st, ['EVERY FRAME','EVERY CUT','EVERY VISION'], function(){ return Math.min(ab.clientWidth*0.86, 560); });
      /* (Nov 26, Sam) the lines fade in one by one; VISION is singled out: it stays the brightest word and flares as it arrives */
      st.lastChild.innerHTML = 'EVERY <span class="m-vis">VISION</span>';
      if ('IntersectionObserver' in window) new IntersectionObserver(function(en, io){ if (en[0].isIntersecting) { st.classList.add('m-go'); io.disconnect(); } }, { threshold: 0.2 }).observe(st);   /* once it has arrived it stays (Sam: make sure it doesn't disappear) */
      else st.classList.add('m-go');
      /* (Nov 27, Sam) the tagline sequence replays every time About is opened, even if it has been seen; within a visit it still stays put */
      var pa0 = document.getElementById('page-about'), wasOn = !!(pa0 && pa0.classList.contains('active'));
      if (pa0) new MutationObserver(function(){ var on = pa0.classList.contains('active');
        if (on && !wasOn) { st.classList.remove('m-go'); void st.offsetWidth; setTimeout(function(){ st.classList.add('m-go'); }, 160); }
        wasOn = on; }).observe(pa0, { attributes:true, attributeFilter:['class'] });
      /* (Nov 26, Sam) type as the background: huge outlined rows of the tagline drifting slowly behind the top of About; ?typebg=0 hides it */
      if (!/[?&]typebg=0/.test(location.search)) { var tb = document.createElement('div'); tb.className = 'm-typebg'; tb.setAttribute('aria-hidden', 'true');
        var run = 'EVERY FRAME \u00b7 EVERY CUT \u00b7 EVERY VISION \u00b7 ', h4 = '';
        for (var ri = 0; ri < 4; ri++) h4 += '<div class="m-typebg-row"><span>' + run + run + '</span><span>' + run + run + '</span></div>';
        tb.innerHTML = h4; ab.insertBefore(tb, ab.firstChild); } } }
  // ---- (Nov 27, Sam) 3D objects on the service cards: a transparent looping video per card, playing only while its card is on screen ----
  (function(){
    var objs = document.querySelectorAll('.m-card-obj[data-obj]'); if (!objs.length) return;
    var ua = navigator.userAgent, webkit = /iP(hone|ad|od)/.test(ua) || (/Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR|Android/.test(ua));   // Safari and every iPhone browser need the HEVC file for transparency
    var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    Array.prototype.forEach.call(objs, function(box){
      var v = box.querySelector('video'), name = box.getAttribute('data-obj'); if (!v) return;
      var src = 'objects/' + name + (webkit ? '.mov' : '.webm') + '?v=5', loaded = false;
      function go(on){ if (still) return; if (on) { if (!loaded) { v.src = src; loaded = true; } var p = v.play(); if (p && p.catch) p.catch(function(){}); } else if (loaded) v.pause(); }
      if ('IntersectionObserver' in window) new IntersectionObserver(function(en){ go(en[0].isIntersecting); }, { threshold: 0.3 }).observe(box);
      else go(true);
    });
  })();
  // ---- client strip straight under the hero ----
  var tr = document.querySelector('#work .logo-track'), reel = document.querySelector('.reel-wrap');
  if (tr && reel) { var blk = tr.parentElement.parentElement; blk.classList.add('m-clients'); blk.removeAttribute('style');
    var l = blk.querySelector('.work-label'); if (l) l.textContent = 'Trusted by';
    reel.insertAdjacentElement('afterend', blk); }
  // ---- footer + contact block ----
  var ft = document.querySelector('footer');
  if (ft) { ft.classList.add('m-footer');
    /* (Nov 27, Sam) footer laid out like the agency reference: name + location left, links right, colour glow rising from the bottom */
    ft.innerHTML = '<div class="m-f-top"><div class="m-f-left"><div class="m-f-mark"></div>' +
        '<div class="m-f-loc"><span>Video · VFX · Post-production</span><span>Based in <b>Dallas</b></span><span>Available worldwide</span></div></div>' +
      '<div class="m-f-cols">' +
        '<div><div class="m-f-h">Site</div><a href="#" data-page="home">Work</a><a href="#" data-page="about">About</a></div>' +
        '<div><div class="m-f-h">Contact</div><a href="mailto:samberde@gmail.com">samberde@gmail.com</a><a href="https://www.instagram.com/berdevision/" target="_blank" rel="noopener">Instagram · @berdevision</a></div>' +
      '</div></div><div class="m-f-base">© 2026 Berdevision. All rights reserved.</div>';
    lockup(ft.querySelector('.m-f-mark'), ['BERDE','VISION'], function(){ return Math.min(ft.clientWidth - 48, 300); });
    document.querySelectorAll('.m-wall a').forEach(function(a){ a.addEventListener('click', function(e){ e.preventDefault(); var n = document.querySelector('nav a[data-page="home"]'); if (n) n.click(); }); });
    ft.querySelectorAll('a[data-page]').forEach(function(a){ a.addEventListener('click', function(e){ e.preventDefault();
      var n = document.querySelector('nav a[data-page="' + a.dataset.page + '"]'); if (n) n.click(); window.scrollTo(0,0); }); });
  }
  fitLocks(); window.addEventListener('resize', fitLocks);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitLocks);
  var pa = document.getElementById('page-about'); if (pa) new MutationObserver(fitLocks).observe(pa, {attributes:true, attributeFilter:['class']});
  // ---- small fixes ----
  document.querySelectorAll('footer p').forEach(function(p){ p.innerHTML = p.innerHTML.replace('2025','2026'); });
})();

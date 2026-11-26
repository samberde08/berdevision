// Before / after: drag the white line across a shot to compare the cut as it came in with the finished frame. Both sides are the moving shot, kept in step.
// A project with several shots shows one at a time; the arrows step through them.
(function(){
  var V = '4';
  var SETS = [
    { h: 'Storm x US Open', sub: 'Drag the line. Left is the cut as it came in, right is the finished spot.', ar: '16 / 9', shots: [
      { id: 'st1', title: 'Ball toss', note: 'Empty sky replaced with a moving storm front' },
      { id: 'st2', title: 'Rally', note: 'Every sky in the run swapped, shot by shot, and matched to the players' },
      { id: 'st3', title: 'Courtside', note: 'Storm clouds behind both athletes, then the film finish' } ] },
    { h: 'Street Fighter x Lids', sub: 'Left is the edit before effects, right is the delivered film.', ar: '9 / 16', shots: [
      { id: 'sf1', title: 'Charge and logo', note: 'Energy in the car, the jacket print lights up, a spark in the hand' },
      { id: 'sf2', title: 'Power up', note: 'Fists catch fire as the fighter squares up' },
      { id: 'sf3', title: 'Gloves', note: 'Electric charge on the gloves as she throws' } ] },
    { h: 'Arran Studios · Black Friday', sub: 'Left is the plate as it was shot, right is the finished frame.', ar: '4 / 3', shots: [
      { id: 'ar2', title: 'The light post', note: 'A street light, the car wrapped around it and the man on its roof, added to an empty roadside, then the grade' } ] },
    { h: 'Lady Bird · Follow the Fizz', sub: 'Left is the drone shot as it came off the camera, right is what aired.', ar: '1280 / 694', shots: [
      { id: 'lbd', title: 'Drone shot', note: 'Parked cars and fencing painted out, then a sunset sky and grade' } ] }
  ];
  var items = [], io = null;
  function widthFor(ar){ var p = ar.split('/'), r = parseFloat(p[0]) / parseFloat(p[1]); return r < 1 ? 'tall' : r < 1.5 ? 'narrow' : ''; }
  function mount(anchor, sets, kicker, place){
    sets.forEach(function(SET, si){
      var many = SET.shots.length > 1;
      var sec = document.createElement('section'); sec.className = 'm-ba-sec' + (SET.cls ? ' ' + SET.cls : '');
      sec.innerHTML = (si || !kicker ? '' : '<p class="m-ba-kicker">' + kicker + '</p>') + '<h3 class="m-ba-h">' + SET.h + '</h3><p class="m-ba-sub">' + SET.sub + '</p>' +
        '<div class="m-ba-list' + (many ? ' m-ba-one' : '') + '"></div>' +
        (many ? '<div class="m-ba-nav" role="group" aria-label="' + SET.h + ' examples"><button type="button" class="m-ba-prev" aria-label="Previous example"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5"/></svg></button><span class="m-ba-count" aria-live="polite"></span><button type="button" class="m-ba-next" aria-label="Next example"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg></button></div>' : '');
      var list = sec.querySelector('.m-ba-list');
      anchor.insertAdjacentElement(si ? 'afterend' : (place || 'afterend'), sec); anchor = sec;
      var cards = SET.shots.map(function(S){
        var ar = S.ar || SET.ar, wc = widthFor(ar);
        var card = document.createElement('figure'); card.className = 'm-ba' + (wc ? ' m-ba-w-' + wc : '');
        card.innerHTML = '<div class="m-ba-frame" tabindex="0" role="slider" aria-label="Before and after: ' + S.title + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">' +
          '<video class="m-ba-a" muted playsinline preload="none" src="ba/' + S.id + '_after.mp4?v=' + V + '"></video>' +
          '<div class="m-ba-clip"><video class="m-ba-b" muted playsinline preload="none" src="ba/' + S.id + '_before.mp4?v=' + V + '"></video></div>' +
          '<span class="m-ba-tag m-ba-tb">Before</span><span class="m-ba-tag m-ba-ta">After</span>' +
          '<div class="m-ba-line"><i></i></div></div>' +
          '<figcaption><b>' + (S.proj ? S.proj + ' · ' : '') + S.title + '</b><span>' + S.note + '</span></figcaption>';
        list.appendChild(card);
        var fr = card.querySelector('.m-ba-frame'), va = card.querySelector('.m-ba-a'), vb = card.querySelector('.m-ba-b'), pos = 50, drag = false;
        [va, vb].forEach(function(v){ v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); });
        function set(p){ pos = Math.max(0, Math.min(100, p)); fr.style.setProperty('--p', pos + '%'); fr.setAttribute('aria-valuenow', Math.round(pos)); }
        function at(e){ var r = fr.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); }
        fr.addEventListener('pointerdown', function(e){ drag = true; try { fr.setPointerCapture(e.pointerId); } catch (x) {} at(e); });
        fr.addEventListener('pointermove', function(e){ if (drag) at(e); });
        ['pointerup', 'pointercancel'].forEach(function(ev){ fr.addEventListener(ev, function(){ drag = false; }); });
        fr.addEventListener('keydown', function(e){ if (e.key === 'ArrowLeft') { set(pos - 5); e.preventDefault(); } if (e.key === 'ArrowRight') { set(pos + 5); e.preventDefault(); } });
        fr.style.aspectRatio = ar;
        set(50);
        var it = { fr: fr, va: va, vb: vb, card: card, raf: 0, on: false };
        // The two clips never loop on their own: when the finished side ends, both go back to the first frame and start together,
        // so there is no catch-up jump at the loop point. In between, a small drift is eased out by a slight speed change.
        it.restart = function(){ try { va.currentTime = 0; vb.currentTime = 0; } catch (x) {} vb.playbackRate = 1;
          if (it.on) [va, vb].forEach(function(v){ var p = v.play(); if (p && p.catch) p.catch(function(){}); }); };
        va.addEventListener('ended', it.restart);
        vb.addEventListener('ended', function(){ if (!va.ended && va.duration - va.currentTime < 0.12) it.restart(); });
        it.tick = function(){
          it.raf = 0; if (!it.on) return;
          if (!va.paused && !vb.paused && va.readyState > 2 && vb.readyState > 2) {
            var d = vb.currentTime - va.currentTime;
            if (Math.abs(d) > 0.2) { try { vb.currentTime = va.currentTime; } catch (x) {} vb.playbackRate = 1; }
            else { var want = d > 0.03 ? 0.96 : d < -0.03 ? 1.04 : 1; if (vb.playbackRate !== want) vb.playbackRate = want; }
          }
          it.raf = requestAnimationFrame(it.tick);
        };
        items.push(it); if (io) io.observe(fr); else run(it, true);
        return card;
      });
      if (many) {
        var cur = 0, cnt = sec.querySelector('.m-ba-count');
        var show = function(i){ cur = (i + cards.length) % cards.length; cards.forEach(function(c, k){ c.classList.toggle('m-on', k === cur); }); cnt.textContent = (cur + 1) + ' / ' + cards.length; };
        sec.querySelector('.m-ba-prev').addEventListener('click', function(){ show(cur - 1); });
        sec.querySelector('.m-ba-next').addEventListener('click', function(){ show(cur + 1); });
        show(0);
      }
    });
  }
  // play only while on screen (a hidden example is never on screen, so it stays paused)
  function run(it, on){
    it.on = on;
    if (!on) { it.va.pause(); it.vb.pause(); return; }
    [it.va, it.vb].forEach(function(v){ if (v.preload === 'none') v.preload = 'auto'; });
    // start only once both sides can play, and from the same frame
    var go = function(){ if (!it.on) return;
      if (it.va.readyState < 3 || it.vb.readyState < 3) { setTimeout(go, 120); return; }
      if (it.va.ended || it.vb.ended) { it.restart(); } else { try { it.vb.currentTime = it.va.currentTime; } catch (x) {} [it.va, it.vb].forEach(function(v){ var p = v.play(); if (p && p.catch) p.catch(function(){}); }); }
      if (!it.raf) it.raf = requestAnimationFrame(it.tick); };
    if (it.va.readyState === 0) it.va.load(); if (it.vb.readyState === 0) it.vb.load();
    go();
  }
  if ('IntersectionObserver' in window) io = new IntersectionObserver(function(en){ en.forEach(function(x){ var it = items.filter(function(i){ return i.fr === x.target; })[0]; if (it) run(it, x.isIntersecting); }); }, { threshold: 0.25 });

  var ab = document.querySelector('.about-page .about-body');
  if (ab) { var anchor = ab.querySelector('.services-grid'); if (anchor) mount(anchor, SETS, 'Before / After'); }
  // (idea preview) the same pairs as one strip on the home page, under the wheel: every example in one place, stepped through with the arrows
  window.__baHome = function(){
    var work = document.getElementById('work'); if (!work || document.querySelector('.m-ba-home')) return;
    var all = []; SETS.forEach(function(S){ var proj = S.h.split(' · ')[0]; S.shots.forEach(function(s){ all.push({ id: s.id, title: s.title, note: s.note, ar: S.ar, proj: proj }); }); });
    var order = ['ar2', 'st1', 'sf1', 'lbd', 'st2', 'sf2', 'st3', 'sf3'];
    all.sort(function(a, b){ return order.indexOf(a.id) - order.indexOf(b.id); });
    mount(work, [{ h: 'Before / After', sub: 'Drag the line. Left is what came in, right is what went out.', ar: '16 / 9', cls: 'm-ba-home', shots: all }], '');
  };
})();

// Before / after: drag the white line across a shot to compare the cut as it came in with the finished frame. Both sides are the moving shot, kept in step.
// A project with several shots shows one at a time; the arrows step through them.
(function(){
  var ab = document.querySelector('.about-page .about-body'); if (!ab) return;
  var V = '4';
  var SETS = [
    { h: 'Storm x US Open', sub: 'Drag the line. Left is the cut as it came in, right is the finished spot.', ar: '16 / 9', shots: [
      { id: 'st1', title: 'Ball toss', note: 'Empty sky replaced with a moving storm front' },
      { id: 'st2', title: 'Rally', note: 'Every sky in the run swapped, shot by shot, and matched to the players' },
      { id: 'st3', title: 'Courtside', note: 'Storm clouds behind both athletes, then the film finish' } ] },
    { h: 'Street Fighter x Lids', sub: 'Left is the edit before effects, right is the delivered film.', ar: '9 / 16', tall: true, shots: [
      { id: 'sf1', title: 'Charge and logo', note: 'Energy in the car, the jacket print lights up, a spark in the hand' },
      { id: 'sf2', title: 'Power up', note: 'Fists catch fire as the fighter squares up' },
      { id: 'sf3', title: 'Gloves', note: 'Electric charge on the gloves as she throws' } ] },
    { h: 'Arran Studios · Black Friday', sub: 'Left is the plate as it was shot, right is the finished frame.', ar: '4 / 3', narrow: true, shots: [
      { id: 'ar2', title: 'The light post', note: 'A street light, the car wrapped around it and the man on its roof, added to an empty roadside, then the grade' } ] },
    { h: 'Lady Bird · Follow the Fizz', sub: 'Left is the drone shot as it came off the camera, right is what aired.', ar: '1280 / 694', shots: [
      { id: 'lbd', title: 'Drone shot', note: 'Parked cars and fencing painted out, then a sunset sky and grade' } ] }
  ];
  var anchor = ab.querySelector('.services-grid'), items = [];
  SETS.forEach(function(SET, si){
    var many = SET.shots.length > 1;
    var sec = document.createElement('section'); sec.className = 'm-ba-sec';
    sec.innerHTML = (si ? '' : '<p class="m-ba-kicker">Before / After</p>') + '<h3 class="m-ba-h">' + SET.h + '</h3><p class="m-ba-sub">' + SET.sub + '</p>' +
      '<div class="m-ba-list' + (SET.tall ? ' m-ba-tall' : '') + (SET.narrow ? ' m-ba-narrow' : '') + (many ? ' m-ba-one' : '') + '"></div>' +
      (many ? '<div class="m-ba-nav" role="group" aria-label="' + SET.h + ' examples"><button type="button" class="m-ba-prev" aria-label="Previous example"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5"/></svg></button><span class="m-ba-count" aria-live="polite"></span><button type="button" class="m-ba-next" aria-label="Next example"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg></button></div>' : '');
    var list = sec.querySelector('.m-ba-list');
    if (anchor) { anchor.insertAdjacentElement('afterend', sec); anchor = sec; } else ab.appendChild(sec);
    var cards = SET.shots.map(function(S){
      var card = document.createElement('figure'); card.className = 'm-ba';
      card.innerHTML = '<div class="m-ba-frame" tabindex="0" role="slider" aria-label="Before and after: ' + S.title + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">' +
        '<video class="m-ba-a" muted loop playsinline preload="none" src="ba/' + S.id + '_after.mp4?v=' + V + '"></video>' +
        '<div class="m-ba-clip"><video class="m-ba-b" muted loop playsinline preload="none" src="ba/' + S.id + '_before.mp4?v=' + V + '"></video></div>' +
        '<span class="m-ba-tag m-ba-tb">Before</span><span class="m-ba-tag m-ba-ta">After</span>' +
        '<div class="m-ba-line"><i></i></div></div>' +
        '<figcaption><b>' + S.title + '</b><span>' + S.note + '</span></figcaption>';
      list.appendChild(card);
      var fr = card.querySelector('.m-ba-frame'), va = card.querySelector('.m-ba-a'), vb = card.querySelector('.m-ba-b'), pos = 50, drag = false;
      [va, vb].forEach(function(v){ v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); });
      function set(p){ pos = Math.max(0, Math.min(100, p)); fr.style.setProperty('--p', pos + '%'); fr.setAttribute('aria-valuenow', Math.round(pos)); }
      function at(e){ var r = fr.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); }
      fr.addEventListener('pointerdown', function(e){ drag = true; try { fr.setPointerCapture(e.pointerId); } catch (x) {} at(e); });
      fr.addEventListener('pointermove', function(e){ if (drag) at(e); });
      ['pointerup', 'pointercancel'].forEach(function(ev){ fr.addEventListener(ev, function(){ drag = false; }); });
      fr.addEventListener('keydown', function(e){ if (e.key === 'ArrowLeft') { set(pos - 5); e.preventDefault(); } if (e.key === 'ArrowRight') { set(pos + 5); e.preventDefault(); } });
      fr.style.aspectRatio = SET.ar;
      set(50);
      var it = { fr: fr, va: va, vb: vb, card: card, raf: 0, on: false };
      // keep the two sides on the same frame: small drifts are eased out by nudging the speed (no visible jump); only a big gap, such as the loop point, is a hard seek
      it.tick = function(){
        it.raf = 0; if (!it.on) return;
        if (!va.paused && va.readyState > 2 && vb.readyState > 2) {
          var d = vb.currentTime - va.currentTime;
          if (Math.abs(d) > 0.25) { try { vb.currentTime = va.currentTime; } catch (x) {} vb.playbackRate = 1; }
          else vb.playbackRate = d > 0.015 ? 0.9 : d < -0.015 ? 1.1 : 1;
        }
        it.raf = requestAnimationFrame(it.tick);
      };
      items.push(it);
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
  // play only while on screen (a hidden example is never on screen, so it stays paused)
  function run(it, on){
    it.on = on;
    [it.va, it.vb].forEach(function(v){ if (on) { if (v.preload === 'none') v.preload = 'auto'; var p = v.play(); if (p && p.catch) p.catch(function(){}); } else v.pause(); });
    if (on) { try { it.vb.currentTime = it.va.currentTime; } catch (x) {} if (!it.raf) it.raf = requestAnimationFrame(it.tick); }
  }
  if ('IntersectionObserver' in window) { var io = new IntersectionObserver(function(en){ en.forEach(function(x){ var it = items.filter(function(i){ return i.fr === x.target; })[0]; if (it) run(it, x.isIntersecting); }); }, { threshold: 0.25 });
    items.forEach(function(it){ io.observe(it.fr); }); }
  else items.forEach(function(it){ run(it, true); });
})();

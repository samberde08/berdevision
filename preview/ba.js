// Before / after: drag the white line across a shot to compare the source plate with the finished frame. Both sides are the moving shot, kept in step.
(function(){
  var ab = document.querySelector('.about-page .about-body'); if (!ab) return;
  var SHOTS = [
    { id: 'st1', title: 'Ball toss', note: 'Empty sky replaced with a moving storm front' },
    { id: 'st2', title: 'Rally', note: 'Every sky in the run swapped, shot by shot, and matched to the players' },
    { id: 'st3', title: 'Courtside', note: 'Storm clouds behind both athletes, then the film finish' }
  ];
  var sec = document.createElement('section'); sec.className = 'm-ba-sec';
  sec.innerHTML = '<p class="m-ba-kicker">Before / After</p><h3 class="m-ba-h">Storm x US Open</h3><p class="m-ba-sub">Drag the line. Left is the cut as it came in, right is the finished spot.</p><div class="m-ba-list"></div>';
  var list = sec.querySelector('.m-ba-list');
  var anchor = ab.querySelector('.services-grid'); if (anchor) anchor.insertAdjacentElement('afterend', sec); else ab.appendChild(sec);
  var items = SHOTS.map(function(S){
    var card = document.createElement('figure'); card.className = 'm-ba';
    card.innerHTML = '<div class="m-ba-frame" tabindex="0" role="slider" aria-label="Before and after: ' + S.title + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">' +
      '<video class="m-ba-a" muted loop playsinline preload="none" src="ba/' + S.id + '_after.mp4?v=1"></video>' +
      '<div class="m-ba-clip"><video class="m-ba-b" muted loop playsinline preload="none" src="ba/' + S.id + '_before.mp4?v=1"></video></div>' +
      '<span class="m-ba-tag m-ba-tb">Before</span><span class="m-ba-tag m-ba-ta">After</span>' +
      '<div class="m-ba-line"><i></i></div></div>' +
      '<figcaption><b>' + S.title + '</b><span>' + S.note + '</span></figcaption>';
    list.appendChild(card);
    var fr = card.querySelector('.m-ba-frame'), va = card.querySelector('.m-ba-a'), vb = card.querySelector('.m-ba-b'), pos = 50, drag = false;
    function set(p){ pos = Math.max(0, Math.min(100, p)); fr.style.setProperty('--p', pos + '%'); fr.setAttribute('aria-valuenow', Math.round(pos)); }
    function at(e){ var r = fr.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); }
    fr.addEventListener('pointerdown', function(e){ drag = true; try { fr.setPointerCapture(e.pointerId); } catch (x) {} at(e); });
    fr.addEventListener('pointermove', function(e){ if (drag) at(e); });
    ['pointerup', 'pointercancel'].forEach(function(ev){ fr.addEventListener(ev, function(){ drag = false; }); });
    fr.addEventListener('keydown', function(e){ if (e.key === 'ArrowLeft') { set(pos - 5); e.preventDefault(); } if (e.key === 'ArrowRight') { set(pos + 5); e.preventDefault(); } });
    // keep the two sides on the same frame
    va.addEventListener('timeupdate', function(){ if (Math.abs(vb.currentTime - va.currentTime) > 0.07) { try { vb.currentTime = va.currentTime; } catch (x) {} } });
    fr.style.aspectRatio = '16 / 9';
    set(50);
    return { fr: fr, va: va, vb: vb };
  });
  // play only while on screen
  function run(it, on){ [it.va, it.vb].forEach(function(v){ if (on) { if (v.preload === 'none') v.preload = 'auto'; var p = v.play(); if (p && p.catch) p.catch(function(){}); } else v.pause(); }); }
  if ('IntersectionObserver' in window) { var io = new IntersectionObserver(function(en){ en.forEach(function(x){ var it = items.filter(function(i){ return i.fr === x.target; })[0]; if (it) run(it, x.isIntersecting); }); }, { threshold: 0.25 });
    items.forEach(function(it){ io.observe(it.fr); }); }
  else items.forEach(function(it){ run(it, true); });
})();

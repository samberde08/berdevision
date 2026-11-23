(function(){
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.work-item'));
  // ---- hover loops ----
  var loops = ['1249151789','1249151605','1249151719','1249151866','1249151733','1249151670','1249151833'];
  tiles.forEach(function(t){
    if (loops.indexOf(t.dataset.vimeo) === -1) return;
    var v = document.createElement('video');
    v.className = 'm-loop'; v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'metadata';
    v.src = 'loops/' + t.dataset.vimeo + '.mp4';
    t.insertBefore(v, t.querySelector('.work-overlay'));
    function on(){ t.classList.add('m-playing'); var p = v.play(); if (p && p.catch) p.catch(function(){}); }
    function off(){ t.classList.remove('m-playing'); v.pause(); }
    t.addEventListener('mouseenter', on); t.addEventListener('mouseleave', off);
    t._mOn = on;
  });
  // ---- hero ----
  var c = document.querySelector('.reel-center');
  if (c) { var s = document.createElement('div'); s.className = 'm-hero-sub'; s.textContent = 'Video + VFX Studio · Dallas'; c.appendChild(s); }
  // ---- player credits ----
  var credits = {
    '1249151789': [['Role','Shot + Edited'],['Artist','Ye'],['Venue','AT&T Stadium, Dallas']],
    '1249151605': [['Role','VFX · SFX · Edit'],['Director / DP','Anthony Crouchelli'],['Brand','Storm Energy']],
    '1249151719': [['Role','VFX'],['Client','Lids x Street Fighter'],['With','Jared Ryder · Daniel Czerni (additional editing)']],
    '1249151866': [['Role','VFX'],['Creative Direction','Luke Abad']],
    '1249151733': [['Role','3D VFX'],['Director','Aficial Visuals'],['VFX Agency','This Was Major'],['EP','David Sosna']],
    '1249151670': [['Role','VFX'],['Director','Kiva Corshen'],['Production','BOUNDARY8'],['Client','Arran Studios']],
    '1249151833': [['Role','Shot · Edited · VFX'],['Artist','Esdeekid']]
  };
  var inner = document.querySelector('.lightbox-inner');
  var panel = document.createElement('div'); panel.className = 'm-credits'; inner.appendChild(panel);
  tiles.forEach(function(t){
    t.addEventListener('click', function(){
      var g = function(s){ var e = t.querySelector(s); return e ? e.textContent : ''; };
      var rows = credits[t.dataset.vimeo] || [['Role','— your role here —']];
      panel.innerHTML = '<div class="m-tag">' + g('.work-tag') + '</div><div class="m-title">' + g('.work-name') + '</div><div class="m-sub">' + g('.work-subtitle') + '</div><dl>' +
        rows.map(function(r){ return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('') + '</dl>';
    }, true);
  });
  // ---- small fixes ----
  document.querySelectorAll('footer p').forEach(function(p){ p.innerHTML = p.innerHTML.replace('2025','2026'); });
})();

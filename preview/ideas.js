// 1) A one-tap way to get in touch that follows the page.
// 2) Idea previews: nothing below changes the page unless it is switched on from the small "Ideas" panel (open the page with ?ideas=1).
(function(){
  var q = new URLSearchParams(location.search), TRY = (q.get('try') || '').split(',').filter(Boolean);
  var has = function(k){ return TRY.indexOf(k) >= 0; };
  window.__TRY = TRY;
  // (Nov 26) Sam: no "Selected" on the wheel; it opens on All. window.__SEL is left unset, so wheel.js adds no Selected chip.

  // ---- hire link (always on) ----
  var hire = document.createElement('a'); hire.className = 'm-hire'; hire.href = 'mailto:samberde@gmail.com?subject=Project%20enquiry';
  hire.innerHTML = '<i aria-hidden="true"></i><span>Available for work</span><b aria-hidden="true">Start a project</b>';
  hire.setAttribute('aria-label', 'Available for work: start a project');
  document.body.appendChild(hire);
  var contact = document.getElementById('contact') || document.querySelector('.contact-grid');
  if (contact && 'IntersectionObserver' in window) new IntersectionObserver(function(en){ hire.classList.toggle('m-off', en[0].isIntersecting); }, { threshold: 0.2 }).observe(contact);
  var lb = document.getElementById('lightbox');
  if (lb && 'MutationObserver' in window) new MutationObserver(function(){ hire.classList.toggle('m-hide', /open|active|show/.test(lb.className)); }).observe(lb, { attributes: true, attributeFilter: ['class'] });

  // ---- idea: say who it is, in the first screen ----
  if (has('who')) {
    var c = document.querySelector('.reel-cta');
    if (c) { var w = document.createElement('p'); w.className = 'm-who'; w.innerHTML = '<b>Sam Berde</b><span>Video + VFX</span>'; c.insertAdjacentElement('afterbegin', w);
      var b = c.querySelector('.btn-reel'); if (b) b.textContent = 'See my work ↓'; }
  }
  // ---- idea: a breakdown reel as the first film on the wheel (DRAFT cut) ----
  if (has('reel')) {
    var strip = document.querySelector('.work-strip');
    if (strip) { var t = document.createElement('div'); t.className = 'work-item'; t.dataset.cat = 'video'; t.dataset.key = 'breakdown'; t.dataset.src = 'films/breakdown_draft.mp4';
      t.innerHTML = '<img src="thumbs/breakdown.jpg?v=1" alt="VFX breakdown reel" style="width:100%;height:100%;object-fit:cover;display:block;"><div class="work-overlay"><p class="work-tag">Reel · 2026</p><p class="work-name">VFX Breakdown</p><p class="work-subtitle">Before and after · draft</p></div>';
      strip.insertBefore(t, strip.firstElementChild); }
  }
  // ---- the before/afters on the home page, under the wheel (approved Nov 26) ----
  window.addEventListener('load', function(){ if (window.__baHome) window.__baHome(); });

  // (the silhouette idea, ?try=sil, lives in collage.js: white cut-outs that fill in as the page scrolls)

  // ---- the panel that switches ideas on and off ----
  if (q.has('ideas') || TRY.length) {
    var IDEAS = [['who', 'Who I am, up top'], ['reel', 'Breakdown reel first (draft)'], ['c3d', '3D collage on About']];
    var p = document.createElement('div'); p.className = 'm-ideas';
    p.innerHTML = '<p>Ideas · preview only</p>' + IDEAS.map(function(i){ return '<label><input type="checkbox" value="' + i[0] + '"' + (has(i[0]) ? ' checked' : '') + '><span>' + i[1] + '</span></label>'; }).join('');
    p.addEventListener('change', function(){ var on = [].slice.call(p.querySelectorAll('input:checked')).map(function(x){ return x.value; });
      var u = new URL(location.href); u.searchParams.set('ideas', '1'); if (on.length) u.searchParams.set('try', on.join(',')); else u.searchParams.delete('try'); location.href = u.toString(); });
    document.body.appendChild(p);
  }
})();

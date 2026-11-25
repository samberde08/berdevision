// Scroll motion for the whole page. Everything here is transform/opacity only, and is switched off for people who ask for reduced motion.
(function(){
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // 1. the hero: as you scroll away, the reel pushes towards you and dissolves, as if you pass through the title into the work
  var v = document.getElementById('reelVideo'), wrap = document.querySelector('.reel-wrap'), cta = document.querySelector('.reel-cta'), raf = 0;
  function hero(){ raf = 0; if (!v || !wrap) return;
    var h = wrap.offsetHeight || 1, p = Math.max(0, Math.min(1, window.scrollY / (h * 0.92)));
    if (p <= 0) { v.style.transform = ''; v.style.opacity = ''; if (cta) cta.style.opacity = ''; return; }
    var e = p * p * (3 - 2 * p);
    v.style.transform = 'scale(' + (1 + 0.34 * e).toFixed(4) + ')'; v.style.opacity = (1 - 0.9 * Math.pow(p, 1.6)).toFixed(3);
    if (cta) cta.style.opacity = Math.max(0, 1 - p * 3).toFixed(3);
  }
  window.addEventListener('scroll', function(){ if (!raf) raf = requestAnimationFrame(hero); }, { passive: true });
  if (v) { v.style.transformOrigin = '50% 46%'; v.style.willChange = 'transform, opacity'; }
  // 2. big titles assemble: each letter drops into place, one after another, when its line arrives
  var titles = Array.prototype.slice.call(document.querySelectorAll('.contact-big, .m-statement span, .m-f-mark span'));
  titles.forEach(function(el){
    if (el.children.length || el.dataset.mAsm) return; var txt = el.textContent; if (!txt || txt.length > 40) return;
    el.dataset.mAsm = '1'; el.setAttribute('aria-label', txt); el.textContent = '';
    txt.split('').forEach(function(ch, i){ var sp = document.createElement('span'); sp.className = 'm-asm'; sp.setAttribute('aria-hidden', 'true');
      sp.textContent = ch === ' ' ? '\u00a0' : ch; sp.style.transitionDelay = (i * 38) + 'ms'; el.appendChild(sp); });
  });
  if ('IntersectionObserver' in window) { var io = new IntersectionObserver(function(en){ en.forEach(function(x){ if (x.isIntersecting) { x.target.classList.add('m-asm-in'); io.unobserve(x.target); } }); }, { threshold: 0.4 });
    titles.forEach(function(el){ if (el.dataset.mAsm) io.observe(el); }); }
  else titles.forEach(function(el){ el.classList.add('m-asm-in'); });
})();

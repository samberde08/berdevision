(function(){
  var ab = document.querySelector('.about-page .about-body'); if (!ab) return;
  var PAD=24;
  // name, x, height, bottom, rotate(deg), z, aspect (w/h of the un-padded cut-out)
  var DESK = {W:1640, H:1100, CX:820, items:[["ai_bear",495,335,540,-6,15,0.508],["ai_kaiju",975,330,540,6,8,0.678],["ai_ye_face",580,490,560,0,14,1.028],["ai_sf_face",292,225,550,-8,12,1.14],["ai_im03",398,215,470,-4,11,0.944],["yachty_portrait",212,275,395,-5,13,0.795],["ai_pegasus",105,250,490,-10,15,1.028],["ai_paige",415,300,395,-4,16,0.637],["ai_danna",615,290,445,-3,18,0.774],["ai_noah",815,310,445,3,18,0.954],["ai_trophy",1112,285,545,8,10,0.652],["storm",1040,250,420,4,16,1.144],["ai_im13",1205,225,420,5,15,0.697],["ai_ye_stance",1250,215,560,7,9,0.84],["ar_guy",1260,190,395,5,17,1.032],["im-12",1285,235,250,6,18,0.709],["ai_im10",1200,260,300,3,18,0.59],["ai_sf_jacket",1335,225,430,9,11,0.614],["esdee",200,370,155,0,23,0.885],["cal",365,320,273,0,26,1.315],["ai_ice",892,440,180,0,27,0.989],["st_ball",725,240,440,0,17,1.143],["es_eye",440,150,262,-6,25,1.416],["arran",1040,250,120,0,28,1.348],["es_dog",585,228,283,0,29,1.941],["ai_cal_shoot",160,320,330,-5,9,0.352],["im-16",95,320,60,-4,20,1.182],["ai_st_serve",70,300,240,-7,8,0.608],["ai_ye_run",-25,235,-8,-6,21,0.891],["im-09",1370,255,235,6,19,0.769],["cal_16",1250,330,20,4,20,1.057],["ai_hoka",1425,280,150,7,8,0.653],["ai_hubbard_small",1540,250,-5,8,21,0.396]],
    earth:{x:-33, h:658, b:-338, R:889, cy:-569, s0:1.35, y0:164},
    type:{lines:['BERDE','VISION'], x0:130, x1:1510, top:1080, bottom:440}};
  var MOB = {W:760, H:1340, CX:380, items:[["ai_pegasus",0,190,930,-10,9,1.028],["ai_bear",40,290,800,-6,8,0.508],["ai_kaiju",560,290,790,6,8,0.678],["ai_ye_face",135,480,600,0,14,1.028],["ai_paige",25,270,590,-4,16,0.637],["yachty_portrait",520,300,500,5,16,0.795],["ai_sf_face",-45,260,400,-8,17,1.14],["ai_danna",135,330,380,-3,18,0.774],["ai_noah",320,340,400,3,18,0.954],["arran",430,260,150,3,28,1.348],["st_ball",250,260,430,0,13,1.143],["esdee",-50,380,165,0,23,0.885],["cal",110,300,235,0,26,1.315],["es_eye",180,100,220,-6,25,1.416],["ai_ice",440,330,265,0,27,0.989],["es_dog",270,150,248,0,29,1.941]],
    earth:{x:-313, h:534, b:-274, R:722, cy:-462, s0:1.5, y0:-30},
    type:{lines:['BERDE','VIS','ION'], x0:40, x1:720, top:1320, bottom:585}};
  // per-letter size jitter (cycled) and tilt: packed, uneven, still readable
  var TJ=[-5,4,-3,6,-4,3,-5,4,-2,5,-4], SJ=[1,.84,1.08,.9,1.12,.86,1.04,.92,1.1,.88,1];   // where each letter ends up once you scroll: tilted, mixed sizes
  var JIT=[1], TILT=[0];   // a clean stacked lockup: every line justified to the same width, tight leading
  var qs = location.search, forceP = (qs.match(/[?&]p=([0-9.]+)/)||[])[1], reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (/[?&]sil=1/.test(qs)) { var ds=document.createElement('style'); ds.textContent='.bvc img.c{filter:brightness(0) invert(1)!important}.bvc .jl,.bvc .stars{display:none!important}.bvc img.earth{filter:brightness(0) invert(.45)!important}'; document.head.appendChild(ds); }
  var wrap = document.createElement('div'); wrap.className='bvc-wrap';
  var stage = document.createElement('div'); stage.className='bvc-stage'; wrap.appendChild(stage);
  var col = document.createElement('div'); col.className='bvc'; stage.appendChild(col);
  var hint = document.createElement('div'); hint.className='bvc-hint'; hint.textContent='Scroll'; stage.appendChild(hint);
  ab.insertBefore(wrap, ab.firstChild);
  for (var a = wrap.parentElement; a && a !== document.body; a = a.parentElement) {
    var o = getComputedStyle(a); if (/(hidden|auto|scroll)/.test(o.overflowX + o.overflowY)) { a.style.overflow = 'clip'; }
  }
  function pageBg(){ for (var e = wrap; e; e = e.parentElement) { var c = getComputedStyle(e).backgroundColor; if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c; } return 'rgb(12,12,13)'; }
  var C=DESK, mobile=false, plates=[], letters=[], earthEl, s=1, pin=0, anchor=8, builtW=-1, mx=0, my=0;
  var meas = document.createElement('canvas').getContext('2d');
  function buildType(){
    // every line is fitted to the full width, so short lines get huge letters and long lines smaller ones;
    // the stacked block is then scaled to fill the sky above the globe
    var T=C.type, boxW=T.x1-T.x0, boxH=T.top-T.bottom, gap=0.02, k=0, rows=[];
    meas.font="800 100px Manrope, 'DM Sans', sans-serif";
    T.lines.forEach(function(line){
      var ch=line.split(''), sc=ch.map(function(){ return JIT[(k++)%JIT.length]; });
      var w100=ch.map(function(c,i){ return meas.measureText(c).width*sc[i]; });
      var F = boxW / (w100.reduce(function(a,b){return a+b;},0)/100 + gap*(ch.length-1));
      rows.push({ch:ch, sc:sc, w100:w100, F:F, h:F*0.72*Math.max.apply(null, sc)});
    });
    var gapY = boxH*0.022, total = rows.reduce(function(a,r){return a+r.h;},0) + gapY*(rows.length-1), fit = Math.min(1, boxH/total);
    var y = T.top - (boxH - total*fit)/2, idx=0;
    rows.forEach(function(r, li){
      var F=r.F*fit, lineH=r.h*fit, lineW = r.w100.reduce(function(a,b){return a+b;},0)/100*F + gap*F*(r.ch.length-1), x = T.x0 + (boxW-lineW)/2;
      y -= lineH;
      r.ch.forEach(function(c,i){
        var fs=F*r.sc[i], cap=fs*0.72, d=document.createElement('div'); d.className='jl'; d.textContent=c;
        var lift = (i%2 ? (lineH-cap) : 0);                      // alternate bottom / top alignment so the sizes interlock
        d.style.cssText='left:'+x+'px;bottom:'+(y+lift)+'px;font-size:'+fs+'px;height:'+cap+'px;z-index:3';
        col.appendChild(d); letters.push({el:d, rot:TJ[idx%TJ.length], sc:SJ[idx%SJ.length], depth:-0.8+0.2*(i%3)}); idx++;
        x += r.w100[i]/100*F + gap*F;
      });
      y -= gapY*fit;
    });
  }
  function build(){
    builtW = wrap.clientWidth; if (!builtW) return;
    mobile = builtW < 720; C = mobile ? MOB : DESK;
    var H=C.H, CX=C.CX, E=C.earth;
    col.innerHTML=''; plates=[]; letters=[];
    col.style.width=C.W+'px'; col.style.height=H+'px'; col.style.marginLeft=(-C.W/2)+'px';
    var stars=document.createElement('div'); stars.className='stars'; stars.style.zIndex=1; col.appendChild(stars);
    buildType();
    // three plates (back / middle / front): each rises as ONE piece, so nobody floats on their own
    var topStart = E.b + E.h*E.s0 - E.y0;                        // where the horizon sits before you scroll
    [[0,10,8],[11,19,15],[20,99,24]].forEach(function(g, gi){
      var p=document.createElement('div'); p.className='plate'; p.style.zIndex=g[2]; col.appendChild(p);
      var maxTop=0;
      C.items.forEach(function(c){
        var inBack = c[0]==='ai_ye_face';                        // Ye leads with the back plate
        var z=c[5]; if (inBack ? gi!==0 : (z<g[0]||z>g[1])) return;
        var im=document.createElement('img'); im.className='c'; im.alt=''; im.decoding='async'; im.src='collage2/'+c[0]+'.webp';
        im.style.cssText='left:'+(c[1]-PAD)+'px;bottom:'+(c[3]-PAD)+'px;height:'+(c[2]+PAD*2)+'px;z-index:'+z+';transform:rotate('+c[4]+'deg)';
        p.appendChild(im); maxTop=Math.max(maxTop, c[3]+c[2]);
      });
      plates.push({el:p, drop: maxTop - Math.min(topStart, 60) + 80, t:0.04, dur:0.82, depth:[-0.6,0.1,0.8][gi]});
    });
    // the whole pyramid rises as ONE piece, so the arrangement (and its overlaps) is identical at every scroll position
    var dmax = Math.max.apply(null, plates.map(function(o){ return o.drop; })); plates.forEach(function(o){ o.drop = dmax; });
    earthEl=document.createElement('img'); earthEl.className='earth'; earthEl.alt=''; earthEl.src='collage2/ye_earth1.webp';
    earthEl.style.cssText='left:'+E.x+'px;bottom:'+E.b+'px;height:'+E.h+'px;z-index:30;transform-origin:50% 100%';
    col.appendChild(earthEl);
    var vh = window.innerHeight; s = Math.min(1, builtW/C.W, (vh - (mobile ? 76 : 20))/H);
    col.style.transform='scale('+s.toFixed(4)+')';
    var sh = H*s;
    anchor = Math.max(mobile ? 62 : 8, Math.round((vh - sh)/2));
    stage.style.top = anchor+'px';
    pin = (reduce || forceP!==undefined) ? 0 : Math.round(Math.min(vh*1.25, 1100));
    stage.style.height=sh+'px'; wrap.style.height=(sh+pin)+'px';
    stage.querySelectorAll('.bvc-fade').forEach(function(f){ f.remove(); });
    var bg = pageBg(), clear = bg.replace('rgb(','rgba(').replace(')',',0)');
    [['left:0;right:0;bottom:0;height:9%','to top'],['left:0;top:0;bottom:0;width:4%','to right'],['right:0;top:0;bottom:0;width:4%','to left']].forEach(function(f){
      var d=document.createElement('div'); d.className='bvc-fade'; d.style.cssText=f[0]+';background:linear-gradient('+f[1]+','+bg+','+clear+')'; stage.appendChild(d); });
    update();
  }
  function ease(t){ t=Math.max(0,Math.min(1,t)); return t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; }
  function update(){
    var prog, E=C.earth;
    if (forceP!==undefined) prog=parseFloat(forceP); else if (reduce || !pin) prog=1; else {
      prog = Math.max(0, Math.min(pin, anchor - wrap.getBoundingClientRect().top))/pin;
    }
    var pe = ease(prog/0.7), es = E.s0 + (1-E.s0)*pe;
    earthEl.style.transform='translate3d('+(mx*8)+'px,'+((1-pe)*E.y0 + my*3)+'px,0) scale('+es.toFixed(4)+')';
    for (var i=0;i<plates.length;i++){ var o=plates[i], u=Math.max(0,Math.min(1,(prog - o.t)/o.dur)), l=1-Math.pow(1-u,2.2);
      o.el.style.transform='translate3d('+(mx*o.depth*16)+'px,'+((1-l)*o.drop + my*o.depth*6)+'px,0)'; }
    var jp = ease(prog/0.45);                                   // the wordmark starts straight and jumbles as you scroll
    for (var j=0;j<letters.length;j++){ var q=letters[j];
      q.el.style.transform='translate3d('+(mx*q.depth*18)+'px,'+(my*q.depth*7)+'px,0) rotate('+(q.rot*jp).toFixed(2)+'deg) scale('+(1+(q.sc-1)*jp).toFixed(3)+')'; }
    hint.style.opacity = prog > 0.06 ? 0 : 1;
  }
  var raf=0; function tick(){ if(raf) return; raf=requestAnimationFrame(function(){ raf=0; update(); }); }
  window.addEventListener('scroll', tick, {passive:true});
  var rt=0; window.addEventListener('resize', function(){ clearTimeout(rt); rt=setTimeout(function(){ if (Math.abs(wrap.clientWidth-builtW) > 2) build(); }, 150); });
  if (window.matchMedia && matchMedia('(hover: hover)').matches) {
    wrap.addEventListener('mousemove', function(e){ var r=stage.getBoundingClientRect(); mx=((e.clientX-r.left)/r.width-0.5)*2; my=((e.clientY-r.top)/r.height-0.5)*2; tick(); });
    wrap.addEventListener('mouseleave', function(){ mx=0; my=0; tick(); });
  }
  var page=document.getElementById('page-about');
  if (page) new MutationObserver(function(){ if (page.classList.contains('active')) build(); }).observe(page, {attributes:true, attributeFilter:['class']});
  build();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ build(); });
  if (/[?&]page=about/.test(qs)) { var a2=document.querySelector('a[data-page="about"]'); if (a2) setTimeout(function(){ a2.click(); setTimeout(function(){ window.scrollTo(0, wrap.getBoundingClientRect().top + window.scrollY - anchor); document.documentElement.setAttribute('data-bvc-ready','1'); }, 900); }, 300); }
})();

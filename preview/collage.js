(function(){
  var ab = document.querySelector('.about-page .about-body'); if (!ab) return;
  var PAD=24;
  // name, x, height, bottom, rotate(deg), z, aspect (w/h of the un-padded cut-out)
  var DESK = {W:1640, H:1190, CX:820, items:[["ai_bear",495,335,540,-6,15,0.508],["ai_kaiju",975,330,540,6,8,0.678],["ai_ye_face",580,490,560,0,14,1.028],["ai_sf_face",292,225,550,-8,12,1.14],["ai_im03",398,215,470,-4,11,0.944],["yachty_portrait",212,275,395,-5,13,0.795],["ai_pegasus",105,250,490,-10,15,1.028],["ai_paige",415,300,395,-4,16,0.637],["ai_danna",615,290,445,-3,18,0.774],["ai_noah",815,310,445,3,18,0.954],["ai_trophy",1112,285,545,8,10,0.652],["storm",1040,250,420,4,16,1.144],["ai_im13",1205,225,420,5,15,0.697],["ai_ye_stance",1250,215,560,7,9,0.84],["ar_guy",1260,190,395,5,17,1.032],["im-12",1285,235,250,6,18,0.709],["ai_im10",1200,260,300,3,18,0.59],["ai_sf_jacket",1335,225,430,9,11,0.614],["esdee",200,370,155,0,23,0.885],["cal",365,320,273,0,26,1.315],["ai_ice",892,440,180,0,27,0.989],["st_ball",725,240,440,0,17,1.143],["es_eye",440,150,262,-6,25,1.416],["arran",1040,250,120,0,28,1.348],["es_dog",585,228,283,0,29,1.941],["ai_cal_shoot",160,320,330,-5,9,0.352],["im-16",95,320,60,-4,20,1.182],["ai_st_serve",70,300,240,-7,8,0.608],["ai_ye_run",-25,235,-8,-6,21,0.891],["im-09",1370,255,235,6,19,0.769],["cal_16",1250,330,20,4,20,1.057],["ai_hoka",1425,280,150,7,8,0.653],["ai_hubbard_small",1540,250,-5,8,21,0.396]],
    earth:{x:-33, h:658, b:-338, R:889, cy:-569, s0:1.35, y0:164},
    type:{lines:['BERDE','VISION'], x0:60, x1:1580, top:1172, bottom:500, end:{lines:['BERDEVISION'], x0:130, x1:1510, top:1168, bottom:1020}}};
  var MOB = {W:760, H:1340, CX:380, items:[["ai_pegasus",0,190,930,-10,9,1.028],["ai_bear",40,290,800,-6,8,0.508],["ai_kaiju",560,290,790,6,8,0.678],["ai_ye_face",135,480,600,0,14,1.028],["ai_paige",25,270,590,-4,16,0.637],["yachty_portrait",520,300,500,5,16,0.795],["ai_sf_face",-45,260,400,-8,17,1.14],["ai_danna",135,330,380,-3,18,0.774],["ai_noah",320,340,400,3,18,0.954],["arran",430,260,150,3,28,1.348],["st_ball",250,260,430,0,13,1.143],["esdee",-50,380,165,0,23,0.885],["cal",110,300,235,0,26,1.315],["es_eye",180,100,220,-6,25,1.416],["ai_ice",440,330,265,0,27,0.989],["es_dog",270,150,248,0,29,1.941]],
    earth:{x:-313, h:534, b:-274, R:722, cy:-462, s0:1.5, y0:-30},
    type:{lines:['BERDE','VISION'], x0:34, x1:726, top:1332, bottom:1000}};   // phone: the whole name on two straight lines above the crowd, only its lower edge tucked behind their heads
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
  if ('IntersectionObserver' in window && !reduce) new IntersectionObserver(function(en, io){ if (en[0].isIntersecting) { stage.classList.add('m-in'); io.disconnect(); } }, { threshold: 0.12 }).observe(wrap);
  else stage.classList.add('m-in');
  for (var a = wrap.parentElement; a && a !== document.body; a = a.parentElement) {
    var o = getComputedStyle(a); if (/(hidden|auto|scroll)/.test(o.overflowX + o.overflowY)) { a.style.overflow = 'clip'; }
  }
  function pageBg(){ for (var e = wrap; e; e = e.parentElement) { var c = getComputedStyle(e).backgroundColor; if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c; } return 'rgb(12,12,13)'; }
  // The entrance (Nov 26, Sam): at first only the BERDEVISION wordmark is there. As the page scrolls, the collage holds in place and the
  // figures arrive left to right, each as a white silhouette that then fills with its picture; the earth comes up under them.
  var SIL = !reduce;
  // (Nov 26, Sam) the hallway: scroll flies down a corridor past every figure toward a white plasma orb; the orb then sinks and
  // becomes the earth, and the figures land on it as the full collage. ?hall=0 shows the earlier entrance.
  var HALL = !reduce && /[?&]hall=1/.test(qs);   // (Nov 26) rejected by Sam; kept only behind ?hall=1 if (HALL) SIL = false;
  var extraEls = null;
  var C=DESK, mobile=false, plates=[], letters=[], cuts=[], dropAll=0, earthEl, s=1, pin=0, anchor=8, builtW=-1, mx=0, my=0;
  var meas = document.createElement('canvas').getContext('2d');
  // (Nov 26, Sam: "vision is cut off") the name opens as two big lines; as the crowd arrives it draws up into ONE line that sits
  // above their heads, so no part of it is hidden. Each letter is laid out twice (start, end) and travels between the two.
  function typeLayout(T){
    var boxW=T.x1-T.x0, boxH=T.top-T.bottom, gap=0.02, rows=[], out=[];
    meas.font="800 100px Manrope, 'DM Sans', sans-serif";
    T.lines.forEach(function(line){
      var ch=line.split(''), w100=ch.map(function(c){ return meas.measureText(c).width; });
      var F = boxW / (w100.reduce(function(a,b){return a+b;},0)/100 + gap*(ch.length-1));
      rows.push({ch:ch, w100:w100, F:F, h:F*0.72});
    });
    var gapY = boxH*0.022, total = rows.reduce(function(a,r){return a+r.h;},0) + gapY*(rows.length-1), fit = Math.min(1, boxH/total);
    var y = T.top - (boxH - total*fit)/2;
    rows.forEach(function(r){
      var F=r.F*fit, lineH=r.h*fit, lineW = r.w100.reduce(function(a,b){return a+b;},0)/100*F + gap*F*(r.ch.length-1), x = T.x0 + (boxW-lineW)/2;
      y -= lineH;
      r.ch.forEach(function(c,i){ out.push({c:c, x:x, y:y, fs:F, cap:F*0.72}); x += r.w100[i]/100*F + gap*F; });
      y -= gapY*fit;
    });
    return out;
  }
  function buildType(){
    var A = typeLayout(C.type), B = C.type.end ? typeLayout(C.type.end) : null;
    A.forEach(function(p, idx){
      var d=document.createElement('div'); d.className='jl'; d.textContent=p.c;
      d.style.cssText='left:'+p.x+'px;bottom:'+p.y+'px;font-size:'+p.fs+'px;height:'+p.cap+'px;z-index:3';
      var q={el:d, rot:TJ[idx%TJ.length], sc:SJ[idx%SJ.length], depth:-0.8+0.2*(idx%3)};
      if (B && B[idx]) { d.style.transformOrigin='0 100%'; q.dx=B[idx].x-p.x; q.dy=p.y-B[idx].y; q.k=B[idx].fs/p.fs; }
      col.appendChild(d); letters.push(q);
    });
  }
  function build(){
    builtW = wrap.clientWidth; if (!builtW) return;
    mobile = builtW < 720; C = mobile ? MOB : DESK;
    var H=C.H, CX=C.CX, E=C.earth;
    col.innerHTML=''; plates=[]; letters=[]; cuts=[];
    col.classList.toggle('shim', !reduce && !HALL);
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
        // each character rises on its own beat: centre first, edges later, with a little swing and its own speed
        var n=cuts.length, cxm=c[1]+c[2]*c[6]/2, jit=((n*37)%11)/11;
        cuts.push({el:im, c:c, gi:gi, rot:c[4], d: inBack ? 0.07 : 0.05 + 0.17*Math.min(1,Math.abs(cxm-CX)/(C.W/2)) + 0.07*jit + gi*0.02,
          dur: 0.5 + 0.16*(((n*53)%7)/7), sw: (n%2 ? 1 : -1)*(4 + 5*jit)});
      });
      plates.push({el:p, drop: maxTop - Math.min(topStart, 60) + 80, t:0.04, dur:0.82, depth:[-0.6,0.1,0.8][gi]});
    });
    // the whole pyramid rises as ONE piece, so the arrangement (and its overlaps) is identical at every scroll position
    var dmax = Math.max.apply(null, plates.map(function(o){ return o.drop; })); plates.forEach(function(o){ o.drop = dmax; }); dropAll = dmax;
    extraEls = null;
    earthEl=document.createElement('img'); earthEl.className='earth'; earthEl.alt=''; earthEl.src='collage2/ye_earth1.webp';
    earthEl.style.cssText='left:'+E.x+'px;bottom:'+E.b+'px;height:'+E.h+'px;z-index:30;transform-origin:50% 100%';
    col.appendChild(earthEl);
    var vh = window.innerHeight; s = Math.min(1, builtW/C.W, (vh - (mobile ? 76 : 20))/H);
    col.style.transform='scale('+s.toFixed(4)+')';
    var sh = H*s;
    anchor = Math.max(mobile ? 62 : 8, Math.round((vh - sh)/2));
    stage.style.top = anchor+'px';
    pin = 0;   // no scroll-driven reveal: Sam rejected the slide-up, the camera pull-back and the point cloud. The collage simply fades in, complete.
    // the collage holds for a short scroll while the figures arrive (see SIL above)
    if (SIL) pin = Math.round(vh * (mobile ? 0.55 : 0.7));
    if (HALL) pin = 0;   // (Nov 26, Sam) the entrance plays by itself when About opens; nothing is tied to scrolling   // (Nov 26, Sam) much shorter
    stage.style.height=sh+'px'; wrap.style.height=(sh+pin)+'px';
    stage.querySelectorAll('.bvc-fade').forEach(function(f){ f.remove(); });
    var bg = pageBg(), clear = bg.replace('rgb(','rgba(').replace(')',',0)');
    [['left:0;right:0;bottom:0;height:9%','to top'],['left:0;top:0;bottom:0;width:4%','to right'],['right:0;top:0;bottom:0;width:4%','to left']].forEach(function(f){
      var d=document.createElement('div'); d.className='bvc-fade'; d.style.cssText=f[0]+';background:linear-gradient('+f[1]+','+bg+','+clear+')'; stage.appendChild(d); });
    pcInit();
    if (HALL) hallInit(sh);
    update();
  }
  function ease(t){ t=Math.max(0,Math.min(1,t)); return t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; }
  // ---- point cloud: every figure is sampled into coloured dots; as you scroll, a turning cloud of dots draws together into the collage ----
  var pc=null, pcCtx=null, pcTok=0, PT=null, pcW=0, pcH=0, pcImg=null, pcBuf=null, pcClear=true;
  function pcInit(){
    var tok=++pcTok; PT=null; if (pc) { pc.remove(); pc=null; }
    if (SIL || reduce || forceP!==undefined || !pin) return;
    var sw=Math.max(2,Math.round(C.W*s)), sh=Math.max(2,Math.round(C.H*s));
    pc=document.createElement('canvas'); pc.className='bvc-pc'; pc.width=sw; pc.height=sh;
    pc.style.cssText='position:absolute;left:50%;top:0;margin-left:'+(-sw/2)+'px;width:'+sw+'px;height:'+sh+'px;z-index:45;pointer-events:none';
    stage.appendChild(pc); pcCtx=pc.getContext('2d'); pcW=sw; pcH=sh; pcImg=pcCtx.createImageData(sw,sh); pcBuf=new Uint32Array(pcImg.data.buffer); pcClear=true;
    var layers=cuts.map(function(q){ return {im:q.el, x:q.c[1]-PAD, b:q.c[3]-PAD, h:q.c[2]+PAD*2, rot:q.c[4], z:q.c[5], oy:0.92}; });
    layers.push({im:earthEl, x:C.earth.x, b:C.earth.b, h:C.earth.h, rot:0, z:31, oy:1});
    layers.sort(function(a,b){ return a.z-b.z; });
    Promise.all(layers.map(function(L){ var im=L.im; return (im.complete && im.naturalWidth) ? 1 : new Promise(function(r){ im.addEventListener('load',r,{once:true}); im.addEventListener('error',r,{once:true}); }); })).then(function(){
      if (tok!==pcTok) return;
      var off=document.createElement('canvas'); off.width=sw; off.height=sh; var g=off.getContext('2d',{willReadFrequently:true});
      var step = sw*sh > 700000 ? 4 : 3, X=[],Y=[],Z=[],Cc=[];
      try {
        layers.forEach(function(L){ var im=L.im; if (!im.naturalWidth) return;
          var hh=L.h*s, ww=hh*im.naturalWidth/im.naturalHeight, left=L.x*s, top=(C.H-L.b-L.h)*s, ox=left+ww/2, oy=top+hh*L.oy, rad=Math.sqrt(ww*ww+hh*hh);
          var x0=Math.max(0,Math.floor((ox-rad)/step)*step), y0=Math.max(0,Math.floor((oy-rad)/step)*step), x1=Math.min(sw,Math.ceil(ox+rad)), y1=Math.min(sh,Math.ceil(oy+rad));
          if (x1-x0<2 || y1-y0<2) return;
          g.clearRect(0,0,sw,sh); g.save(); g.translate(ox,oy); g.rotate(L.rot*Math.PI/180); g.drawImage(im,-ww/2,-hh*L.oy,ww,hh); g.restore();
          var d=g.getImageData(x0,y0,x1-x0,y1-y0).data, w=x1-x0, zz=(L.z-18)*15*s;
          for (var yy=0; yy<y1-y0; yy+=step) for (var xx=0; xx<w; xx+=step) { var o=(yy*w+xx)*4; if (d[o+3]<120) continue;
            X.push(x0+xx); Y.push(y0+yy); Z.push(zz); Cc.push((255<<24)|(d[o+2]<<16)|(d[o+1]<<8)|d[o]); }
        });
      } catch(e) { return; }
      var n=X.length, R=new Float32Array(n*4);
      for (var i=0;i<n;i++){ var u=Math.random()*2-1, th=Math.random()*6.2832, q=Math.sqrt(1-u*u);        // a random direction, and how far out this dot starts
        R[i*4]=q*Math.cos(th); R[i*4+1]=u*0.62; R[i*4+2]=q*Math.sin(th); R[i*4+3]=(0.35+Math.random()*0.75)*Math.max(sw,sh)*0.62; }
      PT={n:n, X:new Float32Array(X), Y:new Float32Array(Y), Z:new Float32Array(Z), C:new Uint32Array(Cc), R:R, step:step};
      update();
    });
  }
  function pcDraw(e){
    if (!PT || !pcBuf) return; pcBuf.fill(0); pcClear=false;
    var n=PT.n, X=PT.X, Y=PT.Y, Z=PT.Z, Cc=PT.C, R=PT.R, k=1-e, kk=k*k*(3-2*k), yaw=kk*1.25, cs=Math.cos(yaw), sn=Math.sin(yaw);
    var cx=pcW/2, cy=pcH*0.52, f=Math.max(pcW,pcH)*1.15, big=e>0.9 ? PT.step : (e>0.6 ? 2 : 1), W=pcW, H=pcH;
    for (var i=0;i<n;i++){ var o=i*4, r=R[o+3]*kk;
      var x=X[i]-cx+R[o]*r, y=Y[i]-cy+R[o+1]*r, z=Z[i]*(0.4+0.6*k)+R[o+2]*r;
      var xr=x*cs - z*sn, zr=x*sn + z*cs, ps=f/(f+zr); if (ps<=0) continue;
      var px=(cx+xr*ps)|0, py=(cy+y*ps)|0; if (px<0||py<0||px>=W-big||py>=H-big) continue;
      var c=Cc[i], p=py*W+px;
      for (var by=0;by<=big;by++) for (var bx=0;bx<=big;bx++) pcBuf[p+by*W+bx]=c; }
    pcCtx.putImageData(pcImg,0,0);
  }
  function update(){
    if (typeof earthEl === 'undefined' || !earthEl) return;        // collage not built yet (home page)
    var prog, E=C.earth;
    if (forceP!==undefined) prog=parseFloat(forceP); else if (reduce || !pin) prog=1; else {
      prog = Math.max(0, Math.min(pin, anchor - wrap.getBoundingClientRect().top))/pin;
    }
    if (HALL && hc) { hallUpdate(forceP!==undefined ? prog : introT); hint.style.opacity = prog > 0.03 ? 0 : 1; reveal(); return; }
    reveal();
    // the figures stand still in their final places; dots gather into them, then the real pictures come up through the dots
    var cloud = !!(pc && PT), dom = cloud ? Math.max(0, Math.min(1, (prog - 0.80)/0.13)) : 1;
    // (idea preview, ?try=c3d) the collage as a diorama: the three layers of figures, the wordmark and the earth sit at real depths,
    // and the whole scene turns a few degrees with the pointer and as it scrolls through the screen
    var D3 = !reduce && window.__TRY && window.__TRY.indexOf('c3d') >= 0, ZS = D3 ? 150 : 0;
    var eo = SIL ? Math.max(0, Math.min(1, (prog - 0.10) / 0.32)) : 1;
    earthEl.style.transform='translate3d('+(mx*8)+'px,'+(my*3)+'px,'+(D3 ? -260 : 0)+'px)'; earthEl.style.opacity=(dom*eo).toFixed(3);
    if (SIL) { if (!extraEls) extraEls = col.querySelectorAll('.atmo, .gshadow'); for (var x9=0;x9<extraEls.length;x9++) extraEls[x9].style.opacity = eo.toFixed(3); }
    for (var i=0;i<plates.length;i++){ var o=plates[i];
      o.el.style.transform='translate3d('+(mx*o.depth*16)+'px,'+(my*o.depth*6)+'px,'+(o.depth*ZS).toFixed(0)+'px)'; }
    for (var k=0;k<cuts.length;k++){ var q2=cuts[k]; q2.el.style.transform='rotate('+q2.rot+'deg)'; q2.el.style.opacity=dom.toFixed(3); }
    if (SIL) for (var k2=0;k2<cuts.length;k2++){ var q3=cuts[k2], el3=q3.el;
      if (q3.xn === undefined) q3.xn = Math.max(0, Math.min(1, (el3.offsetLeft + el3.offsetWidth/2) / Math.max(1, C.W)));
      var t3 = Math.max(0, Math.min(1, (prog - 0.05 - 0.5*q3.xn) / 0.40)), f3;
      el3.style.opacity = Math.min(1, t3 / 0.16).toFixed(3);                             // nothing at first, then the white shape
      if (t3 <= 0.3) f3 = 'brightness(0) invert(1)';                                   // a white cut-out
      else if (t3 >= 1) f3 = 'none';
      else { var u3 = (t3 - 0.3) / 0.7, e3 = u3*u3*(3-2*u3); f3 = 'brightness(' + (1 + 5*(1-e3)*(1-e3)).toFixed(2) + ') saturate(' + e3.toFixed(2) + ')'; }   // then the picture develops out of the white
      if (q3.f !== f3) { q3.f = f3; el3.style.filter = f3; } }
    if (D3) {
      var sr = stage.getBoundingClientRect(), sc3 = Math.max(-1, Math.min(1, ((sr.top + sr.height / 2) - window.innerHeight / 2) / window.innerHeight));
      var hh3 = (sr.height / 2 / s).toFixed(0);
      stage.style.perspective = '1500px'; col.style.transformStyle = 'preserve-3d';
      col.style.transform='scale('+s.toFixed(4)+') translateY('+hh3+'px) rotateY('+(-mx*7 + sc3*7).toFixed(2)+'deg) rotateX('+(my*3.5 - sc3*6).toFixed(2)+'deg) translateY(-'+hh3+'px)';
    } else col.style.transform='scale('+s.toFixed(4)+')';
    if (cloud) { var fadeOut = Math.max(0, Math.min(1, (prog - 0.86)/0.11));
      pc.style.opacity=(1-fadeOut).toFixed(3);
      if (fadeOut < 1) pcDraw(ease(Math.min(1, prog/0.80))); else if (!pcClear) { pcCtx.clearRect(0,0,pcW,pcH); pcClear=true; } }
    var jp = mobile ? 0 : ease(prog/0.45);                                   // the wordmark starts straight and jumbles as you scroll
    for (var j=0;j<letters.length;j++){ var q=letters[j];
      if (q.k !== undefined) q.el.style.transform='translate3d('+(mx*q.depth*18 + q.dx*jp).toFixed(1)+'px,'+(my*q.depth*7 + q.dy*jp).toFixed(1)+'px,'+(q.depth*ZS).toFixed(0)+'px) scale('+(1+(q.k-1)*jp).toFixed(4)+')';
      else q.el.style.transform='translate3d('+(mx*q.depth*18)+'px,'+(my*q.depth*7)+'px,'+(q.depth*ZS).toFixed(0)+'px) rotate('+(q.rot*jp).toFixed(2)+'deg) scale('+(1+(q.sc-1)*jp).toFixed(3)+')'; }
    hint.style.opacity = prog > 0.06 ? 0 : 1;
  }

  // ---------------- the hallway ----------------
  var hc=null, hx=null, orb=null, og=null, OS=320, hallSeq=[], HP=null, orbOn=false, orbT=0, starsEl=null, dpr=1;
  function clamp(v){ return v<0?0:(v>1?1:v); }
  function hallInit(sh){
    if (hc) hc.remove();
    dpr = Math.min(1.5, window.devicePixelRatio || 1);
    hc = document.createElement('canvas'); hc.className='bvc-hall'; hc.width=Math.round(stage.clientWidth*dpr); hc.height=Math.round(sh*dpr);
    hc.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none';
    stage.insertBefore(hc, col); hx = hc.getContext('2d');
    orb = document.createElement('div'); orb.className='bvc-orb'; var oc=document.createElement('canvas'); oc.width=oc.height=OS; orb.appendChild(oc); og=oc.getContext('2d');
    col.appendChild(orb); starsEl = col.querySelector('.stars');
    // corridor measurements, in collage units
    HP = mobile ? {F:900, VY:C.H*0.47, FH:400, CH:520, WW:330, XW:185, HF:560, DZ:560, Z0:1500, RO:150}
                : {F:900, VY:C.H*0.50, FH:340, CH:380, WW:700, XW:430, HF:540, DZ:520, Z0:1500, RO:215};
    // the nearest figure is always drawn on top: front plate first, then down the stacking order
    hallSeq = cuts.slice().sort(function(a,b){ return (b.gi-a.gi) || (b.c[5]-a.c[5]); });
    var hStep = mobile ? 2 : 3, hN = 0;                                    // only some of the cast line the corridor; everyone is in the collage
    hallSeq.forEach(function(q,i){ var c=q.c, eh=c[2]+PAD*2, face=/face|portrait/.test(c[0]);
      q.bx = c[1] + c[2]*c[6]/2; q.by = (C.H - (c[3]-PAD) - eh) + eh*0.92; q.eh = eh;
      if (false) {   // (Nov 26, Sam) corridor cut: nobody lines a hallway any more, the orb goes straight to the earth
         q.hz = HP.Z0 + hN*HP.DZ; q.hs = (hN%2 ? 1 : -1); hN++; } else { q.hz = null; q.hs = 1; } q.hxw = HP.XW*(0.9 + 0.25*(((i*37)%11)/11));
      q.hh = Math.min(face ? HP.HF*0.62 : HP.HF, (mobile ? 300 : 520)/c[6]);   // wide cut-outs are held to a sensible width
      q.hxw = Math.max(q.hxw, q.hh*c[6]/2 + (mobile ? 36 : 100));                 // and nobody stands in front of the orb
      q.hy = face ? HP.FH - HP.HF*0.5 : HP.FH;      // portraits hang at eye level, bodies stand on the floor
      q.rank = Math.min(1, Math.abs(q.bx - C.CX)/(C.W/2)); q.f = null; });
    HP.END = HP.Z0 + (hN-1)*HP.DZ + 140; HP.ZO = HP.END + HP.F;
    orbDraw(orbT);                                   // drawn once straight away, so the orb is never an empty ring
    if (!orbOn) { orbOn = true; requestAnimationFrame(orbLoop); }
  }
  // white plasma: a hot core, slow darker cells and bright moving filaments, drawn small and scaled up
  // white-hot plasma: an over-exposed core, fine turbulent grain that drifts in two layers, convection cells toward the rim, thin arcs
  var OB=[], OFL=[], ON=null; for (var oi=0; oi<22; oi++) OB.push([0.3+0.7*((oi*61)%17)/17, 0.3+0.7*((oi*29)%13)/13, oi*1.7, oi*2.9, 0.09+0.13*((oi*7)%5)/5, 0.45+0.5*((oi*11)%7)/7]);
  for (var oj=0; oj<13; oj++) OFL.push([oj*0.49, 0.4+0.5*((oj*13)%7)/7, 0.2+0.6*((oj*5)%9)/9, oj*2.1]);
  function orbNoise(){ var c=document.createElement('canvas'); c.width=c.height=OS; var g=c.getContext('2d'), sd=7;
    function rnd(){ sd=(sd*16807)%2147483647; return sd/2147483647; }
    g.lineCap='round';                                              // fine wisps, not dots: short curved strokes that follow the sphere
    for (var i=0;i<3200;i++){ var an=rnd()*6.2832, rr=Math.sqrt(rnd())*OS/2, x=OS/2+rr*Math.cos(an), y=OS/2+rr*Math.sin(an), dir=an+1.5708+(rnd()-0.5)*1.4, len=2+rnd()*9, dark=rnd()<0.6;
      g.strokeStyle = dark ? 'rgba(60,100,186,'+(0.05+rnd()*0.13)+')' : 'rgba(255,255,255,'+(0.12+rnd()*0.3)+')'; g.lineWidth=0.4+rnd()*0.9;
      g.beginPath(); g.moveTo(x,y); g.quadraticCurveTo(x+Math.cos(dir+0.5)*len*0.5, y+Math.sin(dir+0.5)*len*0.5, x+Math.cos(dir)*len, y+Math.sin(dir)*len); g.stroke(); }
    return c; }
  function orbDraw(t){
    var g=og, R=OS/2, c=R, i; g.clearRect(0,0,OS,OS); if (!ON) ON=orbNoise();
    var b=g.createRadialGradient(c,c,0,c,c,R); b.addColorStop(0,'#fff'); b.addColorStop(0.62,'#fbfdff'); b.addColorStop(0.86,'#d6e6ff'); b.addColorStop(0.955,'rgba(176,208,255,.9)'); b.addColorStop(1,'rgba(160,198,255,0)');
    g.globalCompositeOperation='source-over'; g.fillStyle=b; g.beginPath(); g.arc(c,c,R,0,6.2832); g.fill();
    g.globalCompositeOperation='source-atop';
    g.save(); g.translate(c,c); g.rotate(t*0.05); g.globalAlpha=0.95; g.drawImage(ON,-R,-R); g.rotate(-t*0.12+1.7); g.scale(1.35,1.35); g.globalAlpha=0.7; g.drawImage(ON,-R,-R); g.restore(); g.globalAlpha=1;
    for (i=0;i<OB.length;i++){ var o=OB[i], rad=R*o[5], x=c+rad*Math.sin(t*0.34*o[0]+o[2]), y=c+rad*Math.cos(t*0.3*o[1]+o[3]), r=R*(o[4]+0.03*Math.sin(t*0.9+i));
      var d=g.createRadialGradient(x,y,0,x,y,r); d.addColorStop(0,'rgba(48,88,176,.36)'); d.addColorStop(0.6,'rgba(64,104,190,.13)'); d.addColorStop(1,'rgba(64,104,190,0)'); g.fillStyle=d; g.fillRect(x-r,y-r,r*2,r*2); }
    g.lineCap='round'; g.shadowColor='#fff'; g.shadowBlur=4;
    for (i=0;i<OFL.length;i++){ var f=OFL[i], a0=f[0]+t*0.16*f[1], a1=a0+1.5+Math.sin(t*0.4+f[3])*0.8;
      g.strokeStyle='rgba(255,255,255,'+(0.5+0.4*Math.sin(t*1.1+f[3]))+')'; g.lineWidth=0.5+0.9*f[2];
      g.beginPath(); g.moveTo(c+R*0.95*Math.cos(a0), c+R*0.95*Math.sin(a0));
      g.bezierCurveTo(c+R*0.62*Math.cos(a0+0.6+0.5*Math.sin(t*0.6+i)), c+R*0.62*Math.sin(a0+0.6+0.5*Math.cos(t*0.5+i)), c+R*0.58*Math.cos(a1-0.6+0.5*Math.cos(t*0.45+i)), c+R*0.58*Math.sin(a1-0.6+0.5*Math.sin(t*0.7+i)), c+R*0.95*Math.cos(a1), c+R*0.95*Math.sin(a1)); g.stroke(); }
    g.shadowBlur=0;
    var h=g.createRadialGradient(c,c,0,c,c,R*0.78); h.addColorStop(0,'rgba(255,255,255,1)'); h.addColorStop(0.45,'rgba(255,255,255,.82)'); h.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=h; g.fillRect(0,0,OS,OS);
    g.globalCompositeOperation='source-over';
  }
  var orbVis=true, orbLast=0;
  function orbLoop(ts){
    requestAnimationFrame(orbLoop);
    if (!orb || !orbVis || ts-orbLast < 40 || document.hidden) return; orbLast=ts;
    var r=stage.getBoundingClientRect(); if (r.bottom < 0 || r.top > window.innerHeight || !r.width) return;
    orbT = ts/1000; orbDraw(orbT);
  }
  function hallDraw(cam, bgA, alpha, orbR){
    var w=hc.width, h=hc.height, sc=s*dpr, cx=w/2, vy=HP.VY*sc, F=HP.F; hx.clearRect(0,0,w,h); if (bgA<=0.004) return;
    hx.fillStyle='rgba(4,6,11,'+(0.96*bgA).toFixed(3)+')'; hx.fillRect(0,0,w,h);          // the corridor is dark, so the orb is the light source
    // light spilling down the corridor from the orb
    var gr=hx.createRadialGradient(cx,vy,0,cx,vy,Math.max(90,orbR*sc*7)); gr.addColorStop(0,'rgba(225,238,255,'+(0.5*bgA)+')'); gr.addColorStop(0.35,'rgba(190,215,255,'+(0.16*bgA)+')'); gr.addColorStop(1,'rgba(210,228,255,0)'); hx.fillStyle=gr; hx.fillRect(0,0,w,h);
    if (alpha<=0.004) return;
    // the four edges of the corridor
    var kn=F/90, ed=[[-1,-HP.CH],[1,-HP.CH],[-1,HP.FH],[1,HP.FH]];
    for (var e=0;e<4;e++){ var x1=cx+ed[e][0]*HP.WW*kn*sc, y1=vy+ed[e][1]*kn*sc, lg=hx.createLinearGradient(x1,y1,cx,vy);
      lg.addColorStop(0,'rgba(215,230,255,0)'); lg.addColorStop(0.75,'rgba(215,230,255,'+(0.2*alpha)+')'); lg.addColorStop(1,'rgba(215,230,255,0)');
      hx.strokeStyle=lg; hx.lineWidth=1*dpr; hx.beginPath(); hx.moveTo(x1,y1); hx.lineTo(cx,vy); hx.stroke(); }
    // frames of light, one between each pair of figures, sliding past as we move
    var DZ=HP.DZ, FAR=DZ*9, z=Math.ceil((cam+70-DZ/2)/DZ)*DZ + DZ/2;
    for (; z < cam+FAR; z+=DZ){ var d=z-cam, k=F/d, a=alpha*clamp(1-d/FAR)*clamp((d-70)/260); if (a<=0.01) continue;
      var rw=HP.WW*k*sc, top=vy-HP.CH*k*sc, bot=vy+HP.FH*k*sc;
      hx.strokeStyle='rgba(220,233,255,'+(0.5*a).toFixed(3)+')'; hx.lineWidth=Math.max(1, 1.6*k*sc); hx.strokeRect(cx-rw, top, rw*2, bot-top);
      hx.strokeStyle='rgba(255,255,255,'+(0.75*a).toFixed(3)+')'; hx.lineWidth=Math.max(1, 3*k*sc); hx.beginPath(); hx.moveTo(cx-rw, bot); hx.lineTo(cx+rw, bot); hx.stroke(); }
  }
  function hallUpdate(prog){
    var hp=0, gp=clamp(prog), it=1, fa=0, F=HP.F, cam=hp*HP.END, E=C.earth, i, q;
    var go = gp*gp*(3-2*gp);
    // the orb: far down the corridor, growing as we approach; then it sinks and swells into the earth
    var k0=F/(HP.ZO-cam), rh=Math.max(mobile?20:28, HP.RO*k0), ie=it*it*(3-2*it), r0=HP.RO*(1.2 + 0.14*ie),   // the orb is there first, close; then it draws away down the corridor
        sinkT=clamp(gp/0.62), se=sinkT*sinkT*(3-2*sinkT);
    var ox=C.CX, oy=HP.VY + ((C.H - E.cy) - HP.VY)*se, orr=r0 + (E.R - r0)*se;
    orb.style.transform='translate3d('+(ox-200).toFixed(1)+'px,'+(oy-200).toFixed(1)+'px,0) scale('+(orr/200).toFixed(4)+')';
    var oo = 1 - clamp((gp-0.5)/0.3); orb.style.opacity=oo.toFixed(3); orb.style.zIndex = gp>0 ? 29 : 2; orbVis = oo>0.01;
    earthEl.style.transform='translate3d('+(mx*8)+'px,'+(my*3)+'px,0)'; earthEl.style.opacity=clamp((gp-0.42)/0.3).toFixed(3);
    introDraw(gp, r0);
    for (i=0;i<plates.length;i++){ var o=plates[i]; o.el.style.transform = gp>=1 ? 'translate3d('+(mx*o.depth*16)+'px,'+(my*o.depth*6)+'px,0)' : 'none'; }
    for (i=0;i<hallSeq.length;i++){ q=hallSeq[i]; var el=q.el, tf, op, fl='none';
      if (gp<=0) {
        var d=q.hz===null ? 0 : q.hz-cam;
        if (d<110 || d>HP.DZ*7.5) { op=0; tf=q.tf||'none'; }
        else { var k=F/d, kk=k*q.hh/q.c[2], sx=C.CX+q.hs*q.hxw*k, sy=HP.VY+q.hy*k;
          tf='translate3d('+(sx-q.bx).toFixed(1)+'px,'+(sy-q.by).toFixed(1)+'px,0) scale('+kk.toFixed(4)+')';
          op=fa*clamp((HP.DZ*7.5-d)/900)*clamp((d-110)/170);
          var br=Math.round(clamp(1-(d-1000)/2000)*10)/10;                         // lit from behind by the orb: a dark shape far away, its own colours up close
          fl = br>=1 ? 'none' : 'brightness('+Math.max(0.2,br)+')'; }
      } else {
        var g=clamp((gp-0.04-0.38*q.rank)/0.5), ge=1-Math.pow(1-g,4), far=1-ge;   // each figure rushes in from behind the camera and brakes into place
        op=clamp(g*5); fl = g>=1 ? 'none' : 'brightness('+(1+Math.round(far*2.4*5)/5)+')';
        if (g>=1) tf='rotate('+q.rot+'deg)';
        else { // a tornado: every figure spirals in around the light, the layers at different rates, each one turning as it comes, then it unwinds into place
          var th=Math.pow(far,1.25)*(2.6+0.95*q.gi), cs=Math.cos(th), sn=Math.sin(th), vx=(q.bx-C.CX)*(1+2.6*far), vy=(q.by-HP.VY)*(1+2.6*far)+120*far;
          tf='translate3d('+(C.CX+vx*cs-vy*sn-q.bx).toFixed(1)+'px,'+(HP.VY+vx*sn+vy*cs-q.by).toFixed(1)+'px,0) scale('+(1+5*far).toFixed(4)+') rotate('+(q.rot*ge+th*38).toFixed(2)+'deg)'; }
      }
      if (q.tf!==tf) { q.tf=tf; el.style.transform=tf; }
      op=op.toFixed(2); if (q.op!==op) { q.op=op; el.style.opacity=op; }
      if (q.f!==fl) { q.f=fl; el.style.filter=fl; }
    }
    var lo=clamp((gp-0.6)/0.34), jp=mobile?0:1;
    for (i=0;i<letters.length;i++){ q=letters[i]; q.el.style.opacity=lo.toFixed(3);
      q.el.style.transform='translate3d('+(mx*q.depth*18)+'px,'+((1-lo)*40+my*q.depth*7).toFixed(1)+'px,0) rotate('+(q.rot*jp).toFixed(2)+'deg) scale('+(1+(q.sc-1)*jp).toFixed(3)+')'; }
    if (starsEl) starsEl.style.opacity=(0.5*lo).toFixed(3);
    col.style.transform='scale('+s.toFixed(4)+')';
  }
  // ---------------- the entrance: it plays once, by itself, each time About opens ----------------
  var introT=1, introRaf=0, introT0=0, IDUR=2300, WS=null;
  function introRun(){
    if (!HALL || forceP!==undefined) return;
    stage.style.transition='none'; stage.classList.add('m-in');             // no slow fade-in: the entrance itself is the reveal
    cancelAnimationFrame(introRaf); introT0=performance.now(); introT=0; update();
    (function step(){ introRaf=requestAnimationFrame(function(now){ introT=clamp((now-introT0)/IDUR); update(); if (introT<1) step(); }); })();
    setTimeout(function(){ if (introT<1 && performance.now()-introT0 > IDUR+900) { cancelAnimationFrame(introRaf); introT=1; update(); } }, IDUR+1000);   // never left half-way
  }
  // light-speed streaks that spiral out of the light, a ring of swirling sparks, and a white flash at the start
  function introDraw(gp, orbR){
    var w=hc.width, h=hc.height, sc=s*dpr, cx=w/2, cy=HP.VY*sc, i; hx.clearRect(0,0,w,h);
    var bgA=1-clamp((gp-0.5)/0.4); if (bgA<=0.004) return;
    hx.globalCompositeOperation='source-over'; hx.fillStyle='rgba(4,6,11,'+(0.96*bgA).toFixed(3)+')'; hx.fillRect(0,0,w,h);
    var gr=hx.createRadialGradient(cx,cy,0,cx,cy,Math.max(w,h)*0.62); gr.addColorStop(0,'rgba(232,242,255,'+(0.62*bgA)+')'); gr.addColorStop(0.3,'rgba(190,215,255,'+(0.2*bgA)+')'); gr.addColorStop(1,'rgba(190,215,255,0)'); hx.fillStyle=gr; hx.fillRect(0,0,w,h);
    var a=clamp(gp/0.06)*(1-clamp((gp-0.5)/0.4)); if (a<=0.004) return;
    if (!WS) { WS=[]; var sd=11; var rnd=function(){ sd=(sd*16807)%2147483647; return sd/2147483647; }; for (i=0;i<230;i++) WS.push([rnd()*6.2832, 0.6+rnd()*0.9, rnd(), rnd(), rnd()<0.5?1:-1]); }
    var maxR=Math.sqrt(w*w+h*h)*0.56, sp=1-0.75*gp;                      // everything brakes as the collage lands
    hx.globalCompositeOperation='lighter'; hx.lineCap='round';
    for (i=0;i<170;i++){ var q=WS[i], u=(gp*2.6*q[1]+q[2])%1, r1=(0.03+u*u*1.05)*maxR, len=(0.02+0.3*u)*maxR*sp, ang=q[0]+0.75*(1-u)*sp;
      hx.strokeStyle='rgba('+(q[3]<0.3?'170,205,255':'255,255,255')+','+(a*(0.15+0.75*u)).toFixed(3)+')'; hx.lineWidth=(0.6+2.2*u*q[3])*dpr;
      hx.beginPath(); hx.moveTo(cx+Math.cos(ang)*r1, cy+Math.sin(ang)*r1); hx.lineTo(cx+Math.cos(ang+0.05*sp)*(r1+len), cy+Math.sin(ang+0.05*sp)*(r1+len)); hx.stroke(); }
    for (i=170;i<WS.length;i++){ var k=WS[i], rr=(0.1+0.5*k[2])*maxR*(1-0.35*gp), an=k[0]+k[4]*(gp*5.5*k[1]), tl=0.5*sp*k[4];
      hx.strokeStyle='rgba(255,255,255,'+(a*(0.35+0.5*k[3])).toFixed(3)+')'; hx.lineWidth=(1+1.6*k[3])*dpr;
      hx.beginPath(); hx.arc(cx, cy, rr, Math.min(an, an-tl), Math.max(an, an-tl)); hx.stroke(); }
    var fl=1-clamp(gp/0.14); if (fl>0) { hx.fillStyle='rgba(255,255,255,'+(0.55*fl).toFixed(3)+')'; hx.fillRect(0,0,w,h); }
    hx.globalCompositeOperation='source-over';
  }
  // ---------------- after the hallway: the statement lights line by line, then the copy and each service arrive in turn ----------------
  var rv=null;
  function reveal(){
    if (reduce) return;
    if (!rv) { rv=[]; var add=function(list, lag){ [].forEach.call(list, function(el,i){ rv.push({el:el, lag:(lag||0)*i, t:-1}); }); };
      add(ab.querySelectorAll('.m-statement > *'), 0.07); add(ab.querySelectorAll(':scope > p'), 0); add(ab.querySelectorAll('.service-item'), 0.09); }
    var vh=window.innerHeight; if (!ab.offsetParent) return;
    for (var i=0;i<rv.length;i++){ var r=rv[i], top=r.el.getBoundingClientRect().top, t=clamp((vh*(0.9-r.lag) - top)/(vh*0.2)); t=Math.round(t*50)/50;
      if (t===r.t) continue; r.t=t; r.el.style.opacity=(0.08+0.92*t).toFixed(2); r.el.style.transform = t>=1 ? 'none' : 'translate3d(0,'+((1-t)*26).toFixed(1)+'px,0)'; }
  }
  // ---------------- the entrance (Nov 26, Sam): we are pulled down a glowing torrent of energy; it gets brighter and brighter, whites out,
  // and clears to the BERDEVISION wordmark. A real fragment shader, so the depth is true perspective, not flat shapes. Scrolling then reveals the collage.
  var TFS = 'precision highp float;uniform vec2 R;uniform float T;uniform float P;'
    + 'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}'
    + 'float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}'
    + 'float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*noise(p);p=p*2.03+vec2(17.,9.);a*=.5;}return s;}'
    + 'vec3 pal(float t){return .55+.45*cos(6.2832*(t+vec3(0.,.33,.67)));}'
    + 'void main(){vec2 uv=(gl_FragCoord.xy-.5*R)/R.y;float r=length(uv),a=atan(uv.y,uv.x);'
    + 'float z=T*.22+P*P*7.5;float tw=T*.12+P*P*3.2;vec3 col=vec3(0.);'
    + 'for(int i=0;i<4;i++){float fi=float(i);float d=(.30+.07*fi)/(r+.015);float ang=a+tw*(.55+.3*fi)+d*(.16+.05*fi);'   // each shell of the torrent sits at its own depth and twists at its own rate
    + 'vec2 c=vec2(cos(ang),sin(ang))*(1.1+.55*fi);float q=d+z*(1.+.45*fi);'
    + 'float n=fbm(vec2(c.x+q*.9,c.y-q*.55)+fi*13.7);float n2=fbm(vec2(c.y*2.+q*1.7,c.x*2.-q)+fi*5.1);'
    + 'float fil=pow(smoothstep(.42,.80,n),2.2)+.55*pow(smoothstep(.55,.9,n2),3.);'
    + 'float depth=smoothstep(.0,.28,r)*(1.-.55*smoothstep(.5,1.3,r));'                                           // dim far down the throat and at the rim: the wall curves away
    + 'col+=pal(n*.55+d*.035+fi*.19+T*.04)*fil*depth*(.5+.28*fi);}'
    + 'float sid=floor((a+3.14159)/6.2832*170.);float h1=hash(vec2(sid,3.));float cell=fract((a+3.14159)/6.2832*170.);'
    + 'float f=fract(log(r+.0001)*.9-z*(.35+.6*h1)+h1*9.);float st=smoothstep(.0,.06,f)*smoothstep(.5,.06,f)*step(.6,h1)*smoothstep(.34,.05,abs(cell-.5))*(.35+.65*hash(vec2(sid,7.)));'
    + 'col+=vec3(.85,.93,1.)*st*smoothstep(.03,.4,r)*(.35+1.3*P);'                                                // sparks streaking past
    + 'float core=.085/(r+.03);col+=vec3(1.,.96,.9)*core*core*(.5+3.2*P*P);'                                      // the light we are being pulled into
    + 'float wr=smoothstep(.52,.9,P);col*=.75+2.2*P*P+18.*wr*wr;col+=vec3(1.,.97,.93)*wr*wr*1.1*smoothstep(1.5,0.,r);col=1.-exp(-col*1.35);'   // it over-exposes: colour blooms to white from the centre out
    + 'col=mix(col,vec3(1.),smoothstep(.82,.92,P));gl_FragColor=vec4(col,1.);}';
  // things from the films fly out of the light and past the camera: each starts tiny down the throat, spirals outward with the torrent, turns, and is gone
  var FLYK=['ai_pegasus','st_ball','ai_trophy','ai_ye_run','ai_bear','es_dog','ai_cal_shoot','ai_kaiju','ai_hoka','ai_st_serve','es_eye','ai_ice','ai_pegasus','st_ball'], fly=null, flyO=[];
  function flyInit(){
    if (fly) return; fly=document.createElement('div'); fly.className='bvc-fly';
    FLYK.forEach(function(k,i){ var im=document.createElement('img'); im.alt=''; im.decoding='async'; im.src='collage2/'+k+'.webp'; fly.appendChild(im);
      flyO.push({el:im, s:0.05+0.6*i/FLYK.length, a:(i*2.39996)%6.2832, spin:(i%2?1:-1)*(0.5+((i*7)%5)/5), big:/ball|eye|trophy/.test(k)?0.6:1, o:''}); });
  }
  function flyFrame(P){
    var W=window.innerWidth, H=window.innerHeight, M=Math.max(W,H), wr=1-clamp((P-0.62)/0.2);
    for (var i=0;i<flyO.length;i++){ var q=flyO[i], u=(P-q.s)/0.2, op;
      if (u<=0 || u>=1 || wr<=0) op='0';
      else { var e=u*u*u, ang=q.a+1.7*u, rad=(0.02+0.92*e)*M*0.62, sc=(0.04+3.4*e)*q.big;
        q.el.style.transform='translate3d('+(Math.cos(ang)*rad).toFixed(1)+'px,'+(Math.sin(ang)*rad).toFixed(1)+'px,0) translate(-50%,-50%) scale('+sc.toFixed(3)+') rotate('+(q.spin*150*u).toFixed(1)+'deg)';
        op=(clamp(u*7)*clamp((1-u)*5)*wr).toFixed(2); }
      if (q.o!==op) { q.o=op; q.el.style.opacity=op; } }
  }
  var tor=null, tgl=null, tprog=null, tU=null, tRaf=0, TDUR=3000, tFast=false;
  function torrentInit(){
    if (tor) return true;
    var c=document.createElement('canvas'); c.className='bvc-torrent';
    var gl=c.getContext('webgl',{antialias:false, alpha:false, powerPreference:'high-performance'}); if (!gl) return false;
    function sh(t,src){ var o=gl.createShader(t); gl.shaderSource(o,src); gl.compileShader(o); return gl.getShaderParameter(o,gl.COMPILE_STATUS) ? o : null; }
    var vs=sh(gl.VERTEX_SHADER,'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'), fs=sh(gl.FRAGMENT_SHADER,TFS); if (!vs||!fs) return false;
    var pr=gl.createProgram(); gl.attachShader(pr,vs); gl.attachShader(pr,fs); gl.linkProgram(pr); if (!gl.getProgramParameter(pr,gl.LINK_STATUS)) return false;
    gl.useProgram(pr); var b=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,b); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    var loc=gl.getAttribLocation(pr,'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    tor=c; tgl=gl; tU={R:gl.getUniformLocation(pr,'R'), T:gl.getUniformLocation(pr,'T'), P:gl.getUniformLocation(pr,'P')}; return true;
  }
  function torrentFrame(P, secs){
    var k=Math.min(1, 900/Math.max(window.innerWidth, window.innerHeight)) * 0.75, w=Math.max(2,Math.round(window.innerWidth*k)), h=Math.max(2,Math.round(window.innerHeight*k));
    if (tor.width!==w || tor.height!==h) { tor.width=w; tor.height=h; tgl.viewport(0,0,w,h); }
    tgl.uniform2f(tU.R,w,h); tgl.uniform1f(tU.T,secs); tgl.uniform1f(tU.P,P); tgl.drawArrays(tgl.TRIANGLES,0,3);
    flyFrame(P);
    tor.style.opacity = P<0.05 ? (P/0.05).toFixed(3) : (P>0.9 ? Math.max(0,(1-P)/0.1).toFixed(3) : '1');
  }
  function torrentRun(){
    if (reduce || HALL) return;
    var fp=(qs.match(/[?&]tp=([0-9.]+)/)||[])[1];
    if (!torrentInit()) return;
    cancelAnimationFrame(tRaf); flyInit(); if (!tor.parentNode) document.body.appendChild(tor); if (!fly.parentNode) document.body.appendChild(fly);
    if (fp!==undefined) { torrentFrame(parseFloat(fp), parseFloat(fp)*TDUR/1000); return; }                     // ?tp=0.5 holds one frame, for checking
    var t0=performance.now(), el=0, last=t0; tFast=false;
    var hurry=function(){ tFast=true; }; window.addEventListener('wheel',hurry,{passive:true,once:true}); window.addEventListener('touchmove',hurry,{passive:true,once:true}); window.addEventListener('keydown',hurry,{once:true});
    (function step(){ tRaf=requestAnimationFrame(function(now){ el+=(now-last)*(tFast?5:1); last=now; var P=Math.min(1,el/TDUR);
      torrentFrame(P, (now-t0)/1000);
      if (P<1 && page && page.classList.contains('active')) step(); else { if (tor.parentNode) tor.parentNode.removeChild(tor); if (fly.parentNode) fly.parentNode.removeChild(fly); } }); })();   // anyone who starts scrolling is let through quickly
  }
  var raf=0; function tick(){ if(raf) return; raf=requestAnimationFrame(function(){ raf=0; update(); }); }
  window.addEventListener('scroll', tick, {passive:true});
  var rt=0; window.addEventListener('resize', function(){ clearTimeout(rt); rt=setTimeout(function(){ if (Math.abs(wrap.clientWidth-builtW) > 2) build(); }, 150); });
  if (window.matchMedia && matchMedia('(hover: hover)').matches) {
    wrap.addEventListener('mousemove', function(e){ var r=stage.getBoundingClientRect(); mx=((e.clientX-r.left)/r.width-0.5)*2; my=((e.clientY-r.top)/r.height-0.5)*2; tick(); });
    wrap.addEventListener('mouseleave', function(){ mx=0; my=0; tick(); });
  }
  var page=document.getElementById('page-about');
  if (page) new MutationObserver(function(){ if (page.classList.contains('active')) { build(); introRun(); if (/[?&]torrent=1/.test(qs)) torrentRun(); } }).observe(page, {attributes:true, attributeFilter:['class']});
  build();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ build(); });
  if (/[?&]page=about/.test(qs)) { var a2=document.querySelector('a[data-page="about"]'); if (a2) setTimeout(function(){ a2.click(); setTimeout(function(){ window.scrollTo(0, wrap.getBoundingClientRect().top + window.scrollY - anchor); document.documentElement.setAttribute('data-bvc-ready','1'); }, 900); }, 300); }
})();

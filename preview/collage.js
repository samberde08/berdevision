(function(){
  var ab = document.querySelector('.about-page .about-body'); if (!ab) return;
  var W=1640, H=1100, CX=820, PAD=24;
  // name, x, height, bottom, rotate(deg), z, aspect (w/h of the un-padded cut-out)
  var ITEMS = [["ai_bear",448,335,540,-6,8,0.508],["ai_kaiju",995,330,540,6,8,0.678],["ai_ye_face",592,465,595,0,14,1.028],["ai_sf_face",292,225,550,-8,12,1.14],["ai_im03",398,215,510,-4,11,0.944],["yachty_portrait",228,250,402,-5,13,0.795],["ai_pegasus",112,235,512,-10,15,1.028],["ai_paige",462,255,430,-4,16,0.637],["ai_danna",625,265,440,-3,18,0.774],["ai_noah",800,280,440,3,18,0.954],["ai_trophy",1112,285,545,8,10,0.652],["storm",1040,250,420,4,16,1.144],["ai_im13",1205,225,420,5,15,0.697],["ai_ye_stance",1250,215,560,7,9,0.84],["ar_guy",1260,190,395,5,17,1.032],["im-12",1285,235,285,6,15,0.709],["ai_im10",1200,260,300,3,13,0.59],["ai_sf_jacket",1328,190,425,9,11,0.614],["esdee",215,360,155,0,23,0.885],["cal",365,320,273,0,26,1.315],["ai_ice",892,440,180,0,27,0.989],["st_ball",738,165,500,0,17,1.143],["es_eye",452,125,262,-6,25,1.416],["arran",1078,250,213,0,28,1.348],["es_dog",600,228,283,0,29,1.941],["ai_cal_shoot",128,285,262,-5,9,0.352],["im-16",62,265,40,-4,20,1.182],["ai_st_serve",10,245,150,-7,8,0.608],["ai_ye_run",-12,195,15,-6,21,0.891],["im-09",1408,225,265,6,9,0.769],["cal_16",1335,265,15,4,20,1.057],["ai_hoka",1488,235,145,7,8,0.653],["ai_hubbard_small",1562,205,5,8,21,0.396]];
  var EARTH = {x:-33, h:640, b:-320, R:889, cy:-569};
  var LET = [['B',95,800,-14,250],['E',255,905,9,205],['R',385,770,-6,235],['D',535,890,16,215],['E',680,965,-10,190],['V',795,835,8,255],['I',975,930,-7,205],['S',1040,800,12,240],['I',1195,915,-7,200],['O',1280,780,15,235],['N',1430,880,-11,250]];
  var DESK = {W:1640, H:1100, CX:820, items:ITEMS, earth:EARTH, letters:LET};
  var MOB = {W:760, H:1340, CX:380, items:[["ai_pegasus",-15,200,960,-10,9,1.028],["ai_bear",40,300,800,-6,8,0.508],["ai_kaiju",525,300,800,6,8,0.678],["ai_trophy",590,235,905,8,7,0.652],["ai_ye_face",150,450,640,0,14,1.028],["ai_paige",40,245,590,-4,16,0.637],["yachty_portrait",568,220,715,5,13,0.795],["ai_sf_face",-25,190,440,-8,15,1.14],["arran",455,195,485,3,19,1.348],["ai_danna",195,260,415,-3,18,0.774],["ai_noah",365,270,415,3,18,0.954],["st_ball",300,150,470,0,17,1.143],["esdee",-25,300,150,0,23,0.885],["cal",40,285,222,0,26,1.315],["es_eye",95,95,215,-6,25,1.416],["ai_ice",440,325,165,0,27,0.989],["es_dog",235,150,250,0,29,1.941]], earth:{x:-313, h:520, b:-260, R:722, cy:-462},
    letters:[['B',20,1165,-12,150],['E',150,1215,8,130],['R',270,1150,-6,150],['D',410,1205,14,140],['E',545,1160,-9,135],['V',5,1000,7,150],['I',125,1045,-8,125],['S',185,975,12,150],['I',505,1050,-7,125],['O',565,985,15,150],['N',640,1040,-11,140]]};
  var C = DESK;
  var qs = location.search, forceP = (qs.match(/[?&]p=([0-9.]+)/)||[])[1], reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wrap = document.createElement('div'); wrap.className='bvc-wrap';
  var stage = document.createElement('div'); stage.className='bvc-stage'; wrap.appendChild(stage);
  var col = document.createElement('div'); col.className='bvc'; stage.appendChild(col);
  var hint = document.createElement('div'); hint.className='bvc-hint'; hint.textContent='Scroll'; stage.appendChild(hint);
  ab.insertBefore(wrap, ab.firstChild);
  // sticky needs no clipping ancestors: turn overflow:hidden into overflow:clip on the way up
  for (var a = wrap.parentElement; a && a !== document.body; a = a.parentElement) {
    var o = getComputedStyle(a); if (/(hidden|auto|scroll)/.test(o.overflowX + o.overflowY)) { a.style.overflow = 'clip'; }
  }
  function pageBg(){ for (var e = wrap; e; e = e.parentElement) { var c = getComputedStyle(e).backgroundColor; if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c; } return 'rgb(12,12,13)'; }
  var curH=H, mobile=false, offX=0, cw=W, els=[], letters=[], earthEl, s=1, pin=0, anchor=8, builtW=-1, mx=0, my=0;
  function build(){
    builtW = wrap.clientWidth; if (!builtW) return;
    mobile = builtW < 720; C = mobile ? MOB : DESK; offX = 0; cw = C.W; var H = C.H, CX = C.CX, EARTH = C.earth; curH = H;
    col.innerHTML=''; els=[]; letters=[];
    col.style.width=cw+'px'; col.style.height=H+'px'; col.style.marginLeft=(-cw/2)+'px';
    var cxm = CX-offX;
    var stars=document.createElement('div'); stars.className='stars'; stars.style.zIndex=1; col.appendChild(stars);
    C.letters.forEach(function(L,i){
      var d=document.createElement('div'); d.className='jl'; d.textContent=L[0];
      d.style.cssText='left:'+L[1]+'px;bottom:'+(L[2]-40)+'px;font-size:'+L[4]+'px;z-index:'+(3+(i%2));
      col.appendChild(d); letters.push({el:d, rot:L[3], k:(i%3)-1, depth:-0.9+0.25*(i%3)});
    });
    var list = C.items;
    var ranked = list.map(function(c){ var cx=c[1]+c[2]*c[6]/2; return {c:c, d:Math.abs(cx-CX)/CX, cx:cx}; });
    var order = ranked.slice().sort(function(a,b){ return a.d-b.d; });
    ranked.forEach(function(o){
      var c=o.c, im=document.createElement('img'); im.className='c'; im.alt=''; im.decoding='async'; im.src='collage2/'+c[0]+'.png';
      im.style.cssText='left:'+(c[1]-PAD-offX)+'px;bottom:'+(c[3]-PAD)+'px;height:'+(c[2]+PAD*2)+'px;z-index:'+c[5];
      col.appendChild(im);
      var rank = order.indexOf(o)/(Math.max(1,order.length-1));
      var dx = o.cx-CX, hz = Math.abs(dx) < EARTH.R ? EARTH.cy + Math.sqrt(EARTH.R*EARTH.R - dx*dx) : -60;
      var drop = Math.max(90, (c[3]+c[2]) - Math.max(hz,-60) + 70);
      var ye = c[0]==='ai_ye_face';
      els.push({el:im, rot:c[4], t: ye ? 0.04 : 0.08 + 0.42*rank, dur: ye ? 0.62 : 0.42, drop:drop, depth:(c[5]-16)/14});
    });
    earthEl=document.createElement('img'); earthEl.className='earth'; earthEl.alt=''; earthEl.src='collage2/ye_earth1.png';
    earthEl.style.cssText='left:'+(EARTH.x-offX)+'px;bottom:'+EARTH.b+'px;height:'+EARTH.h+'px;z-index:30;transform-origin:50% calc(100% + '+(EARTH.b-EARTH.cy)+'px)';
    col.appendChild(earthEl);
    ['gshadow','atmo'].forEach(function(k){ var d=document.createElement('div'); d.className=k; d.style.cssText='width:'+(EARTH.R*2)+'px;height:'+(EARTH.R*2)+'px;left:'+(cxm-EARTH.R)+'px;bottom:'+(EARTH.cy-EARTH.R)+'px;z-index:31'; col.appendChild(d); });
    var vh = window.innerHeight; s = Math.min(1, builtW/cw, (vh - (mobile ? 76 : 20))/H);
    col.style.transform='scale('+s.toFixed(4)+')';
    var sh = H*s;
    anchor = Math.max(mobile ? 62 : 8, Math.round((vh - sh)/2));
    stage.style.top = anchor+'px';
    pin = (reduce || forceP!==undefined) ? 0 : Math.round(Math.min(vh*1.1, 950));
    stage.style.height=sh+'px'; wrap.style.height=(sh+pin)+'px';
    // soft edges without masks: plain gradients in the page colour
    stage.querySelectorAll('.bvc-fade').forEach(function(f){ f.remove(); });
    var bg = pageBg(), clear = bg.replace('rgb(','rgba(').replace(')',',0)');
    [['left:0;right:0;bottom:0;height:11%','to top'],['left:0;top:0;bottom:0;width:5%','to right'],['right:0;top:0;bottom:0;width:5%','to left'],['left:0;right:0;top:0;height:5%','to bottom']].forEach(function(f){
      var d=document.createElement('div'); d.className='bvc-fade'; d.style.cssText=f[0]+';background:linear-gradient('+f[1]+','+bg+','+clear+')'; stage.appendChild(d); });
    update();
  }
  function ease(t){ t=Math.max(0,Math.min(1,t)); return 1-Math.pow(1-t,3); }
  function update(){
    var prog;
    if (forceP!==undefined) prog=parseFloat(forceP); else if (reduce || !pin) prog=1; else {
      var moved = Math.max(0, Math.min(pin, anchor - wrap.getBoundingClientRect().top));
      prog = 0.1 + 0.9*(moved/pin);
    }
    var pe = ease(prog/0.42);
    earthEl.style.transform='translate3d('+(mx*10)+'px,'+((1-pe)*190 + my*4)+'px,0) rotate('+((1-pe)*-32)+'deg)';
    for (var i=0;i<els.length;i++){ var o=els[i], l=ease((prog - o.t)/o.dur);
      o.el.style.transform='translate3d('+(mx*o.depth*22)+'px,'+((1-l)*o.drop + my*o.depth*9)+'px,0) rotate('+(o.rot + (1-l)*o.rot*0.6)+'deg) scale('+(0.92+0.08*l)+')'; }
    for (var j=0;j<letters.length;j++){ var q=letters[j];
      q.el.style.transform='translate3d('+(mx*q.depth*26)+'px,'+(my*q.depth*10 - prog*26*q.k)+'px,0) rotate('+(q.rot + (1-prog)*q.k*5)+'deg)'; }
    hint.style.opacity = prog > 0.28 ? 0 : 1;
  }
  var raf=0; function tick(){ if(raf) return; raf=requestAnimationFrame(function(){ raf=0; update(); }); }
  window.addEventListener('scroll', tick, {passive:true});
  // phones fire resize when the address bar hides: only rebuild when the WIDTH really changes
  var rt=0; window.addEventListener('resize', function(){ clearTimeout(rt); rt=setTimeout(function(){ if (Math.abs(wrap.clientWidth-builtW) > 2) build(); }, 150); });
  if (window.matchMedia && matchMedia('(hover: hover)').matches) {
    wrap.addEventListener('mousemove', function(e){ var r=stage.getBoundingClientRect(); mx=((e.clientX-r.left)/r.width-0.5)*2; my=((e.clientY-r.top)/r.height-0.5)*2; tick(); });
    wrap.addEventListener('mouseleave', function(){ mx=0; my=0; tick(); });
  }
  var page=document.getElementById('page-about');
  if (page) new MutationObserver(function(){ if (page.classList.contains('active')) build(); }).observe(page, {attributes:true, attributeFilter:['class']});
  build();
  if (/[?&]page=about/.test(qs)) { var a2=document.querySelector('a[data-page="about"]'); if (a2) setTimeout(function(){ a2.click(); setTimeout(function(){ window.scrollTo(0, wrap.getBoundingClientRect().top + window.scrollY - anchor); document.documentElement.setAttribute('data-bvc-ready','1'); }, 900); }, 300); }
})();

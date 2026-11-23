(function(){
  var ab = document.querySelector('.about-page .about-body'); if (!ab) return;
  var V='saturate(1.2) contrast(1.1)', BW='contrast(1.18) brightness(1.06)', N='saturate(1.05) contrast(1.05)', T='saturate(.92) contrast(1.05)';
  var W=1640, H=1100, CX=820;
  // file, x, height, bottom, rotate(deg), z, class, base filter, aspect (w/h)
  var ITEMS = [
    ['ai_bear',448,335,540,-6,8,'',N,.51], ['ai_kaiju',995,330,540,6,8,'',N,.68],
    ['ai_ye_face',592,465,595,0,14,'fadeb','contrast(1.08) brightness(1.04)',1.03],
    ['ai_sf_face',292,225,550,-8,12,'',T,1.14], ['ai_im03',398,215,510,-4,11,'',BW,.94],
    ['yachty_portrait',228,250,402,-5,13,'',N,.8], ['ai_pegasus',112,235,512,-10,15,'',N,1.03],
    ['ai_paige',462,255,430,-4,16,'',N,.64], ['ai_danna',625,265,440,-3,18,'',N,.77], ['ai_noah',800,280,440,3,18,'',N,.95],
    ['ai_trophy',1112,285,545,8,10,'',N,.65], ['storm',1040,250,420,4,16,'',BW,1.14], ['ai_im13',1205,225,420,5,15,'',V,.7],
    ['ai_ye_stance',1250,215,560,7,9,'',V,.84], ['ar_guy',1260,190,395,5,17,'',V,1.03], ['im-12',1285,235,285,6,15,'',BW,.71],
    ['ai_im10',1200,260,300,3,13,'',BW,.59], ['ai_sf_jacket',1328,190,425,9,11,'',T,.61],
    ['esdee',215,360,155,0,23,'','contrast(1.15) brightness(1.2)',.885], ['cal',365,320,273,0,26,'',V,1.31], ['ai_ice',892,440,180,0,27,'',V,.99],
    ['st_ball',738,165,500,0,17,'',BW,1.07], ['es_eye',452,125,262,-6,25,'',N,1.42], ['arran',1078,250,213,0,28,'',N,1.35],
    ['es_dog',600,228,283,0,29,'','contrast(1.12) brightness(1.18)',1.94],
    ['ai_cal_shoot',128,285,262,-5,9,'',V,.35], ['im-16',62,265,40,-4,20,'',V,1.18], ['ai_st_serve',10,245,150,-7,8,'',BW,.61], ['ai_ye_run',-12,195,15,-6,21,'',V,.89],
    ['im-09',1408,225,265,6,9,'',V,.77], ['cal_16',1335,265,15,4,20,'',V,1.06], ['ai_hoka',1488,235,145,7,8,'',V,.65], ['ai_hubbard_small',1562,205,5,8,21,'',V,.4]
  ];
  var EARTH = {x:-33, h:640, b:-320, w:1707, R:889, cy:-569};
  var qs = location.search, forceP = (qs.match(/[?&]p=([0-9.]+)/)||[])[1], reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wrap = document.createElement('div'); wrap.className='bvc-wrap';
  var stage = document.createElement('div'); stage.className='bvc-stage'; wrap.appendChild(stage);
  var col = document.createElement('div'); col.className='bvc'; stage.appendChild(col);
  var hint = document.createElement('div'); hint.className='bvc-hint'; hint.textContent='Scroll'; stage.appendChild(hint);
  ab.insertBefore(wrap, ab.firstChild);
  var mobile=false, offX=0, cw=W, els=[], letters=[], earthEl, s=1, pin=0;
  function build(){
    mobile = wrap.clientWidth < 720; offX = mobile ? 300 : 0; cw = mobile ? 1040 : W;
    col.innerHTML=''; els=[];
    col.style.width=cw+'px'; col.style.height=H+'px'; col.style.marginLeft=(-cw/2)+'px';
    var cxm = CX-offX;
    var stars=document.createElement('div'); stars.className='stars'; stars.style.zIndex=1; col.appendChild(stars);
    // jumbled wordmark: each letter is its own tilted, offset paper cut-out scattered across the sky
    var LET = [['B',95,800,-14,250],['E',255,905,9,205],['R',385,770,-6,235],['D',535,890,16,215],['E',680,965,-10,190],['V',795,835,8,255],['I',975,930,-7,205],['S',1040,800,12,240],['I',1195,915,-7,200],['O',1280,780,15,235],['N',1430,880,-11,250]];
    letters=[];
    LET.forEach(function(L,i){
      var d=document.createElement('div'); d.className='jl'; d.textContent=L[0];
      var x = mobile ? 20 + (L[1]-95)*(880/1335) : L[1], fs = mobile ? L[4]*0.74 : L[4];
      d.style.cssText='left:'+x+'px;bottom:'+(L[2]-(mobile?95:40))+'px;font-size:'+fs+'px;z-index:'+(3+(i%2));
      col.appendChild(d); letters.push({el:d, rot:L[3], k:(i%3)-1, depth:-0.9+0.25*(i%3)});
    });
    var list = ITEMS.filter(function(c){ if(!mobile) return true; var cx=c[1]+c[2]*c[8]/2; return cx>330 && cx<1310; });
    var ranked = list.map(function(c){ var cx=c[1]+c[2]*c[8]/2; return {c:c, d:Math.abs(cx-CX)/CX}; });
    var order = ranked.slice().sort(function(a,b){ return a.d-b.d; });
    ranked.forEach(function(o){
      var c=o.c, im=document.createElement('img'); im.className='c '+c[6]; im.alt=''; im.src='collage/'+c[0]+'.png';
      var br = (1.1 - 0.34*Math.min(1,o.d)).toFixed(3);
      var back = c[5] <= 10 ? ' blur(1px) brightness(.9) saturate(.92)' : (c[5] <= 13 ? ' blur(.35px)' : '');
      // paper cut-out: thin light edge, a tight contact shadow, then a soft cast shadow
      var paper = ' drop-shadow(0 0 1.1px rgba(255,250,240,.9)) drop-shadow(0 6px 4px rgba(0,0,0,.6)) drop-shadow(0 20px 24px rgba(0,0,0,.5))';
      im.style.cssText='left:'+(c[1]-offX)+'px;bottom:'+c[3]+'px;height:'+c[2]+'px;z-index:'+c[5]+';filter:'+c[7]+' brightness('+br+')'+back+paper;
      col.appendChild(im);
      var rank = order.indexOf(o)/(Math.max(1,order.length-1));
      var xc = c[1]+c[2]*c[8]/2, dx = xc-CX, hz = Math.abs(dx) < EARTH.R ? EARTH.cy + Math.sqrt(EARTH.R*EARTH.R - dx*dx) : -60;
      var drop = Math.max(90, (c[3]+c[2]) - Math.max(hz,-60) + 70);   // how far down it starts: fully behind the globe
      var ye = c[0]==='ai_ye_face';
      els.push({el:im, rot:c[4], t: ye ? 0.04 : 0.08 + 0.42*rank, dur: ye ? 0.62 : 0.42, drop:drop, depth:(c[5]-16)/14});
    });
    earthEl=document.createElement('img'); earthEl.className='earth'; earthEl.alt=''; earthEl.src='collage/ye_earth1.png';
    earthEl.style.cssText='left:'+(EARTH.x-offX)+'px;bottom:'+EARTH.b+'px;height:'+EARTH.h+'px;z-index:30;transform-origin:50% calc(100% + '+(EARTH.b-EARTH.cy)+'px)';
    col.appendChild(earthEl);
    var gs=document.createElement('div'); gs.className='gshadow'; gs.style.cssText='width:'+(EARTH.R*2)+'px;height:'+(EARTH.R*2)+'px;left:'+(cxm-EARTH.R)+'px;bottom:'+(EARTH.cy-EARTH.R)+'px;z-index:31'; col.appendChild(gs);
    var atmo=document.createElement('div'); atmo.className='atmo'; atmo.style.cssText='width:'+(EARTH.R*2)+'px;height:'+(EARTH.R*2)+'px;left:'+(cxm-EARTH.R)+'px;bottom:'+(EARTH.cy-EARTH.R)+'px;z-index:31'; col.appendChild(atmo);
    ['grade','grain'].forEach(function(k,i){ var d=document.createElement('div'); d.className=k; d.style.zIndex=40+i; col.appendChild(d); });
    s = Math.min(1, wrap.clientWidth/cw);
    col.style.transform='scale('+s.toFixed(4)+')';
    pin = (reduce || forceP) ? 0 : Math.round(Math.min(window.innerHeight*1.15, 950));
    stage.style.height=(H*s)+'px'; wrap.style.height=(H*s+pin)+'px';
    update();
  }
  function ease(t){ t=Math.max(0,Math.min(1,t)); return 1-Math.pow(1-t,3); }
  var mx=0, my=0;
  function update(){
    var prog;
    if (forceP!==undefined) prog=parseFloat(forceP); else if (reduce) prog=1; else {
      var top = wrap.getBoundingClientRect().top, anchor = Math.max(8, (window.innerHeight - H*s)/2);
      var moved = Math.max(0, Math.min(pin, anchor - top));
      stage.style.transform='translateY('+moved+'px)';
      prog = pin ? 0.1 + 0.9*(moved/pin) : 1;
    }
    var pe = ease(prog/0.42);
    earthEl.style.transform='translate('+(mx*10)+'px,'+((1-pe)*190 + my*4)+'px) rotate('+((1-pe)*-32)+'deg)';
    els.forEach(function(o){
      var l = ease((prog - o.t)/o.dur);
      var px = mx*o.depth*22, py = my*o.depth*9;
      // everything rises out from behind the globe on the same path, standing up as it comes
      o.el.style.transform = 'translate('+px+'px,'+((1-l)*o.drop + py)+'px) perspective(1100px) rotateX('+((1-l)*-26)+'deg) rotate('+o.rot+'deg) scale('+(0.94+0.06*l)+')';
    });
    letters.forEach(function(o){ o.el.style.transform='translate('+(mx*o.depth*26)+'px,'+(my*o.depth*10 - prog*26*o.k)+'px) rotate('+(o.rot + (1-prog)*o.k*5)+'deg)'; });
    hint.style.opacity = prog > 0.28 ? 0 : 1;
  }
  var raf=0; function onScroll(){ if(raf) return; raf=requestAnimationFrame(function(){ raf=0; update(); }); }
  window.addEventListener('scroll', onScroll, {passive:true});
  wrap.addEventListener('mousemove', function(e){ var r=wrap.getBoundingClientRect(); mx=((e.clientX-r.left)/r.width-0.5)*2; my=((e.clientY-r.top)/Math.max(1,H*s)-0.5)*2; onScroll(); });
  wrap.addEventListener('mouseleave', function(){ mx=0; my=0; onScroll(); });
  var rt=0; window.addEventListener('resize', function(){ clearTimeout(rt); rt=setTimeout(build, 120); });
  var page=document.getElementById('page-about');
  if (page) new MutationObserver(function(){ if (page.classList.contains('active')) build(); }).observe(page, {attributes:true, attributeFilter:['class']});
  build();
  if (/[?&]page=about/.test(qs)) { var a=document.querySelector('a[data-page="about"]'); if (a) setTimeout(function(){ a.click(); setTimeout(function(){ window.scrollTo(0, wrap.getBoundingClientRect().top + window.scrollY - 8); document.documentElement.setAttribute('data-bvc-ready','1'); }, 900); }, 300); }
})();

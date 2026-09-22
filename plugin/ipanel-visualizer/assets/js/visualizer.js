(function(){
const FIN=[
  {slug:'rich-brown',name:'Rich Brown'},
  {slug:'rich-teak',name:'Rich Teak'},
  {slug:'rich-maple',name:'Rich Maple'},
  {slug:'gray-marble',name:'Gray Marble'},
  {slug:'black-marble',name:'Black Marble'}
];
const TEX='/wp-content/uploads/ipanel-ar/textures/';
const TL=1.215, TH=0.30, EFF=0.29, PER_BOX=10;

function ev(n,o){
  const p=Object.assign({event:n,ab:window.__rv_ab||''},o||{});
  (window.dataLayer=window.dataLayer||[]).push(p);
  if(window.gtag){window.gtag('event',n,p);}
}

function solve8(A,b){
  for(let i=0;i<8;i++){
    let p=i;
    for(let r=i+1;r<8;r++) if(Math.abs(A[r][i])>Math.abs(A[p][i])) p=r;
    [A[i],A[p]]=[A[p],A[i]];
    const t=b[i]; b[i]=b[p]; b[p]=t;
    const pv=A[i][i]||1e-12;
    for(let r=0;r<8;r++){
      if(r===i) continue;
      const f=A[r][i]/pv;
      for(let c=i;c<8;c++) A[r][c]-=f*A[i][c];
      b[r]-=f*b[i];
    }
  }
  return b.map((v,i)=>v/(A[i][i]||1e-12));
}

function ring(C,W,H){
  const px=C.map(c=>[c[0]*W,c[1]*H]);
  const cx=px.reduce((s,p)=>s+p[0],0)/4, cy=px.reduce((s,p)=>s+p[1],0)/4;
  let r=px.map(p=>({p,a:Math.atan2(p[1]-cy,p[0]-cx)})).sort((u,v)=>u.a-v.a).map(o=>o.p);
  let k=0;
  for(let i=1;i<4;i++) if(r[i][0]+r[i][1]<r[k][0]+r[k][1]) k=i;
  return r.slice(k).concat(r.slice(0,k));
}

function init(root){
  const samples=JSON.parse(root.dataset.samples||'[]');
  const VENDOR = root.dataset.vendor || '/wp-content/plugins/ipanel-visualizer/assets/vendor/';
  const MODELS = root.dataset.models || (location.origin + '/wp-content/uploads/ipanel-ar/hf/');
  const TEX = root.dataset.textures || '/wp-content/uploads/ipanel-ar/textures/';

  const S={
    photo:null,W:0,H:0,Hm:0,homog:null,fovH:0,
    C:[[.15,.2],[.85,.2],[.85,.8],[.15,.8]],
    surface:'wall',vert:true,fin:0,ww:3,len:3.05,vid:0,col:[1,1,1],
    shade:true,step:1,ba:100,autoScale:false,autoW:0,
    conf:null,lowLogged:false,scaleLogged:false,
    boxes:0,area:0,bom:null,
    maskC:null,lumC:null,lumMean:1
  };

  root.innerHTML='<div class="rv-card">'
    +'<div class="rv-steps"><span data-s1>1 Photo</span><span data-s2>2 Surface</span><span data-s3>3 Finish</span><span data-s4>4 Result</span></div>'
    +'<div class="rv-stage rv-hide">'
    +'<img class="rv-photo" alt="">'
    +'<div class="rv-clad"><div class="rv-print"></div><div class="rv-grooves"></div><div class="rv-shade"></div><div class="rv-shadow"></div></div>'
    +'<div class="rv-occl"></div>'
    +'<svg class="rv-quad"><polygon fill="none" stroke="#0b5cff" stroke-width="2"/></svg>'
    +'<div class="rv-wipe"><i>⟷</i></div>'
    +'<div class="rv-hint rv-hide"></div>'
    +'<div class="rv-warn rv-hide">📷 Low confidence — retake straight-on with the whole surface in frame, or adjust the dots. <button class="rv-btn ghost" data-retake style="padding:4px 10px;margin-left:8px">Retake</button></div>'
    +'<div class="rv-brand"><span class="rv-bname"></span><span class="rv-burl">ipanel.lk</span><img class="rv-bqr" alt=""></div>'
    +'</div>'
    +'<div class="rv-sheet">'
    +'<div data-p1>'
    +'<div class="rv-title">Show it on YOUR space</div>'
    +'<div class="rv-btnrow"><button class="rv-btn" data-cam>Take photo</button><button class="rv-btn ghost" data-up>Upload</button></div>'
    +'<div class="rv-field" style="font-size:12px">🔒 Your photo is processed on your device — never uploaded.</div>'
    +'<div class="rv-samples"></div>'
    +'<div class="rv-title" style="margin-top:6px">My saved designs</div>'
    +'<div class="rv-mine"></div>'
    +'</div>'
    +'<div data-p2 class="rv-hide">'
    +'<div class="rv-title">Mark the surface</div>'
    +'<div class="rv-btnrow"><button class="rv-btn" data-detect>Auto-detect surface</button></div>'
    +'<div class="rv-btnrow"><button class="rv-btn ghost" data-reset>Reset mask</button></div>'
    +'<div class="rv-field" data-dstatus></div>'
    +'<div class="rv-title" style="margin-top:8px">…or drag the 4 dots</div>'
    +'<div class="rv-seg"><button data-surf="wall" class="on">Wall</button><button data-surf="ceiling">Ceiling</button><button data-surf="floor">Floor</button></div>'
    +'<div class="rv-field">Width <input type="range" data-wwr min="1" max="6" step="0.1" value="3"> <input type="number" data-ww value="3" step="0.1" min="0.5" style="width:70px"> m</div>'
    +'<div class="rv-btnrow" data-wpresets></div>'
    +'</div>'
    +'<div data-p3 class="rv-hide">'
    +'<div class="rv-title">Pick your finish</div>'
    +'<div class="rv-swatches"></div>'
    +'<div class="rv-seg"><button data-orient="v" class="on">Slats vertical</button><button data-orient="h">Slats horizontal</button></div>'
    +'<div class="rv-field">Panel length (mm) <select data-len></select></div>'
    +'<div class="rv-cal" style="display:none"><div class="rv-field">Bright <input type="range" data-cb min="0.6" max="1.4" step="0.01"> Sat <input type="range" data-cs min="0.5" max="1.5" step="0.01"> Con <input type="range" data-cc min="0.6" max="1.4" step="0.01"></div><div class="rv-field" data-ccopy style="font-size:12px"></div></div>'
    +'</div>'
    +'<div data-p4 class="rv-hide">'
    +'<div class="rv-title">Your new look</div>'
    +'<div class="rv-field" style="font-size:12px">Drag the white line on the image to compare · swipe the photo to try other finishes</div>'
    +'<div class="rv-coverage"></div>'
    +'<div class="rv-field" data-bom style="font-size:12px"></div>'
    +'<div class="rv-field" style="font-size:11px">Warranty valid only with certified installation (GI C-channel framework, pop-rivet fixing).</div>'
    +'<div class="rv-btnrow"><button class="rv-btn" data-share>Share on WhatsApp</button><button class="rv-btn" data-cart>Add boxes to cart</button></div>'
    +'<div class="rv-btnrow"><button class="rv-btn ghost" data-wa>Ask on WhatsApp</button><button class="rv-btn ghost" data-quote>Installer quote</button></div>'
    +'<div class="rv-btnrow"><button class="rv-btn ghost" data-live>Live AR (Android, beta)</button></div>'
    +'<div class="rv-btnrow"><button class="rv-btn ghost" data-save>Save design</button><button class="rv-btn ghost" data-restart>Start over</button></div>'
    +'</div>'
    +'</div>'
    +'<div class="rv-nav"><button class="rv-btn ghost" data-back>Back</button><button class="rv-btn" data-next>Next</button></div>'
    +'</div>';

  const q=s=>root.querySelector(s), qa=s=>[...root.querySelectorAll(s)];
  const stage=q('.rv-stage'),photo=q('.rv-photo'),clad=q('.rv-clad'),
        pr=q('.rv-print'),gr=q('.rv-grooves'),sh=q('.rv-shade'),shd=q('.rv-shadow'),
        occl=q('.rv-occl'),poly=q('.rv-quad polygon'),wipe=q('.rv-wipe'),
        warn=q('.rv-warn'),hint=q('.rv-hint'),brand=q('.rv-brand');

  q('[data-dstatus]').setAttribute('aria-live','polite');

  let GL=null,glCanvas=null,GLtex={},GLcur=null,GLmaskS=null,GLmaskO=null,GLlum=null,GLmean=1,texKind='mir';
  let PBR=null,pbrCanvas=null,pbrTexCache={};

  const pbrCap=(()=>{try{const c=document.createElement('canvas');if(!c.getContext('webgl2'))return false;return (navigator.deviceMemory||4)>=4;}catch(e){return false;}})();
  if(pbrCap&&(root.dataset.pbr==='1'||location.search.indexOf('pbr=1')>=0)&&window.iPanelPBR){
    pbrCanvas=document.createElement('canvas'); pbrCanvas.className='rv-gl'; stage.appendChild(pbrCanvas);
    window.iPanelPBR.create(pbrCanvas).then(a=>{PBR=a;ev('rv_renderer',{mode:'pbr'});}).catch(()=>{PBR=null;});
  }
  if((root.dataset.gl==='1'||location.search.indexOf('gl=1')>=0)&&window.iPanelGL&&!PBR){
    glCanvas=document.createElement('canvas'); glCanvas.className='rv-gl'; stage.appendChild(glCanvas);
    (async()=>{GL=await window.iPanelGL.create(glCanvas); if(GL){ev('rv_renderer',{mode:'gl'}); if(S.photo)ensureTex(FIN[S.fin]);}})();
  }
  if(!window.__rv_ab){
    let ab=localStorage.getItem('ipanel_rv_ab');
    if(!ab){ab=Math.random()<0.5?'auto':'manual';localStorage.setItem('ipanel_rv_ab',ab);}
    window.__rv_ab=ab; ev('rv_ab_expose',{variant:ab});
  }
  S.ab=window.__rv_ab;


  const calMode=location.search.indexOf('calibrate')>=0||!!document.getElementById('wp-admin-bar');
  root.querySelector('.rv-cal').style.display=calMode?'block':'none';

  const handles=[0,1,2,3].map(i=>{
    const d=document.createElement('div');
    d.className='rv-h'; d.tabIndex=0; d.setAttribute('aria-label','Corner '+(i+1));
    stage.appendChild(d);
    d.addEventListener('keydown',e=>{
      const st=0.01; let dx=0,dy=0;
      if(e.key==='ArrowLeft')dx=-st; if(e.key==='ArrowRight')dx=st;
      if(e.key==='ArrowUp')dy=-st; if(e.key==='ArrowDown')dy=st;
      if(dx||dy){
        S.C[i][0]=Math.max(0,Math.min(1,S.C[i][0]+dx));
        S.C[i][1]=Math.max(0,Math.min(1,S.C[i][1]+dy));
        update(); e.preventDefault();
      }
    });
    return d;
  });

  const swWrap=q('.rv-swatches');
  FIN.forEach((f,i)=>{
    const d=document.createElement('div');
    d.className='rv-sw'+(i===0?' on':'');
    d.innerHTML='<i style="background-image:url('+TEX+f.slug+'/visualizer-thumb.webp)"></i>'+f.name;
    d.onclick=()=>{S.fin=i;qa('.rv-sw').forEach((e,j)=>e.classList.toggle('on',j===i));loadCol();loadVariations();update();ev('rv_finish_change',{finish:f.slug});};
    swWrap.appendChild(d);
  });

  const samWrap=q('.rv-samples');
  samples.forEach(u=>{
    const im=document.createElement('img');
    im.src=u;
    im.onclick=()=>{ev('rv_photo',{src:'sample'});setPhoto(u);};
    samWrap.appendChild(im);
  });

  q('[data-cam]').onclick=()=>pick(true);
  q('[data-up]').onclick=()=>pick(false);

  function pick(cam){
    const i=document.createElement('input');
    i.type='file'; i.accept='image/*';
    if(cam) i.capture='environment';
    i.onchange=()=>{
      const f=i.files[0];
      if(f){ev('rv_photo',{src:cam?'camera':'upload'});setPhoto(URL.createObjectURL(f));}
    };
    i.click();
  }

  function clearMask(){
    clad.style.maskImage='none'; clad.style.webkitMaskImage='none';
    occl.style.maskImage='none'; occl.style.webkitMaskImage='none';
  }

  function setPhoto(u){
    if(GL && GLmaskS){ GL.del(GLmaskS); GLmaskS=null; }
    if(GL && GLmaskO){ GL.del(GLmaskO); GLmaskO=null; }
    if(GL && GLlum){ GL.del(GLlum); GLlum=null; }
    S.photo=null; clearMask(); photo.src=u; S.fovH=0;,after){
    S.photo=u; clearMask(); photo.src=u; S.fovH=0;
    if(u.indexOf('blob:')===0){
      fetch(u).then(r=>r.arrayBuffer()).then(buf=>new Promise(res=>{
        const sc=document.createElement('script');
        sc.src=VENDOR+'exifreader.js';
        sc.onload=()=>res(window.ExifReader); sc.onerror=()=>res(null);
        document.head.appendChild(sc);
      }).then(ER=>{
        if(!ER) return;
        const t=ER.load(buf);
        const f=t['FocalLengthIn35mmFilm']||t['FocalLengthIn35mmFormat'];
        if(f&&f.value){S.fovH=2*Math.atan(18/f.value)*180/Math.PI; ev('rv_exif',{fovH:Math.round(S.fovH)});}
      })).catch(()=>{});
    }
    photo.onload=()=>{
      stage.classList.remove('rv-hide');
      S.W=stage.clientWidth; S.H=stage.clientHeight;
      go(2);
      if(!S.autoTried&&S.ab==='auto'){S.autoTried=true;setTimeout(()=>q('[data-detect]').click(),80);}
      if(after) after();
    };
  }

  qa('[data-surf]').forEach(b=>b.onclick=()=>{
    S.surface=b.dataset.surf; S.vert=(S.surface==='wall');
    qa('[data-surf]').forEach(x=>x.classList.toggle('on',x===b));
    setOrient(S.vert?'v':'h');
    update();
  });

  function setOrient(v){qa('[data-orient]').forEach(x=>x.classList.toggle('on',x.dataset.orient===v));}
  qa('[data-orient]').forEach(b=>b.onclick=()=>{S.vert=(b.dataset.orient==='v');setOrient(b.dataset.orient);update();});

  q('[data-ww]').oninput=e=>{
    S.ww=+e.target.value||3; q('[data-wwr]').value=S.ww;
    if(S.autoScale&&!S.scaleLogged&&Math.abs(S.ww-S.autoW)>0.05){
      S.scaleLogged=true; ev('rv_scale_corrected',{from:S.autoW,to:S.ww});
    }
    update();
  };
  q('[data-wwr]').oninput=e=>{S.ww=+e.target.value||3;q('[data-ww]').value=S.ww;update();};
  [2,2.5,3,3.5,4].forEach(v=>{
    const b=document.createElement('button');
    b.textContent=v+'m'; b.type='button';
    b.onclick=()=>{S.ww=v;q('[data-ww]').value=v;q('[data-wwr]').value=v;update();};
    q('[data-wpresets]').appendChild(b);
  });

  q('[data-reset]').onclick=()=>{clearMask();q('[data-dstatus]').textContent='Mask cleared.';};

  function applyBA(){clad.style.clipPath='inset(0 '+(100-S.ba)+'% 0 0)';wipe.style.left=S.ba+'%';}
  let wdrag=false;
  wipe.addEventListener('pointerdown',e=>{wdrag=true;wipe.setPointerCapture(e.pointerId);e.stopPropagation();});
  wipe.addEventListener('pointermove',e=>{
    if(!wdrag) return;
    const r=stage.getBoundingClientRect();
    S.ba=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));
    applyBA();
  });
  wipe.addEventListener('pointerup',()=>{if(wdrag)ev('rv_wipe',{ba:Math.round(S.ba)});wdrag=false;});

  let pd=null;
  stage.addEventListener('pointerdown',e=>{pd=[e.clientX,e.clientY];});
  stage.addEventListener('pointerup',e=>{
    if(!pd) return;
    const dx=e.clientX-pd[0], dy=e.clientY-pd[1];
    pd=null;
    if(e.target===wipe||wipe.contains(e.target)) return;
    if(S.step>=3&&Math.abs(dx)>60&&Math.abs(dy)<40){
      const d=dx<0?1:-1;
      S.fin=(S.fin+d+FIN.length)%FIN.length;
      qa('.rv-sw').forEach((el,j2)=>el.classList.toggle('on',j2===S.fin));
      loadCol(); loadVariations(); update();
      ev('rv_finish_change',{finish:FIN[S.fin].slug,src:'swipe'});
    }
  });

  q('[data-restart]').onclick=()=>{stage.classList.add('rv-hide');clearMask();go(1);};

  q('[data-share]').onclick=async()=>{
    try{
      if(!window.domtoimage){
        await new Promise((res,rej)=>{
          const sc=document.createElement('script');
          sc.src=VENDOR+'dom-to-image-more.min.js';
          sc.onload=res; sc.onerror=rej; document.head.appendChild(sc);
        });
      }
      const f=FIN[S.fin];
      brand.style.display='flex'; q('.rv-bname').textContent='iPanel '+f.name;
      try{
        if(!window.QRCode){
          await new Promise((res,rej)=>{
            const sc=document.createElement('script');
            sc.src=VENDOR+'qrcode.min.js';
            sc.onload=res; sc.onerror=rej; document.head.appendChild(sc);
          });
        }
        // Use qrcodejs API (cdnjs version)
        const qrContainer=document.createElement('div');
        qrContainer.style.width='128px';
        qrContainer.style.height='128px';
        new window.QRCode(qrContainer,{text:location.href,width:128,height:128,margin:0});
        // Wait for QR to render, then convert to image
        setTimeout(()=>{
          const canvas=qrContainer.querySelector('canvas');
          if(canvas) q('.rv-bqr').src=canvas.toDataURL();
          else q('.rv-bqr').style.display='none';
        },100);
      }catch(e){q('.rv-bqr').style.display='none';}
      const blob=await window.domtoimage.toBlob(stage,{bgcolor:'#ffffff'});
      brand.style.display='none';
      const text='See my wall with iPanel '+f.name+'! Visualize yours: '+location.href;
      const file=new File([blob],'ipanel-visual.png',{type:'image/png'});
      if(navigator.canShare && navigator.canShare({files:[file]})){
        await navigator.share({files:[file],text});
      }else{
        const a=document.createElement('a');
        a.href=URL.createObjectURL(blob); a.download='ipanel-visual.png'; a.click();
        window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank');
      }
      ev('rv_share',{finish:f.slug});
    }catch(e){brand.style.display='none';console.error(e);alert('Share failed: '+e.message);}
  };

  const liveOk=(root.dataset.livear==='1')&&/Android/i.test(navigator.userAgent)&&('xr' in navigator);
  q('[data-live]').style.display=liveOk?'block':'none';
  q('[data-live]').onclick=()=>{const f=FIN[S.fin];location.href='/webxr-clad.html?fin='+f.slug+'&w='+(S.ww||3)+'&h=2.4&vert='+(S.vert?1:0);};

  q('[data-cart]').onclick=()=>{
    const map=JSON.parse(root.dataset.products||'{}');
    const f=FIN[S.fin]; const id=map[f.slug];
    if(!id){alert('This finish has no product linked yet.');return;}
    ev('rv_cart',{finish:f.slug,boxes:(S.boxes||1),length_mm:Math.round(S.len*1000)});
    location.href='/?add-to-cart='+id+(S.vid?'&variation_id='+S.vid:'')+'&quantity='+(S.boxes||1);
  };

  q('[data-wa]').onclick=()=>{
    const f=FIN[S.fin];
    window.open('https://wa.me/?text='+encodeURIComponent('Hi iPanel! I visualized '+f.name+' on my wall (~'+(S.area||0).toFixed(1)+' m², ~'+(S.boxes||1)+' boxes). Can you advise? '+location.href),'_blank');
    ev('rv_whatsapp',{finish:f.slug});
  };

  q('[data-quote]').onclick=()=>{
    const f=FIN[S.fin], b=S.bom||{};
    const txt='iPanel installer quote — '+f.name+': wall '+((S.ww||0).toFixed(2))+'m x '+((S.Hm||0).toFixed(2))+'m ≈ '+((S.area||0).toFixed(1))+' m²; panels '+(Math.ceil(Math.ceil((S.ww||0)/EFF)*(S.Hm||0)/(S.len||3.05)))+'; boxes '+(S.boxes||1)+'; GI C-channel '+(b.chM||0)+'m; hangers '+(b.hangers||0)+'; pop rivets '+(b.rivets||0)+'. Preview: '+location.href;
    window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank');
    ev('rv_quote',{finish:f.slug});
  };

  q('[data-next]').onclick=()=>go(S.step+1);
  q('[data-back]').onclick=()=>go(S.step-1);

  function applyCol(){
    pr.style.filter='brightness('+S.col[0]+') saturate('+S.col[1]+') contrast('+S.col[2]+')';
    q('[data-ccopy]').textContent='Settings line: '+FIN[S.fin].slug+'='+S.col.map(v=>(+v).toFixed(2)).join(',');
  }

  function loadCol(){
    const m=JSON.parse(root.dataset.colors||'{}');
    const v=m[FIN[S.fin].slug];
    S.col=v?String(v).split(',').map(Number):[1,1,1];
    if(S.col.length!==3||S.col.some(isNaN)) S.col=[1,1,1];
    q('[data-cb]').value=S.col[0]; q('[data-cs]').value=S.col[1]; q('[data-cc]').value=S.col[2];
    applyCol();
  }

  ['cb','cs','cc'].forEach((k,i)=>{q('[data-'+k+']').oninput=e=>{S.col[i]=+e.target.value;applyCol();};});

  function loadVariations(){
    const map=JSON.parse(root.dataset.products||'{}');
    const id=map[FIN[S.fin].slug];
    const sel=q('[data-len]');
    if(!sel) return;
    if(!id){
      sel.innerHTML='<option value="3.05" data-vid="0">3050</option>';
      S.len=3.05; S.vid=0; return;
    }
    fetch('/wp-json/wc/store/v1/products/'+id).then(r=>r.ok?r.json():null).then(d=>{
      const opts=new Map([[3.05,{v:3.05,id:0}]]);
      if(d&&d.variations){
        d.variations.forEach(v=>{
          const a=(v.attributes||[]).find(x=>/len/i.test(x.name||''));
          if(a){const mm=parseFloat(a.value);if(mm>0) opts.set(mm/1000,{v:mm/1000,id:v.id});}
        });
      }
      sel.innerHTML=[...opts.values()].map(o=>'<option value="'+o.v+'" data-vid="'+o.id+'">'+Math.round(o.v*1000)+'</option>').join('');
      if(!opts.has(S.len)) S.len=3.05;
      sel.value=String(S.len);
      S.vid=(sel.selectedOptions[0]?+sel.selectedOptions[0].dataset.vid:0);
      S.price=(d&&d.prices&&d.prices.price)?(+d.prices.price)/Math.pow(10,(d.prices.currency_minor_units!=null?d.prices.currency_minor_units:2)):0;
      S.cur=(d&&d.prices&&d.prices.currency_code)||'LKR';
      coverage();
    }).catch(()=>{});
  }

  q('[data-len]').onchange=e=>{S.len=+e.target.value;S.vid=+e.target.selectedOptions[0].dataset.vid;coverage();};

  q('[data-detect]').onclick=async()=>{
    const st=q('[data-dstatus]');
    st.textContent='Loading AI model (first time ~5MB)…';
    try{
      if(!window.__seg){
        const mod=await import(VENDOR+'transformers.min.js');
        mod.env.remoteHost=MODELS; mod.env.remotePathTemplate='{model}/';
        mod.env.allowLocalModels=false;
        window.__seg=await mod.pipeline('image-segmentation','Xenova/segformer-b0-finetuned-ade-512-512',{quantized:true});
      }
      const t0=performance.now();
      st.textContent='Analysing photo…';
      const c=document.createElement('canvas');
      const sc=Math.min(1,512/photo.naturalWidth);
      c.width=Math.round(photo.naturalWidth*sc); c.height=Math.round(photo.naturalHeight*sc);
      c.getContext('2d').drawImage(photo,0,0,c.width,c.height);
      const res=await window.__seg(c.toDataURL('image/jpeg',0.85));
      const want={wall:'wall',ceiling:'ceiling',floor:'floor'}[S.surface];
      let best=null;
      for(const r of res){
        const ok=(r.label===want)||(r.label==='wall'||r.label==='ceiling'||r.label==='floor');
        if(ok && (!best || r.label===want)) best=r;
      }
      if(!best){st.textContent='No surface found — drag the dots instead.';return;}
      const m=best.mask, mw=m.width, mh=m.height, md=m.data, ch=md.length/(mw*mh);
      const on=new Uint8Array(mw*mh);
      for(let i=0;i<mw*mh;i++) on[i]=md[i*ch]>127?1:0;
      let seed=-1;
      const cx0=(mw/2)|0, cy0=(mh/2)|0;
      if(on[cy0*mw+cx0]) seed=cy0*mw+cx0;
      else{
        let bd=1e18;
        for(let y=0;y<mh;y+=2) for(let x=0;x<mw;x+=2){
          const i=y*mw+x;
          if(on[i]){const d=(x-cx0)*(x-cx0)+(y-cy0)*(y-cy0);if(d<bd){bd=d;seed=i;}}
        }
      }
      if(seed<0){st.textContent='No surface found — drag the dots instead.';return;}
      const comp=new Uint8Array(mw*mh);
      const stk=[seed]; comp[seed]=1;
      let minx=mw,maxx=0,miny=mh,maxy=0,cnt=0;
      while(stk.length){
        const i=stk.pop(); const x=i%mw, y=(i/mw)|0; cnt++;
        if(x<minx)minx=x; if(x>maxx)maxx=x; if(y<miny)miny=y; if(y>maxy)maxy=y;
        if(x>0&&on[i-1]&&!comp[i-1]){comp[i-1]=1;stk.push(i-1);}
        if(x<mw-1&&on[i+1]&&!comp[i+1]){comp[i+1]=1;stk.push(i+1);}
        if(y>0&&on[i-mw]&&!comp[i-mw]){comp[i-mw]=1;stk.push(i-mw);}
        if(y<mh-1&&on[i+mw]&&!comp[i+mw]){comp[i+mw]=1;stk.push(i+mw);}
      }
      if(cnt < mw*mh*0.03){st.textContent='Surface too small — drag the dots instead.';return;}

      const ly=[],ry=[],tx=[],bx=[];
      for(let y=miny;y<=maxy;y+=2){let a=-1,b=-1;for(let x=minx;x<=maxx;x++){if(comp[y*mw+x]){if(a<0)a=x;b=x;}}if(a>=0){ly.push([y,a]);ry.push([y,b]);}}
      for(let x=minx;x<=maxx;x+=2){let a=-1,b=-1;for(let y=miny;y<=maxy;y++){if(comp[y*mw+x]){if(a<0)a=y;b=y;}}if(a>=0){tx.push([x,a]);bx.push([x,b]);}}
      function fit(pts){let n=pts.length,sx=0,sy=0,sxx=0,sxy=0;for(const p of pts){sx+=p[0];sy+=p[1];sxx+=p[0]*p[0];sxy+=p[0]*p[1];}const den=n*sxx-sx*sx;if(!den)return null;const a=(n*sxy-sx*sy)/den;return {a:a,b:(sy-a*sx)/n};}
      const L=fit(ly),Rr=fit(ry),T=fit(tx),B=fit(bx);
      function ix(Ln,Tn){const d=1-Ln.a*Tn.a;if(Math.abs(d)<1e-6)return null;const x=(Ln.a*Tn.b+Ln.b)/d;return [x,Tn.a*x+Tn.b];}
      let q4=null;
      if(L&&Rr&&T&&B){
        const c=[ix(L,T),ix(Rr,T),ix(Rr,B),ix(L,B)];
        if(c.every(p=>p&&isFinite(p[0])&&isFinite(p[1])&&p[0]>-mw*0.2&&p[0]<mw*1.2&&p[1]>-mh*0.2&&p[1]<mh*1.2)) q4=c;
      }
      if(!q4) q4=[[minx,miny],[maxx,miny],[maxx,maxy],[minx,maxy]];
      S.C=q4.map(p=>[p[0]/mw,p[1]/mh]);

      let doorPx=0;
      for(const r of res){
        if(r.label!=='door') continue;
        const om=r.mask;
        if(om.width!==mw||om.height!==mh) continue;
        const od=om.data, och=od.length/(mw*mh);
        let y0=mh,y1=-1;
        for(let y=0;y<mh;y+=2){for(let x=0;x<mw;x+=4){if(od[(y*mw+x)*och]>127){if(y<y0)y0=y;if(y>y1)y1=y;break;}}}
        if(y1>y0&&y0>2&&y1<mh-3){doorPx=y1-y0;}
        if(doorPx) break;
      }
      if(doorPx){
        const ppmE=doorPx/2.0;
        const e=Math.hypot(q4[1][0]-q4[0][0],q4[1][1]-q4[0][1]);
        const wm=e/ppmE;
        if(wm>0.8&&wm<8){S.ww=Math.round(wm*10)/10;S.autoScale=true;S.autoW=S.ww;q('[data-ww]').value=S.ww;q('[data-wwr]').value=S.ww;}
      }

      const bboxA=Math.max(1,(maxx-minx)*(maxy-miny));
      const fill=cnt/bboxA;
      function ang(a,b,c){const v1=[a[0]-b[0],a[1]-b[1]],v2=[c[0]-b[0],c[1]-b[1]];const d=v1[0]*v2[0]+v1[1]*v2[1];const m1=Math.hypot(v1[0],v1[1]),m2=Math.hypot(v2[0],v2[1]);return Math.acos(Math.max(-1,Math.min(1,d/(m1*m2||1))))*180/Math.PI;}
      const angs=[ang(q4[3],q4[0],q4[1]),ang(q4[0],q4[1],q4[2]),ang(q4[1],q4[2],q4[3]),ang(q4[2],q4[3],q4[0])];
      const minA=Math.min.apply(null,angs), maxA=Math.max.apply(null,angs);
      const qA=Math.abs((q4[0][0]*q4[1][1]-q4[1][0]*q4[0][1])+(q4[1][0]*q4[2][1]-q4[2][0]*q4[1][1])+(q4[2][0]*q4[3][1]-q4[3][0]*q4[2][1])+(q4[3][0]*q4[0][1]-q4[0][0]*q4[3][1]))/2;
      const ratio=qA/(mw*mh);
      const s1=Math.max(0,Math.min(1,(fill-0.55)/0.35));
      const s2=(minA>40&&maxA<140)?1:0.5;
      const s3=(ratio>0.06&&ratio<0.92)?1:0.4;
      const s4=(typeof best.score==='number')?Math.max(0,Math.min(1,best.score)):0.8;
      S.conf=0.4*s1+0.2*s2+0.2*s3+0.2*s4;
      S.lowLogged=false;
      ev('rv_conf',{conf:+S.conf.toFixed(2)});

      let hint='';
      if(fill<0.7) hint='Surface partly hidden — change angle so all four corners are visible.';
      else if(ratio<0.12) hint='Too far — move closer so the surface fills the frame.';
      else if(ratio>0.9) hint='Too close — step back to include the surface edges.';
      else if(S.conf<0.6) hint='Blurry or uneven light — retake in better light.';
      else hint='Good photo ✓';
      S.hint=hint; S.hintOk=(hint==='Good photo ✓');
      ev('rv_capture_hint',{hint:hint});

      const mc=document.createElement('canvas'); mc.width=mw; mc.height=mh;
      const ctxm=mc.getContext('2d');
      const mi=ctxm.createImageData(mw,mh);
      for(let i=0;i<mw*mh;i++){
        const o=i*4;
        if(comp[i]){mi.data[o]=255;mi.data[o+1]=255;mi.data[o+2]=255;mi.data[o+3]=255;}
        else mi.data[o+3]=0;
      }
      ctxm.putImageData(mi,0,0);
      const mu='url('+mc.toDataURL()+')';
      clad.style.webkitMaskImage=mu; clad.style.maskImage=mu;
      clad.style.webkitMaskSize='100% 100%'; clad.style.maskSize='100% 100%';

      const OCC=['person','door','window','chair','table','sofa','bed','cabinet','shelf','curtain','plant','lamp','television','counter','desk','seat','wardrobe','clothes','apparel','rack','mirror','refrigerator','staircase'];
      const occ=new Uint8Array(mw*mh);
      for(const r of res){
        if(OCC.indexOf(r.label)<0) continue;
        const om=r.mask;
        if(om.width!==mw||om.height!==mh) continue;
        const od=om.data, och=od.length/(mw*mh);
        for(let y=miny;y<=maxy;y++) for(let x=minx;x<=maxx;x++){
          const i=y*mw+x;
          if(od[i*och]>127) occ[i]=1;
        }
      }
      let occCount=0;
      const oc=document.createElement('canvas'); oc.width=mw; oc.height=mh;
      const octx=oc.getContext('2d');
      const oi=octx.createImageData(mw,mh);
      for(let i=0;i<mw*mh;i++){
        const o=i*4;
        if(occ[i]){occCount++;oi.data[o]=255;oi.data[o+1]=255;oi.data[o+2]=255;oi.data[o+3]=255;}
        else oi.data[o+3]=0;
      }
      octx.putImageData(oi,0,0);
      if(occCount>mw*mh*0.005){
        const ou='url('+oc.toDataURL()+')';
        occl.style.webkitMaskImage=ou; occl.style.maskImage=ou;
        occl.style.webkitMaskSize='100% 100%'; occl.style.maskSize='100% 100%';
        occl.style.backgroundImage='url('+S.photo+')';
      }

      S.maskC={s:mc,o:(occCount>mw*mh*0.005)?oc:null};
      const lc=document.createElement('canvas');
      lc.width=256; lc.height=Math.max(2,Math.round(256*photo.naturalHeight/photo.naturalWidth));
      const lx=lc.getContext('2d');
      lx.filter='grayscale(1) blur(6px)'; lx.drawImage(photo,0,0,lc.width,lc.height);
      const ld=lx.getImageData(0,0,lc.width,lc.height).data;
      let sum=0,n=0;
      for(let i=0;i<ld.length;i+=4){sum+=ld[i];n++;}
      S.lumC=lc; S.lumMean=(sum/(n||1))/255;
      if(GL){GLmaskS=GL.mask(mc);GLmaskO=S.maskC.o?GL.mask(oc):null;GLmean=S.lumMean;GLlum=GL.mask(lc);glDraw();}
      if(PBR){PBR.setMasks(mc,S.maskC.o,lc,S.lumMean);PBR.setEnv(photo);pbrDraw();}

      try{
        st.textContent='Refining occlusion (depth)…';
        if(!window.__dep){
          const m3=await import(VENDOR+'transformers-v3.mjs');
          m3.env.remoteHost=MODELS; m3.env.remotePathTemplate='{model}/';
          m3.env.allowLocalModels=false;
          window.__dep=await m3.pipeline('depth-estimation','onnx-community/depth-anything-v2-small',{quantized:true});
        }
        const dres=await window.__dep(c.toDataURL('image/jpeg',0.85));
        const dt=dres.predicted_depth, dw=dt.dims[dt.dims.length-1], dh=dt.dims[dt.dims.length-2], arr=dt.data;
        const vals=[];
        for(let y=miny;y<=maxy;y+=2) for(let x=minx;x<=maxx;x+=2){
          if(comp[y*mw+x]){const sx=Math.floor(x/mw*dw),sy=Math.floor(y/mh*dh);vals.push(arr[sy*dw+sx]);}
        }
        vals.sort((a,b)=>a-b);
        const med=vals[Math.floor(vals.length/2)]||1;
        for(let y=miny;y<=maxy;y++) for(let x=minx;x<=maxx;x++){
          const sx=Math.floor(x/mw*dw), sy=Math.floor(y/mh*dh);
          if(arr[sy*dw+sx] < med*0.85) occ[y*mw+x]=1;
        }
        const oi2=octx.createImageData(mw,mh);
        for(let i=0;i<mw*mh;i++){
          const o=i*4;
          if(occ[i]){oi2.data[o]=255;oi2.data[o+1]=255;oi2.data[o+2]=255;oi2.data[o+3]=255;}
          else oi2.data[o+3]=0;
        }
        octx.putImageData(oi2,0,0);
        const ou2='url('+oc.toDataURL()+')';
        occl.style.webkitMaskImage=ou2; occl.style.maskImage=ou2;
        occl.style.webkitMaskSize='100% 100%'; occl.style.maskSize='100% 100%';
        occl.style.backgroundImage='url('+S.photo+')';
      }catch(e){console.warn('depth occlusion skipped', e);}

      st.textContent='Detected: '+best.label+'.'+(S.autoScale?' Width auto-estimated from door — adjust if needed.':' Drag dots to fine-tune.');
      ev('rv_autodetect',{label:best.label});
      ev('rv_detect_ms',{ms:Math.round(performance.now()-t0)});
      update();
    }catch(e){
      st.textContent='Auto-detect unavailable — drag the dots instead.';
      console.error(e);
    }
  };

  function go(n){
    S.step=Math.max(1,Math.min(4,n));
    if(!S.seen) S.seen={};
    if(!S.seen[n]){S.seen[n]=1;ev('rv_step',{step:n});}
    [1,2,3,4].forEach(i=>{
      q('[data-p'+i+']').classList.toggle('rv-hide',i!==S.step);
      q('[data-s'+i+']').innerHTML=(i===S.step?'<b>':'')+i+' '+['Photo','Surface','Finish','Result'][i-1]+(i===S.step?'</b>':'');
    });
    q('[data-back]').style.visibility=S.step>1?'visible':'hidden';
    q('[data-next]').style.visibility=S.step<4?'visible':'hidden';
    handles.forEach(h=>h.style.display=(S.step===2)?'block':'none');
    wipe.style.display=(S.step===4)?'block':'none';
    poly.style.display=(S.step===2)?'block':'none';
    if(S.step===4){loadVariations();coverage();}
    update();
  }

  function coverage(){
    const R=ring(S.C,S.W,S.H);
    const ppm=S.W/S.ww;
    const side=(Math.hypot(R[3][0]-R[0][0],R[3][1]-R[0][1])+Math.hypot(R[2][0]-R[1][0],R[2][1]-R[1][1]))/2;
    const hm=side/ppm;
    const area=S.ww*hm;
    const cols=Math.ceil(S.ww/EFF);
    const panels=Math.max(1,Math.ceil(cols*hm/S.len));
    const boxes=Math.ceil(panels/PER_BOX);
    const chRows=Math.ceil(hm/0.61)+1, chM=Math.ceil(chRows*S.ww), hangers=chRows*(Math.ceil(S.ww/1.22)+1);
    S.boxes=boxes; S.area=area;
    const rivets=panels*8;
    S.bom={chM:chM,hangers:hangers,rivets:rivets};
    S.Hm=hm;
    const bomEl=q('[data-bom]');
    if(bomEl) bomEl.innerHTML='Installer estimate: <b>'+chM+'m</b> GI C-channel (2ft c/c) · <b>'+hangers+'</b> GI hangers (4ft c/c) · <b>'+rivets+'</b> pop rivets · offcut waste in panel count.';
    q('.rv-coverage').innerHTML='Wall ≈ <b>'+area.toFixed(1)+' m²</b> · <b>'+cols+'</b> columns · ≈ <b>'+panels+' panel'+(panels>1?'s':'')+'</b> = <b>'+boxes+' box'+(boxes>1?'es':'')+'</b>'
      +' · framework ≈ <b>'+chM+'m</b> GI C-channel + <b>'+hangers+'</b> hangers'
      +(S.price?' · est. <b>'+S.cur+' '+Math.round(S.price*S.boxes).toLocaleString()+'</b>':'')
      +'. Final count confirmed at checkout.';
  }

  function update(){
    if(!S.W) return;
    const R=ring(S.C,S.W,S.H);
    handles.forEach((h,i)=>{h.style.left=S.C[i][0]*S.W+'px';h.style.top=S.C[i][1]*S.H+'px';});
    poly.setAttribute('points',R.map(p=>p.join(',')).join(' '));
    const Src=[[0,0],[S.W,0],[S.W,S.H],[0,S.H]], A=[], b=[];
    for(let i=0;i<4;i++){
      const xs=Src[i][0], ys=Src[i][1], xd=R[i][0], yd=R[i][1];
      A.push([xs,ys,1,0,0,0,-xs*xd,-ys*xd]); b.push(xd);
      A.push([0,0,0,xs,ys,1,-xs*yd,-ys*yd]); b.push(yd);
    }
    const s=solve8(A,b);
    S.homog=[s[0],s[1],s[2],s[3],s[4],s[5],s[6],s[7],1];
    const tf='matrix3d('+s[0]+','+s[3]+',0,'+s[6]+','+s[1]+','+s[4]+',0,'+s[7]+',0,0,1,0,'+s[2]+','+s[5]+',0,1)';
    const f=FIN[S.fin];
    if(GL) ensureTex(f);
    if(PBR) ensurePbrTex(f);
    pr.style.transform=tf; gr.style.transform=tf;
    const ppm=S.W/S.ww;
    const full=TEX+f.slug+'/albedo-s'+(S.vert?'-rot-full':'-full')+'.webp';
    const mir=TEX+f.slug+'/albedo-s'+(S.vert?'-rot-mir':'-mir')+'.webp';
    const fb=TEX+f.slug+'/visualizer'+(S.vert?'-rot':'')+'.webp';
    const setSize=k=>{
      pr.style.backgroundSize = k==='full' ? (S.vert?(TH*ppm)+'px '+(3.05*ppm)+'px':(3.05*ppm)+'px '+(TH*ppm)+'px')
        : k==='mir' ? (S.vert?(TH*ppm)+'px '+(2*TL*ppm)+'px':(2*TL*ppm)+'px '+(TH*ppm)+'px')
        : (S.vert?(TH*ppm)+'px '+(TL*ppm)+'px':(TL*ppm)+'px '+(TH*ppm)+'px');
    };
    const i2=new Image();
    i2.onerror=()=>{const i3=new Image(); i3.onerror=()=>{pr.style.backgroundImage='url('+fb+')';setSize('vis');}; i3.onload=()=>setSize('mir'); i3.src=mir;};
    i2.onload=()=>setSize('full'); i2.src=full;
    pr.style.backgroundImage='url('+full+')';
    applyCol();
    const gp=Math.max(1,.004*ppm), pp=.03*ppm, jp=EFF*ppm, jw=Math.max(1.5,.006*ppm), ej=3.05*ppm, ew=Math.max(1,.003*ppm);
    const ax=S.vert?'to right':'to bottom', ay=S.vert?'to bottom':'to right';
    gr.style.backgroundImage='repeating-linear-gradient('+ax+',rgba(0,0,0,.85) 0 '+gp+'px,rgba(255,255,255,.15) '+gp+'px '+(gp+1)+'px,transparent '+(gp+1)+'px '+pp+'px),'
      +'repeating-linear-gradient('+ax+',rgba(0,0,0,.95) 0 '+jw+'px,transparent '+jw+'px '+jp+'px),'
      +'repeating-linear-gradient('+ay+',rgba(0,0,0,.8) 0 '+ew+'px,transparent '+ew+'px '+ej+'px)';
    sh.style.clipPath='polygon('+R.map(p=>p.map(v=>v+'px').join(' ')).join(',')+')';
    shd.style.clipPath=sh.style.clipPath;
    sh.style.backgroundImage=S.photo?('url('+S.photo+')'):'none';
    sh.style.backgroundSize='100% 100%';
    sh.style.display=S.shade?'block':'none';
    applyBA();
    if(PBR) pbrDraw(); else glDraw();
    const low=(S.conf!=null&&S.conf<0.6);
    hint.textContent=S.hint||'';
    hint.classList.toggle('rv-hide',!S.hint);
    hint.style.background=S.hintOk?'rgba(20,120,60,.92)':'rgba(180,120,20,.95)';
    warn.classList.toggle('rv-hide',!low);
    const cartBtn=q('[data-cart]');
    if(cartBtn){cartBtn.disabled=low;cartBtn.style.opacity=low?0.5:1;}
    if(low&&!S.lowLogged){S.lowLogged=true;ev('rv_lowconf',{conf:+S.conf.toFixed(2)});}
    ev('rv_update',{finish:f.slug,surface:S.surface});
  }

  function glDraw(){
    if(!GL||!GLcur||!S.W||!S.Hm) return;
    glCanvas.width=S.W; glCanvas.height=S.H; glCanvas.style.display='block';
    const ppm=S.W/S.ww;
    const tile = texKind==='full' ? (S.vert?[TH*ppm,3.05*ppm]:[3.05*ppm,TH*ppm])
      : texKind==='mir' ? (S.vert?[TH*ppm,2*TL*ppm]:[2*TL*ppm,TH*ppm])
      : (S.vert?[TH*ppm,TL*ppm]:[TL*ppm,TH*ppm]);
    GL.draw({W:S.W,H:S.H,H:S.Hm,tile:tile,panel:GLcur,maskS:GLmaskS,maskO:GLmaskO,lum:GLlum,mean:GLmean});
    glCanvas.style.clipPath=clad.style.clipPath;
    pr.style.display='none'; gr.style.display='none'; sh.style.display='none'; shd.style.display='none'; occl.style.display='none';
  }

  function ensureTex(f){
    const kinds=['full','mir','vis'];
    const urls={
      full:TEX+f.slug+'/albedo-s'+(S.vert?'-rot-full':'-full')+'.webp',
      mir:TEX+f.slug+'/albedo-s'+(S.vert?'-rot-mir':'-mir')+'.webp',
      vis:TEX+f.slug+'/visualizer'+(S.vert?'-rot':'')+'.webp'
    };
    const key=f.slug+(S.vert?'v':'h');
    if(GLtex[key]){GLcur=GLtex[key].t;texKind=GLtex[key].k;glDraw();return;}
    (function tryK(i){
      if(i>=kinds.length) return;
      const im=new Image();
      im.onload=()=>{const t=GL.tex(im);GLtex[key]={t:t,k:kinds[i]};GLcur=t;texKind=kinds[i];glDraw();};
      im.onerror=()=>tryK(i+1);
      im.src=urls[kinds[i]];
    })(0);
  }

  function pbrDraw(){
    if(!PBR||!S.W||!S.Hm||!pbrTexCache[FIN[S.fin].slug+(S.vert?'v':'h')]) return;
    pbrCanvas.width=S.W; pbrCanvas.height=S.H; pbrCanvas.style.display='block';
    const R=ring(S.C,S.W,S.H);
    PBR.draw({W:S.W,H:S.H,corners:R,Wm:S.ww,Hm:S.Hm,vert:S.vert,fovH:S.fovH||0});
    pbrCanvas.style.clipPath=clad.style.clipPath;
    pr.style.display='none'; gr.style.display='none'; sh.style.display='none'; shd.style.display='none'; occl.style.display='none';
    if(glCanvas) glCanvas.style.display='none';
  }

  function ensurePbrTex(f){
    if(!PBR) return;
    const key=f.slug+(S.vert?'v':'h');
    if(pbrTexCache[key]&&pbrTexCache[key]!==1) return;
    pbrTexCache[key]=1;
    const kinds=['full','mir','vis'];
    const urls={
      full:TEX+f.slug+'/albedo-s'+(S.vert?'-rot-full':'-full')+'.webp',
      mir:TEX+f.slug+'/albedo-s'+(S.vert?'-rot-mir':'-mir')+'.webp',
      vis:TEX+f.slug+'/visualizer'+(S.vert?'-rot':'')+'.webp'
    };
    const nurl=TEX+'_common/groove-normal-'+(S.vert?'v':'h')+'.png';
    (function tryK(i){
      if(i>=kinds.length) return;
      const im=new Image();
      im.onload=()=>{
        const nm=new Image();
        nm.onload=()=>{
          const lenM=kinds[i]==='full'?3.05:(kinds[i]==='mir'?2*TL:TL);
          const marble=/marble/.test(f.slug);
          pbrTexCache[key]=2;
          PBR.setMaps(im,nm,{rough:marble?0.28:0.55,clearcoat:marble?0.7:0.15,tileM:S.vert?[0.3,lenM]:[lenM,0.3]});
          if(S.maskC&&S.lumC) PBR.setMasks(S.maskC.s,S.maskC.o,S.lumC,S.lumMean);
          PBR.setEnv(photo);
          pbrDraw();
        };
        nm.src=nurl;
      };
      im.onerror=()=>tryK(i+1);
      im.src=urls[kinds[i]];
    })(0);
  }

  function loadMine(){
    const arr=JSON.parse(localStorage.getItem('ipanel_rv_designs')||'[]');
    const w=q('.rv-mine'); w.innerHTML='';
    arr.forEach(d=>{
      const im=document.createElement('img');
      im.src=d.d;
      im.onclick=()=>{
        setPhoto(d.d,()=>{
          S.C=d.C; S.fin=d.fin; S.ww=d.ww; S.vert=d.vert; S.surface=d.surface||'wall';
          q('[data-ww]').value=S.ww; q('[data-wwr]').value=S.ww;
          qa('.rv-sw').forEach((el,j)=>el.classList.toggle('on',j===S.fin));
          setOrient(S.vert?'v':'h');
          qa('[data-surf]').forEach(x=>x.classList.toggle('on',x.dataset.surf===S.surface));
          loadCol(); loadVariations(); go(4);
        });
      };
      w.appendChild(im);
    });
  }

  q('[data-save]').onclick=()=>{
    const c=document.createElement('canvas');
    const sc=Math.min(1,1000/photo.naturalWidth);
    c.width=Math.round(photo.naturalWidth*sc); c.height=Math.round(photo.naturalHeight*sc);
    c.getContext('2d').drawImage(photo,0,0,c.width,c.height);
    const arr=JSON.parse(localStorage.getItem('ipanel_rv_designs')||'[]');
    arr.unshift({d:c.toDataURL('image/jpeg',0.7),C:S.C,fin:S.fin,ww:S.ww,vert:S.vert,surface:S.surface,ts:Date.now()});
    while(arr.length>6) arr.pop();
    localStorage.setItem('ipanel_rv_designs',JSON.stringify(arr));
    loadMine();
    ev('rv_save',{finish:FIN[S.fin].slug});
  };

  root.addEventListener('click',e=>{
    if(e.target&&e.target.getAttribute&&e.target.getAttribute('data-retake')!==null){pick(false);}
  });

  const pre=root.dataset.finish;
  if(pre){const pi=FIN.findIndex(f=>f.slug===pre);if(pi>=0){S.fin=pi;}}
  qa('.rv-sw').forEach((el,j)=>el.classList.toggle('on',j===S.fin));

  window.addEventListener('resize',function(){ if(S.photo && !stage.classList.contains('rv-hide')){ S.W=stage.clientWidth; S.H=stage.clientHeight; update(); } });
  loadMine();
  go(1);
}

document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('.ipanel-rv').forEach(r=>{
  try{init(r);}catch(e){
    console.error(e);
    r.innerHTML='<div class="rv-card" style="padding:18px">The visualizer could not start on this device. <a href="/contact/">Contact us</a> or WhatsApp iPanel for a free visualisation.</div>';
  }
}));
})();

document.addEventListener('click',function(e){
  var t=e.target;
  if(t.closest && t.closest('[data-ipanel-ar-open]')){
    var m=document.querySelector('[data-ipanel-ar-modal]');
    if(m){ m.hidden=false; document.body.style.overflow='hidden';
      setTimeout(function(){ window.dispatchEvent(new Event('resize')); },60); }
    return;
  }
  if(t.closest && t.closest('[data-ipanel-ar-close]')){
    var m2=document.querySelector('[data-ipanel-ar-modal]');
    if(m2){ m2.hidden=true; document.body.style.overflow=''; }
    return;
  }
  if(t.hasAttribute && t.hasAttribute('data-ipanel-ar-modal')){ t.hidden=true; document.body.style.overflow=''; }
});

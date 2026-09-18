(function(){
const FIN=[{slug:'rich-brown',name:'Rich Brown'},{slug:'rich-teak',name:'Rich Teak'},{slug:'rich-maple',name:'Rich Maple'},{slug:'gray-marble',name:'Gray Marble'},{slug:'black-marble',name:'Black Marble'}];
const TEX='/wp-content/uploads/ipanel-ar/textures/';
const TL=1.215, TH=0.30, EFF=0.29, PANEL_AREA=EFF*3.05, PER_BOX=10;
function ev(n,o){(window.dataLayer=window.dataLayer||[]).push(Object.assign({event:n},o||{}));if(window.gtag){window.gtag('event',n,o||{});}}
function solve8(A,b){for(let i=0;i<8;i++){let p=i;for(let r=i+1;r<8;r++)if(Math.abs(A[r][i])>Math.abs(A[p][i]))p=r;
[A[i],A[p]]=[A[p],A[i]];const t=b[i];b[i]=b[p];b[p]=t;const pv=A[i][i]||1e-12;
for(let r=0;r<8;r++){if(r===i)continue;const f=A[r][i]/pv;for(let c=i;c<8;c++)A[r][c]-=f*A[i][c];b[r]-=f*b[i];}}
return b.map((v,i)=>v/(A[i][i]||1e-12));}
function ring(C,W,H){const px=C.map(c=>[c[0]*W,c[1]*H]);const cx=px.reduce((s,p)=>s+p[0],0)/4,cy=px.reduce((s,p)=>s+p[1],0)/4;
let r=px.map(p=>({p,a:Math.atan2(p[1]-cy,p[0]-cx)})).sort((u,v)=>u.a-v.a).map(o=>o.p);
let k=0;for(let i=1;i<4;i++)if(r[i][0]+r[i][1]<r[k][0]+r[k][1])k=i;return r.slice(k).concat(r.slice(0,k));}
function init(root){
 const samples=JSON.parse(root.dataset.samples||'[]');
 const S={photo:null,W:0,H:0,C:[[.15,.2],[.85,.2],[.85,.8],[.15,.8]],surface:'wall',vert:true,fin:0,ww:3,shade:true,step:1,ba:100};
 root.innerHTML='<div class="rv-card">'
 +'<div class="rv-steps"><span data-s1>1 Photo</span><span data-s2>2 Surface</span><span data-s3>3 Finish</span><span data-s4>4 Result</span></div>'
 +'<div class="rv-stage rv-hide"><img class="rv-photo" alt=""><div class="rv-clad"><div class="rv-print"></div><div class="rv-grooves"></div><div class="rv-shade"></div></div>'
 +'<div class="rv-occl"></div>'
 +'<svg class="rv-quad"><polygon fill="none" stroke="#0b5cff" stroke-width="2"/></svg>'+'<div class="rv-wipe"><i>⟷</i></div>'+'<div class="rv-warn rv-hide">📷 Low confidence — retake straight-on with the whole surface in frame, or adjust the dots.</div>'+'<div class="rv-warn rv-hide">📷 Low confidence — retake straight-on with the whole surface in frame, or adjust the dots.</div>'+'<div class="rv-brand"><span class="rv-bname"></span><span class="rv-burl">ipanel.lk</span><img class="rv-bqr" alt=""></div></div>'
 +'<div class="rv-sheet">'
 +'<div data-p1><div class="rv-title">Show it on YOUR space</div>'
 +'<div class="rv-btnrow"><button class="rv-btn" data-cam>Take photo</button><button class="rv-btn ghost" data-up>Upload</button></div>'
 +'<div class="rv-samples"></div></div>'
 +'<div data-p2 class="rv-hide"><div class="rv-title">Mark the surface</div>'
 +'<div class="rv-btnrow"><button class="rv-btn" data-detect>Auto-detect surface</button></div>'
 +'<div class="rv-btnrow"><button class="rv-btn ghost" data-reset>Reset mask</button></div>'
 +'<div class="rv-field" data-dstatus></div>'
 +'<div class="rv-title" style="margin-top:8px">…or drag the 4 dots</div>'
 +'<div class="rv-seg"><button data-surf="wall" class="on">Wall</button><button data-surf="ceiling">Ceiling</button><button data-surf="floor">Floor</button></div>'
 +'<div class="rv-field">Top-edge width (m) <input type="number" data-ww value="3" step="0.1" min="0.5"></div></div>'
 +'<div data-p3 class="rv-hide"><div class="rv-title">Pick your finish</div><div class="rv-swatches"></div>'
 +'<div class="rv-field"><label><input type="checkbox" data-horiz> slats horizontal</label></div></div>'
 +'<div data-p4 class="rv-hide"><div class="rv-title">Your new look</div>'
 +'<div class="rv-field" style="font-size:12px">Drag the white line on the image to compare · swipe the photo to try other finishes</div>'
 +'<div class="rv-coverage"></div>'
 +'<div class="rv-btnrow"><button class="rv-btn" data-share>Share on WhatsApp</button><button class="rv-btn ghost" data-cart>Add boxes to cart</button></div><div class="rv-btnrow"><button class="rv-btn ghost" data-live>Live AR (Android, beta)</button></div><div class="rv-btnrow"><button class="rv-btn ghost" data-live>Live AR (Android, beta)</button></div><div class="rv-btnrow"><button class="rv-btn ghost" data-restart>Start over</button></div></div>'
 +'</div>'
 +'<div class="rv-nav"><button class="rv-btn ghost" data-back>Back</button><button class="rv-btn" data-next>Next</button></div>'
 +'</div>';
 const q=s=>root.querySelector(s), qa=s=>[...root.querySelectorAll(s)];
 const stage=q('.rv-stage'),photo=q('.rv-photo'),clad=q('.rv-clad'),pr=q('.rv-print'),gr=q('.rv-grooves'),sh=q('.rv-shade'),occl=q('.rv-occl'),poly=q('.rv-quad polygon'),wipe=q('.rv-wipe'),brand=q('.rv-brand');
 q('[data-dstatus]').setAttribute('aria-live','polite');
 const handles=[0,1,2,3].map(i=>{const d=document.createElement('div');d.className='rv-h';stage.appendChild(d);return d;});
 const swWrap=q('.rv-swatches');
 FIN.forEach((f,i)=>{const d=document.createElement('div');d.className='rv-sw'+(i===0?' on':'');d.innerHTML='<i style="background-image:url('+TEX+f.slug+'/visualizer-thumb.webp)"></i>'+f.name;
  d.onclick=()=>{S.fin=i;qa('.rv-sw').forEach((e,j)=>e.classList.toggle('on',j===i));update();};swWrap.appendChild(d);});
 const samWrap=q('.rv-samples');
 samples.forEach(u=>{const im=document.createElement('img');im.src=u;im.onclick=()=>setPhoto(u);samWrap.appendChild(im);});
 q('[data-cam]').onclick=()=>pick(true); q('[data-up]').onclick=()=>pick(false);
 function pick(cam){const i=document.createElement('input');i.type='file';i.accept='image/*';if(cam)i.capture='environment';
  i.onchange=()=>{const f=i.files[0];if(f)setPhoto(URL.createObjectURL(f));};i.click();}
 function clearMask(){clad.style.maskImage='none';clad.style.webkitMaskImage='none';occl.style.maskImage='none';occl.style.webkitMaskImage='none';}
 function setPhoto(u){S.photo=u;clearMask();photo.src=u;photo.onload=()=>{stage.classList.remove('rv-hide');S.W=stage.clientWidth;S.H=stage.clientHeight;go(2);};}
 qa('[data-surf]').forEach(b=>b.onclick=()=>{S.surface=b.dataset.surf;S.vert=(S.surface==='wall');qa('[data-surf]').forEach(x=>x.classList.toggle('on',x===b));q('[data-horiz]').checked=!S.vert;update();});
 q('[data-horiz]').onchange=e=>{S.vert=!e.target.checked;update();};
 q('[data-ww]').oninput=e=>{S.ww=+e.target.value||3;update();};
 q('[data-reset]').onclick=()=>{clearMask();q('[data-dstatus]').textContent='Mask cleared.';};
 function applyBA(){clad.style.clipPath='inset(0 '+(100-S.ba)+'% 0 0)';wipe.style.left=S.ba+'%';}
 let wdrag=false;
 wipe.addEventListener('pointerdown',e=>{wdrag=true;wipe.setPointerCapture(e.pointerId);e.stopPropagation();});
 wipe.addEventListener('pointermove',e=>{if(!wdrag)return;const r=stage.getBoundingClientRect();S.ba=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));applyBA();});
 wipe.addEventListener('pointerup',()=>wdrag=false);
 let pd=null;
 stage.addEventListener('pointerdown',e=>{pd=[e.clientX,e.clientY];});
 stage.addEventListener('pointerup',e=>{if(!pd)return;const dx=e.clientX-pd[0],dy=e.clientY-pd[1];pd=null;
  if(e.target===wipe||wipe.contains(e.target))return;
  if(S.step>=3&&Math.abs(dx)>60&&Math.abs(dy)<40){const d=dx<0?1:-1;S.fin=(S.fin+d+FIN.length)%FIN.length;
   qa('.rv-sw').forEach((el,j2)=>el.classList.toggle('on',j2===S.fin));loadCol();loadVariations();update();}});
 q('[data-restart]').onclick=()=>{stage.classList.add('rv-hide');clearMask();go(1);};
 q('[data-share]').onclick=async()=>{
  try{
   if(!window.domtoimage){ await new Promise((res,rej)=>{const sc=document.createElement('script');
     sc.src='https://cdn.jsdelivr.net/npm/dom-to-image-more@3.4.5/dist/dom-to-image-more.min.js';
     sc.onload=res; sc.onerror=rej; document.head.appendChild(sc);}); }
   brand.style.display='flex'; q('.rv-bname').textContent='iPanel '+f.name;
   try{ if(!window.QRCode){ await new Promise((res,rej)=>{const sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';sc.onload=res;sc.onerror=rej;document.head.appendChild(sc);}); }
     q('.rv-bqr').src=await window.QRCode.toDataURL(location.href,{width:128,margin:0}); }catch(e){ q('.rv-bqr').style.display='none'; }
   const blob=await window.domtoimage.toBlob(stage,{bgcolor:'#ffffff'});
   brand.style.display='none';
   const f=FIN[S.fin];
   const text='See my wall with iPanel '+f.name+'! Visualize yours: '+location.href;
   const file=new File([blob],'ipanel-visual.png',{type:'image/png'});
   if(navigator.canShare && navigator.canShare({files:[file]})){ await navigator.share({files:[file],text}); }
   else{ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='ipanel-visual.png'; a.click();
         window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank'); }
   ev('rv_share',{finish:f.slug});
  }catch(e){ brand.style.display='none'; console.error(e); alert('Share failed: '+e.message); }
 };
 const liveOk=(root.dataset.livear==='1')&&/Android/i.test(navigator.userAgent)&&('xr' in navigator);
 q('[data-live]').style.display=liveOk?'block':'none';
 q('[data-live]').onclick=()=>{const f=FIN[S.fin];location.href='/webxr-clad.html?fin='+f.slug+'&w='+(S.ww||3)+'&h=2.4&vert='+(S.vert?1:0);};
 const liveOk=(root.dataset.livear==='1')&&/Android/i.test(navigator.userAgent)&&('xr' in navigator);
 q('[data-live]').style.display=liveOk?'block':'none';
 q('[data-live]').onclick=()=>{const f=FIN[S.fin];location.href='/webxr-clad.html?fin='+f.slug+'&w='+(S.ww||3)+'&h=2.4&vert='+(S.vert?1:0);};
 q('[data-cart]').onclick=()=>{
  const map=JSON.parse(root.dataset.products||'{}'); const f=FIN[S.fin]; const id=map[f.slug];
  if(!id){ alert('This finish has no product linked yet.'); return; }
  ev('rv_cart',{finish:f.slug,boxes:S.boxes||1});location.href='/?add-to-cart='+id+'&quantity='+(S.boxes||1);
 };
 q('[data-next]').onclick=()=>go(S.step+1); q('[data-back]').onclick=()=>go(S.step-1);
 q('[data-detect]').onclick=async()=>{
  const st=q('[data-dstatus]'); st.textContent='Loading AI model (first time ~5MB)…';
  try{
   if(!window.__seg){ const mod=await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js');
     mod.env.allowLocalModels=false;
     window.__seg=await mod.pipeline('image-segmentation','Xenova/segformer-b0-finetuned-ade-512-512',{quantized:true}); }
   st.textContent='Analysing photo…';
   const c=document.createElement('canvas'); const sc=Math.min(1,512/photo.naturalWidth);
   c.width=Math.round(photo.naturalWidth*sc); c.height=Math.round(photo.naturalHeight*sc);
   c.getContext('2d').drawImage(photo,0,0,c.width,c.height);
   const res=await window.__seg(c.toDataURL('image/jpeg',0.85));
   const want={wall:'wall',ceiling:'ceiling',floor:'floor'}[S.surface];
   let best=null;
   for(const r of res){ const ok=(r.label===want)||(r.label==='wall'||r.label==='ceiling'||r.label==='floor');
     if(ok && (!best || r.label===want)) best=r; }
   if(!best){ st.textContent='No surface found — drag the dots instead.'; return; }
   const m=best.mask, mw=m.width, mh=m.height, md=m.data, ch=md.length/(mw*mh);
   const on=new Uint8Array(mw*mh);
   for(let i=0;i<mw*mh;i++) on[i]=md[i*ch]>127?1:0;
   let seed=-1; const cx0=(mw/2)|0, cy0=(mh/2)|0;
   if(on[cy0*mw+cx0]) seed=cy0*mw+cx0;
   else { let bd=1e18; for(let y=0;y<mh;y+=2)for(let x=0;x<mw;x+=2){const i=y*mw+x; if(on[i]){const d=(x-cx0)*(x-cx0)+(y-cy0)*(y-cy0); if(d<bd){bd=d;seed=i;}}} }
   if(seed<0){ st.textContent='No surface found — drag the dots instead.'; return; }
   const comp=new Uint8Array(mw*mh); const stk=[seed]; comp[seed]=1;
   let minx=mw,maxx=0,miny=mh,maxy=0,cnt=0;
   while(stk.length){ const i=stk.pop(); const x=i%mw, y=(i/mw)|0; cnt++;
     if(x<minx)minx=x; if(x>maxx)maxx=x; if(y<miny)miny=y; if(y>maxy)maxy=y;
     if(x>0&&on[i-1]&&!comp[i-1]){comp[i-1]=1;stk.push(i-1);}
     if(x<mw-1&&on[i+1]&&!comp[i+1]){comp[i+1]=1;stk.push(i+1);}
     if(y>0&&on[i-mw]&&!comp[i-mw]){comp[i-mw]=1;stk.push(i-mw);}
     if(y<mh-1&&on[i+mw]&&!comp[i+mw]){comp[i+mw]=1;stk.push(i+mw);} }
   if(cnt < mw*mh*0.03){ st.textContent='Surface too small — drag the dots instead.'; return; }
   const mc=document.createElement('canvas'); mc.width=mw; mc.height=mh;
   const ctxm=mc.getContext('2d'); const mi=ctxm.createImageData(mw,mh);
   for(let i=0;i<mw*mh;i++){ const o=i*4; if(comp[i]){mi.data[o]=255;mi.data[o+1]=255;mi.data[o+2]=255;mi.data[o+3]=255;} else mi.data[o+3]=0; }
   ctxm.putImageData(mi,0,0);
   const mu='url('+mc.toDataURL()+')';
   clad.style.webkitMaskImage=mu; clad.style.maskImage=mu;
   clad.style.webkitMaskSize='100% 100%'; clad.style.maskSize='100% 100%';
   S.C=[[minx,miny],[maxx,miny],[maxx,maxy],[minx,maxy]].map(p=>[p[0]/mw,p[1]/mh]);
   const OCC=['person','door','window','chair','table','sofa','bed','cabinet','shelf','curtain','plant','lamp','television','counter','desk','seat','wardrobe','clothes','apparel','rack','mirror','refrigerator','staircase'];
   const occ=new Uint8Array(mw*mh);
   for(const r of res){ if(OCC.indexOf(r.label)<0) continue; const om=r.mask; if(om.width!==mw||om.height!==mh) continue; const od=om.data, och=od.length/(mw*mh);
     for(let y=miny;y<=maxy;y++)for(let x=minx;x<=maxx;x++){ const i=y*mw+x; if(od[i*och]>127) occ[i]=1; } }
   let occCount=0; const oc=document.createElement('canvas'); oc.width=mw; oc.height=mh; const octx=oc.getContext('2d'); const oi=octx.createImageData(mw,mh);
   for(let i=0;i<mw*mh;i++){ const o=i*4; if(occ[i]){occCount++; oi.data[o]=255;oi.data[o+1]=255;oi.data[o+2]=255;oi.data[o+3]=255;} else oi.data[o+3]=0; }
   octx.putImageData(oi,0,0);
   if(occCount>mw*mh*0.005){ const ou='url('+oc.toDataURL()+')'; occl.style.webkitMaskImage=ou; occl.style.maskImage=ou;
     occl.style.webkitMaskSize='100% 100%'; occl.style.maskSize='100% 100%'; occl.style.backgroundImage='url('+S.photo+')'; }
   st.textContent='Detected: '+best.label+'. Drag dots to fine-tune.';
   ev('rv_autodetect',{label:best.label});
   update();
  }catch(e){ st.textContent='Auto-detect unavailable — drag the dots instead.'; console.error(e); }
 };
 function go(n){S.step=Math.max(1,Math.min(4,n));
  [1,2,3,4].forEach(i=>{q('[data-p'+i+']').classList.toggle('rv-hide',i!==S.step);
   q('[data-s'+i+']').innerHTML=(i===S.step?'<b>':'')+i+' '+['Photo','Surface','Finish','Result'][i-1]+(i===S.step?'</b>':'');});
  q('[data-back]').style.visibility=S.step>1?'visible':'hidden';
  q('[data-next]').style.visibility=S.step<4?'visible':'hidden';
  handles.forEach(h=>h.style.display=(S.step===2)?'block':'none');
  wipe.style.display=(S.step===4)?'block':'none';
  poly.style.display=(S.step===2)?'block':'none';
  if(S.step===4)coverage(); update();}
 function coverage(){const R=ring(S.C,S.W,S.H);const ppm=S.W/S.ww;
  const side=(Math.hypot(R[3][0]-R[0][0],R[3][1]-R[0][1])+Math.hypot(R[2][0]-R[1][0],R[2][1]-R[1][1]))/2;
  const hm=side/ppm, area=S.ww*hm, panels=Math.ceil(area/PANEL_AREA), boxes=Math.ceil(panels/PER_BOX);
  S.boxes=boxes;
  q('.rv-coverage').innerHTML='Wall ≈ <b>'+area.toFixed(1)+' m²</b> · needs ≈ <b>'+panels+' panel'+(panels>1?'s':'')+'</b> = <b>'+boxes+' box'+(boxes>1?'es':'')+'</b> (10 panels/box). Final count confirmed at checkout.';}
 function update(){if(!S.W)return;const R=ring(S.C,S.W,S.H);
  handles.forEach((h,i)=>{h.style.left=S.C[i][0]*S.W+'px';h.style.top=S.C[i][1]*S.H+'px';});
  poly.setAttribute('points',R.map(p=>p.join(',')).join(' '));
  const Src=[[0,0],[S.W,0],[S.W,S.H],[0,S.H]],A=[],b=[];
  for(let i=0;i<4;i++){const xs=Src[i][0],ys=Src[i][1],xd=R[i][0],yd=R[i][1];
   A.push([xs,ys,1,0,0,0,-xs*xd,-ys*xd]);b.push(xd);A.push([0,0,0,xs,ys,1,-xs*yd,-ys*yd]);b.push(yd);}
  const s=solve8(A,b), tf='matrix3d('+s[0]+','+s[3]+',0,'+s[6]+','+s[1]+','+s[4]+',0,'+s[7]+',0,0,1,0,'+s[2]+','+s[5]+',0,1)';
  const f=FIN[S.fin];
  pr.style.transform=tf; gr.style.transform=tf;
  const _u=TEX+f.slug+'/albedo-s'+(S.vert?'-rot-mir':'-mir')+'.webp';
  pr.style.backgroundImage='url('+_u+')';
  const _im=new Image(); _im.onerror=()=>{pr.style.backgroundImage='url('+TEX+f.slug+'/visualizer'+(S.vert?'-rot':'')+'.webp)';}; _im.src=_u;
  const ppm=S.W/S.ww;
  pr.style.backgroundSize=S.vert?(TH*ppm)+'px '+(2*TL*ppm)+'px':(2*TL*ppm)+'px '+(TH*ppm)+'px';
  const gp=Math.max(1,.004*ppm),pp=.03*ppm,jp=EFF*ppm,jw=Math.max(1.5,.006*ppm),ej=3.05*ppm,ew=Math.max(1,.003*ppm);
  const ax=S.vert?'to right':'to bottom', ay=S.vert?'to bottom':'to right';
  gr.style.backgroundImage='repeating-linear-gradient('+ax+',rgba(0,0,0,.85) 0 '+gp+'px,rgba(255,255,255,.15) '+gp+'px '+(gp+1)+'px,transparent '+(gp+1)+'px '+pp+'px),'
   +'repeating-linear-gradient('+ax+',rgba(0,0,0,.95) 0 '+jw+'px,transparent '+jw+'px '+jp+'px),'
   +'repeating-linear-gradient('+ay+',rgba(0,0,0,.8) 0 '+ew+'px,transparent '+ew+'px '+ej+'px)';
  sh.style.clipPath='polygon('+R.map(p=>p.map(v=>v+'px').join(' ')).join(',')+')';
  sh.style.backgroundImage=S.photo?('url('+S.photo+')'):'none'; sh.style.backgroundSize='100% 100%';
  sh.style.display=S.shade?'block':'none';
  applyBA();
  ev('rv_update',{finish:f.slug,surface:S.surface});}
 let drag=-1;
 handles.forEach((h,i)=>{h.addEventListener('pointerdown',e=>{drag=i;h.setPointerCapture(e.pointerId);});
  h.addEventListener('pointermove',e=>{if(drag!==i)return;const r=stage.getBoundingClientRect();
   S.C[i]=[(e.clientX-r.left)/S.W,(e.clientY-r.top)/S.H];update();});
  h.addEventListener('pointerup',()=>{drag=-1;S.conf=Math.max(S.conf||0,0.75);});});
 go(1);
}
document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('.ipanel-rv').forEach(r=>{try{init(r);}catch(e){console.error(e);
 r.innerHTML='<div class="rv-card" style="padding:18px">The visualizer could not start on this device. <a href="/contact/">Contact us</a> or WhatsApp iPanel for a free visualisation.</div>';}}));
})();

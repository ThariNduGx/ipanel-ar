(function(){
var CDN='https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.min.js';
var T=null;
function solve8(A,b){for(var i=0;i<8;i++){var p=i;for(var r=i+1;r<8;r++)if(Math.abs(A[r][i])>Math.abs(A[p][i]))p=r;
var t=A[i];A[i]=A[p];A[p]=t;var t2=b[i];b[i]=b[p];b[p]=t2;var pv=A[i][i]||1e-12;
for(var r2=0;r2<8;r2++){if(r2===i)continue;var f=A[r2][i]/pv;for(var c=i;c<8;c++)A[r2][c]-=f*A[i][c];b[r2]-=f*b[i];}}
return b.map(function(v,i){return v/(A[i][i]||1e-12);});}
window.iPanelPBR={create:function(canvas){
 return import(CDN).then(function(TH){
  T=TH;
  var renderer=new T.WebGLRenderer({canvas:canvas,alpha:true,antialias:true});
  renderer.outputColorSpace=T.SRGBColorSpace; renderer.toneMapping=T.ACESFilmicToneMapping;
  var scene=new T.Scene(), cam=new T.PerspectiveCamera(60,1,0.05,60);
  var geo=new T.PlaneGeometry(1,1); geo.translate(0.5,-0.5,0);
  var mat=new T.MeshPhysicalMaterial({side:T.FrontSide,metalness:0});
  var mesh=new T.Mesh(geo,mat); mesh.matrixAutoUpdate=false; scene.add(mesh);
  scene.add(new T.AmbientLight(0xffffff,0.3));
  var sun=new T.DirectionalLight(0xffffff,1.1); sun.position.set(0.4,0.8,1); scene.add(sun);
  var pmrem=new T.PMREMGenerator(renderer);
  var rt=new T.WebGLRenderTarget(1,1);
  var comp=new T.Scene(), ccam=new T.OrthographicCamera(-1,1,1,-1,0,1);
  var cmat=new T.ShaderMaterial({uniforms:{tD:{value:null},mS:{value:null},mO:{value:null},lU:{value:null},hasS:{value:0},hasO:{value:0},hasL:{value:0},mean:{value:1}},
   vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position*2.0-1.0,0.0,1.0);}',
   fragmentShader:'precision highp float;varying vec2 vUv;uniform sampler2D tD;uniform sampler2D mS;uniform sampler2D mO;uniform sampler2D lU;uniform int hasS;uniform int hasO;uniform int hasL;uniform float mean;void main(){vec2 uv=vec2(vUv.x,1.0-vUv.y);if(hasS==1&&texture2D(mS,uv).a<0.5)discard;if(hasO==1&&texture2D(mO,uv).a>0.5)discard;vec4 c=texture2D(tD,uv);if(hasL==1){float l=texture2D(lU,uv).r;c.rgb*=clamp(l/max(mean,0.001),0.35,1.7);}gl_FragColor=vec4(c.rgb,1.0);}'});
  comp.add(new T.Mesh(new T.PlaneGeometry(2,2),cmat));
  var api={
   setEnv:function(photo){var w=64,h=32,c=document.createElement('canvas');c.width=w;c.height=h;var x=c.getContext('2d');x.drawImage(photo,0,0,w,h);var d=x.getImageData(0,0,w,h).data;var data=new Uint8Array(w*h*4);for(var i=0;i<w*h;i++){var o=i*4;data[o]=d[o];data[o+1]=d[o+1];data[o+2]=d[o+2];data[o+3]=255;}var eq=new T.DataTexture(data,w,h);eq.needsUpdate=true;eq.mapping=T.EquirectangularReflectionMapping;eq.colorSpace=T.SRGBColorSpace;scene.environment=pmrem.fromEquirectangular(eq).texture;eq.dispose();},
   setMaps:function(a,n,opts){if(mat.map)mat.map.dispose();if(mat.normalMap)mat.normalMap.dispose();
    var mk=function(im,srgb){var t=new T.Texture(im);if(srgb)t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.anisotropy=renderer.capabilities.getMaxAnisotropy();t.needsUpdate=true;return t;};
    mat.map=mk(a,true); mat.normalMap=mk(n,false); mat.normalScale=new T.Vector2(1.2,1.2);
    mat.roughness=opts.rough; mat.clearcoat=opts.clearcoat; mat.clearcoatRoughness=0.25; mat.needsUpdate=true; api._tileM=opts.tileM;},
   setMasks:function(cs,co,cl,mean){api._mS=cs?new T.CanvasTexture(cs):null;if(api._mS)api._mS.flipY=false;
    api._mO=co?new T.CanvasTexture(co):null;if(api._mO)api._mO.flipY=false;
    api._mL=cl?new T.CanvasTexture(cl):null;if(api._mL)api._mL.flipY=false; api._mean=mean;},
   draw:function(o){var W=o.W,H=o.H;renderer.setSize(W,H,false);rt.setSize(W,H);
    var fovH=(o.fovH||65)*Math.PI/180; var fx=W/(2*Math.tan(fovH/2));
    cam.aspect=W/H; cam.fov=2*Math.atan(H/(2*fx))*180/Math.PI; cam.updateProjectionMatrix();
    var Ss=[[0,0],[o.Wm,0],[o.Wm,o.Hm],[0,o.Hm]],A=[],b=[];
    for(var i=0;i<4;i++){var xs=Ss[i][0],ys=Ss[i][1],xd=o.corners[i][0],yd=o.corners[i][1];
     A.push([xs,ys,1,0,0,0,-xs*xd,-ys*xd]);b.push(xd);A.push([0,0,0,xs,ys,1,-xs*yd,-ys*yd]);b.push(yd);}
    var h=solve8(A,b), cx=W/2, cy=H/2;
    var kinv=function(v){var w=v[2]||1;return[(v[0]/w-cx)/fx,(v[1]/w-cy)/fx,1];};
    var r1=kinv([h[0],h[3],h[6]]), r2=kinv([h[1],h[4],h[7]]);
    var lam=1/Math.hypot(r1[0],r1[1],r1[2]); r1=r1.map(function(v){return v*lam;}); r2=r2.map(function(v){return v*lam;});
    var r3=[r1[1]*r2[2]-r1[2]*r2[1],r1[2]*r2[0]-r1[0]*r2[2],r1[0]*r2[1]-r1[1]*r2[0]];
    var t=kinv([h[2],h[5],h[8]]).map(function(v){return v*lam;});
    mesh.matrix.set(r1[0]*o.Wm,-r2[0]*o.Hm,r3[0],t[0], r1[1]*o.Wm,-r2[1]*o.Hm,r3[1],t[1], r1[2]*o.Wm,-r2[2]*o.Hm,r3[2],t[2], 0,0,0,1);
    if(mat.map&&api._tileM){mat.map.repeat.set(o.Wm/api._tileM[0],o.Hm/api._tileM[1]); mat.normalMap.repeat.set(o.Wm/0.3,o.Hm/0.3);}
    renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene,cam); renderer.setRenderTarget(null);
    var u=cmat.uniforms; u.tD.value=rt.texture;
    u.hasS.value=api._mS?1:0; if(api._mS)u.mS.value=api._mS;
    u.hasO.value=api._mO?1:0; if(api._mO)u.mO.value=api._mO;
    u.hasL.value=api._mL?1:0; if(api._mL){u.lU.value=api._mL;u.mean.value=api._mean||1;}
    renderer.render(comp,ccam);}
  };
  return api;
 });
}};
})();

(function(){

window.iPanelGL={create:function(canvas){
 var gl=canvas.getContext('webgl2'); if(!gl)return null;
 var VS='attribute vec2 a;varying vec2 vUv;void main(){vUv=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}';
 var FS='precision highp float;varying vec2 vUv;'
  +'uniform vec2 res;uniform mat3 Hinv;uniform vec2 tile;'
  +'uniform sampler2D panel;uniform sampler2D maskS;uniform sampler2D maskO;uniform sampler2D lum;'
  +'uniform int hasS;uniform int hasO;uniform int hasL;uniform float mean;'
  +'void main(){vec2 mv=vec2(vUv.x,1.0-vUv.y);'
  +'if(hasS==1&&texture2D(maskS,mv).a<0.5)discard;'
  +'if(hasO==1&&texture2D(maskO,mv).a>0.5)discard;'
  +'vec2 p=vec2(vUv.x*res.x,(1.0-vUv.y)*res.y);'
  +'vec3 q=Hinv*vec3(p,1.0);q/=q.z;'
  +'if(q.x<0.0||q.y<0.0||q.x>res.x||q.y>res.y)discard;'
  +'vec3 col=texture2D(panel,q/tile).rgb;'
  +'if(hasL==1){float l=texture2D(lum,mv).r;col*=clamp(l/max(mean,0.001),0.35,1.7);}'
  +'gl_FragColor=vec4(col,1.0);}';
 function sh(t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);
  if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o;}
 var pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);
 if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error('link');
 gl.useProgram(pr);
 var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 var loc=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
 var U=function(n){return gl.getUniformLocation(pr,n);};
 function upload(src,repeat,mip,flipY){var t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,!!flipY);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);
  gl.wrapS=gl.wrapT=repeat?gl.REPEAT:gl.CLAMP_TO_EDGE;
  if(mip){gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
   var e=gl.getExtension('EXT_texture_filter_anisotropic');
   if(e)gl.texParameterf(gl.TEXTURE_2D,e.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,gl.getParameter(e.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));}
  else gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);return t;}
 return {gl:gl,
  tex:function(img){return upload(img,true,true,true);},
  del:function(t){if(t)gl.deleteTexture(t);},,
  mask:function(cvs){return upload(cvs,false,false);},
  draw:function(o){gl.viewport(0,0,o.W,o.H);gl.useProgram(pr);
   gl.uniform2f(U('res'),o.W,o.H);gl.uniform2f(U('tile'),o.tile[0],o.tile[1]);
   var hi=window.iPanelHomography.inv3(o.homog);
    if(!hi) return;gl.uniformMatrix3fv(U('Hinv'),false,new Float32Array([hi[0],hi[3],hi[6],hi[1],hi[4],hi[7],hi[2],hi[5],hi[8]]));
   gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,o.panel);gl.uniform1i(U('panel'),0);
   gl.activeTexture(gl.TEXTURE1);if(o.maskS){gl.bindTexture(gl.TEXTURE_2D,o.maskS);gl.uniform1i(U('maskS'),1);gl.uniform1i(U('hasS'),1);}else gl.uniform1i(U('hasS'),0);
   gl.activeTexture(gl.TEXTURE2);if(o.maskO){gl.bindTexture(gl.TEXTURE_2D,o.maskO);gl.uniform1i(U('maskO'),2);gl.uniform1i(U('hasO'),1);}else gl.uniform1i(U('hasO'),0);
   gl.activeTexture(gl.TEXTURE3);if(o.lum){gl.bindTexture(gl.TEXTURE_2D,o.lum);gl.uniform1i(U('lum'),3);gl.uniform1i(U('hasL'),1);gl.uniform1f(U('mean'),o.mean||1);}else gl.uniform1i(U('hasL'),0);
   gl.drawArrays(gl.TRIANGLES,0,3);}
 };
}};
})();

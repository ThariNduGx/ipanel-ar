(function(){
var VS='#version 300 es\nvoid main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.0-1.0,0.0,1.0);}';
var FS='#version 300 es\nprecision highp float;\n'
+'uniform vec2 res;uniform mat3 Hinv;uniform vec2 tile;\n'
+'uniform sampler2D panel;uniform sampler2D maskS;uniform sampler2D maskO;uniform sampler2D lum;\n'
+'uniform int hasS;uniform int hasO;uniform int hasL;uniform float mean;out vec4 o;\n'
+'void main(){vec2 p=vec2(gl_FragCoord.x,res.y-gl_FragCoord.y);vec2 sp=vec2(p.x/res.x,1.0-p.y/res.y);\n'
+' if(hasS==1&&texture(maskS,sp).a<0.5)discard;\n'
+' if(hasO==1&&texture(maskO,sp).a>0.5)discard;\n'
+' vec3 q=Hinv*vec3(p,1.0);q/=q.z;\n'
+' if(q.x<0.0||q.y<0.0||q.x>res.x||q.y>res.y)discard;\n'
+' vec3 col=texture(panel,q/tile).rgb;\n'
+' if(hasL==1){float l=texture(lum,sp).r;col*=clamp(l/max(mean,0.001),0.35,1.7);}\n'
+' o=vec4(col,1.0);}';
function comp(gl,t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o;}
function inv3(m){var a=m[0],b=m[1],c=m[2],d=m[3],e=m[4],f=m[5],g=m[6],h=m[7],i=m[8];
 var A=e*i-f*h,B=-(d*i-f*g),C=d*h-e*g,det=a*A+b*B+c*C;if(!det)return m;
 return [A/det,B/det,C/det,-(b*i-c*h)/det,(a*i-c*g)/det,-(a*h-b*g)/det,(b*f-c*e)/det,-(a*f-c*d)/det,(a*e-b*d)/det];}
window.iPanelGL={create:function(canvas){
 var gl=canvas.getContext('webgl2'); if(!gl)return null;
 try{
  var pr=gl.createProgram();gl.attachShader(pr,comp(gl,gl.VERTEX_SHADER,VS));gl.attachShader(pr,comp(gl,gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error('link');
  gl.useProgram(pr);gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,4,gl.STATIC_DRAW);
  var U=function(n){return gl.getUniformLocation(pr,n);};
  return {gl:gl,
   tex:function(img){var t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);gl.wrapS=gl.wrapT=gl.REPEAT;gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);var e=gl.getExtension('EXT_texture_filter_anisotropic');if(e)gl.texParameterf(gl.TEXTURE_2D,e.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,gl.getParameter(e.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));return t;},
   mask:function(cvs){var t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cvs);gl.wrapS=gl.wrapT=gl.CLAMP_TO_EDGE;gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);return t;},
   draw:function(o){gl.useProgram(pr);gl.viewport(0,0,o.W,o.H);
    gl.uniform2f(U('res'),o.W,o.H);gl.uniform2f(U('tile'),o.tile[0],o.tile[1]);
    var hi=inv3(o.H);gl.uniformMatrix3fv(U('Hinv'),false,new Float32Array([hi[0],hi[3],hi[6],hi[1],hi[4],hi[7],hi[2],hi[5],hi[8]]));
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,o.panel);gl.uniform1i(U('panel'),0);
    gl.activeTexture(gl.TEXTURE1);if(o.maskS){gl.bindTexture(gl.TEXTURE_2D,o.maskS);gl.uniform1i(U('maskS'),1);gl.uniform1i(U('hasS'),1);}else gl.uniform1i(U('hasS'),0);
    gl.activeTexture(gl.TEXTURE2);if(o.maskO){gl.bindTexture(gl.TEXTURE_2D,o.maskO);gl.uniform1i(U('maskO'),2);gl.uniform1i(U('hasO'),1);}else gl.uniform1i(U('hasO'),0);
    gl.activeTexture(gl.TEXTURE3);if(o.lum){gl.bindTexture(gl.TEXTURE_2D,o.lum);gl.uniform1i(U('lum'),3);gl.uniform1i(U('hasL'),1);gl.uniform1f(U('mean'),o.mean);}else gl.uniform1i(U('hasL'),0);
    gl.drawArrays(gl.TRIANGLES,0,3);}
  };
 }catch(e){console.warn('iPanel GL init failed',e);return null;}
}};
})();

import json
from pathlib import Path
from PIL import Image
import numpy as np
for d in sorted(Path('textures').iterdir()):
    if not (d/'albedo.json').exists(): continue
    side=json.loads((d/'albedo.json').read_text())
    p=side['pitch_px']; pxmm=side['px_per_mm']
    im=Image.open(d/'albedo.webp').convert('RGB')
    a=np.asarray(im).astype(float)/255.0
    h,w,_=a.shape
    gw=max(3,int(round(4.0*pxmm)))
    prof=np.ones(h)
    for b in range(0,h+p,p):
        lo,hi=max(0,b-gw//2),min(h,b+gw//2)
        for r in range(lo,hi):
            prof[r]=min(prof[r],0.25+0.75*abs(r-b)/(gw/2))
    prof[0:3]=0.2; prof[-3:]=0.2
    a*=prof[:,None,None]
    out=Image.fromarray((np.clip(a,0,1)*255).astype('uint8'))
    out=out.resize((1200,max(2,int(1200*h/w))),Image.LANCZOS)
    out.save(d/'visualizer.webp',quality=88)
    out.transpose(Image.Transpose.ROTATE_90).save(d/'visualizer-rot.webp',quality=88)
    print('ok',d.name)

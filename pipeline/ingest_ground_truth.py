import json, sys
from pathlib import Path
import numpy as np
from PIL import Image
try:
    from skimage.metrics import structural_similarity as ssim
    from skimage.color import rgb2lab, deltaE_ciede2000
    HAVE_SK=True
except Exception:
    HAVE_SK=False
try:
    from playwright.sync_api import sync_playwright
    HAVE_PW=True
except Exception:
    HAVE_PW=False
GT=Path(sys.argv[1] if len(sys.argv)>1 else '../ground-truth')
HARNESS='http://localhost:8080/tools/gt-render.html'
rows=[]
rooms=sorted([d for d in GT.iterdir() if d.is_dir()]) if GT.exists() else []
if not rooms:
    print('no ground-truth rooms found at', GT.resolve(), '- kit is ready, awaiting photos.'); sys.exit(0)
if not (HAVE_SK and HAVE_PW):
    print('needs: pip install scikit-image  &&  playwright (tools/node_modules). '); sys.exit(2)
with sync_playwright() as pw:
    b=pw.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
    for room in rooms:
        marks=[]
        mf=room/'marks.jsonl'
        if mf.exists(): marks=[json.loads(l) for l in mf.read_text().splitlines() if l.strip()]
        for mk in marks:
            page=b.new_page(); page.set_viewport_size({'width':1200,'height':900})
            q=json.dumps(mk['quad'])
            page.goto(f"{HARNESS}?photo=/{GT.name}/{room.name}/{mk['photo']}&quad={q}&finish={mk['finish']}&w={mk['width_m']}&h={mk['height_m']}", wait_until='load')
            page.wait_timeout(1200)
            out=room/f"render_{mk['photo']}.png"
            page.query_selector('#out').screenshot(path=str(out)); page.close()
            real=np.asarray(Image.open(room/mk['photo']).convert('RGB'),dtype=float)
            rend=np.asarray(Image.open(out).convert('RGB'),dtype=float)
            Hh,Ww=min(real.shape[0],rend.shape[0]),min(real.shape[1],rend.shape[1])
            real=real[:Hh,:Ww]; rend=rend[:Hh,:Ww]
            xs=[int(p[0]*Ww) for p in mk['quad']]; ys=[int(p[1]*Hh) for p in mk['quad']]
            x0,x1,y0,y1=max(0,min(xs)),min(Ww,max(xs)),max(0,min(ys)),min(Hh,max(ys))
            a=real[y0:y1,x0:x1]; c=rend[y0:y1,x0:x1]
            if a.size==0: continue
            s=ssim(a.astype('uint8'), c.astype('uint8'), channel_axis=2, data_range=255)
            de=deltaE_ciede2000(rgb2lab(a/255.0), rgb2lab(c/255.0)).mean()
            panels_est=max(1, -(-int(mk['width_m']/0.29)//1) * -(-int(mk['height_m'])//1)) if False else max(1, __import__('math').ceil(__import__('math').ceil(mk['width_m']/0.29)*mk['height_m']/3.05))
            scale_err=abs(panels_est-mk['panels'])/max(1,mk['panels'])*100
            rows.append({'room':room.name,'photo':mk['photo'],'finish':mk['finish'],'ssim':round(s,3),'dE2000':round(de,2),'scale_err_pct':round(scale_err,1)})
    b.close()
import math
print(f"{'room':12}{'photo':18}{'finish':14}{'SSIM':>7}{'dE2000':>8}{'scale%':>8}")
for r in rows: print(f"{r['room']:12}{r['photo']:18}{r['finish']:14}{r['ssim']:>7}{r['dE2000']:>8}{r['scale_err_pct']:>8}")
bad=[r for r in rows if r['ssim']<0.85 or r['dE2000']>3.0 or r['scale_err_pct']>5]
Path('../docs/GT-SCORECARD.md').write_text('# Ground-truth scorecard\n\n'+ '\n'.join(f"- {r['room']}/{r['photo']} {r['finish']}: SSIM {r['ssim']}, dE2000 {r['dE2000']}, scale {r['scale_err_pct']}%" for r in rows) + f"\n\nFAIL: {len(bad)}\n")
print('FAIL count:', len(bad)); sys.exit(1 if bad else 0)

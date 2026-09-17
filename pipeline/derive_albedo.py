#!/usr/bin/env python3
"""Usage: python3 derive_albedo.py textures/<slug>/source.webp <slug>"""
import sys, json
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

def autocrop(a, thresh=12):
    m = a.mean(axis=2) > (thresh/255.0)
    r = np.where(m.any(axis=1))[0]; c = np.where(m.any(axis=0))[0]
    return a[r[0]:r[-1]+1, c[0]:c[-1]+1]

def pitch(sig, min_lag=20):
    s = sig - sig.mean()
    ac = np.correlate(s, s, 'full')[len(s)-1:]
    return min_lag + int(np.argmax(ac[min_lag:len(s)//2]))

def main():
    src = Path(sys.argv[1]); slug = sys.argv[2]
    img = Image.open(src).convert('RGB')
    a = np.asarray(img).astype(float) / 255.0
    a = autocrop(a)
    sig = a.mean(axis=2).mean(axis=1)          # per-row brightness
    p = pitch(sig)                              # slat pitch in px (=30mm)
    folded = sig[: (len(sig)//p)*p].reshape(-1, p).mean(axis=0)
    thr = folded.min() + 0.5*(np.median(folded) - folded.min())
    mask = np.array([folded[r % p] < thr for r in range(a.shape[0])])
    g = int(np.argmin(folded))                  # groove centre offset
    # inpaint groove rows from neighbours
    out = a.copy()
    for r in np.where(mask)[0]:
        l = r-1
        while l >= 0 and mask[l]: l -= 1
        u = r+1
        while u < a.shape[0] and mask[u]: u += 1
        if l >= 0 and u < a.shape[0]:
            t = (r-l)/(u-l); out[r] = (1-t)*a[l] + t*a[u]
    # crop exactly one face = 10 pitches, starting at a groove centre
    rows = (out.shape[0] // p) * p
    assert rows >= 5*p, "source image too short for one face"
    out = out[:rows]
    # flatten lighting gently
    lum = np.asarray(Image.fromarray((out.mean(axis=2)*255).astype(np.uint8)).filter(
        ImageFilter.GaussianBlur(radius=max(20, out.shape[0]//6)))).astype(float)/255.0
    out = np.clip(out * (lum.mean()/(lum+1e-6))[..., None], 0, 1)
    dst = src.parent
    Image.fromarray((out*255).astype(np.uint8)).save(dst/'albedo.webp', quality=85)
    (dst/'albedo.json').write_text(json.dumps({
        "source": src.name, "pitch_px": p, "px_per_mm": p/30.0,
        "groove_center_px": g, "face_height_px": rows}, indent=2))
    print(f"OK {slug}: pitch={p}px  px/mm={p/30.0:.2f}  face={out.shape[1]}x{out.shape[0]}")

if __name__ == '__main__':
    main()

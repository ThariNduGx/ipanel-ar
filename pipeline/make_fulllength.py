import sys
from pathlib import Path
from PIL import Image
slug=sys.argv[1]
d=Path('textures')/slug
art=Image.open(d/'artwork.png').convert('RGB')   # supplier print: one full 3050mm x 290mm face
w=1500; h=max(2,int(1500*art.height/art.width))
s=art.resize((w,h),Image.LANCZOS)
s.save(d/'albedo-s-full.webp',quality=82)
s.transpose(Image.Transpose.ROTATE_90).save(d/'albedo-s-rot-full.webp',quality=82)
print('full-length textures ready for',slug)

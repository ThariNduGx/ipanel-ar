# Factory artwork request (per finish) — kills mirror-tiling repeat
Ask the supplier for the PRINT FILE of one full panel face:
- Physical: 3050 mm (length) x 290 mm (effective face width), slats along length.
- Resolution: >=150 dpi at physical size (>=18,000 x 1,700 px ideal; 6,000 x 570 px minimum).
- Content: flat scanned decor WITHOUT grooves (grooves added procedurally), no perspective, no lighting gradient, no border/letterbox.
- Format: PNG or TIFF, sRGB.
Intake: save as pipeline/textures/<slug>/artwork.png, then:
  python3 make_fulllength.py <slug>
  copy albedo-s-full.webp + albedo-s-rot-full.webp into uploads/ipanel-ar/textures/<slug>/ (local + prod)
The visualizer auto-prefers full-length (no mirror chevron); falls back to mirror tiles when absent.

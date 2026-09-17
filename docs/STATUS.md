# iPanel AR/3D & Room Visualizer — Status & Handoff

## Environments
- Repo: ~/Projects/ipanel-ar (git → GitHub). Pipeline venv: pipeline/.venv.
- Local: Local by Flywheel "ipanel" (ipanel.local); tools server: python3 -m http.server 8080.
- Production: ipanel.lk (cPanel, LiteSpeed+Autoptimize ON). /visualizer/, /ar-test/, /webxr-clad.html.

## Repo layout
- pipeline/: build_panel.py (Blender parametric), derive_albedo.py, make_visualizer_texture.py, profiles/*.json, textures/<slug>/{albedo,visualizer,albedo-s,*-mir,*-rot}.webp, output/*.{glb,usdz}
- plugin/ipanel-visualizer/: [ipanel_viewer] 3D/AR shortcode; [ipanel_room_visualizer] + Elementor widget; includes/class-{visualizer,compat,elementor}.php; assets/js/visualizer.js; assets/css/visualizer.css
- tools/: clad-demo.html (interaction proof), webxr-clad.html (WebXR live-clad spike)
- docs/STATUS.md (this file)

## Phases & gates
- Phase 0 (pipeline + object AR + perf): DONE. Vanilla Scene-Viewer-safe GLB (PNG, no Draco, centered origin); AR launch validated on Android Scene Viewer + iPhone Quick Look on production.
- Phase 1 (Room Visualizer): DONE on production. Wizard; auto-detect (on-device SegFormer) + mask clip + foreground occlusion; manual 4-dot; true-scale 3-layer clad; before/after; coverage→boxes; WhatsApp share; add-to-cart(+variation); Elementor widget; GA4 bridge; optimizer-safe.
- Phase 2 (commerce depth): DONE (variation-aware cart, Elementor, GA4). Gate C record PENDING.
- Phase 3 (realism): occlusion DONE; Gate-B calibration UI DONE (values PENDING); WebXR spike DEPLOYED, go/no-go PENDING.

## Open inputs / risks
1. Factory full-length (3.05m) artwork per finish — removes mirror-tile chevron repeat (highest visual value).
2. Gate-B calibration lines (5 finishes) via sliders → Settings.
3. Gate C / Phase-1 perf record (PSI mobile LCP/CLS + loader.io).
4. WebXR go/no-go → promote Live-AR or log ADR note (iOS has no WebXR; photo visualizer remains backbone).
5. Sample rooms: generated set live; swap in hero marketing renders when available.

## Decision log (key)
- Photo Room Visualizer = cross-platform backbone; WebXR live = Android-only enhancement.
- Vanilla GLB export after Scene Viewer rejections (off-spec WebP; corner-origin invisibility).
- Relative asset URLs everywhere (env parity).
- Shading = blurred luminance only (sharp multiply caused see-through).
- Grooves/joints procedural (raster grooves moiré). Mirror-tiling until factory artwork.

## Ops runbook (deploy)
1. Edit locally → test ipanel.local (+ localhost:8080 for tools).
2. Zip plugin → cPanel plugins/ delete folder → upload → extract → activate → LiteSpeed purge.
3. Textures: pipeline gen → uploads/ipanel-ar/textures/<slug>/ (local + prod).
4. Settings → iPanel Visualizer: samples, products, calibration, livear.

## QA checklist (each release)
Full wizard Android+iPhone; console clean; our JS/CSS separate in Network; /ar-test/ ok; coverage sane; share+cart ok; PSI no regression.

## Hardening (Phase 3 close)
- Error boundary: init try/catch → friendly fallback card with contact links.
- a11y: prefers-reduced-motion, focus-visible outlines, aria-live detect status, keyboard-nudge handles.
- Payload: swatch thumbs 160px; print textures 1000px q80; mirror tiles retained. Textures zip: ipanel-textures.zip.

## Phase 4 growth plan (next)
1. Visualizer on every product page via Elementor single-product template (finish preselected from product).
2. SEO/structured data: Product + ImageObject + VideoObject/3DModel (model-viewer schema) for AR/3D assets.
3. GA4 funnel dashboard ownership (docs/GA4-FUNNEL.md) + A/B readout at ≥500 sessions/side.
4. UGC gallery with consent + moderation (REST pending/approved folders, admin approve UI).
5. Factory-artwork intake: per-finish 3.05m print → regenerate textures (removes mirror chevron).
6. Live-AR promotion decision from WebXR go/no-go.

## Hardening (Phase 3 close)
- Error boundary: init try/catch → friendly fallback card with contact links.
- a11y: prefers-reduced-motion, focus-visible outlines, aria-live detect status, keyboard-nudge handles.
- Payload: 160px swatch thumbs; 1000px q80 print textures; mirror tiles retained. Textures zip: ipanel-textures.zip.

## Phase 4 growth plan (next)
1. Visualizer on every product page via Elementor single-product template (finish preselected from product).
2. SEO/structured data: Product + 3DModel (model-viewer schema) for AR/3D assets.
3. GA4 funnel dashboard ownership (docs/GA4-FUNNEL.md) + A/B readout at ≥500 sessions/side.
4. UGC gallery with consent + moderation (REST pending/approved, admin approve UI).
5. Factory-artwork intake: per-finish 3.05m print → regenerate textures (removes mirror chevron).
6. Live-AR promotion decision from WebXR go/no-go.

## Deep-research disposition (Phase 4 close)
Adopted now: line-fit quad (mask boundary lines -> corner intersections), door-prior auto-scale (2.0m) with override, contact-shadow layer, privacy trust line, rAF-throttled drag, NSFWJS client gate on UGC.
Phase 5 strategic: metric depth (Metric3D/Depth-Anything-metric) to remove manual measurement; depth-based occlusion; WebGL2 compositor with mipmaps + normal-map grooves; ONNX Runtime Web evaluation; i18n (si/ta); cut-list/waste installer tool.
Rejected: LayoutNet/RoomNet, HarmonyNet/Poisson (license+weight risk), OpenCV.js WASM (line-fit covers need).

## Deep-research disposition (Phase 4 close)
Adopted now: line-fit quad (mask boundary lines -> corner intersections); door-prior auto-scale (2.0m) with override; contact-shadow layer; privacy trust line; rAF-throttled drag; NSFWJS client gate on UGC.
Phase 5 strategic: metric depth (Metric3D / Depth-Anything-metric) to remove manual measurement; depth-based occlusion; WebGL2 compositor with mipmaps + normal-map grooves; ONNX Runtime Web evaluation; i18n (si/ta); cut-list/waste installer tool.
Rejected: LayoutNet/RoomNet; HarmonyNet/Poisson (license + weight risk); OpenCV.js WASM (line-fit covers the need).

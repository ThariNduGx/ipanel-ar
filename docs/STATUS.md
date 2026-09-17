# iPanel AR/3D & Room Visualizer — Status & Handoff

## Environments
- Repo: ~/Projects/ipanel-ar (git → GitHub). Pipeline venv: pipeline/.venv.
- Local: Local by Flywheel site "ipanel" (ipanel.local). Local server for tools: python3 -m http.server 8080.
- Production: ipanel.lk (cPanel, LiteSpeed + Autoptimize ON). Visualizer page: /visualizer/. AR test: /ar-test/. Live-AR spike: /webxr-clad.html.

## Repo layout
- pipeline/ Blender parametric builder (build_panel.py), derive_albedo.py, make_visualizer_texture.py, profiles/*.json, textures/<slug>/{albedo,visualizer,albedo-s,*-mir,*-rot}.webp, output/*.{glb,usdz}
- plugin/ipanel-visualizer/ WP plugin: 3D/AR viewer shortcode [ipanel_viewer]; Room Visualizer [ipanel_room_visualizer] + Elementor widget; includes/class-{visualizer,compat,elementor}.php; assets/js/visualizer.js, assets/css/visualizer.css
- tools/ clad-demo.html (interaction proof), compositor-demo.html (retired), webxr-clad.html (WebXR live-clad spike)
- docs/STATUS.md (this file)

## Phases & gates
- Phase 0 (pipeline + object AR + perf): DONE. GLB/USDZ per finish, vanilla Scene-Viewer-safe export (PNG, no Draco, centered origin), true-scale verified conceptually; AR launch on Android Scene Viewer + iPhone Quick Look validated on production.
- Phase 1 (Room Visualizer): DONE on production. Wizard (photo/camera/samples → surface → finish → result), auto-detect (SegFormer-B0 on-device) + mask clip + foreground occlusion, manual 4-dot override, true-scale 3-layer clad (print + procedural grooves/joints + blurred shading), before/after, coverage→boxes, WhatsApp share, add-to-cart(+variation), Elementor widget, GA4 bridge (rv_update/rv_autodetect/rv_share/rv_cart), optimizer-safe.
- Phase 2 (commerce depth): DONE (variation-aware coverage/cart, Elementor, GA4). Gate C record: PENDING (PSI + loader.io numbers not yet filed).
- Phase 3 (realism): occlusion DONE; Gate-B calibration UI DONE (values PENDING from brand owner); WebXR live-clad spike DEPLOYED, go/no-go PENDING.

## Open inputs / risks
1. Factory full-length (3.05m) artwork per finish — removes mirror-tile chevron repeat. HIGHEST visual value.
2. Gate-B calibration lines (5 finishes) — brand owner to set via sliders → Settings.
3. Gate C / Phase-1 perf record (PSI mobile LCP/CLS, loader.io) — to file.
4. WebXR go/no-go — decides Live-AR promotion vs ADR note (iOS has no WebXR; photo visualizer remains backbone).
5. Sample rooms: generated set loaded; replace with hero marketing renders when available.

## Decision log (key)
- DR-02: photo Room Visualizer = cross-platform backbone; WebXR live = Android-only enhancement.
- GLB export vanilla (PNG/no-Draco/centered) after Scene Viewer rejections (WebP off-spec; corner-origin invisible).
- Relative asset URLs everywhere (local/staging/prod parity).
- Shading = blurred luminance only (sharp multiply caused see-through).
- Grooves/joints procedural (vector) — raster grooves moiré.
- Mirror-tiling until factory artwork lands.

## Ops runbook (deploy)
1. Local: edit → test on ipanel.local (+ localhost:8080 for tools).
2. zip plugin; cPanel plugins/ delete folder → upload zip → extract → activate → LiteSpeed purge.
3. Textures: pipeline gen → copy to uploads/ipanel-ar/textures/<slug>/ (local) and cPanel uploads (prod).
4. Settings → iPanel Visualizer: samples, products, calibration, livear.

## QA checklist (each release)
wizard full flow Android+iPhone; console clean; our JS/CSS separate in Network; AR/3D page ok; coverage sane; share+cart ok; PSI no regression.

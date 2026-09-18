# Release checklist (every visualizer change)
1. Local: apply patch → ipanel.local hard-refresh → manual walk: photo→detect→finish→result→share/cart.
2. Smoke: `cd tools && npm i -D playwright && npx playwright install chromium && node smoke.mjs` (expect "clean" x3).
3. Phone: CSS + ?gl=1 + ?pbr=1 walk; drag smoothness; recapture banner on bad photo; BOM/quote text.
4. GA4 DebugView: rv_step 1-4, rv_renderer, rv_conf, rv_capture_hint present.
5. Zip plugin → cPanel overwrite → LiteSpeed purge → production spot-check (one sample room run).
6. PSI mobile spot check on /visualizer/ (LCP<=1.9, CLS<=0.05).
7. git commit + tag release-<date>; update docs/STATUS.md.
Rollback: keep previous zip at tools/prev-plugin.zip before each deploy (cp before overwrite).

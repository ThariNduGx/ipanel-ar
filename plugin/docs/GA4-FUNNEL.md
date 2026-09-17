# GA4 funnel & A/B recipe (Room Visualizer)
Events (all carry `ab` = auto|manual): rv_ab_expose, rv_step{1..4}, rv_update{finish,surface}, rv_autodetect{label}, rv_save, rv_share, rv_whatsapp, rv_cart{finish,boxes,length_mm}.
Funnel exploration: GA4 → Explore → Funnel → steps: rv_step step=1 → 2 → 3 → 4 → rv_cart. Secondary: rv_share, rv_whatsapp.
A/B: compare `ab=auto` vs `ab=manual` on: step2→step4 completion, rv_cart rate, time-to-result. Decide winner at ≥500 sessions/side; ship winner as default (set S.ab default accordingly).
Debug: GA4 DebugView; ensure Site Kit gtag present (ev() bridges dataLayer+gtag).

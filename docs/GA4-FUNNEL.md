
## KPI definitions & dashboard (Phase 4 #3)
Primary: RV sessions = rv_step{1}; Completion = rv_step{4} / rv_step{1}; Commerce = rv_cart / rv_step{4}; Virality = (rv_share+rv_whatsapp) / rv_step{4}.
Secondary: detect success = rv_autodetect / rv_step{2}; detect p50 ms = rv_detect_ms; photo mix = rv_photo.src; finish engagement = rv_finish_change count/session; wipe adoption = rv_wipe / rv_step{4}.
A/B readout (auto vs manual): compare Completion, Commerce, and time step2→step4. Ship winner at >=500 sessions/side by setting the default variant in code (S.ab default) and retiring the loser.
Explorations to build once: Funnel(rv_step1..4,rv_cart); Trend(completion by week); Comparison(ab variant x KPIs); Retention(saved designs via rv_save repeat).

## KPI definitions & dashboard (Phase 4 #3)
Primary: RV sessions = rv_step{1}; Completion = rv_step{4}/rv_step{1}; Commerce = rv_cart/rv_step{4}; Virality = (rv_share+rv_whatsapp)/rv_step{4}.
Secondary: detect success = rv_autodetect/rv_step{2}; detect p50 = rv_detect_ms; photo mix = rv_photo.src; finish engagement = rv_finish_change/session; wipe adoption = rv_wipe/rv_step{4}.
A/B readout (auto vs manual): compare Completion, Commerce, time step2->step4. Ship winner at >=500 sessions/side by setting the default variant in code and retiring the loser.
Explorations to build once: Funnel(rv_step1..4, rv_cart); Trend(completion weekly); Comparison(ab x KPIs); Retention(repeat rv_save).

## KPI definitions & dashboard (Phase 4 #3)
Primary: RV sessions = rv_step{1}; Completion = rv_step{4}/rv_step{1}; Commerce = rv_cart/rv_step{4}; Virality = (rv_share+rv_whatsapp)/rv_step{4}.
Secondary: detect success = rv_autodetect/rv_step{2}; detect p50 ms = rv_detect_ms; photo mix = rv_photo.src; finish engagement = rv_finish_change count/session; wipe adoption = rv_wipe/rv_step{4}.
A/B readout (auto vs manual): compare Completion, Commerce, time step2->step4. Ship winner at >=500 sessions/side by setting the default variant in code (S.ab default) and retiring the loser.
Explorations to build once: Funnel(rv_step1..4, rv_cart); Trend(completion by week); Comparison(ab variant x KPIs); Retention(repeat rv_save).

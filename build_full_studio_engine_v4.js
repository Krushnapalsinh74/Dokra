const fs = require('fs');

console.log('Building complete authentic studio-engine.js...');

// Read the beginning of studio-engine.js (SVG_ICONS, animalPersonasInfo, screenElementsInventory, selectScreen, renderElementTree, selectElement)
const currentEngine = fs.readFileSync('backend/card-service/src/studio-engine.js', 'utf8');

// Find the start of renderPhoneScreen
const splitMarker = '// -----------------------------------------------------------------------------\n// 7. RENDER AUTHENTIC MOBILE APP PHONE SCREEN';
const parts = currentEngine.split(splitMarker);

if (parts.length < 2) {
  console.error('Could not find splitMarker');
  process.exit(1);
}

const part1 = parts[0];

// Now construct the complete renderPhoneScreen that handles ALL 42 screens across all 7 domains!
const fullPhoneRenderer = `// -----------------------------------------------------------------------------
// 7. RENDER AUTHENTIC MOBILE APP PHONE SCREEN
// -----------------------------------------------------------------------------
function renderPhoneScreen(data, screenId) {
  const root = document.getElementById('phone-dynamic-screen-root');
  if (!root) return;

  const c = data?.config || {};
  let html = '';

  // DOMAIN 1: HOME & DAILY ACTIVITY
  if (screenId === 'scr_home_main_dashboard') {
    const steps = c.steps || 8500;
    const stepGoal = c.step_goal || 10000;
    const cal = c.active_calories || 485;
    const calGoal = c.calorie_goal || 600;
    const time = c.active_time_mins || 42;
    const timeGoal = c.active_time_goal || 60;
    const readiness = c.readiness_score || 86;
    const sleepScore = c.sleep_score || 88;
    const sleepDur = c.sleep_duration || '7h 42m';
    const hr = c.heart_rate || 72;
    const glu = c.glucose_mgdl || 104;
    const sys = c.systolic_mmhg || 118;
    const dia = c.diastolic_mmhg || 76;

    html = '' +
      '<!-- Top One UI App Bar -->' +
      '<div class="phone-screen-header editable-element" id="elem-home.header" onclick="selectElement(\\'home.header\\', event)" data-element-id="home.header">' +
        '<span class="element-selection-badge">home.header</span>' +
        '<div class="phone-screen-header-title">' +
          '<img src="/assets/dokra_logo.png" style="width:26px; height:26px; object-fit:contain; border-radius:7px; background:#fff; padding:1px;">' +
          '<span style="font-weight:900; letter-spacing:-0.3px; font-size:18px;">Dokra Health</span>' +
        '</div>' +
        '<div style="display:flex; align-items:center; gap:8px;">' +
          '<div style="display:flex; align-items:center; gap:5px; background:rgba(16,185,129,0.12); padding:3px 8px; border-radius:999px;">' +
            '<span style="display:inline-flex; width:6px; height:6px; border-radius:50%; background:#10b981; box-shadow:0 0 6px #10b981;"></span>' +
            '<span style="font-size:10.5px; font-weight:700; color:#10b981;">Watch7 94%</span>' +
          '</div>' +
          '<span style="color:var(--phone-text-muted); cursor:pointer;">' + SVG_ICONS.badge + '</span>' +
        '</div>' +
      '</div>' +

      '<div style="display:flex; align-items:baseline; justify-content:space-between; padding:0 6px; margin-top:-4px;">' +
        '<div>' +
          '<div style="font-size:11px; font-weight:700; color:var(--phone-text-muted); text-transform:uppercase; letter-spacing:0.5px;">Today</div>' +
          '<div style="font-size:22px; font-weight:900; color:var(--phone-text-main); font-family:\\'Outfit\\', sans-serif;">Apr 28, Monday</div>' +
        '</div>' +
        '<span style="font-size:11.5px; font-weight:800; color:var(--primary-blue); cursor:pointer;">Weekly Report &gt;</span>' +
      '</div>' +

      '<!-- 1. Authentic Daily Activity 3-Ring Tile with 7-Day Calendar -->' +
      '<div class="phone-hero-card editable-element" id="elem-home.activity_ring" onclick="selectElement(\\'home.activity_ring\\', event)" data-element-id="home.activity_ring">' +
        '<span class="element-selection-badge">home.activity_ring</span>' +
        '<div style="display:flex; align-items:center; justify-content:space-between;">' +
          '<div style="display:flex; align-items:center; gap:8px;">' +
            SVG_ICONS.ring +
            '<span style="font-size:14px; font-weight:800; color:var(--phone-text-main);">Daily Activity</span>' +
          '</div>' +
          '<span style="font-size:12px; font-weight:800; color:#10b981;">' + Math.round((steps/stepGoal)*100) + '% of Goal &gt;</span>' +
        '</div>' +
        '<div style="display:flex; align-items:center; justify-content:space-between; margin-top:6px;">' +
          '<div class="rings-svg-wrapper" style="width:130px; height:130px; position:relative;">' +
            '<svg viewBox="0 0 160 160" style="width:100%; height:100%; transform:rotate(-90deg);">' +
              '<circle cx="80" cy="80" r="66" fill="none" stroke="rgba(244,63,94,0.15)" stroke-width="12" />' +
              '<circle cx="80" cy="80" r="66" fill="none" stroke="#f43f5e" stroke-width="12" stroke-dasharray="414.69" stroke-dashoffset="' + (414.69 * (1 - Math.min(1, cal / calGoal))) + '" stroke-linecap="round" />' +
              '<circle cx="80" cy="80" r="48" fill="none" stroke="rgba(16,185,129,0.15)" stroke-width="12" />' +
              '<circle cx="80" cy="80" r="48" fill="none" stroke="#10b981" stroke-width="12" stroke-dasharray="301.59" stroke-dashoffset="' + (301.59 * (1 - Math.min(1, steps / stepGoal))) + '" stroke-linecap="round" />' +
              '<circle cx="80" cy="80" r="30" fill="none" stroke="rgba(56,189,248,0.15)" stroke-width="12" />' +
              '<circle cx="80" cy="80" r="30" fill="none" stroke="#38bdf8" stroke-width="12" stroke-dasharray="188.49" stroke-dashoffset="' + (188.49 * (1 - Math.min(1, time / timeGoal))) + '" stroke-linecap="round" />' +
            '</svg>' +
            '<div class="ring-center-stats">' +
              '<span class="ring-steps-val" id="phone-home-steps-val">' + steps.toLocaleString() + '</span>' +
              '<span class="ring-steps-label">Steps</span>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex; flex-direction:column; gap:9px; flex:1; margin-left:14px;">' +
            '<div>' +
              '<div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:2px;">' +
                '<span style="color:#10b981; font-weight:700;">Steps</span>' +
                '<span style="font-weight:700; color:var(--phone-text-main);">' + steps.toLocaleString() + ' / ' + stepGoal.toLocaleString() + '</span>' +
              '</div>' +
              '<div class="phone-progress-bar"><div class="phone-progress-fill" style="width:' + Math.min(100, (steps/stepGoal)*100) + '%; background:#10b981;"></div></div>' +
            '</div>' +
            '<div>' +
              '<div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:2px;">' +
                '<span style="color:#38bdf8; font-weight:700;">Active Time</span>' +
                '<span style="font-weight:700; color:var(--phone-text-main);">' + time + ' / ' + timeGoal + ' min</span>' +
              '</div>' +
              '<div class="phone-progress-bar"><div class="phone-progress-fill" style="width:' + Math.min(100, (time/timeGoal)*100) + '%; background:#38bdf8;"></div></div>' +
            '</div>' +
            '<div>' +
              '<div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:2px;">' +
                '<span style="color:#f43f5e; font-weight:700;">Active Cal</span>' +
                '<span style="font-weight:700; color:var(--phone-text-main);">' + cal + ' / ' + calGoal + ' kcal</span>' +
              '</div>' +
              '<div class="phone-progress-bar"><div class="phone-progress-fill" style="width:' + Math.min(100, (cal/calGoal)*100) + '%; background:#f43f5e;"></div></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<!-- 7-Day Weekly Calendar Strip -->' +
        '<div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:10px; margin-top:4px;">' +
          ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) =>
            '<div style="display:flex; flex-direction:column; align-items:center; gap:4px;">' +
              '<span style="font-size:9.5px; font-weight:700; color:' + (i === 1 ? '#10b981' : 'var(--phone-text-muted)') + ';">' + d + '</span>' +
              '<div style="width:16px; height:16px; border-radius:50%; border:2px solid ' + (i <= 1 ? '#10b981' : 'rgba(255,255,255,0.15)') + '; background:' + (i <= 1 ? 'rgba(16,185,129,0.2)' : 'transparent') + '; display:flex; align-items:center; justify-content:center;">' +
                (i <= 1 ? '<span style="width:6px; height:6px; border-radius:50%; background:#10b981;"></span>' : '') +
              '</div>' +
            '</div>'
          ).join('') +
        '</div>' +
      '</div>' +

      '<!-- 2. Energy Score Hero Tile -->' +
      '<div class="phone-hero-card editable-element" id="elem-home.vitality_card" onclick="selectElement(\\'home.vitality_card\\', event)" data-element-id="home.vitality_card">' +
        '<span class="element-selection-badge">home.vitality_card</span>' +
        '<div style="display:flex; align-items:center; justify-content:space-between;">' +
          '<div style="display:flex; align-items:center; gap:8px;">' +
            SVG_ICONS.vitality +
            '<span style="font-size:14px; font-weight:800; color:var(--phone-text-main);">Energy Score</span>' +
          '</div>' +
          '<span class="phone-badge-pill" style="background:rgba(129,140,248,0.2); color:#818cf8;">Optimal Stamina &gt;</span>' +
        '</div>' +
        '<div style="display:flex; align-items:center; gap:16px; margin-top:2px;">' +
          '<div style="position:relative; width:64px; height:64px; display:flex; align-items:center; justify-content:center;">' +
            '<svg viewBox="0 0 40 40" style="width:100%; height:100%; transform:rotate(-90deg);">' +
              '<circle cx="20" cy="20" r="16" fill="none" stroke="rgba(129,140,248,0.2)" stroke-width="4"/>' +
              '<circle cx="20" cy="20" r="16" fill="none" stroke="url(#energyGrad)" stroke-width="4" stroke-dasharray="100.53" stroke-dashoffset="' + (100.53 * (1 - readiness/100)) + '" stroke-linecap="round"/>' +
              '<defs><linearGradient id="energyGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#818cf8"/></linearGradient></defs>' +
            '</svg>' +
            '<span class="phone-metric-big" style="color:#818cf8; font-size:20px; position:absolute;" id="phone-home-vitality-num">' + readiness + '</span>' +
          '</div>' +
          '<div style="flex:1; display:flex; flex-direction:column; gap:4px;">' +
            '<div style="font-size:11.5px; font-weight:800; color:#10b981;">▲ 3 pts higher than yesterday</div>' +
            '<div style="font-size:11px; color:var(--phone-text-muted); line-height:1.3;">Your autonomic nervous system is fully recovered. Great day for aerobic exercise.</div>' +
          '</div>' +
        '</div>' +
        '<!-- 4 Contributing Factors Pill Grid -->' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:4px;">' +
          '<div style="background:var(--bg-card-subtle); padding:6px 8px; border-radius:8px; display:flex; justify-content:space-between; font-size:10px;"><span style="color:var(--phone-text-muted);">Sleep Consistency</span><span style="color:#10b981; font-weight:700;">Optimal</span></div>' +
          '<div style="background:var(--bg-card-subtle); padding:6px 8px; border-radius:8px; display:flex; justify-content:space-between; font-size:10px;"><span style="color:var(--phone-text-muted);">Prior Activity</span><span style="color:#10b981; font-weight:700;">Active</span></div>' +
          '<div style="background:var(--bg-card-subtle); padding:6px 8px; border-radius:8px; display:flex; justify-content:space-between; font-size:10px;"><span style="color:var(--phone-text-muted);">Sleep HR Dip</span><span style="color:#10b981; font-weight:700;">-14.2%</span></div>' +
          '<div style="background:var(--bg-card-subtle); padding:6px 8px; border-radius:8px; display:flex; justify-content:space-between; font-size:10px;"><span style="color:var(--phone-text-muted);">Sleeping HRV</span><span style="color:#38bdf8; font-weight:700;">62 ms</span></div>' +
        '</div>' +
      '</div>' +

      '<!-- 3. Sleep Session Tile with Hypnogram & Animal Coaching -->' +
      '<div class="phone-hero-card editable-element" id="elem-home.sleep_card" onclick="selectElement(\\'home.sleep_card\\', event)" data-element-id="home.sleep_card">' +
        '<span class="element-selection-badge">home.sleep_card</span>' +
        '<div style="display:flex; align-items:center; justify-content:space-between;">' +
          '<div style="display:flex; align-items:center; gap:8px;">' +
            SVG_ICONS.moon +
            '<span style="font-size:14px; font-weight:800; color:var(--phone-text-main);">Sleep</span>' +
          '</div>' +
          '<span style="font-size:12px; font-weight:800; color:#38bdf8;">' + sleepScore + ' / 100 (Excellent) &gt;</span>' +
        '</div>' +
        '<div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:2px;">' +
          '<span style="font-size:24px; font-weight:900; color:var(--phone-text-main);">' + sleepDur + '</span>' +
          '<span style="font-size:11px; color:var(--phone-text-muted);">11:15 PM - 6:57 AM</span>' +
        '</div>' +
        '<!-- 4-Stage Hypnogram Bar -->' +
        '<div style="display:flex; height:10px; border-radius:999px; overflow:hidden; gap:2px; margin-top:4px;">' +
          '<div style="width:5%; background:#f97316;" title="Awake 5%"></div>' +
          '<div style="width:22%; background:#38bdf8;" title="REM 22%"></div>' +
          '<div style="width:51%; background:#60a5fa;" title="Light 51%"></div>' +
          '<div style="width:22%; background:#1e40af;" title="Deep 22%"></div>' +
        '</div>' +
        '<div style="display:flex; justify-content:space-between; font-size:9.5px; color:var(--phone-text-muted);">' +
          '<span>Awake 5%</span><span>REM 22%</span><span>Light 51%</span><span>Deep 22%</span>' +
        '</div>' +
        '<!-- Animal Coaching Badge -->' +
        '<div style="display:flex; align-items:center; gap:10px; background:var(--bg-card-subtle); padding:8px 12px; border-radius:12px; margin-top:4px;">' +
          '<img src="/assets/home_card_sleep_animal_lion.webp" style="width:38px; height:38px; object-fit:contain;">' +
          '<div style="display:flex; flex-direction:column; gap:1px; flex:1;">' +
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<span style="font-size:12px; font-weight:800; color:var(--phone-text-main);">Unconcerned Lion</span>' +
              '<span style="font-size:10px; color:#10b981; font-weight:700;">Level 4, Order 1</span>' +
            '</div>' +
            '<span style="font-size:10.5px; color:var(--phone-text-muted);">Solid circadian rhythm. Deep restorative recovery.</span>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<!-- 4. Heart Rate Card with ECG Pulse Line -->' +
      '<div class="phone-hero-card editable-element" id="elem-home.heart_card" onclick="selectElement(\\'home.heart_card\\', event)" data-element-id="home.heart_card">' +
        '<span class="element-selection-badge">home.heart_card</span>' +
        '<div style="display:flex; align-items:center; justify-content:space-between;">' +
          '<div style="display:flex; align-items:center; gap:8px;">' +
            SVG_ICONS.heart +
            '<span style="font-size:14px; font-weight:800; color:var(--phone-text-main);">Heart Rate</span>' +
          '</div>' +
          '<span style="font-size:11px; color:var(--phone-text-muted);">Measured 2m ago &gt;</span>' +
        '</div>' +
        '<div style="display:flex; align-items:baseline; justify-content:space-between; margin-top:2px;">' +
          '<div style="display:flex; align-items:baseline; gap:4px;">' +
            '<span class="phone-metric-big" style="color:#f43f5e;" id="phone-home-hr-val">' + hr + '</span>' +
            '<span style="font-size:12px; font-weight:700; color:var(--phone-text-muted);">bpm</span>' +
          '</div>' +
          '<span style="font-size:11px; font-weight:700; color:var(--phone-text-muted);">Resting: 58 bpm • 52-124 bpm</span>' +
        '</div>' +
        '<!-- ECG Pulse Curve SVG -->' +
        '<div style="width:100%; height:32px; margin-top:4px;">' +
          '<svg viewBox="0 0 300 40" style="width:100%; height:100%;" preserveAspectRatio="none">' +
            '<path d="M0,20 L40,20 L50,8 L60,32 L70,12 L80,24 L90,20 L150,20 L160,6 L170,34 L180,10 L190,22 L200,20 L300,20" fill="none" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round"/>' +
          '</svg>' +
        '</div>' +
      '</div>' +

      '<!-- 5. Blood Pressure & CGM 2-Column Grid -->' +
      '<div class="phone-grid-2">' +
        '<div class="phone-hero-card editable-element" id="elem-home.bp_card" onclick="selectElement(\\'home.bp_card\\', event)" data-element-id="home.bp_card" style="padding:12px 14px;">' +
          '<span class="element-selection-badge">home.bp_card</span>' +
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<span style="font-size:11px; font-weight:800; color:var(--phone-text-muted);">BLOOD PRESSURE</span>' +
            '<span style="font-size:9.5px; color:#10b981; font-weight:700;">Normal</span>' +
          '</div>' +
          '<div style="font-size:20px; font-weight:900; color:var(--phone-text-main); margin-top:2px;" id="phone-bp-display-val">' + sys + ' / ' + dia + '</div>' +
          '<span style="font-size:10px; color:var(--phone-text-muted);">Pulse 68 bpm</span>' +
        '</div>' +
        '<div class="phone-hero-card editable-element" id="elem-home.cgm_card" onclick="selectElement(\\'home.cgm_card\\', event)" data-element-id="home.cgm_card" style="padding:12px 14px;">' +
          '<span class="element-selection-badge">home.cgm_card</span>' +
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<span style="font-size:11px; font-weight:800; color:var(--phone-text-muted);">GLUCOSE (CGM)</span>' +
            '<span style="font-size:9.5px; color:#10b981; font-weight:700;">→ Stable</span>' +
          '</div>' +
          '<div style="font-size:20px; font-weight:900; color:var(--phone-text-main); margin-top:2px;" id="phone-cgm-val">' + glu + ' <span style="font-size:11px; font-weight:700;">mg/dL</span></div>' +
          '<span style="font-size:10px; color:var(--phone-text-muted);">TIR: 89% in range</span>' +
        '</div>' +
      '</div>' +

      '<!-- 6. Exercise Quick Start Tile -->' +
      '<div class="phone-hero-card editable-element" id="elem-home.quick_exercises" onclick="selectElement(\\'home.quick_exercises\\', event)" data-element-id="home.quick_exercises" style="padding:12px 14px;">' +
        '<span class="element-selection-badge">home.quick_exercises</span>' +
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">' +
          '<div style="display:flex; align-items:center; gap:6px;">' +
            SVG_ICONS.sport +
            '<span style="font-size:13px; font-weight:800; color:var(--phone-text-main);">Exercise</span>' +
          '</div>' +
          '<span style="font-size:11px; color:var(--primary-blue); font-weight:700;">More &gt;</span>' +
        '</div>' +
        '<div style="display:flex; justify-content:space-around; align-items:center;">' +
          '<div style="display:flex; flex-direction:column; align-items:center; gap:4px; cursor:pointer;" onclick="selectScreen(\\'scr_pedometer_detail\\')">' +
            '<div style="width:42px; height:42px; border-radius:50%; background:rgba(16,185,129,0.15); display:flex; align-items:center; justify-content:center; color:#10b981;">' +
              SVG_ICONS.steps +
            '</div>' +
            '<span style="font-size:10.5px; font-weight:700; color:var(--phone-text-main);">Walking</span>' +
          '</div>' +
          '<div style="display:flex; flex-direction:column; align-items:center; gap:4px; cursor:pointer;" onclick="selectScreen(\\'scr_sport_live_run_hud\\')">' +
            '<div style="width:42px; height:42px; border-radius:50%; background:rgba(37,99,235,0.15); display:flex; align-items:center; justify-content:center; color:#3b82f6;">' +
              SVG_ICONS.sport +
            '</div>' +
            '<span style="font-size:10.5px; font-weight:700; color:var(--phone-text-main);">Running</span>' +
          '</div>' +
          '<div style="display:flex; flex-direction:column; align-items:center; gap:4px; cursor:pointer;" onclick="selectScreen(\\'scr_sport_cycling_live\\')">' +
            '<div style="width:42px; height:42px; border-radius:50%; background:rgba(245,158,11,0.15); display:flex; align-items:center; justify-content:center; color:#f59e0b;">' +
              SVG_ICONS.cycling +
            '</div>' +
            '<span style="font-size:10.5px; font-weight:700; color:var(--phone-text-main);">Cycling</span>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<!-- 7. Live Partner Service Cards Feed (Connected to /v2/servicecard/list) -->' +
      '<div class="phone-hero-card editable-element" id="elem-home.service_feed" onclick="selectElement(\\'home.service_feed\\', event)" data-element-id="home.service_feed">' +
        '<span class="element-selection-badge">home.service_feed</span>' +
        '<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">' +
          '<div style="display:flex; align-items:center; gap:8px;">' +
            SVG_ICONS.card +
            '<span style="font-size:13px; font-weight:800; color:var(--phone-text-main);">Partner Feed &amp; Insights</span>' +
          '</div>' +
          '<span style="font-size:10px; font-weight:700; color:#10b981;">Connected to API</span>' +
        '</div>' +
        '<div style="display:flex; flex-direction:column; gap:8px;">' +
          (liveServiceCards && liveServiceCards.length > 0 ? liveServiceCards.slice(0, 3).map(sc =>
            '<div style="background:var(--bg-card-subtle); border:1px solid var(--border-color); border-radius:12px; padding:10px;">' +
              '<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:2px;">' +
                '<span style="font-size:11.5px; font-weight:800; color:var(--phone-text-main);">' + escapeHtml(sc.serviceInfo?.resourceInfo?.data?.serviceName || sc.serviceId) + '</span>' +
                '<span style="font-size:9.5px; color:#10b981; font-weight:700;">' + escapeHtml(sc.serviceInfo?.resourceInfo?.data?.partnerName || 'Dokra Health') + '</span>' +
              '</div>' +
              '<div style="font-size:10.5px; color:var(--phone-text-muted); line-height:1.3;">' + escapeHtml(sc.serviceInfo?.resourceInfo?.data?.description || 'Health intelligence partner card') + '</div>' +
            '</div>'
          ).join('') : '<div style="font-size:11px; color:var(--phone-text-muted); text-align:center; padding:10px;">Loaded dynamically from /v2/servicecard/list</div>') +
        '</div>' +
      '</div>' +

      '<!-- 8. Floating One UI Bottom Navigation Bar -->' +
      '<div class="editable-element" id="elem-home.bottom_nav" onclick="selectElement(\\'home.bottom_nav\\', event)" data-element-id="home.bottom_nav" style="position:sticky; bottom:8px; z-index:10; width:100%; display:flex; align-items:center; justify-content:space-between; margin-top:8px;">' +
        '<span class="element-selection-badge">home.bottom_nav</span>' +
        '<div style="flex:1; background:rgba(18,28,51,0.92); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.08); border-radius:999px; display:flex; justify-content:space-around; padding:8px 12px; box-shadow:0 8px 24px rgba(0,0,0,0.2);">' +
          '<div style="display:flex; flex-direction:column; align-items:center; gap:2px; font-size:10px; font-weight:700; color:#10b981; cursor:pointer;" onclick="selectScreen(\\'scr_home_main_dashboard\\')">' +
            SVG_ICONS.home +
            '<span>Home</span>' +
          '</div>' +
          '<div style="display:flex; flex-direction:column; align-items:center; gap:2px; font-size:10px; font-weight:700; color:var(--phone-text-muted); cursor:pointer;" onclick="selectScreen(\\'scr_together_stepathon_deep\\')">' +
            SVG_ICONS.badge +
            '<span>Together</span>' +
          '</div>' +
          '<div style="display:flex; flex-direction:column; align-items:center; gap:2px; font-size:10px; font-weight:700; color:var(--phone-text-muted); cursor:pointer;" onclick="selectScreen(\\'scr_sport_live_run_hud\\')">' +
            SVG_ICONS.sport +
            '<span>Fitness</span>' +
          '</div>' +
          '<div style="display:flex; flex-direction:column; align-items:center; gap:2px; font-size:10px; font-weight:700; color:var(--phone-text-muted); cursor:pointer;" onclick="selectScreen(\\'scr_medication_tracker_deep\\')">' +
            SVG_ICONS.widget +
            '<span>Meds</span>' +
          '</div>' +
        '</div>' +
        '<button style="width:42px; height:42px; border-radius:50%; background:#10b981; color:#fff; border:none; font-size:22px; display:flex; align-items:center; justify-content:center; margin-left:8px; box-shadow:0 6px 16px rgba(16,185,129,0.35); cursor:pointer;">+</button>' +
      '</div>';
  }

  // 2. DAILY ACTIVITY 3-RING SCREEN
  else if (screenId === 'scr_daily_activity_ring') {
    const steps = c.steps || 8500;
    const stepGoal = c.step_goal || 10000;
    const cal = c.active_calories || 485;
    const calGoal = c.calorie_goal || 600;
    const time = c.active_time_mins || 42;
    const timeGoal = c.active_time_goal || 60;

    html = '' +
      '<div class="phone-screen-header editable-element" id="elem-ring.header" onclick="selectElement(\\'ring.header\\', event)" data-element-id="ring.header">' +
        '<span class="element-selection-badge">ring.header</span>' +
        '<div class="phone-screen-header-title">' +
          '<span class="phone-screen-header-back" onclick="selectScreen(\\'scr_home_main_dashboard\\')">&larr;</span>' +
          '<span id="phone-active-title">Daily Activity</span>' +
        '</div>' +
        '<span style="color:var(--phone-text-muted);">&vellip;</span>' +
      '</div>' +

      '<div class="phone-hero-card editable-element" id="elem-ring.svg_geometry" onclick="selectElement(\\'ring.svg_geometry\\', event)" data-element-id="ring.svg_geometry" style="align-items:center; padding:24px 16px;">' +
        '<span class="element-selection-badge">ring.svg_geometry</span>' +
        '<div class="rings-svg-wrapper" style="width:190px; height:190px; position:relative;">' +
          '<svg viewBox="0 0 160 160" style="width:100%; height:100%; transform:rotate(-90deg);">' +
            '<circle cx="80" cy="80" r="66" fill="none" stroke="rgba(244,63,94,0.15)" stroke-width="12" />' +
            '<circle cx="80" cy="80" r="66" fill="none" stroke="#f43f5e" stroke-width="12" stroke-dasharray="414.69" stroke-dashoffset="' + (414.69 * (1 - Math.min(1, cal / calGoal))) + '" stroke-linecap="round" />' +
            '<circle cx="80" cy="80" r="48" fill="none" stroke="rgba(16,185,129,0.15)" stroke-width="12" />' +
            '<circle cx="80" cy="80" r="48" fill="none" stroke="#10b981" stroke-width="12" stroke-dasharray="301.59" stroke-dashoffset="' + (301.59 * (1 - Math.min(1, steps / stepGoal))) + '" stroke-linecap="round" />' +
            '<circle cx="80" cy="80" r="30" fill="none" stroke="rgba(56,189,248,0.15)" stroke-width="12" />' +
            '<circle cx="80" cy="80" r="30" fill="none" stroke="#38bdf8" stroke-width="12" stroke-dasharray="188.49" stroke-dashoffset="' + (188.49 * (1 - Math.min(1, time / timeGoal))) + '" stroke-linecap="round" />' +
          '</svg>' +
          '<div class="ring-center-stats">' +
            '<span class="ring-steps-val" id="phone-ring-steps-val" style="font-size:28px;">' + steps.toLocaleString() + '</span>' +
            '<span class="ring-steps-label">/ ' + stepGoal.toLocaleString() + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="phone-hero-card editable-element" id="elem-ring.step_counter" onclick="selectElement(\\'ring.step_counter\\', event)" data-element-id="ring.step_counter">' +
        '<span class="element-selection-badge">ring.step_counter</span>' +
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
          '<div style="display:flex; align-items:center; gap:8px;">' +
            SVG_ICONS.steps +
            '<span style="font-weight:800; font-size:13px; color:var(--phone-text-main);">Steps Target Progress</span>' +
          '</div>' +
          '<span style="font-weight:800; font-size:12px; color:#10b981;">' + Math.round((steps/stepGoal)*100) + '%</span>' +
        '</div>' +
        '<div class="phone-progress-bar"><div class="phone-progress-fill" style="width:' + Math.min(100, (steps/stepGoal)*100) + '%; background:#10b981;"></div></div>' +
      '</div>' +

      '<div class="phone-hero-card editable-element" id="elem-ring.time_bar" onclick="selectElement(\\'ring.time_bar\\', event)" data-element-id="ring.time_bar">' +
        '<span class="element-selection-badge">ring.time_bar</span>' +
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
          '<div style="display:flex; align-items:center; gap:8px;">' +
            SVG_ICONS.pace +
            '<span style="font-weight:800; font-size:13px; color:var(--phone-text-main);">Active Time (42 min)</span>' +
          '</div>' +
          '<span style="font-weight:800; font-size:12px; color:#38bdf8;">' + Math.round((time/timeGoal)*100) + '%</span>' +
        '</div>' +
        '<div class="phone-progress-bar"><div class="phone-progress-fill" style="width:' + Math.min(100, (time/timeGoal)*100) + '%; background:#38bdf8;"></div></div>' +
      '</div>' +

      '<div class="phone-hero-card editable-element" id="elem-ring.calorie_bar" onclick="selectElement(\\'ring.calorie_bar\\', event)" data-element-id="ring.calorie_bar">' +
        '<span class="element-selection-badge">ring.calorie_bar</span>' +
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
          '<div style="display:flex; align-items:center; gap:8px;">' +
            SVG_ICONS.sport +
            '<span style="font-weight:800; font-size:13px; color:var(--phone-text-main);">Active Calories (485 kcal)</span>' +
          '</div>' +
          '<span style="font-weight:800; font-size:12px; color:#f43f5e;">' + Math.round((cal/calGoal)*100) + '%</span>' +
        '</div>' +
        '<div class="phone-progress-bar"><div class="phone-progress-fill" style="width:' + Math.min(100, (cal/calGoal)*100) + '%; background:#f43f5e;"></div></div>' +
      '</div>';
  }

  // 3. PEDOMETER & STEPS DETAIL SCREEN
  else if (screenId === 'scr_pedometer_detail') {
    const steps = c.steps || 8500;
    const goal = c.step_goal || 10000;
    const dist = c.distance_km || 5.42;

    html = '' +
      '<div class="phone-screen-header editable-element" id="elem-pedometer.header" onclick="selectElement(\\'pedometer.header\\', event)" data-element-id="pedometer.header">' +
        '<span class="element-selection-badge">pedometer.header</span>' +
        '<div class="phone-screen-header-title">' +
          '<span class="phone-screen-header-back" onclick="selectScreen(\\'scr_home_main_dashboard\\')">&larr;</span>' +
          '<span id="phone-active-title">Steps</span>' +
        '</div>' +
        '<span style="font-size:12px; color:var(--primary-blue); font-weight:700;">History</span>' +
      '</div>' +

      '<div class="phone-hero-card editable-element" id="elem-pedometer.step_counter" onclick="selectElement(\\'pedometer.step_counter\\', event)" data-element-id="pedometer.step_counter" style="align-items:center; padding:24px 16px;">' +
        '<span class="element-selection-badge">pedometer.step_counter</span>' +
        '<span style="font-size:11px; font-weight:800; color:var(--phone-text-muted); text-transform:uppercase;">Recorded Steps</span>' +
        '<div class="phone-metric-big" style="font-size:44px; color:#10b981; margin:6px 0;" id="phone-pedometer-steps-val">' + steps.toLocaleString() + '</div>' +
        '<span class="phone-badge-pill" style="background:rgba(16,185,129,0.15); color:#10b981;">' + Math.round((steps/goal)*100) + '% of ' + goal.toLocaleString() + ' goal</span>' +
      '</div>' +

      '<div class="phone-hero-card editable-element" id="elem-pedometer.distance_card" onclick="selectElement(\\'pedometer.distance_card\\', event)" data-element-id="pedometer.distance_card">' +
        '<span class="element-selection-badge">pedometer.distance_card</span>' +
        '<span style="font-size:11.5px; font-weight:800; color:var(--phone-text-main);">Hourly Step Histogram</span>' +
        '<div style="display:flex; align-items:flex-end; justify-content:space-between; height:70px; padding-top:12px;">' +
          [15, 30, 45, 90, 60, 40, 85, 100, 75, 50, 65, 35].map(h =>
            '<div style="width:6%; height:' + h + '%; background:#10b981; border-radius:4px;"></div>'
          ).join('') +
        '</div>' +
        '<div style="display:flex; justify-content:space-between; font-size:9.5px; color:var(--phone-text-muted); margin-top:4px;">' +
          '<span>6 AM</span><span>12 PM</span><span>6 PM</span><span>12 AM</span>' +
        '</div>' +
        '<div class="phone-grid-2" style="margin-top:8px;">' +
          '<div style="background:var(--bg-card-subtle); padding:8px; border-radius:10px; text-align:center;">' +
            '<span style="font-size:10px; color:var(--phone-text-muted);">Distance</span>' +
            '<div style="font-size:14px; font-weight:800; color:var(--phone-text-main);">' + dist + ' km</div>' +
          '</div>' +
          '<div style="background:var(--bg-card-subtle); padding:8px; border-radius:10px; text-align:center;">' +
            '<span style="font-size:10px; color:var(--phone-text-muted);">Floors Climbed</span>' +
            '<div style="font-size:14px; font-weight:800; color:var(--phone-text-main);">12 floors</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  // 4. VITALITY & ENERGY SCORE DASHBOARD SCREEN
  else if (screenId === 'scr_vitality_energy_score' || screenId === 'scr_vitality_score_factors') {
    const score = c.current_score || c.readiness_score || 86;
    const status = c.score_status || 'Optimal Stamina';

    html = '' +
      '<div class="phone-screen-header editable-element" id="elem-vitality.header" onclick="selectElement(\\'vitality.header\\', event)" data-element-id="vitality.header">' +
        '<span class="element-selection-badge">vitality.header</span>' +
        '<div class="phone-screen-header-title">' +
          '<span class="phone-screen-header-back" onclick="selectScreen(\\'scr_home_main_dashboard\\')">&larr;</span>' +
          '<span id="phone-active-title">Energy score</span>' +
        '</div>' +
        '<span style="color:var(--phone-text-muted);">&vellip;</span>' +
      '</div>' +

      '<div class="phone-hero-card editable-element" id="elem-vitality.readiness_gauge" onclick="selectElement(\\'vitality.readiness_gauge\\', event)" data-element-id="vitality.readiness_gauge" style="align-items:center; padding:24px 16px;">' +
        '<span class="element-selection-badge">vitality.readiness_gauge</span>' +
        '<div style="position:relative; width:170px; height:170px; display:flex; align-items:center; justify-content:center;">' +
          '<svg viewBox="0 0 40 40" style="width:100%; height:100%; transform:rotate(-90deg);">' +
            '<circle cx="20" cy="20" r="16" fill="none" stroke="rgba(129,140,248,0.15)" stroke-width="3.5"/>' +
            '<circle cx="20" cy="20" r="16" fill="none" stroke="url(#vitalityMainGrad)" stroke-width="3.5" stroke-dasharray="100.53" stroke-dashoffset="' + (100.53 * (1 - score/100)) + '" stroke-linecap="round"/>' +
            '<defs><linearGradient id="vitalityMainGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#818cf8"/></linearGradient></defs>' +
          '</svg>' +
          '<div style="display:flex; flex-direction:column; align-items:center; position:absolute;">' +
            '<span class="phone-metric-big" style="color:#818cf8; font-size:42px;" id="phone-gauge-score-val">' + score + '</span>' +
            '<span style="font-size:11px; font-weight:800; color:#10b981;">' + status + '</span>' +
          '</div>' +
        '</div>' +
        '<div style="font-size:12px; font-weight:800; color:#10b981; margin-top:8px;">▲ 3 points higher than yesterday</div>' +
      '</div>' +

      '<!-- 7 Contributing Factors Cards (From APK XML) -->' +
      '<div class="phone-hero-card editable-element" id="elem-vitality.factors_list" onclick="selectElement(\\'vitality.factors_list\\', event)" data-element-id="vitality.factors_list">' +
        '<span class="element-selection-badge">vitality.factors_list</span>' +
        '<div style="font-size:13px; font-weight:800; color:var(--phone-text-main); margin-bottom:8px;">7 Contributing Factors</div>' +
        '<div style="display:flex; flex-direction:column; gap:8px;">' +
          [
            { name: 'Sleep Time Consistency', status: 'Optimal', pts: '+8 pts', color: '#10b981' },
            { name: 'Previous Day Activity', status: 'Active (10.2k steps)', pts: '+7 pts', color: '#10b981' },
            { name: 'Sleep Heart Rate Dip', status: '-14.2% Optimal', pts: '+9 pts', color: '#10b981' },
            { name: 'Sleep Duration', status: '7h 42m Optimal', pts: '+8 pts', color: '#10b981' },
            { name: 'Sleeping HRV', status: '62 ms (High)', pts: '+9 pts', color: '#38bdf8' },
            { name: 'Resting Heart Rate', status: '54 bpm (Stable)', pts: '+8 pts', color: '#10b981' },
            { name: 'Sleep Regularity', status: 'Consistent', pts: '+7 pts', color: '#10b981' }
          ].map(f =>
            '<div style="background:var(--bg-card-subtle); padding:10px 12px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">' +
              '<div>' +
                '<div style="font-size:12px; font-weight:700; color:var(--phone-text-main);">' + f.name + '</div>' +
                '<div style="font-size:10px; color:' + f.color + '; font-weight:700;">' + f.status + '</div>' +
              '</div>' +
              '<span style="font-size:11px; font-weight:800; color:var(--primary-blue);">' + f.pts + '</span>' +
            '</div>'
          ).join('') +
        '</div>' +
      '</div>';
  }

  // 5. SLEEP SESSION & COACHING SCREEN
  else if (screenId === 'scr_sleep_main_dashboard' || screenId === 'scr_sleep_coaching_persona_hub' || screenId === 'scr_sleep_score_contributors') {
    const sleepDur = c.sleep_duration || '7h 42m';
    const sleepScore = c.sleep_score || 88;
    const persona = animalPersonasInfo[c.animal_persona || 'lion'];

    html = '' +
      '<div class="phone-screen-header editable-element" id="elem-sleep.header" onclick="selectElement(\\'sleep.header\\', event)" data-element-id="sleep.header">' +
        '<span class="element-selection-badge">sleep.header</span>' +
        '<div class="phone-screen-header-title">' +
          '<span class="phone-screen-header-back" onclick="selectScreen(\\'scr_home_main_dashboard\\')">&larr;</span>' +
          '<span id="phone-active-title">Sleep</span>' +
        '</div>' +
        '<span style="color:var(--phone-text-muted);">&vellip;</span>' +
      '</div>' +

      '<div class="phone-hero-card editable-element" id="elem-sleep.score_gauge" onclick="selectElement(\\'sleep.score_gauge\\', event)" data-element-id="sleep.score_gauge" style="padding:18px;">' +
        '<span class="element-selection-badge">sleep.score_gauge</span>' +
        '<div style="display:flex; justify-content:space-between; align-items:baseline;">' +
          '<div>' +
            '<span style="font-size:11px; font-weight:800; color:var(--phone-text-muted); text-transform:uppercase;">Total Sleep Time</span>' +
            '<div class="phone-metric-big" style="color:var(--phone-text-main); font-size:32px;">' + sleepDur + '</div>' +
          '</div>' +
          '<div style="text-align:right;">' +
            '<span style="font-size:11px; font-weight:800; color:var(--phone-text-muted);">Sleep Score</span>' +
            '<div style="font-size:24px; font-weight:900; color:#38bdf8;" id="phone-sleep-score-val">' + sleepScore + ' <span style="font-size:13px; font-weight:700;">/ 100</span></div>' +
          '</div>' +
        '</div>' +
        '<div style="font-size:11px; color:var(--phone-text-muted); margin-top:2px;">Bedtime: 11:15 PM &bull; Wake: 6:57 AM</div>' +
      '</div>' +

      '<!-- 4-Stage Hypnogram Chart -->' +
      '<div class="phone-hero-card editable-element" id="elem-sleep.hypnogram" onclick="selectElement(\\'sleep.hypnogram\\', event)" data-element-id="sleep.hypnogram">' +
        '<span class="element-selection-badge">sleep.hypnogram</span>' +
        '<div style="font-size:13px; font-weight:800; color:var(--phone-text-main);">Sleep Stages Hypnogram</div>' +
        '<div style="display:flex; height:12px; border-radius:999px; overflow:hidden; gap:2px; margin-top:6px;">' +
          '<div style="width:5%; background:#f97316;"></div>' +
          '<div style="width:22%; background:#38bdf8;"></div>' +
          '<div style="width:51%; background:#60a5fa;"></div>' +
          '<div style="width:22%; background:#1e40af;"></div>' +
        '</div>' +
        '<div class="phone-grid-2" style="margin-top:8px;">' +
          '<div style="background:var(--bg-card-subtle); padding:6px 10px; border-radius:8px; font-size:11px;"><span style="color:#f97316; font-weight:700;">Awake:</span> 5% (24m)</div>' +
          '<div style="background:var(--bg-card-subtle); padding:6px 10px; border-radius:8px; font-size:11px;"><span style="color:#38bdf8; font-weight:700;">REM:</span> 22% (1h 41m)</div>' +
          '<div style="background:var(--bg-card-subtle); padding:6px 10px; border-radius:8px; font-size:11px;"><span style="color:#60a5fa; font-weight:700;">Light:</span> 51% (3h 56m)</div>' +
          '<div style="background:var(--bg-card-subtle); padding:6px 10px; border-radius:8px; font-size:11px;"><span style="color:#1e40af; font-weight:700;">Deep:</span> 22% (1h 41m)</div>' +
        '</div>' +
      '</div>' +

      '<!-- Official Coaching Animal Persona -->' +
      '<div class="phone-hero-card editable-element" id="elem-sleep.animal_persona" onclick="selectElement(\\'sleep.animal_persona\\', event)" data-element-id="sleep.animal_persona">' +
        '<span class="element-selection-badge">sleep.animal_persona</span>' +
        '<div style="display:flex; align-items:center; gap:12px;">' +
          '<img id="phone-animal-hero-img" src="' + persona.image + '" style="width:64px; height:64px; object-fit:contain; border-radius:14px; background:rgba(255,255,255,0.05); padding:3px;">' +
          '<div style="flex:1;">' +
            '<div style="font-size:15px; font-weight:800; color:var(--phone-text-main);" id="phone-sleep-persona-name">' + persona.name + '</div>' +
            '<div style="font-size:11px; font-weight:700; color:#10b981;" id="phone-sleep-persona-level">' + persona.level + '</div>' +
            '<div style="font-size:10.5px; color:var(--phone-text-muted); line-height:1.3; margin-top:2px;" id="phone-sleep-persona-advice">' + (c.coaching_advice || persona.advice) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  // 6. SPORTS & GPS RUNNING HUD
  else if (screenId === 'scr_sport_live_run_hud' || screenId.startsWith('scr_sport_')) {
    const dist = c.distance_km || 5.42;
    const pace = c.current_pace || '5:18';
    const cadence = c.cadence_spm || 168;

    html = '' +
      '<div class="phone-screen-header editable-element" id="elem-sport.header" onclick="selectElement(\\'sport.header\\', event)" data-element-id="sport.header">' +
        '<span class="element-selection-badge">sport.header</span>' +
        '<div class="phone-screen-header-title">' +
          '<span class="phone-screen-header-back" onclick="selectScreen(\\'scr_home_main_dashboard\\')">&larr;</span>' +
          '<span id="phone-active-title">Outdoor Run</span>' +
        '</div>' +
        '<span style="font-size:11px; color:#10b981; font-weight:700;">GPS Active</span>' +
      '</div>' +

      '<div class="phone-hero-card editable-element" id="elem-sport.timer" onclick="selectElement(\\'sport.timer\\', event)" data-element-id="sport.timer" style="align-items:center; padding:18px;">' +
        '<span class="element-selection-badge">sport.timer</span>' +
        '<span style="font-size:11px; font-weight:800; color:var(--phone-text-muted);">DURATION</span>' +
        '<div class="phone-metric-big" style="font-size:42px; font-family:\\'JetBrains Mono\\', monospace;">00:34:12</div>' +
      '</div>' +

      '<div class="phone-grid-2 editable-element" id="elem-sport.distance_card" onclick="selectElement(\\'sport.distance_card\\', event)" data-element-id="sport.distance_card">' +
        '<span class="element-selection-badge">sport.distance_card</span>' +
        '<div class="phone-mini-tile">' +
          '<span style="font-size:10px; color:var(--phone-text-muted);">DISTANCE</span>' +
          '<div class="phone-metric-big" style="font-size:26px;">' + dist + ' <span style="font-size:12px; font-weight:700;">km</span></div>' +
        '</div>' +
        '<div class="phone-mini-tile">' +
          '<span style="font-size:10px; color:var(--phone-text-muted);">PACE</span>' +
          '<div class="phone-metric-big" style="font-size:26px;" id="phone-coach-pace-val">' + pace + ' <span style="font-size:12px; font-weight:700;">/km</span></div>' +
        '</div>' +
      '</div>' +

      '<!-- 5-Zone HR Telemetry Bar -->' +
      '<div class="phone-hero-card editable-element" id="elem-sport.hr_zones_bar" onclick="selectElement(\\'sport.hr_zones_bar\\', event)" data-element-id="sport.hr_zones_bar">' +
        '<span class="element-selection-badge">sport.hr_zones_bar</span>' +
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
          '<span style="font-size:12px; font-weight:800; color:var(--phone-text-main);">Heart Rate (156 bpm)</span>' +
          '<span class="phone-badge-pill" style="background:#f59e0b; color:#fff;">Zone 4: Threshold</span>' +
        '</div>' +
        '<div style="display:flex; height:8px; border-radius:999px; overflow:hidden; gap:2px; margin-top:4px;">' +
          '<div style="width:20%; background:#60a5fa;"></div>' +
          '<div style="width:20%; background:#34d399;"></div>' +
          '<div style="width:20%; background:#fbbf24;"></div>' +
          '<div style="width:20%; background:#f87171; box-shadow:0 0 8px #f87171;"></div>' +
          '<div style="width:20%; background:#c084fc;"></div>' +
        '</div>' +
      '</div>' +

      '<div class="editable-element" id="elem-sport.controls" onclick="selectElement(\\'sport.controls\\', event)" data-element-id="sport.controls" style="display:flex; gap:10px; width:100%; margin-top:6px;">' +
        '<span class="element-selection-badge">sport.controls</span>' +
        '<button style="flex:1; padding:12px; border-radius:14px; background:#f59e0b; color:#000; border:none; font-weight:800; cursor:pointer;">Pause</button>' +
        '<button style="flex:1; padding:12px; border-radius:14px; background:#ef4444; color:#fff; border:none; font-weight:800; cursor:pointer;">Finish</button>' +
      '</div>';
  }

  // 7. HEART HEALTH & SINUS ECG
  else if (screenId.startsWith('scr_heart_') || screenId.startsWith('scr_ecg_') || screenId.startsWith('scr_vitals_')) {
    const hr = c.heart_rate || c.current_bpm || 72;
    const resting = c.resting_bpm || 58;

    html = '' +
      '<div class="phone-screen-header editable-element" id="elem-heart.header" onclick="selectElement(\\'heart.header\\', event)" data-element-id="heart.header">' +
        '<span class="element-selection-badge">heart.header</span>' +
        '<div class="phone-screen-header-title">' +
          '<span class="phone-screen-header-back" onclick="selectScreen(\\'scr_home_main_dashboard\\')">&larr;</span>' +
          '<span id="phone-active-title">Electrocardiogram (ECG)</span>' +
        '</div>' +
        '<span style="color:var(--phone-text-muted);">&vellip;</span>' +
      '</div>' +

      '<div class="phone-hero-card editable-element" id="elem-heart.bpm_display" onclick="selectElement(\\'heart.bpm_display\\', event)" data-element-id="heart.bpm_display" style="align-items:center; padding:18px;">' +
        '<span class="element-selection-badge">heart.bpm_display</span>' +
        '<div style="display:flex; align-items:center; gap:8px;">' +
          '<span style="display:inline-flex; width:12px; height:12px; border-radius:50%; background:#f43f5e; box-shadow:0 0 10px #f43f5e;"></span>' +
          '<span style="font-size:11px; font-weight:800; color:var(--phone-text-muted); text-transform:uppercase;">Sinus Rhythm (Lead I)</span>' +
        '</div>' +
        '<div class="phone-metric-big" style="color:#f43f5e; font-size:48px; margin:4px 0;" id="phone-bpm-metric-num">' + hr + ' <span style="font-size:16px; font-weight:700; color:var(--phone-text-muted);">bpm</span></div>' +
        '<span class="phone-badge-pill" style="background:rgba(16,185,129,0.15); color:#10b981;">Normal Sinus Rhythm &bull; Resting: ' + resting + ' bpm</span>' +
      '</div>' +

      '<!-- 60Hz Lead I ECG Medical Waveform Canvas -->' +
      '<div class="phone-hero-card editable-element" id="elem-heart.waveform_lead1" onclick="selectElement(\\'heart.waveform_lead1\\', event)" data-element-id="heart.waveform_lead1">' +
        '<span class="element-selection-badge">heart.waveform_lead1</span>' +
        '<div style="font-size:11.5px; font-weight:800; color:var(--phone-text-main); margin-bottom:4px;">Lead I ECG Waveform (500Hz sampling)</div>' +
        '<div style="width:100%; height:80px; background:rgba(244,63,94,0.03); border:1px solid rgba(244,63,94,0.12); border-radius:10px; position:relative; overflow:hidden;">' +
          '<svg viewBox="0 0 400 80" style="width:100%; height:100%;" preserveAspectRatio="none">' +
            '<path d="M0,40 L30,40 L40,36 L45,44 L50,40 L65,40 L70,10 L78,65 L84,25 L90,40 L110,40 L120,32 L130,40 L200,40 L210,36 L215,44 L220,40 L235,40 L240,10 L248,65 L254,25 L260,40 L280,40 L290,32 L300,40 L400,40" fill="none" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round"/>' +
          '</svg>' +
        '</div>' +
        '<div class="phone-grid-2" style="margin-top:8px;">' +
          '<div style="background:var(--bg-card-subtle); padding:6px; border-radius:8px; text-align:center; font-size:10px;">PR: 164 ms</div>' +
          '<div style="background:var(--bg-card-subtle); padding:6px; border-radius:8px; text-align:center; font-size:10px;">QRS: 88 ms</div>' +
        '</div>' +
      '</div>';
  }

  // 8. BLOOD PRESSURE SCREEN
  else if (screenId.startsWith('scr_bp_') || screenId.startsWith('scr_telehealth_')) {
    const sys = c.systolic_mmhg || 118;
    const dia = c.diastolic_mmhg || 76;

    html = '' +
      '<div class="phone-screen-header editable-element" id="elem-bp.header" onclick="selectElement(\\'bp.header\\', event)" data-element-id="bp.header">' +
        '<span class="element-selection-badge">bp.header</span>' +
        '<div class="phone-screen-header-title">' +
          '<span class="phone-screen-header-back" onclick="selectScreen(\\'scr_home_main_dashboard\\')">&larr;</span>' +
          '<span id="phone-active-title">Blood pressure</span>' +
        '</div>' +
        '<span style="color:var(--phone-text-muted);">&vellip;</span>' +
      '</div>' +

      '<div class="phone-hero-card editable-element" id="elem-bp.gauge" onclick="selectElement(\\'bp.gauge\\', event)" data-element-id="bp.gauge" style="align-items:center; padding:24px 16px;">' +
        '<span class="element-selection-badge">bp.gauge</span>' +
        '<span style="font-size:11px; font-weight:800; color:var(--phone-text-muted);">SPHYGMOMANOMETER READING</span>' +
        '<div class="phone-metric-big" style="font-size:46px; margin:6px 0;" id="phone-bp-display-val">' + sys + ' / ' + dia + '</div>' +
        '<span style="font-size:13px; font-weight:700; color:var(--phone-text-muted);">mmHg &bull; Pulse: 68 bpm</span>' +
        '<span class="phone-badge-pill" style="background:rgba(16,185,129,0.15); color:#10b981; margin-top:8px;">Optimal Normal Blood Pressure</span>' +
      '</div>' +

      '<div class="phone-hero-card editable-element" id="elem-bp.cuff_card" onclick="selectElement(\\'bp.cuff_card\\', event)" data-element-id="bp.cuff_card">' +
        '<span class="element-selection-badge">bp.cuff_card</span>' +
        '<div style="font-size:12px; font-weight:800; color:var(--phone-text-main);">Omron Cuff Calibration</div>' +
        '<div style="font-size:11px; color:var(--phone-text-muted); margin-top:2px;">Last calibrated with Omron Evolv cuff on Apr 25. Next calibration in 25 days.</div>' +
      '</div>';
  }

  // 9. BLOOD GLUCOSE CGM SCREEN
  else if (screenId.startsWith('scr_cgm_') || screenId.startsWith('scr_glucose_')) {
    const glu = c.glucose_mgdl || 104;
    const tir = c.time_in_range_percent || 89;

    html = '' +
      '<div class="phone-screen-header editable-element" id="elem-cgm.header" onclick="selectElement(\\'cgm.header\\', event)" data-element-id="cgm.header">' +
        '<span class="element-selection-badge">cgm.header</span>' +
        '<div class="phone-screen-header-title">' +
          '<span class="phone-screen-header-back" onclick="selectScreen(\\'scr_home_main_dashboard\\')">&larr;</span>' +
          '<span id="phone-active-title">Blood glucose (CGM)</span>' +
        '</div>' +
        '<span style="font-size:11px; color:#10b981; font-weight:700;">Sensor: 9d</span>' +
      '</div>' +

      '<div class="phone-hero-card editable-element" id="elem-cgm.telemetry" onclick="selectElement(\\'cgm.telemetry\\', event)" data-element-id="cgm.telemetry" style="align-items:center; padding:20px 16px;">' +
        '<span class="element-selection-badge">cgm.telemetry</span>' +
        '<span style="font-size:11px; font-weight:800; color:var(--phone-text-muted);">CURRENT GLUCOSE</span>' +
        '<div style="display:flex; align-items:baseline; gap:6px; margin:4px 0;">' +
          '<span class="phone-metric-big" style="font-size:48px;" id="phone-cgm-val">' + glu + '</span>' +
          '<span style="font-size:16px; font-weight:800; color:#10b981;">&rarr; mg/dL</span>' +
        '</div>' +
        '<span class="phone-badge-pill" style="background:rgba(16,185,129,0.15); color:#10b981;">Target Corridor (70 - 140 mg/dL)</span>' +
      '</div>' +

      '<div class="phone-hero-card editable-element" id="elem-cgm.tir_card" onclick="selectElement(\\'cgm.tir_card\\', event)" data-element-id="cgm.tir_card">' +
        '<span class="element-selection-badge">cgm.tir_card</span>' +
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
          '<span style="font-size:12px; font-weight:800; color:var(--phone-text-main);">Time in Range (TIR)</span>' +
          '<span style="font-size:12px; font-weight:800; color:#10b981;">' + tir + '% in target</span>' +
        '</div>' +
        '<div class="phone-progress-bar"><div class="phone-progress-fill" style="width:' + tir + '%; background:#10b981;"></div></div>' +
      '</div>';
  }

  // 10. MEDICATIONS SCREEN
  else if (screenId === 'scr_medication_tracker_deep') {
    html = '' +
      '<div class="phone-screen-header editable-element" id="elem-meds.header" onclick="selectElement(\\'meds.header\\', event)" data-element-id="meds.header">' +
        '<span class="element-selection-badge">meds.header</span>' +
        '<div class="phone-screen-header-title">' +
          '<span class="phone-screen-header-back" onclick="selectScreen(\\'scr_home_main_dashboard\\')">&larr;</span>' +
          '<span id="phone-active-title">Medications</span>' +
        '</div>' +
        '<span style="font-size:12px; font-weight:700; color:var(--primary-blue);">+ Add</span>' +
      '</div>' +

      '<div class="phone-hero-card editable-element" id="elem-meds.schedule" onclick="selectElement(\\'meds.schedule\\', event)" data-element-id="meds.schedule">' +
        '<span class="element-selection-badge">meds.schedule</span>' +
        '<div style="font-size:13px; font-weight:800; color:var(--phone-text-main); margin-bottom:8px;">Today\\'s Medication Schedule</div>' +
        '<div style="display:flex; flex-direction:column; gap:8px;">' +
          '<div style="background:var(--bg-card-subtle); padding:10px 12px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">' +
            '<div><strong style="font-size:12px;">Multivitamin &bull; 1 tablet</strong><div style="font-size:10px; color:var(--phone-text-muted);">8:00 AM with breakfast</div></div>' +
            '<span style="color:#10b981; font-weight:800;">Taken &#10004;</span>' +
          '</div>' +
          '<div style="background:var(--bg-card-subtle); padding:10px 12px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">' +
            '<div><strong style="font-size:12px;">CoQ10 100mg &bull; 1 capsule</strong><div style="font-size:10px; color:var(--phone-text-muted);">1:00 PM with lunch</div></div>' +
            '<span style="color:#10b981; font-weight:800;">Taken &#10004;</span>' +
          '</div>' +
          '<div style="background:var(--bg-card-subtle); padding:10px 12px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">' +
            '<div><strong style="font-size:12px;">Magnesium 400mg</strong><div style="font-size:10px; color:var(--phone-text-muted);">9:00 PM before sleep</div></div>' +
            '<span style="color:#f59e0b; font-weight:800;">Upcoming</span>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  // 11. TOGETHER & CHALLENGES SCREEN
  else if (screenId === 'scr_together_stepathon_deep') {
    html = '' +
      '<div class="phone-screen-header editable-element" id="elem-together.header" onclick="selectElement(\\'together.header\\', event)" data-element-id="together.header">' +
        '<span class="element-selection-badge">together.header</span>' +
        '<div class="phone-screen-header-title">' +
          '<span class="phone-screen-header-back" onclick="selectScreen(\\'scr_home_main_dashboard\\')">&larr;</span>' +
          '<span id="phone-active-title">Together</span>' +
        '</div>' +
        '<span style="color:var(--phone-text-muted);">&vellip;</span>' +
      '</div>' +

      '<div class="phone-hero-card editable-element" id="elem-together.challenge" onclick="selectElement(\\'together.challenge\\', event)" data-element-id="together.challenge">' +
        '<span class="element-selection-badge">together.challenge</span>' +
        '<span style="font-size:11px; font-weight:800; color:var(--primary-blue);">GLOBAL STEPATHON &bull; APR 2026</span>' +
        '<div class="phone-metric-big" style="font-size:32px; margin:4px 0;">68,400 <span style="font-size:14px; font-weight:700; color:var(--phone-text-muted);">/ 100k steps</span></div>' +
        '<div class="phone-progress-bar"><div class="phone-progress-fill" style="width:68%; background:#10b981;"></div></div>' +
        '<span style="font-size:11px; color:#10b981; font-weight:700; margin-top:4px;">Rank #1 amongst friends &bull; Top 12% globally</span>' +
      '</div>';
  }

  // 12. FALLBACK ADAPTIVE SCREEN
  else {
    html = '' +
      '<div class="phone-screen-header editable-element" id="elem-' + screenId + '.header" onclick="selectElement(\\'' + screenId + '.header\\', event)" data-element-id="' + screenId + '.header">' +
        '<span class="element-selection-badge">' + screenId + '.header</span>' +
        '<div class="phone-screen-header-title">' +
          '<span class="phone-screen-header-back" onclick="selectScreen(\\'scr_home_main_dashboard\\')">&larr;</span>' +
          '<span id="phone-active-title">' + escapeHtml(data?.screen_name || screenId) + '</span>' +
        '</div>' +
        '<span style="color:var(--phone-text-muted);">&vellip;</span>' +
      '</div>' +

      '<div class="phone-hero-card editable-element" id="elem-' + screenId + '.main_card" onclick="selectElement(\\'' + screenId + '.main_card\\', event)" data-element-id="' + screenId + '.main_card">' +
        '<span class="element-selection-badge">' + screenId + '.main_card</span>' +
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
          '<span style="font-size:11px; font-weight:800; color:var(--phone-text-muted);">MOBILE MODULE ACTIVE</span>' +
          '<span class="phone-badge-pill" style="background:rgba(16,185,129,0.15); color:#10b981;">One UI 7 Verified</span>' +
        '</div>' +
        '<div style="font-size:15px; font-weight:800; color:var(--phone-text-main); margin-top:4px;">' + escapeHtml(data?.screen_name || screenId) + '</div>' +
        '<div style="font-size:11px; color:var(--phone-text-muted); margin-top:4px;">Deep Link Route: <code>' + escapeHtml(data?.route_path || 'dokrahealth://') + '</code></div>' +
      '</div>';
  }

  root.innerHTML = html;
}
`;

// Extract after renderPhoneScreen
const inspectorSplit = '// -----------------------------------------------------------------------------\n// 8. RENDER TAILORED ELEMENT-SPECIFIC INSPECTOR CONTROLS';
const inspectorPart = currentEngine.split(inspectorSplit)[1];

const finalCode = part1 + fullPhoneRenderer + '\n// -----------------------------------------------------------------------------\n// 8. RENDER TAILORED ELEMENT-SPECIFIC INSPECTOR CONTROLS' + inspectorPart;

fs.writeFileSync('backend/card-service/src/studio-engine.js', finalCode, 'utf8');
console.log('✔ Successfully assembled authentic studio-engine.js! Length:', finalCode.length);

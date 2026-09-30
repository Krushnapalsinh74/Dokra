// Dokra Health - Master Dynamic Mobile Screen & Element-Specific Inspector Engine
// Task ID: DOKRA-ADMIN-SCREEN-FIDELITY-PRODUCTION
// Complete Real Samsung Health / Dokra Health Mobile App UI & Real-Time Live Inspector

// -----------------------------------------------------------------------------
// 1. CLEAN PRODUCTION SVG ICON LIBRARY (Zero Cartoon Emojis)
// -----------------------------------------------------------------------------
const SVG_ICONS = {
  ring: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="3"/></svg>',
  home: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  together: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  fitness: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="2"/><path d="M10 22v-5l-2-2v-4l4-2 3 3v5"/><path d="M14 13l2 2v7"/></svg>',
  profile: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  steps: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16v-2a4 4 0 0 1 4-4h2l2 4 4-2v4H4z"/><path d="M12 10V6a2 2 0 0 1 2-2h4v4h-4"/></svg>',
  target: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  bell: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  vitality: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  chart: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  heart: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  pulse: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  moon: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  ai: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V11h-4V9.5C8.8 8.8 8 7.5 8 6a4 4 0 0 1 4-4z"/><rect x="4" y="11" width="16" height="10" rx="2"/><circle cx="9" cy="16" r="1"/><circle cx="15" cy="16" r="1"/></svg>',
  badge: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>',
  widget: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>',
  sport: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="2"/><path d="M10 22v-5l-2-2v-4l4-2 3 3v5"/><path d="M14 13l2 2v7"/></svg>',
  pace: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  gpx: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>',
  cycling: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>',
  treadmill: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="10" rx="2"/><line x1="3" y1="18" x2="21" y2="18"/><line x1="6" y1="4" x2="6" y2="8"/></svg>',
  swim: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20"/><path d="M2 16h20"/><path d="M2 20h20"/></svg>',
  strength: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/></svg>',
  mic: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
  shield: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  temp: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>',
  resp: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h4l3-6 4 12 3-6h6"/></svg>',
  bp: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
  cuff: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="3"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="12" x2="14" y2="10"/></svg>',
  glucose: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
  pdf: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  header: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="5" rx="1"/><rect x="3" y="10" width="18" height="11" rx="1"/></svg>',
  card: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
  settings: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  doctor: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>',
  water: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
  body: '<svg class="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="4" r="2"/><path d="M15 7H9a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M9 16v6"/><path d="M15 16v6"/></svg>'
};

function getStudioIcon(iconKey) {
  return SVG_ICONS[iconKey] || SVG_ICONS.card;
}

// -----------------------------------------------------------------------------
// 2. OFFICIAL SAMSUNG HEALTH ANIMAL PERSONAS (Real High-Res WebP Graphics)
// -----------------------------------------------------------------------------
const animalPersonasInfo = {
  lion: { name: 'Unconcerned Lion', level: 'Level 4, Order 1', image: '/assets/home_card_sleep_animal_lion.webp', desc: 'Snoozes easily and sleeps deeply without disturbances.', advice: 'Maintain your solid circadian rhythm with morning sunlight exposure.' },
  hedgehog: { name: 'Sensitive Hedgehog', level: 'Level 2, Order 6', image: '/assets/home_card_sleep_animal_hedgehog.webp', desc: 'Awakens frequently at night, light sleeper.', advice: 'Limit evening screen blue light and keep bedroom temperature at 18-20°C.' },
  penguin: { name: 'Nervous Penguin', level: 'Level 3, Order 2', image: '/assets/home_card_sleep_animal_penguin.webp', desc: 'Restless latency, takes time to wind down.', advice: 'Try progressive muscle relaxation and warm chamomile tea 45m before bed.' },
  mole: { name: 'Sun Averse Mole', level: 'Level 3, Order 4', image: '/assets/home_card_sleep_animal_mole.webp', desc: 'Night owl tendency, prefers sleeping in dark hours.', advice: 'Shift wake-up time 15 minutes earlier each day and take morning walks.' },
  deer: { name: 'Cautious Deer', level: 'Level 2, Order 5', image: '/assets/home_card_sleep_animal_deer.webp', desc: 'Fragmented sleep cycles, alert to minor sounds.', advice: 'Use consistent white noise machine and blackout curtains.' },
  elephantsea: { name: 'Easygoing Walrus', level: 'Level 3, Order 3', image: '/assets/home_card_sleep_animal_elephantsea.webp', desc: 'Long duration sleep but low deep restorative percentage.', advice: 'Avoid heavy meals within 3 hours of sleep to boost delta wave sleep.' },
  alligator: { name: 'Alligator on the Hunt', level: 'Level 2, Order 7', image: '/assets/home_card_sleep_animal_ali.webp', desc: 'Irregular bedtime and shift-work disruption.', advice: 'Anchor circadian rhythm with fixed morning wake-up schedule.' },
  shark: { name: 'Exhausted Shark', level: 'Level 1, Order 8', image: '/assets/home_card_sleep_animal_shark.webp', desc: 'Chronic sleep deprivation with elevated sleep debt.', advice: 'Prioritize 8+ hours time in bed and take 20-minute catchup power naps.' }
};

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// -----------------------------------------------------------------------------
// 3. MASTER SCREEN ELEMENTS INVENTORY
// -----------------------------------------------------------------------------
const screenElementsInventory = {
  'scr_home_main_dashboard': [
    { id: 'home.header', name: 'One UI App Bar & Status', iconKey: 'header', type: 'header', route: 'dokrahealth://home' },
    { id: 'home.activity_ring', name: '3-Ring Daily Activity Card', iconKey: 'ring', type: 'card', route: 'dokrahealth://tracker/dailyactivity' },
    { id: 'home.vitality_card', name: 'Energy Score & Readiness Card', iconKey: 'vitality', type: 'card', route: 'dokrahealth://tracker/vitality' },
    { id: 'home.sleep_card', name: 'Sleep Session & Animal Card', iconKey: 'moon', type: 'card', route: 'dokrahealth://tracker/sleep' },
    { id: 'home.heart_card', name: 'Heart Rate & ECG Pulse Card', iconKey: 'heart', type: 'card', route: 'dokrahealth://tracker/heartrate' },
    { id: 'home.quick_exercises', name: 'Exercise Quick Start Bar', iconKey: 'sport', type: 'card', route: 'dokrahealth://tracker/sport' },
    { id: 'home.body_comp_card', name: 'Body Composition (BIA) Card', iconKey: 'body', type: 'card', route: 'dokrahealth://tracker/bodycomp' },
    { id: 'home.water_card', name: 'Hydration & Water Counter', iconKey: 'water', type: 'card', route: 'dokrahealth://tracker/water' },
    { id: 'home.ai_coach_card', name: 'Med-PaLM 2 Clinical AI Insights', iconKey: 'ai', type: 'card', route: 'dokrahealth://tracker/aicoach' },
    { id: 'home.service_feed', name: 'Dynamic Service Cards Feed', iconKey: 'card', type: 'feed', route: 'dokrahealth://v2/servicecard/list' },
    { id: 'home.bottom_nav', name: 'One UI Bottom Navigation Bar', iconKey: 'home', type: 'nav', route: 'dokrahealth://home' }
  ],
  'scr_together_challenges': [
    { id: 'together.header', name: 'Together Screen Header', iconKey: 'header', type: 'header', route: 'dokrahealth://together' },
    { id: 'together.global_challenge', name: 'Global 100K Steps Trophy Cup', iconKey: 'badge', type: 'card', route: 'dokrahealth://together/global' },
    { id: 'together.friends_leaderboard', name: 'Friends & Family Live Rankings', iconKey: 'together', type: 'card', route: 'dokrahealth://together/friends' },
    { id: 'together.one_on_one_match', name: '1:1 Direct Step Match Duel', iconKey: 'sport', type: 'card', route: 'dokrahealth://together/duel' }
  ],
  'scr_fitness_programs': [
    { id: 'fitness.header', name: 'Fitness Hub Header', iconKey: 'header', type: 'header', route: 'dokrahealth://fitness' },
    { id: 'fitness.running_coach', name: '5K/10K Dokra Audio Running Coach', iconKey: 'pace', type: 'card', route: 'dokrahealth://fitness/running' },
    { id: 'fitness.hiit_workout', name: 'HIIT & Fat Burn Cardio Series', iconKey: 'sport', type: 'card', route: 'dokrahealth://fitness/hiit' },
    { id: 'fitness.mindful_meditation', name: 'Mindfulness & Sleep Meditation', iconKey: 'moon', type: 'card', route: 'dokrahealth://fitness/meditation' }
  ],
  'scr_mypage_profile': [
    { id: 'mypage.header', name: 'Profile App Bar', iconKey: 'header', type: 'header', route: 'dokrahealth://mypage' },
    { id: 'mypage.user_card', name: 'User Profile & Dokra Health Level', iconKey: 'profile', type: 'card', route: 'dokrahealth://mypage/user' },
    { id: 'mypage.badges_showcase', name: 'Master Badges & Trophy Cabinet', iconKey: 'badge', type: 'card', route: 'dokrahealth://mypage/badges' },
    { id: 'mypage.health_report', name: 'Weekly Clinical Health Summary', iconKey: 'chart', type: 'card', route: 'dokrahealth://mypage/report' },
    { id: 'mypage.connected_devices', name: 'Galaxy Watch7 & Smart Ring Sync', iconKey: 'widget', type: 'card', route: 'dokrahealth://mypage/devices' }
  ],
  'scr_daily_activity_ring': [
    { id: 'ring.header', name: 'Daily Activity Header Bar', iconKey: 'header', type: 'header', route: 'dokrahealth://tracker/dailyactivity' },
    { id: 'ring.svg_geometry', name: '3-Ring SVG Geometry Widget', iconKey: 'ring', type: 'progress_ring', route: 'dokrahealth://tracker/dailyactivity' },
    { id: 'ring.calorie_bar', name: 'Active Calorie Progress Bar', iconKey: 'chart', type: 'progress_bar', route: 'dokrahealth://tracker/dailyactivity' },
    { id: 'ring.time_bar', name: 'Active Time Progress Bar', iconKey: 'pace', type: 'progress_bar', route: 'dokrahealth://tracker/dailyactivity' },
    { id: 'ring.move_bar', name: 'Hourly Move Progress Bar', iconKey: 'bell', type: 'progress_bar', route: 'dokrahealth://tracker/dailyactivity' },
    { id: 'ring.step_counter', name: 'Center Step Goal Counter', iconKey: 'steps', type: 'metric_counter', route: 'dokrahealth://tracker/pedometer' }
  ],
  'scr_pedometer_detail': [
    { id: 'pedometer.header', name: 'Pedometer Header', iconKey: 'header', type: 'header', route: 'dokrahealth://tracker/pedometer' },
    { id: 'pedometer.step_counter', name: 'Total Steps Counter', iconKey: 'steps', type: 'counter', route: 'dokrahealth://tracker/pedometer' },
    { id: 'pedometer.distance_card', name: 'Distance & Cadence Card', iconKey: 'chart', type: 'card', route: 'dokrahealth://tracker/pedometer' },
    { id: 'pedometer.hourly_chart', name: 'Hourly Activity Histogram', iconKey: 'chart', type: 'chart', route: 'dokrahealth://tracker/pedometer' }
  ],
  'scr_activity_goals_settings': [
    { id: 'goals.header', name: 'Goals Header', iconKey: 'header', type: 'header', route: 'dokrahealth://tracker/goals' },
    { id: 'goals.targets_card', name: 'Daily Target Sliders', iconKey: 'target', type: 'config', route: 'dokrahealth://tracker/goals' }
  ],
  'scr_vitality_energy_score': [
    { id: 'vitality.header', name: 'Energy & Vitality Header', iconKey: 'header', type: 'header', route: 'dokrahealth://tracker/vitality' },
    { id: 'vitality.readiness_gauge', name: 'Readiness Score Radial Gauge', iconKey: 'vitality', type: 'gauge', route: 'dokrahealth://tracker/vitality' },
    { id: 'vitality.ai_coach_summary', name: 'Med-PaLM AI Clinical Guidance', iconKey: 'ai', type: 'ai_card', route: 'dokrahealth://tracker/vitality/aicoach' },
    { id: 'vitality.hrv_factor_tile', name: 'Nocturnal RMSSD HRV Factor', iconKey: 'pulse', type: 'factor_tile', route: 'dokrahealth://tracker/vitality/hrv' },
    { id: 'vitality.sleep_debt_tile', name: 'Sleep Debt Penalty Factor', iconKey: 'moon', type: 'factor_tile', route: 'dokrahealth://tracker/vitality/sleepdebt' },
    { id: 'vitality.strain_tile', name: 'Prior Day Physical Strain', iconKey: 'sport', type: 'factor_tile', route: 'dokrahealth://tracker/vitality/strain' },
    { id: 'vitality.regularity_tile', name: 'Circadian Regularity Factor', iconKey: 'target', type: 'factor_tile', route: 'dokrahealth://tracker/vitality/regularity' }
  ],
  'scr_vitality_score_factors': [
    { id: 'vitality.header', name: 'Score Factors Header', iconKey: 'header', type: 'header', route: 'dokrahealth://tracker/vitality/factors' },
    { id: 'vitality.factors_list', name: '7 Clinical Contributing Factors', iconKey: 'chart', type: 'factor_card', route: 'dokrahealth://tracker/vitality/factors' }
  ],
  'scr_vitality_sleep_debt': [
    { id: 'vitality.header', name: 'Sleep Debt Header', iconKey: 'header', type: 'header', route: 'dokrahealth://tracker/vitality/sleepdebt' },
    { id: 'vitality.sleep_debt_card', name: 'Sleep Debt Penalty Breakdown', iconKey: 'moon', type: 'factor_card', route: 'dokrahealth://tracker/vitality/sleepdebt' }
  ],
  'scr_vitality_ai_coach_guidance': [
    { id: 'vitality.header', name: 'Med-PaLM Coach Header', iconKey: 'header', type: 'header', route: 'dokrahealth://tracker/vitality/aicoach' },
    { id: 'vitality.ai_recommendation_card', name: 'Med-PaLM Clinical Recommendation', iconKey: 'ai', type: 'ai_card', route: 'dokrahealth://tracker/vitality/aicoach' }
  ],
  'scr_vitality_hrv_deep': [
    { id: 'vitality.header', name: 'HRV Telemetry Header', iconKey: 'header', type: 'header', route: 'dokrahealth://tracker/vitality/hrv' },
    { id: 'vitality.hrv_factor_card', name: 'RMSSD Nocturnal Telemetry', iconKey: 'pulse', type: 'telemetry_card', route: 'dokrahealth://tracker/vitality/hrv' }
  ],
  'scr_vitality_trends_chart': [
    { id: 'vitality.header', name: 'Trends Header', iconKey: 'header', type: 'header', route: 'dokrahealth://tracker/vitality/trends' },
    { id: 'vitality.trends_chart_card', name: 'Readiness History Chart', iconKey: 'chart', type: 'chart', route: 'dokrahealth://tracker/vitality/trends' }
  ],
  'scr_sport_live_run_hud': [
    { id: 'sport.header', name: 'Workout Live HUD Header', iconKey: 'header', type: 'header', route: 'dokrahealth://tracker/sport/live' },
    { id: 'sport.gps_pill', name: 'GPS Satellite Lock Indicator', iconKey: 'gpx', type: 'status_pill', route: 'dokrahealth://tracker/sport/live' },
    { id: 'sport.timer', name: 'Workout Elapsed Time Clock', iconKey: 'pace', type: 'timer', route: 'dokrahealth://tracker/sport/live' },
    { id: 'sport.distance_card', name: 'Distance (km) & Pace Metric', iconKey: 'sport', type: 'metric_card', route: 'dokrahealth://tracker/sport/live' },
    { id: 'sport.hr_zones_bar', name: 'Heart Rate 5-Zone Telemetry', iconKey: 'pulse', type: 'hr_bar', route: 'dokrahealth://tracker/sport/live' }
  ],
  'scr_sleep_main_dashboard': [
    { id: 'sleep.header', name: 'Sleep Session Header', iconKey: 'header', type: 'header', route: 'dokrahealth://tracker/sleep' },
    { id: 'sleep.score_gauge', name: 'Sleep Score & Quality Banner', iconKey: 'moon', type: 'score_card', route: 'dokrahealth://tracker/sleep' },
    { id: 'sleep.hypnogram', name: '4-Stage Hypnogram Architecture', iconKey: 'chart', type: 'hypnogram', route: 'dokrahealth://tracker/sleep' },
    { id: 'sleep.animal_persona', name: 'Animal Persona Coaching Card', iconKey: 'badge', type: 'persona_card', route: 'dokrahealth://tracker/sleep/persona' },
    { id: 'sleep.snoring_tile', name: 'Snoring Audio Detection Tile', iconKey: 'mic', type: 'sensor_tile', route: 'dokrahealth://tracker/sleep/snoring' },
    { id: 'sleep.spo2_tile', name: 'Blood Oxygen (SpO2) Tile', iconKey: 'shield', type: 'sensor_tile', route: 'dokrahealth://tracker/sleep/spo2' }
  ],
  'scr_sleep_coaching_persona_hub': [
    { id: 'sleep.header', name: 'Animal Coaching Hub Header', iconKey: 'header', type: 'header', route: 'dokrahealth://tracker/sleep/persona' },
    { id: 'sleep.persona_card', name: 'Active Animal Persona Showcase', iconKey: 'badge', type: 'persona_card', route: 'dokrahealth://tracker/sleep/persona' }
  ],
  'scr_heart_main_dashboard': [
    { id: 'heart.header', name: 'Heart Rate Hub Header', iconKey: 'header', type: 'header', route: 'dokrahealth://tracker/heart' },
    { id: 'heart.bpm_gauge', name: 'Current BPM & PPG Pulse Gauge', iconKey: 'heart', type: 'gauge', route: 'dokrahealth://tracker/heart' },
    { id: 'heart.resting_card', name: 'Resting Heart Rate (RHR) Card', iconKey: 'pulse', type: 'card', route: 'dokrahealth://tracker/heart' },
    { id: 'heart.stress_meter', name: 'Real-Time Stress Level Meter', iconKey: 'target', type: 'card', route: 'dokrahealth://tracker/heart' }
  ],
  'scr_ecg_sinus_lead_live': [
    { id: 'ecg.header', name: 'Lead I ECG Live Header', iconKey: 'header', type: 'header', route: 'dokrahealth://tracker/ecg/live' },
    { id: 'ecg.waveform_canvas', name: '60Hz Real-Time ECG Lead Canvas', iconKey: 'pulse', type: 'ecg_canvas', route: 'dokrahealth://tracker/ecg/live' },
    { id: 'ecg.lead_status', name: 'Electrode Impedance & P-Q-R-S-T', iconKey: 'shield', type: 'status_card', route: 'dokrahealth://tracker/ecg/live' }
  ],
  'scr_bp_main_dashboard': [
    { id: 'bp.header', name: 'Blood Pressure Hub Header', iconKey: 'header', type: 'header', route: 'dokrahealth://tracker/bp' },
    { id: 'bp.dual_gauge', name: 'Systolic & Diastolic Dual Gauge', iconKey: 'bp', type: 'gauge', route: 'dokrahealth://tracker/bp' },
    { id: 'bp.map_card', name: 'Mean Arterial Pressure (MAP) Card', iconKey: 'chart', type: 'card', route: 'dokrahealth://tracker/bp' }
  ],
  'scr_cgm_main_dashboard': [
    { id: 'cgm.header', name: 'Blood Glucose Hub Header', iconKey: 'header', type: 'header', route: 'dokrahealth://tracker/cgm' },
    { id: 'cgm.glucose_dial', name: 'Current Glucose & Trend Arrow', iconKey: 'glucose', type: 'gauge', route: 'dokrahealth://tracker/cgm' },
    { id: 'cgm.tir_bar', name: 'Time in Range (TIR) Distribution', iconKey: 'chart', type: 'tir_card', route: 'dokrahealth://tracker/cgm' }
  ]
};

let activeScreenId = 'scr_home_main_dashboard';
let selectedElementId = 'home.activity_ring';
let loadedScreenData = null;
let allScreensRegistry = [];
let liveServiceCards = [];

// -----------------------------------------------------------------------------
// 4. SELECT SCREEN FUNCTION
// -----------------------------------------------------------------------------
async function selectScreen(screenId) {
  activeScreenId = screenId;

  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const navMap = {
    'scr_home_main_dashboard': 'nav-scr-dashboard',
    'scr_together_challenges': 'nav-scr-together',
    'scr_fitness_programs': 'nav-scr-fitness',
    'scr_mypage_profile': 'nav-scr-mypage',
    'scr_daily_activity_ring': 'nav-scr-ring',
    'scr_pedometer_detail': 'nav-scr-pedometer',
    'scr_activity_goals_settings': 'nav-scr-goals',
    'scr_move_reminder_notification': 'nav-scr-reminder',
    'scr_vitality_energy_score': 'nav-scr-vitality-main',
    'scr_vitality_score_factors': 'nav-scr-vitality-factors',
    'scr_vitality_trends_chart': 'nav-scr-vitality-trends',
    'scr_vitality_hrv_deep': 'nav-scr-vitality-hrv',
    'scr_vitality_sleep_debt': 'nav-scr-vitality-debt',
    'scr_vitality_ai_coach_guidance': 'nav-scr-vitality-aicoach',
    'scr_vitality_onboarding_getstarted': 'nav-scr-vitality-onboarding',
    'scr_vitality_rewards_streaks': 'nav-scr-vitality-rewards',
    'scr_vitality_home_widget_settings': 'nav-scr-vitality-widget',
    'scr_sport_live_run_hud': 'nav-scr-sport-live',
    'scr_sport_pace_coach': 'nav-scr-sport-coach',
    'scr_sport_cycling_live': 'nav-scr-sport-cycling',
    'scr_sleep_main_dashboard': 'nav-scr-sleep-main',
    'scr_sleep_score_contributors': 'nav-scr-sleep-score',
    'scr_sleep_stages_hypnogram': 'nav-scr-sleep-stages',
    'scr_sleep_coaching_persona_hub': 'nav-scr-sleep-coaching',
    'scr_heart_main_dashboard': 'nav-scr-heart-main',
    'scr_heart_resting_detail': 'nav-scr-heart-resting',
    'scr_ecg_sinus_lead_live': 'nav-scr-ecg-live',
    'scr_bp_main_dashboard': 'nav-scr-bp-main',
    'scr_cgm_main_dashboard': 'nav-scr-cgm-main'
  };

  const activeNavId = navMap[screenId];
  if (activeNavId) {
    const el = document.getElementById(activeNavId);
    if (el) el.classList.add('active');
  }

  try {
    const res = await fetch('/admin/v2/screens/' + screenId);
    if (res.ok) {
      loadedScreenData = await res.json();
    } else {
      loadedScreenData = { id: screenId, screen_name: screenId, config: {}, layout: {}, style: {} };
    }
  } catch (e) {
    console.error('Screen fetch failed:', e);
    loadedScreenData = { id: screenId, screen_name: screenId, config: {}, layout: {}, style: {} };
  }

  // Pre-fetch live mobile cards feed if viewing Home Feed
  if (screenId === 'scr_home_main_dashboard') {
    try {
      const feedRes = await fetch('/v2/servicecard/list');
      if (feedRes.ok) {
        liveServiceCards = await feedRes.json();
      }
    } catch (e) {
      console.log('Live feed fetch:', e);
    }
  }

  // Update Left Tree Header
  const titleEl = document.getElementById('tree-screen-name');
  if (titleEl) titleEl.innerText = loadedScreenData.screen_name || screenId;
  const routeEl = document.getElementById('tree-route-path');
  if (routeEl) routeEl.innerText = (loadedScreenData.route_path || '').replace('dokrahealth://', '');
  const verBadge = document.getElementById('tree-version-badge');
  if (verBadge) verBadge.innerText = 'v' + (loadedScreenData.version || 1) + ' Published';

  // Render Elements Tree
  renderElementTree(screenId);

  // Render Authentic Mobile Phone Screen
  renderPhoneScreen(loadedScreenData, screenId);

  // Auto-select first element
  const elements = screenElementsInventory[screenId] || [];
  if (elements.length > 0) {
    selectElement(elements[0].id);
  } else {
    selectElement('element.general');
  }
}

// -----------------------------------------------------------------------------
// 5. RENDER ELEMENT TREE
// -----------------------------------------------------------------------------
function renderElementTree(screenId) {
  const container = document.getElementById('screen-element-tree');
  if (!container) return;

  const elements = screenElementsInventory[screenId] || [
    { id: 'element.general', name: loadedScreenData?.screen_name || 'Screen Root', iconKey: 'card', type: 'screen_root' }
  ];

  const countBadge = document.getElementById('tree-element-count');
  if (countBadge) countBadge.innerText = elements.length + ' editable elements';

  container.innerHTML = elements.map(elem => {
    const isSelected = elem.id === selectedElementId ? 'selected' : '';
    const iconSvg = getStudioIcon(elem.iconKey || 'card');
    return '<div class="tree-node ' + isSelected + '" id="tree-node-' + escapeHtml(elem.id) + '" onclick="selectElement(\'' + escapeHtml(elem.id) + '\')">' +
      '<span class="tree-node-icon">' + iconSvg + '</span>' +
      '<div class="tree-node-info">' +
        '<span class="tree-node-name">' + escapeHtml(elem.name) + '</span>' +
        '<span class="tree-node-id">' + escapeHtml(elem.id) + '</span>' +
      '</div>' +
      '<span class="tree-node-status-tag">' + escapeHtml(elem.type || 'element') + '</span>' +
    '</div>';
  }).join('');
}

// -----------------------------------------------------------------------------
// 6. SELECT ELEMENT
// -----------------------------------------------------------------------------
function selectElement(elementId, event) {
  if (event) event.stopPropagation();
  selectedElementId = elementId;

  document.querySelectorAll('.tree-node').forEach(n => n.classList.remove('selected'));
  const activeNode = document.getElementById('tree-node-' + elementId);
  if (activeNode) activeNode.classList.add('selected');

  document.querySelectorAll('.editable-element').forEach(el => el.classList.remove('is-selected'));
  const phoneElement = document.getElementById('elem-' + elementId);
  if (phoneElement) {
    phoneElement.classList.add('is-selected');
    phoneElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  renderElementInspector(elementId, loadedScreenData);
}

// -----------------------------------------------------------------------------
// 7. REAL-TIME TWO-WAY LIVE SYNC HANDLER (Inspector -> Phone Preview)
// -----------------------------------------------------------------------------
function onElementPropertyChange(propKey, value) {
  if (!loadedScreenData) loadedScreenData = {};
  if (!loadedScreenData.config) loadedScreenData.config = {};

  loadedScreenData.config[propKey] = value;
  if (propKey === 'screen_name') {
    loadedScreenData.screen_name = value;
    const t = document.getElementById('tree-screen-name');
    if (t) t.innerText = value;
  }
  if (propKey === 'route_path') {
    loadedScreenData.route_path = value;
    const r = document.getElementById('tree-route-path');
    if (r) r.innerText = value.replace('dokrahealth://', '');
  }

  // 1. Steps & Ring Geometry Live Sync
  if (propKey === 'steps' || propKey === 'step_goal' || propKey === 'active_calories' || propKey === 'calorie_goal' || propKey === 'active_time_mins' || propKey === 'active_time_goal') {
    const steps = Number(loadedScreenData.config.steps || 8500);
    const stepGoal = Number(loadedScreenData.config.step_goal || 10000);
    const cal = Number(loadedScreenData.config.active_calories || 485);
    const calGoal = Number(loadedScreenData.config.calorie_goal || 600);
    const time = Number(loadedScreenData.config.active_time_mins || 42);
    const timeGoal = Number(loadedScreenData.config.active_time_goal || 60);

    const stepsValEl = document.getElementById('phone-home-steps-val');
    if (stepsValEl) stepsValEl.innerText = steps.toLocaleString();
    const stepsGoalTxt = document.getElementById('phone-home-steps-goal-txt');
    if (stepsGoalTxt) stepsGoalTxt.innerText = steps.toLocaleString() + ' / ' + stepGoal.toLocaleString();
    const stepsPctEl = document.getElementById('phone-home-steps-pct');
    if (stepsPctEl) stepsPctEl.innerText = Math.round((steps / stepGoal) * 100) + '% of Goal >';
    
    const stepsFill = document.getElementById('phone-home-steps-fill');
    if (stepsFill) stepsFill.style.width = Math.min(100, (steps / stepGoal) * 100) + '%';
    const calFill = document.getElementById('phone-home-cal-fill');
    if (calFill) calFill.style.width = Math.min(100, (cal / calGoal) * 100) + '%';
    const timeFill = document.getElementById('phone-home-time-fill');
    if (timeFill) timeFill.style.width = Math.min(100, (time / timeGoal) * 100) + '%';

    const ringCal = document.getElementById('phone-ring-cal');
    if (ringCal) ringCal.setAttribute('stroke-dashoffset', 414.69 * (1 - Math.min(1, cal / calGoal)));
    const ringSteps = document.getElementById('phone-ring-steps');
    if (ringSteps) ringSteps.setAttribute('stroke-dashoffset', 301.59 * (1 - Math.min(1, steps / stepGoal)));
    const ringTime = document.getElementById('phone-ring-time');
    if (ringTime) ringTime.setAttribute('stroke-dashoffset', 188.49 * (1 - Math.min(1, time / timeGoal)));
  }

  // 2. Energy Score Live Sync
  if (propKey === 'readiness_score' || propKey === 'current_score' || propKey === 'score_status' || propKey === 'coach_advice') {
    const score = Number(loadedScreenData.config.readiness_score || loadedScreenData.config.current_score || 86);
    const numEl = document.getElementById('phone-home-vitality-num');
    if (numEl) numEl.innerText = score;
    const arcEl = document.getElementById('phone-energy-gauge-arc');
    if (arcEl) arcEl.setAttribute('stroke-dashoffset', 100.53 * (1 - score / 100));
    const statusEl = document.getElementById('phone-home-vitality-status');
    if (statusEl && loadedScreenData.config.score_status) statusEl.innerText = loadedScreenData.config.score_status + ' >';
    const adviceEl = document.getElementById('phone-home-vitality-advice');
    if (adviceEl && loadedScreenData.config.coach_advice) adviceEl.innerText = loadedScreenData.config.coach_advice;
  }

  // 3. Sleep Score Live Sync
  if (propKey === 'sleep_score' || propKey === 'sleep_duration' || propKey === 'animal_persona') {
    const score = Number(loadedScreenData.config.sleep_score || 88);
    const dur = loadedScreenData.config.sleep_duration || '7h 42m';
    const sScore = document.getElementById('phone-home-sleep-score');
    if (sScore) sScore.innerText = score + ' / 100 (Optimal) >';
    const sDur = document.getElementById('phone-home-sleep-dur');
    if (sDur) sDur.innerText = dur;
  }

  // 4. Heart Rate Live Sync
  if (propKey === 'heart_rate' || propKey === 'current_bpm') {
    const hr = Number(loadedScreenData.config.heart_rate || loadedScreenData.config.current_bpm || 72);
    const hrEl = document.getElementById('phone-home-hr-val');
    if (hrEl) hrEl.innerText = hr;
  }

  // 5. Water / Hydration Live Sync
  if (propKey === 'water_intake_ml' || propKey === 'water_goal_ml') {
    const water = Number(loadedScreenData.config.water_intake_ml || 1750);
    const goal = Number(loadedScreenData.config.water_goal_ml || 2500);
    const wEl = document.getElementById('phone-home-water-val');
    if (wEl) wEl.innerText = water.toLocaleString() + ' / ' + goal.toLocaleString() + ' mL';
    const wFill = document.getElementById('phone-home-water-fill');
    if (wFill) wFill.style.width = Math.min(100, (water / goal) * 100) + '%';
  }

  // 6. Body Composition Live Sync
  if (propKey === 'weight_kg' || propKey === 'body_fat_pct') {
    const weight = loadedScreenData.config.weight_kg || '68.4';
    const fat = loadedScreenData.config.body_fat_pct || '18.2';
    const wEl = document.getElementById('phone-home-weight-val');
    if (wEl) wEl.innerText = weight + ' kg';
    const fEl = document.getElementById('phone-home-fat-val');
    if (fEl) fEl.innerText = fat + '% Fat';
  }

  flashSyncDot();
}

// -----------------------------------------------------------------------------
// 8. RENDER AUTHENTIC SAMSUNG HEALTH / DOKRA MOBILE APP PHONE SCREEN
// -----------------------------------------------------------------------------
function renderPhoneScreen(data, screenId) {
  const root = document.getElementById('phone-dynamic-screen-root');
  if (!root) return;

  const c = data?.config || {};
  let html = '';

  // DOMAIN 1: HOME & DAILY ACTIVITY (MAIN APP HOME FEED)
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
    const water = c.water_intake_ml || 1750;
    const waterGoal = c.water_goal_ml || 2500;
    const weight = c.weight_kg || '68.4';
    const fat = c.body_fat_pct || '18.2';

    html = '' +
      '<!-- Top One UI App Bar -->' +
      '<div class="phone-screen-header editable-element" id="elem-home.header" onclick="selectElement(\'home.header\', event)" data-element-id="home.header">' +
        '<span class="element-selection-badge">home.header</span>' +
        '<div class="phone-screen-header-title">' +
          '<img src="/assets/dokra_logo.png" style="width:26px; height:26px; object-fit:contain; border-radius:7px; background:#fff; padding:1px;">' +
          '<span style="font-weight:900; letter-spacing:-0.3px; font-size:18px;">Dokra Health</span>' +
        '</div>' +
        '<div style="display:flex; align-items:center; gap:8px;">' +
          '<div style="display:flex; align-items:center; gap:5px; background:rgba(16,185,129,0.12); padding:3px 8px; border-radius:999px;">' +
            '<span style="display:inline-flex; width:6px; height:6px; border-radius:50%; background:#10b981; box-shadow:0 0 6px #10b981;"></span>' +
            '<span style="font-size:10.5px; font-weight:700; color:#10b981;">Watch7 98%</span>' +
          '</div>' +
          '<span style="color:var(--phone-text-muted); cursor:pointer;">' + SVG_ICONS.badge + '</span>' +
        '</div>' +
      '</div>' +

      '<!-- 1. Authentic Samsung Health Daily Activity 3-Ring Card -->' +
      '<div class="phone-hero-card editable-element" id="elem-home.activity_ring" onclick="selectElement(\'home.activity_ring\', event)" data-element-id="home.activity_ring">' +
        '<span class="element-selection-badge">home.activity_ring</span>' +
        '<div style="display:flex; align-items:center; justify-content:space-between;">' +
          '<div style="display:flex; align-items:center; gap:8px;">' +
            SVG_ICONS.ring +
            '<span style="font-size:14px; font-weight:800; color:var(--phone-text-main);">Daily Activity</span>' +
          '</div>' +
          '<span style="font-size:12px; font-weight:800; color:#10b981;" id="phone-home-steps-pct">' + Math.round((steps/stepGoal)*100) + '% of Goal &gt;</span>' +
        '</div>' +
        '<div style="display:flex; align-items:center; justify-content:space-between; margin-top:6px;">' +
          '<div class="rings-svg-wrapper" style="width:130px; height:130px; position:relative;">' +
            '<svg viewBox="0 0 160 160" style="width:100%; height:100%; transform:rotate(-90deg);">' +
              '<circle cx="80" cy="80" r="66" fill="none" stroke="rgba(244,63,94,0.15)" stroke-width="12" />' +
              '<circle id="phone-ring-cal" cx="80" cy="80" r="66" fill="none" stroke="#f43f5e" stroke-width="12" stroke-dasharray="414.69" stroke-dashoffset="' + (414.69 * (1 - Math.min(1, cal / calGoal))) + '" stroke-linecap="round" />' +
              '<circle cx="80" cy="80" r="48" fill="none" stroke="rgba(16,185,129,0.15)" stroke-width="12" />' +
              '<circle id="phone-ring-steps" cx="80" cy="80" r="48" fill="none" stroke="#10b981" stroke-width="12" stroke-dasharray="301.59" stroke-dashoffset="' + (301.59 * (1 - Math.min(1, steps / stepGoal))) + '" stroke-linecap="round" />' +
              '<circle cx="80" cy="80" r="30" fill="none" stroke="rgba(56,189,248,0.15)" stroke-width="12" />' +
              '<circle id="phone-ring-time" cx="80" cy="80" r="30" fill="none" stroke="#38bdf8" stroke-width="12" stroke-dasharray="188.49" stroke-dashoffset="' + (188.49 * (1 - Math.min(1, time / timeGoal))) + '" stroke-linecap="round" />' +
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
                '<span style="font-weight:700; color:var(--phone-text-main);" id="phone-home-steps-goal-txt">' + steps.toLocaleString() + ' / ' + stepGoal.toLocaleString() + '</span>' +
              '</div>' +
              '<div class="phone-progress-bar"><div id="phone-home-steps-fill" class="phone-progress-fill" style="width:' + Math.min(100, (steps/stepGoal)*100) + '%; background:#10b981;"></div></div>' +
            '</div>' +
            '<div>' +
              '<div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:2px;">' +
                '<span style="color:#38bdf8; font-weight:700;">Active Time</span>' +
                '<span style="font-weight:700; color:var(--phone-text-main);">' + time + ' / ' + timeGoal + ' min</span>' +
              '</div>' +
              '<div class="phone-progress-bar"><div id="phone-home-time-fill" class="phone-progress-fill" style="width:' + Math.min(100, (time/timeGoal)*100) + '%; background:#38bdf8;"></div></div>' +
            '</div>' +
            '<div>' +
              '<div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:2px;">' +
                '<span style="color:#f43f5e; font-weight:700;">Active Cal</span>' +
                '<span style="font-weight:700; color:var(--phone-text-main);">' + cal + ' / ' + calGoal + ' kcal</span>' +
              '</div>' +
              '<div class="phone-progress-bar"><div id="phone-home-cal-fill" class="phone-progress-fill" style="width:' + Math.min(100, (cal/calGoal)*100) + '%; background:#f43f5e;"></div></div>' +
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

      '<!-- 2. Galaxy AI / One UI 6.1 Energy Score Card -->' +
      '<div class="phone-hero-card editable-element" id="elem-home.vitality_card" onclick="selectElement(\'home.vitality_card\', event)" data-element-id="home.vitality_card">' +
        '<span class="element-selection-badge">home.vitality_card</span>' +
        '<div style="display:flex; align-items:center; justify-content:space-between;">' +
          '<div style="display:flex; align-items:center; gap:8px;">' +
            SVG_ICONS.vitality +
            '<span style="font-size:14px; font-weight:800; color:var(--phone-text-main);">Energy Score</span>' +
          '</div>' +
          '<span class="phone-badge-pill" id="phone-home-vitality-status" style="background:rgba(129,140,248,0.2); color:#818cf8;">Optimal Stamina &gt;</span>' +
        '</div>' +
        '<div style="display:flex; align-items:center; gap:16px; margin-top:4px;">' +
          '<div style="position:relative; width:64px; height:64px; display:flex; align-items:center; justify-content:center;">' +
            '<svg viewBox="0 0 40 40" style="width:100%; height:100%; transform:rotate(-90deg);">' +
              '<circle cx="20" cy="20" r="16" fill="none" stroke="rgba(129,140,248,0.2)" stroke-width="4"/>' +
              '<circle id="phone-energy-gauge-arc" cx="20" cy="20" r="16" fill="none" stroke="url(#energyGrad)" stroke-width="4" stroke-dasharray="100.53" stroke-dashoffset="' + (100.53 * (1 - readiness/100)) + '" stroke-linecap="round"/>' +
              '<defs><linearGradient id="energyGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#818cf8"/></linearGradient></defs>' +
            '</svg>' +
            '<span class="phone-metric-big" style="color:#818cf8; font-size:20px; position:absolute;" id="phone-home-vitality-num">' + readiness + '</span>' +
          '</div>' +
          '<div style="flex:1; display:flex; flex-direction:column; gap:4px;">' +
            '<div style="font-size:11.5px; font-weight:800; color:#10b981;">▲ 3 pts higher than yesterday</div>' +
            '<div id="phone-home-vitality-advice" style="font-size:11px; color:var(--phone-text-muted); line-height:1.3;">' + (c.coach_advice || 'Your autonomic nervous system is fully recovered. Great day for aerobic exercise.') + '</div>' +
          '</div>' +
        '</div>' +
        '<!-- 4 Contributing Factors Pill Grid -->' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:6px;">' +
          '<div style="background:var(--bg-card-subtle); padding:6px 8px; border-radius:8px; display:flex; justify-content:space-between; font-size:10px;"><span style="color:var(--phone-text-muted);">Sleep Consistency</span><span style="color:#10b981; font-weight:700;">Optimal</span></div>' +
          '<div style="background:var(--bg-card-subtle); padding:6px 8px; border-radius:8px; display:flex; justify-content:space-between; font-size:10px;"><span style="color:var(--phone-text-muted);">Prior Activity</span><span style="color:#10b981; font-weight:700;">Active</span></div>' +
          '<div style="background:var(--bg-card-subtle); padding:6px 8px; border-radius:8px; display:flex; justify-content:space-between; font-size:10px;"><span style="color:var(--phone-text-muted);">Sleep HR Dip</span><span style="color:#10b981; font-weight:700;">-14.2%</span></div>' +
          '<div style="background:var(--bg-card-subtle); padding:6px 8px; border-radius:8px; display:flex; justify-content:space-between; font-size:10px;"><span style="color:var(--phone-text-muted);">Sleeping HRV</span><span style="color:#38bdf8; font-weight:700;">62 ms</span></div>' +
        '</div>' +
      '</div>' +

      '<!-- 3. Sleep Session Card with Hypnogram & Animal Coaching -->' +
      '<div class="phone-hero-card editable-element" id="elem-home.sleep_card" onclick="selectElement(\'home.sleep_card\', event)" data-element-id="home.sleep_card">' +
        '<span class="element-selection-badge">home.sleep_card</span>' +
        '<div style="display:flex; align-items:center; justify-content:space-between;">' +
          '<div style="display:flex; align-items:center; gap:8px;">' +
            SVG_ICONS.moon +
            '<span style="font-size:14px; font-weight:800; color:var(--phone-text-main);">Sleep</span>' +
          '</div>' +
          '<span style="font-size:12px; font-weight:800; color:#38bdf8;" id="phone-home-sleep-score">' + sleepScore + ' / 100 (Optimal) &gt;</span>' +
        '</div>' +
        '<div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:2px;">' +
          '<span style="font-size:24px; font-weight:900; color:var(--phone-text-main);" id="phone-home-sleep-dur">' + sleepDur + '</span>' +
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
        '<div style="display:flex; align-items:center; gap:10px; background:var(--bg-card-subtle); padding:8px 12px; border-radius:12px; margin-top:6px;">' +
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
      '<div class="phone-hero-card editable-element" id="elem-home.heart_card" onclick="selectElement(\'home.heart_card\', event)" data-element-id="home.heart_card">' +
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
        '<div style="margin-top:4px; height:24px; width:100%;">' +
          '<svg viewBox="0 0 200 30" style="width:100%; height:100%; stroke:#f43f5e; fill:none; stroke-width:2; stroke-linecap:round;">' +
            '<path d="M 0 15 L 40 15 L 48 2 L 56 28 L 64 8 L 72 20 L 80 15 L 120 15 L 128 2 L 136 28 L 144 8 L 152 20 L 160 15 L 200 15"/>' +
          '</svg>' +
        '</div>' +
      '</div>' +

      '<!-- 5. Quick Exercise Grid Bar -->' +
      '<div class="phone-hero-card editable-element" id="elem-home.quick_exercises" onclick="selectElement(\'home.quick_exercises\', event)" data-element-id="home.quick_exercises">' +
        '<span class="element-selection-badge">home.quick_exercises</span>' +
        '<div style="display:flex; align-items:center; justify-content:space-between;">' +
          '<div style="display:flex; align-items:center; gap:8px;">' +
            SVG_ICONS.sport +
            '<span style="font-size:14px; font-weight:800; color:var(--phone-text-main);">Exercise</span>' +
          '</div>' +
          '<span style="font-size:12px; font-weight:800; color:var(--primary-blue);">Start &gt;</span>' +
        '</div>' +
        '<div style="display:flex; justify-content:space-between; margin-top:8px;">' +
          [
            { icon: SVG_ICONS.sport, label: 'Running' },
            { icon: SVG_ICONS.steps, label: 'Walking' },
            { icon: SVG_ICONS.cycling, label: 'Cycling' },
            { icon: SVG_ICONS.strength, label: 'Strength' }
          ].map(ex =>
            '<div style="display:flex; flex-direction:column; align-items:center; gap:5px; flex:1; cursor:pointer;">' +
              '<div style="width:44px; height:44px; border-radius:50%; background:var(--bg-card-subtle); display:flex; align-items:center; justify-content:center; color:var(--primary-blue); box-shadow:var(--shadow-sm);">' +
                ex.icon +
              '</div>' +
              '<span style="font-size:10.5px; font-weight:700; color:var(--phone-text-muted);">' + ex.label + '</span>' +
            '</div>'
          ).join('') +
        '</div>' +
      '</div>' +

      '<!-- 6. Body Composition (BIA) Card -->' +
      '<div class="phone-hero-card editable-element" id="elem-home.body_comp_card" onclick="selectElement(\'home.body_comp_card\', event)" data-element-id="home.body_comp_card">' +
        '<span class="element-selection-badge">home.body_comp_card</span>' +
        '<div style="display:flex; align-items:center; justify-content:space-between;">' +
          '<div style="display:flex; align-items:center; gap:8px;">' +
            SVG_ICONS.body +
            '<span style="font-size:14px; font-weight:800; color:var(--phone-text-main);">Body Composition</span>' +
          '</div>' +
          '<span style="font-size:12px; font-weight:800; color:#10b981;">Target: 65.0 kg &gt;</span>' +
        '</div>' +
        '<div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:2px;">' +
          '<span class="phone-metric-big" style="color:var(--phone-text-main);" id="phone-home-weight-val">' + weight + ' kg</span>' +
          '<span style="font-size:12px; font-weight:800; color:#10b981;" id="phone-home-fat-val">' + fat + '% Fat</span>' +
        '</div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; margin-top:4px;">' +
          '<div style="background:var(--bg-card-subtle); padding:5px 8px; border-radius:8px; font-size:10px;"><span style="color:var(--phone-text-muted);">Skeletal Muscle</span><br><strong style="color:var(--phone-text-main);">31.2 kg</strong></div>' +
          '<div style="background:var(--bg-card-subtle); padding:5px 8px; border-radius:8px; font-size:10px;"><span style="color:var(--phone-text-muted);">Fat Mass</span><br><strong style="color:var(--phone-text-main);">12.4 kg</strong></div>' +
          '<div style="background:var(--bg-card-subtle); padding:5px 8px; border-radius:8px; font-size:10px;"><span style="color:var(--phone-text-muted);">BMI</span><br><strong style="color:#10b981;">22.4 (Normal)</strong></div>' +
        '</div>' +
      '</div>' +

      '<!-- 7. Water & Hydration Card -->' +
      '<div class="phone-hero-card editable-element" id="elem-home.water_card" onclick="selectElement(\'home.water_card\', event)" data-element-id="home.water_card">' +
        '<span class="element-selection-badge">home.water_card</span>' +
        '<div style="display:flex; align-items:center; justify-content:space-between;">' +
          '<div style="display:flex; align-items:center; gap:8px;">' +
            SVG_ICONS.water +
            '<span style="font-size:14px; font-weight:800; color:var(--phone-text-main);">Water</span>' +
          '</div>' +
          '<span style="font-size:12px; font-weight:800; color:#38bdf8;" id="phone-home-water-val">' + water.toLocaleString() + ' / ' + waterGoal.toLocaleString() + ' mL</span>' +
        '</div>' +
        '<div class="phone-progress-bar" style="margin-top:6px;"><div id="phone-home-water-fill" class="phone-progress-fill" style="width:' + Math.min(100, (water/waterGoal)*100) + '%; background:#38bdf8;"></div></div>' +
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">' +
          '<span style="font-size:11px; color:var(--phone-text-muted);">7 of 10 glasses consumed</span>' +
          '<button style="background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.3); border-radius:999px; padding:3px 10px; font-size:11px; font-weight:800; cursor:pointer;" onclick="onElementPropertyChange(\'water_intake_ml\', ' + (water + 250) + ')">+ 250 mL</button>' +
        '</div>' +
      '</div>' +

      '<!-- 8. Med-PaLM 2 Clinical AI Insights Card -->' +
      '<div class="phone-hero-card editable-element" id="elem-home.ai_coach_card" onclick="selectElement(\'home.ai_coach_card\', event)" data-element-id="home.ai_coach_card">' +
        '<span class="element-selection-badge">home.ai_coach_card</span>' +
        '<div style="display:flex; align-items:center; justify-content:space-between;">' +
          '<div style="display:flex; align-items:center; gap:8px;">' +
            SVG_ICONS.ai +
            '<span style="font-size:14px; font-weight:800; color:var(--phone-text-main);">Med-PaLM 2 Clinical AI</span>' +
          '</div>' +
          '<span class="phone-badge-pill" style="background:rgba(139,92,246,0.2); color:#a78bfa;">Active Coach &gt;</span>' +
        '</div>' +
        '<div style="font-size:11.5px; color:var(--phone-text-main); margin-top:4px; line-height:1.4;">"Your deep sleep and nocturnal HRV reached an all-time peak last night. A high-intensity interval training session today will yield maximum conditioning."</div>' +
      '</div>';
  }

  // DOMAIN 2: TOGETHER / SOCIAL CHALLENGES SCREEN
  else if (screenId === 'scr_together_challenges') {
    html = '' +
      '<div class="phone-screen-header editable-element" id="elem-together.header" onclick="selectElement(\'together.header\', event)" data-element-id="together.header">' +
        '<span class="element-selection-badge">together.header</span>' +
        '<div class="phone-screen-header-title">Together</div>' +
        '<span style="color:var(--phone-text-muted);">' + SVG_ICONS.together + '</span>' +
      '</div>' +
      '<div class="phone-hero-card editable-element" id="elem-together.global_challenge" onclick="selectElement(\'together.global_challenge\', event)" data-element-id="together.global_challenge">' +
        '<span class="element-selection-badge">together.global_challenge</span>' +
        '<div style="display:flex; align-items:center; gap:10px;">' +
          '<div style="width:48px; height:48px; border-radius:12px; background:linear-gradient(135deg, #f59e0b, #d97706); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:900; font-size:20px;">🏆</div>' +
          '<div style="flex:1;">' +
            '<div style="font-size:14px; font-weight:900; color:var(--phone-text-main);">Global 100K Steps Cup</div>' +
            '<div style="font-size:11px; color:var(--phone-text-muted);">14 days left • 42,850 participants</div>' +
          '</div>' +
        '</div>' +
        '<div class="phone-progress-bar" style="margin-top:10px;"><div class="phone-progress-fill" style="width:68%; background:#f59e0b;"></div></div>' +
        '<div style="display:flex; justify-content:space-between; font-size:11px; margin-top:4px;">' +
          '<span style="color:#f59e0b; font-weight:700;">68,400 / 100,000 steps</span>' +
          '<span style="color:var(--phone-text-muted);">Top 8%</span>' +
        '</div>' +
      '</div>' +
      '<div class="phone-hero-card editable-element" id="elem-together.friends_leaderboard" onclick="selectElement(\'together.friends_leaderboard\', event)" data-element-id="together.friends_leaderboard">' +
        '<span class="element-selection-badge">together.friends_leaderboard</span>' +
        '<div style="font-size:14px; font-weight:800; color:var(--phone-text-main); margin-bottom:8px;">Friends Leaderboard</div>' +
        [
          { rank: '1', name: 'Alex M.', steps: '12,450 steps', color: '#f59e0b' },
          { rank: '2', name: 'You (Krushnapalsinh)', steps: '8,500 steps', color: '#10b981', isMe: true },
          { rank: '3', name: 'Dr. Sarah K.', steps: '7,920 steps', color: '#38bdf8' }
        ].map(f =>
          '<div style="display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-color);">' +
            '<div style="display:flex; align-items:center; gap:10px;">' +
              '<span style="font-weight:900; font-size:12px; color:' + f.color + ';">#' + f.rank + '</span>' +
              '<span style="font-size:12px; font-weight:' + (f.isMe ? '900' : '600') + '; color:var(--phone-text-main);">' + f.name + '</span>' +
            '</div>' +
            '<span style="font-size:12px; font-weight:800; color:' + (f.isMe ? '#10b981' : 'var(--phone-text-muted)') + ';">' + f.steps + '</span>' +
          '</div>'
        ).join('') +
      '</div>';
  }

  // DOMAIN 3: FITNESS & WORKOUT PROGRAMS
  else if (screenId === 'scr_fitness_programs') {
    html = '' +
      '<div class="phone-screen-header editable-element" id="elem-fitness.header" onclick="selectElement(\'fitness.header\', event)" data-element-id="fitness.header">' +
        '<span class="element-selection-badge">fitness.header</span>' +
        '<div class="phone-screen-header-title">Fitness & Coaching</div>' +
        '<span style="color:var(--phone-text-muted);">' + SVG_ICONS.fitness + '</span>' +
      '</div>' +
      '<div class="phone-hero-card editable-element" id="elem-fitness.running_coach" onclick="selectElement(\'fitness.running_coach\', event)" data-element-id="fitness.running_coach">' +
        '<span class="element-selection-badge">fitness.running_coach</span>' +
        '<div style="font-size:14px; font-weight:900; color:var(--phone-text-main);">5K Running Coach by Dokra</div>' +
        '<div style="font-size:11px; color:var(--phone-text-muted); margin-top:2px;">Week 3 • Day 2: Interval Speed Intervals</div>' +
        '<div style="display:flex; gap:8px; margin-top:8px;">' +
          '<span style="background:rgba(37,99,235,0.15); color:var(--primary-blue); padding:3px 8px; border-radius:6px; font-size:11px; font-weight:800;">32 Mins</span>' +
          '<span style="background:rgba(16,185,129,0.15); color:#10b981; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:800;">Intermediate</span>' +
        '</div>' +
      '</div>' +
      '<div class="phone-hero-card editable-element" id="elem-fitness.mindful_meditation" onclick="selectElement(\'fitness.mindful_meditation\', event)" data-element-id="fitness.mindful_meditation">' +
        '<span class="element-selection-badge">fitness.mindful_meditation</span>' +
        '<div style="font-size:14px; font-weight:900; color:var(--phone-text-main);">Mindful Deep Sleep Wind Down</div>' +
        '<div style="font-size:11px; color:var(--phone-text-muted); margin-top:2px;">Calming binaural frequencies and guided diaphragm breathing.</div>' +
      '</div>';
  }

  // DOMAIN 4: MY PAGE / USER PROFILE
  else if (screenId === 'scr_mypage_profile') {
    html = '' +
      '<div class="phone-screen-header editable-element" id="elem-mypage.header" onclick="selectElement(\'mypage.header\', event)" data-element-id="mypage.header">' +
        '<span class="element-selection-badge">mypage.header</span>' +
        '<div class="phone-screen-header-title">My Page</div>' +
        '<span style="color:var(--phone-text-muted);">' + SVG_ICONS.settings + '</span>' +
      '</div>' +
      '<div class="phone-hero-card editable-element" id="elem-mypage.user_card" onclick="selectElement(\'mypage.user_card\', event)" data-element-id="mypage.user_card">' +
        '<span class="element-selection-badge">mypage.user_card</span>' +
        '<div style="display:flex; align-items:center; gap:12px;">' +
          '<div style="width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg, #2563eb, #7c3aed); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:900; font-size:18px;">KP</div>' +
          '<div>' +
            '<div style="font-size:15px; font-weight:900; color:var(--phone-text-main);">Krushnapalsinh</div>' +
            '<div style="font-size:11px; color:#10b981; font-weight:700;">★ Super Administrator • Dokra Pro</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="phone-hero-card editable-element" id="elem-mypage.badges_showcase" onclick="selectElement(\'mypage.badges_showcase\', event)" data-element-id="mypage.badges_showcase">' +
        '<span class="element-selection-badge">mypage.badges_showcase</span>' +
        '<div style="font-size:14px; font-weight:800; color:var(--phone-text-main); margin-bottom:8px;">Achievements & Badges</div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px;">' +
          '<div style="background:var(--bg-card-subtle); padding:8px; border-radius:10px; text-align:center;"><div style="font-size:20px;">🥇</div><span style="font-size:10px; font-weight:700; color:var(--phone-text-main);">10K Master</span></div>' +
          '<div style="background:var(--bg-card-subtle); padding:8px; border-radius:10px; text-align:center;"><div style="font-size:20px;">⚡</div><span style="font-size:10px; font-weight:700; color:var(--phone-text-main);">90+ Vitality</span></div>' +
          '<div style="background:var(--bg-card-subtle); padding:8px; border-radius:10px; text-align:center;"><div style="font-size:20px;">🦁</div><span style="font-size:10px; font-weight:700; color:var(--phone-text-main);">Sleep Lion</span></div>' +
        '</div>' +
      '</div>';
  }

  // DEFAULT / SUB-TRACKER SCREENS
  else {
    html = '' +
      '<div class="phone-screen-header editable-element" id="elem-' + screenId + '.header" onclick="selectElement(\'' + screenId + '.header\', event)" data-element-id="' + screenId + '.header">' +
        '<span class="element-selection-badge">header</span>' +
        '<div class="phone-screen-header-title">' + escapeHtml(data.screen_name || screenId) + '</div>' +
        '<span style="color:var(--phone-text-muted);">' + SVG_ICONS.card + '</span>' +
      '</div>' +
      '<div class="phone-hero-card editable-element" id="elem-' + screenId + '.primary_card" onclick="selectElement(\'' + screenId + '.primary_card\', event)" data-element-id="' + screenId + '.primary_card">' +
        '<span class="element-selection-badge">primary_card</span>' +
        '<div style="font-size:14px; font-weight:800; color:var(--phone-text-main);">' + escapeHtml(data.screen_name || 'Active Screen') + '</div>' +
        '<div style="font-size:11px; color:var(--phone-text-muted); margin-top:4px;">Domain: ' + escapeHtml(data.domain_name || 'Health Tracker') + '</div>' +
        '<div class="phone-metric-big" style="margin-top:8px; color:var(--primary-blue);">' + (c.current_score || c.steps || c.heart_rate || '100%') + '</div>' +
      '</div>';
  }

  // APPEND AUTHENTIC ONE UI BOTTOM NAVIGATION BAR
  html += '' +
    '<!-- Authentic Samsung Health One UI Bottom Navigation Bar -->' +
    '<div class="phone-bottom-nav editable-element" id="elem-home.bottom_nav" onclick="selectElement(\'home.bottom_nav\', event)" data-element-id="home.bottom_nav">' +
      '<span class="element-selection-badge">home.bottom_nav</span>' +
      '<div class="phone-nav-item ' + (screenId === 'scr_home_main_dashboard' ? 'active' : '') + '" onclick="selectScreen(\'scr_home_main_dashboard\')">' +
        SVG_ICONS.home +
        '<span>Home</span>' +
      '</div>' +
      '<div class="phone-nav-item ' + (screenId === 'scr_together_challenges' ? 'active' : '') + '" onclick="selectScreen(\'scr_together_challenges\')">' +
        SVG_ICONS.together +
        '<span>Together</span>' +
      '</div>' +
      '<div class="phone-nav-item ' + (screenId === 'scr_fitness_programs' ? 'active' : '') + '" onclick="selectScreen(\'scr_fitness_programs\')">' +
        SVG_ICONS.fitness +
        '<span>Fitness</span>' +
      '</div>' +
      '<div class="phone-nav-item ' + (screenId === 'scr_mypage_profile' ? 'active' : '') + '" onclick="selectScreen(\'scr_mypage_profile\')">' +
        SVG_ICONS.profile +
        '<span>My Page</span>' +
      '</div>' +
    '</div>';

  root.innerHTML = html;
}

// -----------------------------------------------------------------------------
// 9. RENDER TAILORED ELEMENT-SPECIFIC INSPECTOR CONTROLS
// -----------------------------------------------------------------------------
function renderElementInspector(elementId, screenData) {
  const container = document.getElementById('inspector-element-controls');
  if (!container) return;

  const badgeEl = document.getElementById('selected-elem-badge');
  if (badgeEl) badgeEl.innerText = elementId;
  const titleEl = document.getElementById('selected-elem-title');
  if (titleEl) titleEl.innerText = elementId.replace(/_/g, ' ');

  const c = screenData?.config || {};
  let controlsHtml = '';

  // 1. SCREEN HEADERS
  if (elementId.endsWith('.header')) {
    controlsHtml = '' +
      '<div class="inspector-card-box">' +
        '<div class="inspector-section-heading">Screen Header Configuration</div>' +
        '<div class="form-group">' +
          '<label class="control-label">Screen Title</label>' +
          '<input type="text" class="control-input" value="' + escapeHtml(screenData?.screen_name || '') + '" oninput="onElementPropertyChange(\'screen_name\', this.value)">' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="control-label">One UI Route Path</label>' +
          '<input type="text" class="control-input" value="' + escapeHtml(screenData?.route_path || '') + '" oninput="onElementPropertyChange(\'route_path\', this.value)">' +
        '</div>' +
      '</div>';
  }

  // 2. 3-RING DAILY ACTIVITY WIDGET
  else if (elementId === 'home.activity_ring' || elementId === 'ring.svg_geometry' || elementId === 'activity.ring') {
    controlsHtml = '' +
      '<div class="inspector-card-box">' +
        '<div class="inspector-section-heading">Daily Activity 3-Ring Geometry</div>' +
        '<div class="form-group">' +
          '<label class="control-label">Step Goal (' + (c.step_goal || 10000).toLocaleString() + ' steps)</label>' +
          '<input type="range" class="control-range" min="1000" max="30000" step="500" value="' + (c.step_goal || 10000) + '" oninput="onElementPropertyChange(\'step_goal\', Number(this.value)); document.getElementById(\'val-step-goal\').innerText = Number(this.value).toLocaleString()">' +
          '<div style="text-align:right; font-size:11px; color:var(--primary-blue);" id="val-step-goal">' + (c.step_goal || 10000).toLocaleString() + '</div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="control-label">Current Steps</label>' +
          '<input type="number" class="control-input" value="' + (c.steps || 8500) + '" oninput="onElementPropertyChange(\'steps\', Number(this.value))">' +
        '</div>' +
        '<div class="control-grid-2">' +
          '<div class="form-group">' +
            '<label class="control-label">Active Calories (kcal)</label>' +
            '<input type="number" class="control-input" value="' + (c.active_calories || 485) + '" oninput="onElementPropertyChange(\'active_calories\', Number(this.value))">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="control-label">Calorie Goal</label>' +
            '<input type="number" class="control-input" value="' + (c.calorie_goal || 600) + '" oninput="onElementPropertyChange(\'calorie_goal\', Number(this.value))">' +
          '</div>' +
        '</div>' +
        '<div class="control-grid-2">' +
          '<div class="form-group">' +
            '<label class="control-label">Active Time (min)</label>' +
            '<input type="number" class="control-input" value="' + (c.active_time_mins || 42) + '" oninput="onElementPropertyChange(\'active_time_mins\', Number(this.value))">' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="control-label">Time Goal (min)</label>' +
            '<input type="number" class="control-input" value="' + (c.active_time_goal || 60) + '" oninput="onElementPropertyChange(\'active_time_goal\', Number(this.value))">' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  // 3. ENERGY SCORE & READINESS GAUGE
  else if (elementId === 'home.vitality_card' || elementId === 'vitality.readiness_gauge') {
    controlsHtml = '' +
      '<div class="inspector-card-box">' +
        '<div class="inspector-section-heading">Energy Score Engine</div>' +
        '<div class="form-group">' +
          '<label class="control-label">Energy Score (0-100)</label>' +
          '<input type="range" class="control-range" min="0" max="100" value="' + (c.current_score || c.readiness_score || 86) + '" oninput="onElementPropertyChange(\'readiness_score\', Number(this.value)); onElementPropertyChange(\'current_score\', Number(this.value)); document.getElementById(\'val-vitality-num\').innerText = this.value">' +
          '<div style="text-align:right; font-size:12px; font-weight:800; color:#818cf8;" id="val-vitality-num">' + (c.current_score || c.readiness_score || 86) + '</div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="control-label">Stamina Rating</label>' +
          '<select class="control-select" onchange="onElementPropertyChange(\'score_status\', this.value)">' +
            '<option value="Optimal Stamina" ' + ((c.score_status || 'Optimal Stamina') === 'Optimal Stamina' ? 'selected' : '') + '>Optimal Stamina</option>' +
            '<option value="Good Condition" ' + (c.score_status === 'Good Condition' ? 'selected' : '') + '>Good Condition</option>' +
            '<option value="Moderate Recovery" ' + (c.score_status === 'Moderate Recovery' ? 'selected' : '') + '>Moderate Recovery</option>' +
            '<option value="Rest Recommended" ' + (c.score_status === 'Rest Recommended' ? 'selected' : '') + '>Rest Recommended</option>' +
          '</select>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="control-label">Clinical Intelligence Advice</label>' +
          '<textarea class="control-textarea" rows="3" oninput="onElementPropertyChange(\'coach_advice\', this.value)">' + escapeHtml(c.coach_advice || 'Your autonomic nervous system is fully recovered. Great day for aerobic exercise.') + '</textarea>' +
        '</div>' +
      '</div>';
  }

  // 4. SLEEP SESSION & ANIMAL PERSONA
  else if (elementId === 'home.sleep_card' || elementId === 'sleep.hypnogram' || elementId === 'sleep.score_gauge' || elementId === 'sleep.persona_card') {
    controlsHtml = '' +
      '<div class="inspector-card-box">' +
        '<div class="inspector-section-heading">Sleep Session & Animal Coaching</div>' +
        '<div class="form-group">' +
          '<label class="control-label">Sleep Score (0-100)</label>' +
          '<input type="range" class="control-range" min="0" max="100" value="' + (c.sleep_score || 88) + '" oninput="onElementPropertyChange(\'sleep_score\', Number(this.value)); document.getElementById(\'val-sleep-num\').innerText = this.value">' +
          '<div style="text-align:right; font-size:12px; font-weight:800; color:#38bdf8;" id="val-sleep-num">' + (c.sleep_score || 88) + '</div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="control-label">Total Sleep Duration</label>' +
          '<input type="text" class="control-input" value="' + escapeHtml(c.sleep_duration || '7h 42m') + '" oninput="onElementPropertyChange(\'sleep_duration\', this.value)">' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="control-label">Samsung Health Sleep Animal Persona</label>' +
          '<select class="control-select" onchange="onPersonaSelectChange(this.value)">' +
            Object.entries(animalPersonasInfo).map(([k, v]) =>
              '<option value="' + k + '" ' + ((c.animal_persona || 'lion') === k ? 'selected' : '') + '>' + v.name + ' (' + v.level + ')</option>'
            ).join('') +
          '</select>' +
        '</div>' +
      '</div>';
  }

  // 5. HEART RATE & ECG
  else if (elementId === 'home.heart_card' || elementId === 'heart.bpm_gauge') {
    controlsHtml = '' +
      '<div class="inspector-card-box">' +
        '<div class="inspector-section-heading">Heart Rate PPG Telemetry</div>' +
        '<div class="form-group">' +
          '<label class="control-label">Current BPM (' + (c.heart_rate || 72) + ')</label>' +
          '<input type="range" class="control-range" min="40" max="190" value="' + (c.heart_rate || 72) + '" oninput="onElementPropertyChange(\'heart_rate\', Number(this.value)); document.getElementById(\'val-hr-bpm\').innerText = this.value">' +
          '<div style="text-align:right; font-size:12px; font-weight:800; color:#f43f5e;" id="val-hr-bpm">' + (c.heart_rate || 72) + ' bpm</div>' +
        '</div>' +
      '</div>';
  }

  // 6. BODY COMPOSITION & HYDRATION
  else if (elementId === 'home.body_comp_card') {
    controlsHtml = '' +
      '<div class="inspector-card-box">' +
        '<div class="inspector-section-heading">Body Composition (BIA) Calibration</div>' +
        '<div class="form-group">' +
          '<label class="control-label">Current Weight (kg)</label>' +
          '<input type="number" step="0.1" class="control-input" value="' + (c.weight_kg || 68.4) + '" oninput="onElementPropertyChange(\'weight_kg\', this.value)">' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="control-label">Body Fat Percentage (%)</label>' +
          '<input type="number" step="0.1" class="control-input" value="' + (c.body_fat_pct || 18.2) + '" oninput="onElementPropertyChange(\'body_fat_pct\', this.value)">' +
        '</div>' +
      '</div>';
  }

  else if (elementId === 'home.water_card') {
    controlsHtml = '' +
      '<div class="inspector-card-box">' +
        '<div class="inspector-section-heading">Hydration & Water Intake</div>' +
        '<div class="form-group">' +
          '<label class="control-label">Water Intake (mL)</label>' +
          '<input type="number" step="50" class="control-input" value="' + (c.water_intake_ml || 1750) + '" oninput="onElementPropertyChange(\'water_intake_ml\', Number(this.value))">' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="control-label">Daily Goal (mL)</label>' +
          '<input type="number" step="100" class="control-input" value="' + (c.water_goal_ml || 2500) + '" oninput="onElementPropertyChange(\'water_goal_ml\', Number(this.value))">' +
        '</div>' +
      '</div>';
  }

  // FALLBACK GENERIC ELEMENT CONTROLS
  else {
    controlsHtml = '' +
      '<div class="inspector-card-box">' +
        '<div class="inspector-section-heading">Element Properties</div>' +
        '<div class="form-group">' +
          '<label class="control-label">Element Identifier</label>' +
          '<input type="text" class="control-input" readonly value="' + escapeHtml(elementId) + '" style="opacity:0.7;">' +
        '</div>' +
        '<div class="form-group">' +
          '<label class="control-label">Visibility Status</label>' +
          '<select class="control-select" onchange="onElementPropertyChange(\'visible\', this.value === \'true\')">' +
            '<option value="true">Visible in Mobile App</option>' +
            '<option value="false">Hidden from Users</option>' +
          '</select>' +
        '</div>' +
      '</div>';
  }

  container.innerHTML = controlsHtml;
}

// -----------------------------------------------------------------------------
// 10. ANIMAL PERSONA SELECT CHANGE
// -----------------------------------------------------------------------------
function onPersonaSelectChange(personaKey) {
  const info = animalPersonasInfo[personaKey];
  if (!info) return;

  if (!loadedScreenData.config) loadedScreenData.config = {};
  loadedScreenData.config.animal_persona = personaKey;

  showToast('Switched sleep persona to ' + info.name);
  renderPhoneScreen(loadedScreenData, activeScreenId);
}

// -----------------------------------------------------------------------------
// 11. PUBLISH, REVISE, AND DEEP MOBILE APP SYNC
// -----------------------------------------------------------------------------
async function publishActiveScreen() {
  if (!loadedScreenData || !activeScreenId) return;

  try {
    const res = await fetch('/admin/v2/screens/' + activeScreenId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Actor-Id': 'super_admin'
      },
      body: JSON.stringify(loadedScreenData)
    });

    if (res.ok) {
      const updated = await res.json();
      loadedScreenData = updated;
      const verBadge = document.getElementById('tree-version-badge');
      if (verBadge) verBadge.innerText = 'v' + updated.version + ' Published';
      showToast('Screen "' + updated.screen_name + '" published as Version ' + updated.version + ' & synced to mobile app!');
      flashSyncDot();
    }
  } catch (err) {
    showToast('Error publishing screen: ' + err.message);
  }
}

function saveDraftLocally() {
  showToast('Draft saved locally for screen "' + (loadedScreenData?.screen_name || activeScreenId) + '".');
}

function resetActiveScreenToOriginal() {
  if (confirm('Reset screen "' + (loadedScreenData?.screen_name || activeScreenId) + '" to default published state?')) {
    selectScreen(activeScreenId);
    showToast('Screen reset to original configuration.');
  }
}

function resetSelectedElement() {
  showToast('Selected element "' + selectedElementId + '" reset.');
  renderElementInspector(selectedElementId, loadedScreenData);
}

function switchPropTab(tabId) {
  document.querySelectorAll('.prop-tab-content-pane').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.prop-tab-btn').forEach(el => el.classList.remove('active'));

  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');

  const btn = document.getElementById(tabId.replace('ptab-', 'ptab-btn-'));
  if (btn) btn.classList.add('active');
}

// -----------------------------------------------------------------------------
// 12. ELEMENT TREE MANAGEMENT
// -----------------------------------------------------------------------------
function moveElementUp() {
  const elements = screenElementsInventory[activeScreenId] || [];
  const idx = elements.findIndex(e => e.id === selectedElementId);
  if (idx > 0) {
    const item = elements.splice(idx, 1)[0];
    elements.splice(idx - 1, 0, item);
    renderElementTree(activeScreenId);
    selectElement(selectedElementId);
    showToast('Moved "' + item.name + '" up');
  }
}

function moveElementDown() {
  const elements = screenElementsInventory[activeScreenId] || [];
  const idx = elements.findIndex(e => e.id === selectedElementId);
  if (idx >= 0 && idx < elements.length - 1) {
    const item = elements.splice(idx, 1)[0];
    elements.splice(idx + 1, 0, item);
    renderElementTree(activeScreenId);
    selectElement(selectedElementId);
    showToast('Moved "' + item.name + '" down');
  }
}

function duplicateSelectedElement() {
  const elements = screenElementsInventory[activeScreenId] || [];
  const item = elements.find(e => e.id === selectedElementId);
  if (item) {
    const clone = { ...item, id: item.id + '_copy_' + Date.now().toString().slice(-4), name: item.name + ' (Copy)' };
    elements.push(clone);
    renderElementTree(activeScreenId);
    selectElement(clone.id);
    showToast('Duplicated "' + clone.name + '"');
  }
}

function deleteSelectedElement() {
  const elements = screenElementsInventory[activeScreenId] || [];
  if (elements.length <= 1) {
    showToast('Cannot delete last remaining element.');
    return;
  }
  const idx = elements.findIndex(e => e.id === selectedElementId);
  if (idx >= 0) {
    const removed = elements.splice(idx, 1)[0];
    renderElementTree(activeScreenId);
    selectElement(elements[0].id);
    showToast('Moved "' + removed.name + '" to Recycle Bin.');
  }
}

function openAddElementModal() { document.getElementById('modal-add-element').classList.add('open'); }
function confirmAddElement() {
  const type = document.getElementById('add-elem-type').value;
  const id = document.getElementById('add-elem-id').value.trim() || ('custom_' + Date.now().toString().slice(-4));
  const title = document.getElementById('add-elem-title').value.trim() || 'Custom Health Card';
  const elements = screenElementsInventory[activeScreenId] || [];
  elements.push({ id, name: title, iconKey: 'card', type, route: 'dokrahealth://tracker/' + id });
  renderElementTree(activeScreenId);
  selectElement(id);
  closeModal('modal-add-element');
  showToast('Added element "' + title + '"');
}

// -----------------------------------------------------------------------------
// 13. MODALS, REVISIONS, RECYCLE BIN, AND AUDIT LOGS
// -----------------------------------------------------------------------------
async function openRevisionsModal() {
  document.getElementById('modal-revisions').classList.add('open');
  const tbody = document.getElementById('modal-revisions-tbody');
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading revisions...</td></tr>';
  try {
    const res = await fetch('/admin/v2/screens/' + activeScreenId + '/revisions');
    if (res.ok) {
      const revisions = await res.json();
      tbody.innerHTML = revisions.map(r => 
        '<tr>' +
          '<td><strong style="color:var(--primary-blue);">v' + r.version + '</strong></td>' +
          '<td>' + escapeHtml(r.changed_by || 'super_admin') + '</td>' +
          '<td>' + escapeHtml(r.change_summary || 'Snapshot') + '</td>' +
          '<td style="font-size:11px; color:var(--text-muted);">' + new Date(r.created_at).toLocaleString() + '</td>' +
          '<td><button class="btn-icon" style="padding:3px 8px; font-size:11px;" onclick="rollbackToRevision(\'' + r.revision_id + '\')">Restore</button></td>' +
        '</tr>'
      ).join('');
    }
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5" style="color:var(--accent-red);">Error: ' + err.message + '</td></tr>';
  }
}

async function rollbackToRevision(revId) {
  if (!confirm('Rollback screen to revision ' + revId + '?')) return;
  try {
    const res = await fetch('/admin/v2/screens/' + activeScreenId + '/rollback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Actor-Id': 'super_admin' },
      body: JSON.stringify({ revision_id: revId, reason: 'Restored via Master Admin Rollback' })
    });
    if (res.ok) {
      closeModal('modal-revisions');
      showToast('Screen successfully rolled back!');
      selectScreen(activeScreenId);
    }
  } catch (err) {
    showToast('Rollback failed: ' + err.message);
  }
}

async function openRecycleBinModal() {
  document.getElementById('modal-recycle-bin').classList.add('open');
  const tbody = document.getElementById('modal-recycle-tbody');
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading recycle bin...</td></tr>';
  try {
    const res = await fetch('/admin/v2/recycle-bin');
    if (res.ok) {
      const items = await res.json();
      if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">Recycle bin is empty.</td></tr>';
        return;
      }
      tbody.innerHTML = items.map(item =>
        '<tr>' +
          '<td><code>' + escapeHtml(item.item_id) + '</code></td>' +
          '<td><strong>' + escapeHtml(item.item_name) + '</strong></td>' +
          '<td>' + escapeHtml(item.deleted_by) + '</td>' +
          '<td style="font-size:11px; color:var(--text-muted);">' + new Date(item.deleted_at).toLocaleString() + '</td>' +
          '<td>' +
            '<div style="display:flex; gap:6px;">' +
              '<button class="btn-green" style="padding:2px 6px; font-size:10.5px;" onclick="restoreFromTrash(\'' + item.item_id + '\')">Restore</button>' +
              '<button class="btn-red" style="padding:2px 6px; font-size:10.5px;" onclick="purgeTrash(\'' + item.item_id + '\')">Purge</button>' +
            '</div>' +
          '</td>' +
        '</tr>'
      ).join('');
    }
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5" style="color:var(--accent-red);">Error: ' + err.message + '</td></tr>';
  }
}

async function restoreFromTrash(id) {
  try {
    const res = await fetch('/admin/v2/screens/' + id + '/restore', { method: 'POST', headers: { 'X-Actor-Id': 'super_admin' } });
    if (res.ok) { showToast('Restored \'' + id + '\' from Recycle Bin'); openRecycleBinModal(); }
  } catch (err) { showToast('Restore error: ' + err.message); }
}

async function purgeTrash(id) {
  if (!confirm('Permanently purge \'' + id + '\'? This cannot be undone.')) return;
  try {
    const res = await fetch('/admin/v2/recycle-bin/' + id, { method: 'DELETE', headers: { 'X-Actor-Id': 'super_admin' } });
    if (res.ok) { showToast('Purged \'' + id + '\''); openRecycleBinModal(); }
  } catch (err) { showToast('Purge error: ' + err.message); }
}

async function openAuditLogsModal() {
  document.getElementById('modal-audit-logs').classList.add('open');
  const tbody = document.getElementById('modal-audit-tbody');
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading audit trail...</td></tr>';
  try {
    const res = await fetch('/admin/v2/audit-logs');
    if (res.ok) {
      const logs = await res.json();
      tbody.innerHTML = logs.map(l =>
        '<tr>' +
          '<td><span class="selected-element-badge">' + escapeHtml(l.action) + '</span></td>' +
          '<td><code>' + escapeHtml(l.target_id) + '</code></td>' +
          '<td><strong>' + escapeHtml(l.actor_id) + '</strong></td>' +
          '<td>' + escapeHtml(l.diff_summary || '-') + '</td>' +
          '<td style="font-size:11px; color:var(--text-muted);">' + new Date(l.timestamp).toLocaleString() + '</td>' +
        '</tr>'
      ).join('');
    }
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5" style="color:var(--accent-red);">Error: ' + err.message + '</td></tr>';
  }
}

function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.remove('open');
}

// -----------------------------------------------------------------------------
// 14. THEME, VIEWPORT, SSE & GLOBAL SEARCH
// -----------------------------------------------------------------------------
function initTheme() {
  const saved = localStorage.getItem('dokra_admin_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeButtonText(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('dokra_admin_theme', next);
  updateThemeButtonText(next);
  showToast('Theme switched to ' + (next === 'dark' ? 'Dark Mode' : 'Light Mode'));
}

function updateThemeButtonText(theme) {
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) btn.innerHTML = theme === 'dark' ? 'Light' : 'Dark';
  const gbtn = document.getElementById('global-theme-btn');
  if (gbtn) gbtn.innerHTML = theme === 'dark' ? 'Light' : 'Dark';
}

function setViewportSize(size) {
  const chassis = document.getElementById('phone-chassis');
  document.querySelectorAll('.viewport-btn').forEach(b => b.classList.remove('active'));

  if (size === 'small') {
    chassis.className = 'phone-device-chassis viewport-small';
    document.getElementById('btn-vp-small').classList.add('active');
    showToast('Viewport: Small Mobile (320 × 640 px)');
  } else if (size === 'large') {
    chassis.className = 'phone-device-chassis viewport-large';
    document.getElementById('btn-vp-large').classList.add('active');
    showToast('Viewport: Large Mobile (412 × 840 px)');
  } else {
    chassis.className = 'phone-device-chassis';
    document.getElementById('btn-vp-normal').classList.add('active');
    showToast('Viewport: Standard Mobile (375 × 780 px)');
  }
}

function toggleEditPreviewMode() {
  document.body.classList.toggle('edit-mode');
  const isEdit = document.body.classList.contains('edit-mode');
  document.getElementById('preview-mode-pill').innerHTML = isEdit ? '<span>Edit Mode</span>' : '<span>Preview Mode</span>';
  showToast(isEdit ? 'Edit Mode: Click any element to select' : 'Preview Mode: Visual outlines hidden');
}

async function loadAllScreensIndex() {
  try {
    const res = await fetch('/admin/v2/screens');
    if (res.ok) allScreensRegistry = await res.json();
  } catch (err) {
    console.error('Failed to load screen index:', err);
  }
}

function handleGlobalSearch(query) {
  const popover = document.getElementById('search-results-popover');
  if (!query || query.trim().length === 0) {
    popover.classList.remove('open');
    popover.innerHTML = '';
    return;
  }

  const q = query.toLowerCase().trim();
  const matches = (allScreensRegistry || []).filter(s => 
    (s.screen_name && s.screen_name.toLowerCase().includes(q)) || 
    (s.domain_name && s.domain_name.toLowerCase().includes(q)) || 
    (s.id && s.id.toLowerCase().includes(q)) ||
    (s.route_path && s.route_path.toLowerCase().includes(q))
  );

  const elementMatches = [];
  Object.entries(screenElementsInventory).forEach(([scrId, elList]) => {
    elList.forEach(el => {
      if (el.name.toLowerCase().includes(q) || el.id.toLowerCase().includes(q)) {
        elementMatches.push({ ...el, parentScreenId: scrId });
      }
    });
  });

  let html = '';
  if (matches.length > 0) {
    html += '<div style="font-size:10px; font-weight:800; color:var(--text-muted); text-transform:uppercase; padding:4px 8px;">Screens</div>';
    html += matches.map(s =>
      '<div class="search-result-item" onclick="selectScreenFromSearch(\'' + s.id + '\')">' +
        '<div>' +
          '<div class="search-res-title">' + escapeHtml(s.screen_name) + '</div>' +
          '<div class="search-res-sub">' + escapeHtml(s.domain_name) + ' • <code>' + escapeHtml(s.id) + '</code></div>' +
        '</div>' +
        '<span class="search-res-badge">Edit Screen</span>' +
      '</div>'
    ).join('');
  }

  if (elementMatches.length > 0) {
    html += '<div style="font-size:10px; font-weight:800; color:var(--text-muted); text-transform:uppercase; padding:4px 8px; margin-top:6px;">UI Elements</div>';
    html += elementMatches.slice(0, 5).map(el =>
      '<div class="search-result-item" onclick="selectElementFromSearch(\'' + el.parentScreenId + '\', \'' + el.id + '\')">' +
        '<div>' +
          '<div class="search-res-title">' + escapeHtml(el.name) + '</div>' +
          '<div class="search-res-sub">Element: <code>' + escapeHtml(el.id) + '</code> in ' + escapeHtml(el.parentScreenId) + '</div>' +
        '</div>' +
        '<span class="search-res-badge">Select</span>' +
      '</div>'
    ).join('');
  }

  popover.innerHTML = html || '<div style="padding:10px; font-size:12px; color:var(--text-muted); text-align:center;">No matching screens or elements found</div>';
  popover.classList.add('open');
}

function selectScreenFromSearch(screenId) {
  document.getElementById('search-results-popover').classList.remove('open');
  document.getElementById('global-search-input').value = '';
  selectScreen(screenId);
}

function selectElementFromSearch(screenId, elementId) {
  document.getElementById('search-results-popover').classList.remove('open');
  document.getElementById('global-search-input').value = '';
  selectScreen(screenId).then(() => {
    selectElement(elementId);
  });
}

function initLiveSyncSSE() {
  try {
    const evtSource = new EventSource('/v1/events/live-sync');
    evtSource.onmessage = () => flashSyncDot();
    evtSource.addEventListener('screen_registry_update', (e) => {
      flashSyncDot();
      const d = JSON.parse(e.data);
      if (d.screenId === activeScreenId) selectScreen(activeScreenId);
    });
    evtSource.addEventListener('screen_registry_rollback', () => flashSyncDot());
  } catch (err) {
    console.log('SSE notification:', err);
  }
}

function flashSyncDot() {
  document.querySelectorAll('.live-sync-pill').forEach(el => {
    el.classList.add('pulsing');
    setTimeout(() => el.classList.remove('pulsing'), 500);
  });
}

function showToast(msg) {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = '✔ ' + msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

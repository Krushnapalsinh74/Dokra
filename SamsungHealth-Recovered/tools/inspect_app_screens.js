const fs = require('fs');
const path = require('path');

const manifestPath = path.resolve(__dirname, '../apktool/AndroidManifest.xml');
const xml = fs.readFileSync(manifestPath, 'utf8');

const activities = [];
const regex = /<activity\b[^>]*android:name="([^"]+)"[^>]*>/g;
let match;
while ((match = regex.exec(xml)) !== null) {
  activities.push(match[1]);
}

console.log('=== TOTAL ACTIVITIES FOUND IN DOKRA HEALTH APP:', activities.length, '===');

// Categorize activities by functional module
const modules = {};
activities.forEach(act => {
  const parts = act.split('.');
  let mod = 'core';
  if (act.includes('.tracker.')) {
    const idx = act.indexOf('.tracker.');
    mod = 'tracker.' + act.substring(idx + 9).split('.')[0];
  } else if (act.includes('.app.')) {
    const idx = act.indexOf('.app.');
    mod = 'app.' + act.substring(idx + 5).split('.')[0];
  } else if (act.includes('.together.')) {
    mod = 'together';
  } else if (act.includes('.fitness.')) {
    mod = 'fitness';
  } else if (act.includes('.exercise.')) {
    mod = 'exercise';
  } else if (act.includes('.food.') || act.includes('.nutrition.')) {
    mod = 'food_nutrition';
  } else if (act.includes('.sleep.')) {
    mod = 'sleep';
  } else if (act.includes('.heartrate.') || act.includes('.ecg.')) {
    mod = 'heart_ecg';
  } else if (act.includes('.bloodpressure.')) {
    mod = 'blood_pressure';
  } else if (act.includes('.bloodglucose.')) {
    mod = 'blood_glucose';
  } else if (act.includes('.bodycomposition.') || act.includes('.weight.')) {
    mod = 'body_weight';
  } else if (act.includes('.stress.') || act.includes('.mindfulness.')) {
    mod = 'stress_mindfulness';
  } else if (act.includes('.water.')) {
    mod = 'water_hydration';
  } else if (act.includes('.medication.')) {
    mod = 'medication';
  } else if (act.includes('.telehealth.') || act.includes('.expert.') || act.includes('.clinical.')) {
    mod = 'telehealth_clinical';
  } else if (act.includes('.program.') || act.includes('.challenge.')) {
    mod = 'programs_challenges';
  } else if (act.includes('.setting.') || act.includes('.settings.')) {
    mod = 'settings_profile';
  } else if (act.includes('.wearable.') || act.includes('.accessory.') || act.includes('.device.')) {
    mod = 'devices_wearables';
  } else if (act.includes('.auth.')) {
    mod = 'auth_onboarding';
  } else if (parts.length >= 6) {
    mod = parts[4] + '.' + parts[5];
  } else {
    mod = parts.slice(2, 4).join('.');
  }

  if (!modules[mod]) modules[mod] = [];
  modules[mod].push(act);
});

console.log('\n=== MODULE BREAKDOWN ===');
for (const [mod, list] of Object.entries(modules).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`${mod}: ${list.length} screens`);
}

// Print full activity list grouped by module
fs.writeFileSync(path.resolve(__dirname, 'extracted_screens.json'), JSON.stringify({
  totalCount: activities.length,
  modules
}, null, 2));

console.log('\nWrote extracted_screens.json successfully.');

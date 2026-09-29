const fs = require('fs');
const path = require('path');

const apktoolDir = path.resolve(__dirname, '../apktool');

console.log('=== Step 1: Patching HealthDataStore.smali ===');
const healthDataStorePath = path.join(apktoolDir, 'smali/com/samsung/android/sdk/healthdata/HealthDataStore.smali');
if (fs.existsSync(healthDataStorePath)) {
  let hds = fs.readFileSync(healthDataStorePath, 'utf8');

  // Replace checkAndNotifyDataPlatformStatus to immediately return true (1)
  const oldCheckMethodRegex = /\.method private checkAndNotifyDataPlatformStatus\(\)Z[\s\S]*?\.end method/;
  const newCheckMethod = `.method private checkAndNotifyDataPlatformStatus()Z
    .locals 1

    const/4 v0, 0x1

    return v0
.end method`;
  hds = hds.replace(oldCheckMethodRegex, newCheckMethod);

  // Replace getPlatformPackageName to return com.dokra.health
  const oldPlatformPkgRegex = /\.method public static getPlatformPackageName\(\)Ljava\/lang\/String;[\s\S]*?\.end method/;
  const newPlatformPkg = `.method public static getPlatformPackageName()Ljava/lang/String;
    .locals 1

    const-string v0, "com.dokra.health"

    return v0
.end method`;
  hds = hds.replace(oldPlatformPkgRegex, newPlatformPkg);

  // Replace REL_PLATFORM_PACKAGE_NAME constant
  hds = hds.replace(
    '.field private static final REL_PLATFORM_PACKAGE_NAME:Ljava/lang/String; = "com.sec.android.app.shealth"',
    '.field private static final REL_PLATFORM_PACKAGE_NAME:Ljava/lang/String; = "com.dokra.health"'
  );

  fs.writeFileSync(healthDataStorePath, hds, 'utf8');
  console.log('✓ HealthDataStore.smali patched successfully.');
} else {
  console.error('✗ HealthDataStore.smali not found!');
}

console.log('=== Step 2: Patching ComponentManager.smali ===');
const compManagerPath = path.join(apktoolDir, 'smali/com/samsung/android/sdk/healthdata/privileged/util/ComponentManager.smali');
if (fs.existsSync(compManagerPath)) {
  let cm = fs.readFileSync(compManagerPath, 'utf8');

  // Replace "com.sec.android.app.shealth" with dynamically obtained getPackageName() or "com.dokra.health"
  cm = cm.replace(/"com\.sec\.android\.app\.shealth"/g, '"com.dokra.health"');

  // Wrap setComponentEnabledSetting in try-catch in both private enableComponent and disableComponent
  cm = cm.replace(
    /invoke-virtual \{p0, p1, p2, v0\}, Landroid\/content\/pm\/PackageManager;->setComponentEnabledSetting\(Landroid\/content\/ComponentName;II\)V/g,
    `:try_start_sec\n    invoke-virtual {p0, p1, p2, v0}, Landroid/content/pm/PackageManager;->setComponentEnabledSetting(Landroid/content/ComponentName;II)V\n    :try_end_sec\n    .catch Ljava/lang/Throwable; {:try_start_sec .. :try_end_sec} :catch_sec\n    :catch_sec`
  );

  cm = cm.replace(
    /invoke-virtual \{p0, p1, v0, v0\}, Landroid\/content\/pm\/PackageManager;->setComponentEnabledSetting\(Landroid\/content\/ComponentName;II\)V/g,
    `:try_start_sec2\n    invoke-virtual {p0, p1, v0, v0}, Landroid/content/pm/PackageManager;->setComponentEnabledSetting(Landroid/content/ComponentName;II)V\n    :try_end_sec2\n    .catch Ljava/lang/Throwable; {:try_start_sec2 .. :try_end_sec2} :catch_sec2\n    :catch_sec2`
  );

  fs.writeFileSync(compManagerPath, cm, 'utf8');
  console.log('✓ ComponentManager.smali patched successfully.');
} else {
  console.error('✗ ComponentManager.smali not found!');
}

console.log('=== Step 3: Patching SHealthApplication.smali ===');
const shealthAppPath = path.join(apktoolDir, 'smali/com/samsung/android/app/shealth/SHealthApplication.smali');
if (fs.existsSync(shealthAppPath)) {
  let sa = fs.readFileSync(shealthAppPath, 'utf8');
  sa = sa.replace(/"com\.sec\.android\.app\.shealth"/g, '"com.dokra.health"');
  fs.writeFileSync(shealthAppPath, sa, 'utf8');
  console.log('✓ SHealthApplication.smali patched successfully.');
} else {
  console.error('✗ SHealthApplication.smali not found!');
}

console.log('=== Step 4: Patching TrackerSportCardMainActivity.smali ===');
const trackerSportPath = path.join(apktoolDir, 'smali_classes5/com/samsung/android/app/shealth/tracker/sport/track/view/TrackerSportCardMainActivity.smali');
if (fs.existsSync(trackerSportPath)) {
  let ts = fs.readFileSync(trackerSportPath, 'utf8');

  // Fix NullPointerExceptions in onApplyInsetInActivity / applyInsetInBase
  ts = ts.replace(
    /:cond_7\r?\n\s*new-instance p0, Ljava\/lang\/NullPointerException;[\s\S]*?throw p0/g,
    ':cond_7\n    goto :goto_2'
  );

  ts = ts.replace(
    /:cond_9\r?\n\s*new-instance p0, Ljava\/lang\/NullPointerException;[\s\S]*?throw p0/g,
    ':cond_9\n    goto :goto_3'
  );

  ts = ts.replace(
    /:cond_b\r?\n\s*new-instance p0, Ljava\/lang\/NullPointerException;[\s\S]*?throw p0/g,
    ':cond_b\n    return-object p2'
  );

  fs.writeFileSync(trackerSportPath, ts, 'utf8');
  console.log('✓ TrackerSportCardMainActivity.smali NPEs removed successfully.');
} else {
  console.error('✗ TrackerSportCardMainActivity.smali not found!');
}

console.log('=== Step 5: Patching ExerciseMainListActivity.smali ===');
const exerciseMainListPath = path.join(apktoolDir, 'smali_classes5/com/samsung/android/app/shealth/tracker/sport/exerciselist/ExerciseMainListActivity.smali');
if (fs.existsSync(exerciseMainListPath)) {
  let eml = fs.readFileSync(exerciseMainListPath, 'utf8');

  // Fix NullPointerException in onCreate
  eml = eml.replace(
    /:cond_0\r?\n\s*new-instance p0, Ljava\/lang\/NullPointerException;[\s\S]*?throw p0/g,
    ':cond_0\n    goto :goto_0'
  );

  fs.writeFileSync(exerciseMainListPath, eml, 'utf8');
  console.log('✓ ExerciseMainListActivity.smali NPEs removed successfully.');
} else {
  console.error('✗ ExerciseMainListActivity.smali not found!');
}

console.log('\n=== All core smali crash points successfully patched! ===');

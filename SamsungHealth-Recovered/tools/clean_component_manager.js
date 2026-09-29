const fs = require('fs');
const path = require('path');

const compManagerPath = path.resolve(__dirname, '../apktool/smali/com/samsung/android/sdk/healthdata/privileged/util/ComponentManager.smali');
let cm = fs.readFileSync(compManagerPath, 'utf8');

// Replace duplicate try_start_sec blocks in disableComponent
cm = cm.replace(
  /:try_start_sec[\s\S]*?:catch_sec\r?\n\s*:catch_sec/g,
  `:try_start_sec\n    invoke-virtual {p0, p1, p2, v0}, Landroid/content/pm/PackageManager;->setComponentEnabledSetting(Landroid/content/ComponentName;II)V\n    :try_end_sec\n    .catch Ljava/lang/Throwable; {:try_start_sec .. :try_end_sec} :catch_sec\n    :catch_sec`
);

// Replace duplicate try_start_sec2 blocks in enableComponent
cm = cm.replace(
  /:try_start_sec2[\s\S]*?:catch_sec2\r?\n\s*:catch_sec2/g,
  `:try_start_sec2\n    invoke-virtual {p0, p1, v0, v0}, Landroid/content/pm/PackageManager;->setComponentEnabledSetting(Landroid/content/ComponentName;II)V\n    :try_end_sec2\n    .catch Ljava/lang/Throwable; {:try_start_sec2 .. :try_end_sec2} :catch_sec2\n    :catch_sec2`
);

fs.writeFileSync(compManagerPath, cm, 'utf8');
console.log('Cleaned ComponentManager.smali successfully.');

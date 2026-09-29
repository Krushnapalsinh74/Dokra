const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const apktoolDir = path.join(rootDir, 'apktool');
const manifestPath = path.join(apktoolDir, 'AndroidManifest.xml');
const manifest = fs.readFileSync(manifestPath, 'utf8');

// Find all smali directories
const smaliDirs = fs.readdirSync(apktoolDir)
    .filter(name => name.startsWith('smali'))
    .map(name => path.join(apktoolDir, name));

function smaliClassExists(className) {
    // Convert e.g. com.example.MyClass to com/example/MyClass.smali
    const relPath = className.replace(/\./g, '/') + '.smali';
    for (const sDir of smaliDirs) {
        if (fs.existsSync(path.join(sDir, relPath))) {
            return true;
        }
    }
    // Also check standard Android framework classes
    if (className.startsWith('android.') || className.startsWith('androidx.')) {
        // Some might be in framework or DEX
        for (const sDir of smaliDirs) {
            if (fs.existsSync(path.join(sDir, relPath))) return true;
        }
    }
    return false;
}

// Extract all android:name in manifest
const nameMatches = manifest.matchAll(/android:name="([^"]+)"/g);
const missingClasses = [];
const foundClasses = [];

for (const match of nameMatches) {
    let cls = match[1];
    if (cls.startsWith('.')) {
        cls = 'com.dokra.health' + cls;
    }
    // Ignore permissions, actions, metadata keys, etc. (check if it looks like a class in application components)
    // We only care about components: activity, service, receiver, provider, application
}

// Let's specifically inspect <application>, <activity>, <service>, <receiver>, <provider>
const componentRegex = /<(application|activity|activity-alias|service|receiver|provider)[^>]*android:name="([^"]+)"[^>]*>/g;
let compMatch;
console.log('=== CHECKING ALL MANIFEST COMPONENTS ===');
while ((compMatch = componentRegex.exec(manifest)) !== null) {
    const compType = compMatch[1];
    let cls = compMatch[2];
    if (cls.startsWith('.')) {
        cls = 'com.dokra.health' + cls;
    }
    const exists = smaliClassExists(cls);
    if (!exists) {
        console.log(`[MISSING CLASS] <${compType} android:name="${cls}"> NOT FOUND in smali!`);
        missingClasses.push({ type: compType, name: cls });
    } else {
        foundClasses.push({ type: compType, name: cls });
    }
}

console.log(`\nSummary: Found ${foundClasses.length} valid component classes, ${missingClasses.length} MISSING component classes!`);

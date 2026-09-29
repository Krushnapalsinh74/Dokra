const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const apktoolDir = path.join(rootDir, 'apktool');
const manifestPath = path.join(apktoolDir, 'AndroidManifest.xml');

const manifest = fs.readFileSync(manifestPath, 'utf8');

// Find all launcher activities
const actRegex = /<activity[\s\S]*?<\/activity>/g;
let match;
console.log('=== LAUNCHER ACTIVITIES ===');
while ((match = actRegex.exec(manifest)) !== null) {
    const act = match[0];
    if (act.includes('android.intent.action.MAIN') && act.includes('android.intent.category.LAUNCHER')) {
        const nameMatch = act.match(/android:name="([^"]+)"/);
        console.log('Launcher Activity:', nameMatch ? nameMatch[1] : 'unknown');
        console.log(act);
    }
}

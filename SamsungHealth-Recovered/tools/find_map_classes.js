const fs = require('fs');
const path = require('path');

const apktoolDir = path.resolve(__dirname, '..', 'apktool');

const smaliDirs = fs.readdirSync(apktoolDir)
    .filter(name => name.startsWith('smali'))
    .map(name => path.join(apktoolDir, name));

function findFile(name) {
    for (const sDir of smaliDirs) {
        function walk(dir) {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const ent of entries) {
                const full = path.join(dir, ent.name);
                if (ent.isDirectory()) {
                    const res = walk(full);
                    if (res) return res;
                } else if (ent.name.toLowerCase().includes(name.toLowerCase())) {
                    return full;
                }
            }
            return null;
        }
        const res = walk(sDir);
        if (res) return res;
    }
    return null;
}

console.log('ExerciseTrackerMapViewFragment:', findFile('ExerciseTrackerMapViewFragment'));
console.log('MapFragment:', findFile('MapFragment'));
console.log('MapView:', findFile('MapView'));
console.log('ExerciseRunningTrackerFragment:', findFile('ExerciseRunningTrackerFragment'));

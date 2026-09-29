const fs = require('fs');
const path = require('path');

const apktoolDir = path.resolve(__dirname, '..', 'apktool');

const smaliDirs = fs.readdirSync(apktoolDir)
    .filter(name => name.startsWith('smali'))
    .map(name => path.join(apktoolDir, name));

function searchFiles(dirs, pattern, maxResults = 10) {
    let results = [];
    function walk(dir) {
        if (results.length >= maxResults) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const ent of entries) {
            const full = path.join(dir, ent.name);
            if (ent.isDirectory()) {
                walk(full);
            } else if (ent.name.endsWith('.smali')) {
                const content = fs.readFileSync(full, 'utf8');
                if (typeof pattern === 'string' ? content.includes(pattern) : pattern.test(content)) {
                    results.push({ file: full, rel: path.relative(apktoolDir, full) });
                    if (results.length >= maxResults) return;
                }
            }
        }
    }
    for (const d of dirs) walk(d);
    return results;
}

console.log('--- Searching for PermissionActivity smali ---');
console.log(searchFiles(smaliDirs, 'PermissionActivity.smali'));

console.log('--- Searching for PermissionActivity references in SportCard ---');
console.log(searchFiles(smaliDirs, 'com/samsung/android/app/shealth/app/helper/PermissionActivity'));

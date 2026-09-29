const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const apktoolDir = path.join(rootDir, 'apktool');

function findSmaliFiles(dir) {
    let files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            files = files.concat(findSmaliFiles(full));
        } else if (ent.name.endsWith('.smali')) {
            files.push(full);
        }
    }
    return files;
}

const smaliDirs = fs.readdirSync(apktoolDir)
    .filter(name => name.startsWith('smali'))
    .map(name => path.join(apktoolDir, name));

const occurrences = [];
for (const sDir of smaliDirs) {
    const smaliFiles = findSmaliFiles(sDir);
    for (const file of smaliFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
            if (line.includes('com.dokra.health') || line.includes('com/dokra/health')) {
                // Ignore our injected provider classes
                if (!file.includes('com\\dokra\\health\\provider') && !file.includes('com/dokra/health/provider')) {
                    occurrences.push({ file: path.relative(apktoolDir, file), lineNum: idx + 1, line: line.trim() });
                }
            }
        });
    }
}

console.log(`Found ${occurrences.length} occurrences of com.dokra.health in decompiled smali:`);
occurrences.forEach(o => {
    console.log(`${o.file}:${o.lineNum} -> ${o.line}`);
});

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', 'apktool');
const manifestPath = path.join(rootDir, 'AndroidManifest.xml');
const manifest = fs.readFileSync(manifestPath, 'utf8');

// Extract all authorities declared by <provider> elements
const providerRegex = /<provider\s+[^>]*android:authorities="([^"]+)"[^>]*>/g;
let match;
const declaredAuthorities = [];
while ((match = providerRegex.exec(manifest)) !== null) {
    declaredAuthorities.push(match[1]);
}

console.log(`Found ${declaredAuthorities.length} declared provider authorities in <application>:`);
declaredAuthorities.forEach(a => console.log(' -', a));

// Search for smali files mentioning these authorities or package name
console.log('\nSearching for smali files referencing these authorities...');

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

const smaliDirs = fs.readdirSync(rootDir)
    .filter(name => name.startsWith('smali'))
    .map(name => path.join(rootDir, name));

let totalSmaliCount = 0;
const authorityMatches = {};
declaredAuthorities.forEach(a => authorityMatches[a] = []);

for (const sDir of smaliDirs) {
    const smaliFiles = findSmaliFiles(sDir);
    totalSmaliCount += smaliFiles.length;
    for (const file of smaliFiles) {
        const content = fs.readFileSync(file, 'utf8');
        for (const auth of declaredAuthorities) {
            if (content.includes(auth)) {
                authorityMatches[auth].push(path.relative(rootDir, file));
            }
        }
    }
}

console.log(`Scanned ${totalSmaliCount} smali files.`);
console.log('\nAuthority match results in Smali:');
for (const [auth, files] of Object.entries(authorityMatches)) {
    if (files.length > 0) {
        console.log(`\n[${auth}] -> referenced in ${files.length} smali file(s):`);
        files.slice(0, 5).forEach(f => console.log('  -', f));
        if (files.length > 5) console.log(`  ... and ${files.length - 5} more`);
    } else {
        console.log(`\n[${auth}] -> NOT directly referenced as literal string in smali.`);
    }
}

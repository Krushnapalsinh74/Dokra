const fs = require('fs');
const path = require('path');

const resDir = path.join(__dirname, '..', 'apktool', 'res');

function findXmlFiles(dir) {
    let files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            files = files.concat(findXmlFiles(full));
        } else if (ent.name.endsWith('.xml')) {
            files.push(full);
        }
    }
    return files;
}

const allXmlFiles = findXmlFiles(resDir);
console.log(`Found ${allXmlFiles.length} XML files in res/`);

const matchingFiles = [];
for (const file of allXmlFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('com.sec.android.app.shealth') || content.includes('com.samsung.android.app.shealth')) {
        matchingFiles.push(path.relative(resDir, file));
    }
}

console.log(`Found ${matchingFiles.length} resource files mentioning shealth:`);
matchingFiles.forEach(f => console.log(' -', f));

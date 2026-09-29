const fs = require('fs');
const path = require('path');

const st9Path = path.resolve(__dirname, '..', 'apktool', 'smali_classes5', 'st9.smali');
const content = fs.readFileSync(st9Path, 'utf8');

const lines = content.split('\n');
lines.forEach((line, idx) => {
    if (line.toLowerCase().includes('map') || line.toLowerCase().includes('permission') || line.toLowerCase().includes('location') || line.toLowerCase().includes('tracker')) {
        console.log(`Line ${idx+1}: ${line.trim()}`);
    }
});

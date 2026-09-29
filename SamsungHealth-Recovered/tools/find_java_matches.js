const fs = require('fs');
const path = require('path');
const srcDir = 'C:/Users/AE/Desktop/DokraHealth/SamsungHealth-Recovered/src/main/java';

function walk(dir) {
    const list = fs.readdirSync(dir, {withFileTypes: true});
    for (const item of list) {
        const full = path.join(dir, item.name);
        if (item.isDirectory()) {
            walk(full);
        } else if (item.name.endsWith('.java')) {
            const content = fs.readFileSync(full, 'utf8');
            if (content.toLowerCase().includes('mock') || content.toLowerCase().includes('fake') || content.toLowerCase().includes('step') || content.toLowerCase().includes('gps') || content.toLowerCase().includes('location') || content.toLowerCase().includes('distance')) {
                console.log('Match in Java:', full);
            }
        }
    }
}
walk(srcDir);

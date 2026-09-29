const fs = require('fs');
const path = require('path');

const resDir = path.resolve(__dirname, '..', 'apktool', 'res');
const valuesDirs = fs.readdirSync(resDir).filter(d => d.startsWith('values'));

for (const v of valuesDirs) {
    const p = path.join(resDir, v);
    const files = fs.readdirSync(p);
    for (const f of files) {
        if (f.endsWith('.xml')) {
            const content = fs.readFileSync(path.join(p, f), 'utf8');
            if (content.includes('sesl_loading_progress_color') || content.includes('progressCircleDotColor') || content.includes('23c492')) {
                console.log(`Match in ${v}/${f}`);
            }
        }
    }
}

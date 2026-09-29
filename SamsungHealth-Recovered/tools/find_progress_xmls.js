const fs = require('fs');
const path = require('path');

const resDir = path.resolve(__dirname, '..', 'apktool', 'res');

function search(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            search(full);
        } else if (ent.name.endsWith('.xml')) {
            const txt = fs.readFileSync(full, 'utf8');
            if (txt.includes('sesl_loading_progress_color') || txt.includes('sesl_progress') || txt.includes('progressCircleDotColor') || txt.includes('23c492') || txt.includes('progress_mono')) {
                console.log('Match in:', path.relative(resDir, full));
            }
        }
    }
}

search(resDir);

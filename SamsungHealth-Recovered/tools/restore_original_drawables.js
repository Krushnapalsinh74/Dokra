const fs = require('fs');
const path = require('path');

const originalRes = path.resolve(__dirname, '../build/original-decoded/res');
const apktoolRes = path.resolve(__dirname, '../apktool/res');

function copySpecific(pattern) {
    function scan(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const ent of entries) {
            const full = path.join(dir, ent.name);
            if (ent.isDirectory()) {
                scan(full);
            } else if (ent.name.includes(pattern)) {
                const rel = path.relative(originalRes, full);
                const target = path.join(apktoolRes, rel);
                if (fs.existsSync(path.dirname(target))) {
                    fs.copyFileSync(full, target);
                    console.log(`Restored: ${rel}`);
                }
            }
        }
    }
    scan(originalRes);
}

console.log('Restoring original progress & indicator vector drawables...');
copySpecific('sesl_vector_drawable_progress');
copySpecific('progress');
copySpecific('loading');
copySpecific('badge');
console.log('Restoration completed.');

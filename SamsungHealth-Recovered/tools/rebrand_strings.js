const fs = require('fs');
const path = require('path');

const resDir = path.resolve(__dirname, '../apktool/res');

function replaceInText(text) {
    let res = text;
    // Specific terms first
    res = res.replaceAll('Samsung Health', 'Dokra Health');
    res = res.replaceAll('Samsung health', 'Dokra Health');
    res = res.replaceAll('SAMSUNG HEALTH', 'DOKRA HEALTH');
    res = res.replaceAll('SamsungHealth', 'DokraHealth');
    res = res.replaceAll('S Health', 'Dokra Health');
    res = res.replaceAll('S-Health', 'Dokra-Health');
    res = res.replaceAll('S health', 'Dokra Health');
    res = res.replaceAll('S HEALTH', 'DOKRA HEALTH');
    res = res.replaceAll('Samsung Account', 'Dokra Account');
    res = res.replaceAll('Samsung account', 'Dokra account');
    res = res.replaceAll("Samsung's", "Dokra's");
    res = res.replaceAll('Samsung', 'Dokra');
    res = res.replaceAll('SAMSUNG', 'DOKRA');
    return res;
}

function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;

    let inString = false;
    let inItem = false;
    const newLines = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Case 1: Single-line <string name="...">...</string>
        if (line.includes('<string') && line.includes('</string>')) {
            const startIdx = line.indexOf('>') + 1;
            const endIdx = line.lastIndexOf('</string>');
            if (startIdx > 0 && endIdx >= startIdx) {
                const prefix = line.substring(0, startIdx);
                const body = line.substring(startIdx, endIdx);
                const suffix = line.substring(endIdx);
                const newBody = replaceInText(body);
                if (newBody !== body) {
                    line = prefix + newBody + suffix;
                    modified = true;
                }
            }
        }
        // Case 2: Single-line <item...>...</item>
        else if (line.includes('<item') && line.includes('</item>')) {
            const startIdx = line.indexOf('>') + 1;
            const endIdx = line.lastIndexOf('</item>');
            if (startIdx > 0 && endIdx >= startIdx) {
                const prefix = line.substring(0, startIdx);
                const body = line.substring(startIdx, endIdx);
                const suffix = line.substring(endIdx);
                if (!body.trim().startsWith('@') && !body.trim().startsWith('?')) {
                    const newBody = replaceInText(body);
                    if (newBody !== body) {
                        line = prefix + newBody + suffix;
                        modified = true;
                    }
                }
            }
        }
        // Case 3: Start of multiline <string
        else if (line.includes('<string') && !line.includes('</string>')) {
            inString = true;
            const startIdx = line.indexOf('>') + 1;
            if (startIdx > 0 && startIdx < line.length) {
                const prefix = line.substring(0, startIdx);
                const body = line.substring(startIdx);
                const newBody = replaceInText(body);
                if (newBody !== body) {
                    line = prefix + newBody;
                    modified = true;
                }
            }
        }
        // Case 4: End of multiline </string>
        else if (inString && line.includes('</string>')) {
            inString = false;
            const endIdx = line.indexOf('</string>');
            const body = line.substring(0, endIdx);
            const suffix = line.substring(endIdx);
            const newBody = replaceInText(body);
            if (newBody !== body) {
                line = newBody + suffix;
                modified = true;
            }
        }
        // Case 5: Middle of multiline <string>
        else if (inString) {
            const newBody = replaceInText(line);
            if (newBody !== line) {
                line = newBody;
                modified = true;
            }
        }

        newLines.push(line);
    }

    if (modified) {
        fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
        return true;
    }
    return false;
}

const entries = fs.readdirSync(resDir, { withFileTypes: true });
let updatedCount = 0;
let totalFiles = 0;

for (const entry of entries) {
    if (entry.isDirectory() && entry.name.startsWith('values')) {
        const fullPath = path.join(resDir, entry.name);
        const xmlFiles = fs.readdirSync(fullPath).filter(f => f.endsWith('.xml'));
        for (const xmlFile of xmlFiles) {
            totalFiles++;
            const xmlPath = path.join(fullPath, xmlFile);
            if (processFile(xmlPath)) {
                updatedCount++;
            }
        }
    }
}

console.log(`Finished processing: ${updatedCount} / ${totalFiles} files updated.`);

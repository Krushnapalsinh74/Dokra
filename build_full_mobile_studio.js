const fs = require('fs');
const path = require('path');

console.log('--- Dokra Health: Generating Pixel-Perfect Mobile App Screens & Engine ---');

// 1. UPDATE STUDIO.HTML to remove hardcoded bottom nav and ensure smooth phone viewport
let studioHtml = fs.readFileSync('backend/card-service/src/studio.html', 'utf8');

// Remove hardcoded bottom nav block (lines 2596-2615)
const hardcodedNavMarker = '<!-- PHONE BOTTOM NAV -->';
if (studioHtml.includes(hardcodedNavMarker)) {
  const parts = studioHtml.split(hardcodedNavMarker);
  const afterParts = parts[1].split('</div>\n          </div>\n        </div>\n      </div>');
  if (afterParts.length >= 2) {
    studioHtml = parts[0] + '</div>\n        </div>\n      </div>' + afterParts.slice(1).join('</div>\n        </div>\n      </div>');
    console.log('✔ Removed hardcoded duplicate bottom nav from studio.html');
  } else {
    // Alternative split
    studioHtml = studioHtml.replace(/<!-- PHONE BOTTOM NAV -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/, '</div>\n          </div>\n        </div>');
    console.log('✔ Regex removed hardcoded bottom nav');
  }
}

// Ensure phone-viewport has smooth styling and no double scrollbar
studioHtml = studioHtml.replace(
  'padding-bottom: 24px;',
  'padding-bottom: 16px; min-height: 100%;'
);

fs.writeFileSync('backend/card-service/src/studio.html', studioHtml, 'utf8');

console.log('✔ studio.html updated successfully.');

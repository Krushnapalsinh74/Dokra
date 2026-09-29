const fs = require('fs');
const path = require('path');

let cachedHtml = null;

function renderCardStudioHtml() {
  const htmlPath = path.resolve(__dirname, 'studio.html');
  // In development, read fresh each time or use cached
  try {
    return fs.readFileSync(htmlPath, 'utf8');
  } catch (err) {
    return '<h1>Error loading studio.html: ' + err.message + '</h1>';
  }
}

module.exports = {
  renderCardStudioHtml
};

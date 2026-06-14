const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

if (!html.includes('Cache-Control')) {
    html = html.replace('<head>', '<head>\n    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">\n    <meta http-equiv="Pragma" content="no-cache">\n    <meta http-equiv="Expires" content="0">');
}

const v = Date.now();
html = html.replace(/\.css(\?v=[0-9]+)?\"/g, '.css?v=' + v + '"');
html = html.replace(/\.js(\?v=[0-9]+)?\"/g, '.js?v=' + v + '"');

fs.writeFileSync('index.html', html);
console.log('Cache-busting aplicado a index.html. Versión: ' + v);

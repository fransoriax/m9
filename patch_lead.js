const fs = require('fs');
let appJS = fs.readFileSync('app_v12.js', 'utf8');
appJS = appJS.replace(/localStorage\.setItem\('m9-inventory-db',\s*JSON\.stringify\(db\)\);/g, "if (window.M9Cache) { window.M9Cache.set('m9-inventory-db', db); }");
fs.writeFileSync('app_v12.js', appJS);
console.log('patched addLeadToCRM');

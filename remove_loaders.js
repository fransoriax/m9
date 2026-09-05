const fs = require('fs');
let app = fs.readFileSync('app_v12.js', 'utf8');

// Replace catalog loader
app = app.replace(/grid\.innerHTML\s*=\s*`[^`]*?Cargando cat[aáǭ]logo[^`]*?`;/gs, 'return; // Wait for background sync');

// Replace detail loader
app = app.replace(/const loader = document\.createElement\("div"\);[\s\S]*?loader\.innerHTML = `[\s\S]*?Cargando detalles[\s\S]*?`;\s*detailContainer\.parentNode\.insertBefore\(loader, detailContainer\);/gs, '/* silent wait */');
app = app.replace(/detailContainer\.style\.display = 'none';/g, '/* silent wait */');
app = app.replace(/const overlay = document\.getElementById\("detail-loading-overlay"\);\s*if \(overlay\) overlay\.remove\(\);/g, '');

fs.writeFileSync('app_v12.js', app);
console.log('Loaders removed');

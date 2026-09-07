const fs = require('fs');
let adminJS = fs.readFileSync('admin/admin.js', 'utf8');

adminJS = adminJS.replace(/function loadDatabase\(\)/g, 'async function loadDatabase()');
adminJS = adminJS.replace(/const saved = null; \/\* Handled asynchronously now \*\//g, "const saved = window.M9Cache ? await window.M9Cache.get('m9-inventory-db') : null;");
adminJS = adminJS.replace(/const parsed = JSON\.parse\(saved\);/g, 'const parsed = saved;');
adminJS = adminJS.replace(/window\.onload = \(\) => {/g, 'window.onload = async () => {');
adminJS = adminJS.replace(/loadDatabase\(\);/g, 'await loadDatabase();');

fs.writeFileSync('admin/admin.js', adminJS);
console.log('admin.js async refactor done');

const fs = require('fs');
let adminJS = fs.readFileSync('admin/admin.js', 'utf8');

adminJS = adminJS.replace(/init\(\) \{\s*await loadDatabase\(\);/g, "async init() {\n    await loadDatabase();");
adminJS = adminJS.replace(/window\.onload = async \(\) => \{\s*App\.init\(\);/g, "window.onload = async () => {\n  await App.init();"); // Actually, I replaced loadDatabase() inside window.onload? Wait! Let's check window.onload.

fs.writeFileSync('admin/admin.js', adminJS);
console.log('Fixed admin.js');

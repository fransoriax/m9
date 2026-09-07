const fs = require('fs');
let app = fs.readFileSync('app_v12.js', 'utf8');

const target = '<span class="spec-label" style="display:block; font-size:0.72rem; color:var(--text-secondary); text-transform:uppercase;">Potencia</span>';
const replacement = '<span class="spec-label" style="display:block; font-size:0.72rem; color:var(--text-secondary); text-transform:uppercase;">Motorización</span>';

if (app.includes(target)) {
  app = app.replace(target, replacement);
  fs.writeFileSync('app_v12.js', app);
  console.log('Replaced in app_v12.js');
}

let appOld = fs.readFileSync('app.js', 'utf8');
if (appOld.includes(target)) {
  appOld = appOld.replace(target, replacement);
  fs.writeFileSync('app.js', appOld);
  console.log('Replaced in app.js');
}

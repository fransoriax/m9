const fs = require('fs');
let c = fs.readFileSync('app_v12.js', 'utf8');
c = c.split('detalle.html?id=${fork.id}').join('detalle.html#${fork.id}');
c = c.split('detalle.html?id=${truck.id}').join('detalle.html#${truck.id}');
fs.writeFileSync('app_v12.js', c);
const remaining = (c.match(/detalle\.html\?id=\$\{(fork|truck)\.id\}/g)||[]);
console.log('Remaining ?id links:', remaining.length);
console.log('#id links:', (c.match(/detalle\.html#\$\{(fork|truck)\.id\}/g)||[]).length);

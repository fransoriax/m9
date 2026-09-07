const fs = require('fs');
let adminJs = fs.readFileSync('admin/admin.js', 'utf8');

const regex = /<td><div class="td-specs-row">([\s\S]*?)<\/td>\s*<td><\/td>\s*<td><div style="display:flex; align-items:center;">([\s\S]*?)<\/td>\s*<td><div class="td-badges-group">\$\{statusBadge\} \$\{visBadge\}<\/div><\/td>\s*<td><\/td>/g;

const newRow = '<td><div class="td-specs-row"><span class="td-spec-chip">Capacidad: ${item.capacity||\'—\'}</span></div></td>\n            <td><div class="td-specs-row"><span class="td-spec-chip">Motor: ${item.motor||item.power||\'—\'}</span></div></td>\n            <td><div class="td-specs-row"><span class="td-spec-chip">Año: ${item.year||\'—\'}</span></div></td>\n            <td><div style="display:flex; align-items:center;">$2</td>\n            <td>${statusBadge}</td>\n            <td>${visBadge}</td>';

adminJs = adminJs.replace(regex, newRow);

fs.writeFileSync('admin/admin.js', adminJs);
console.log('CRM Table rows updated');

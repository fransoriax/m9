const fs = require('fs');
let adminJs = fs.readFileSync('admin/admin.js', 'utf8');

const oldHeader = '<th>Capacidad</th><th>Motorización</th><th>Precio</th>\r\n        <th>Estado</th><th>Web</th><th>Acciones</th>';
const newHeader = '<th>Capacidad</th><th>Motorización</th><th>Año</th><th>Precio</th>\r\n        <th>Estado</th><th>Web</th><th>Acciones</th>';

adminJs = adminJs.replace(oldHeader, newHeader);

const oldRow = '<td><div class="td-specs-row"><span class="td-spec-chip">Capacidad: ${item.capacity||\'—\'}</span> <span class="td-spec-chip">Motor: ${item.motor||\'—\'}</span></div></td>\r\n            <td></td>\r\n            <td><div style="display:flex; align-items:center;"><span class="td-price-tag">${item.currency||\'USD\'} ${item.price.toLocaleString(\'es-AR\')}</span>${item.discount > 0 ? `<span style="color:#ffaa00; font-size:0.75rem; font-weight:700; margin-left:6px; background:rgba(255,170,0,0.15); padding:2px 5px; border-radius:4px;">-${item.discount}%</span>` : \'\'}</div></td>\r\n            <td><div class="td-badges-group">${statusBadge} ${visBadge}</div></td>\r\n            <td></td>';

const newRow = '<td><div class="td-specs-row"><span class="td-spec-chip">Capacidad: ${item.capacity||\'—\'}</span></div></td>\r\n            <td><div class="td-specs-row"><span class="td-spec-chip">Motor: ${item.motor||item.power||\'—\'}</span></div></td>\r\n            <td><div class="td-specs-row"><span class="td-spec-chip">Año: ${item.year||\'—\'}</span></div></td>\r\n            <td><div style="display:flex; align-items:center;"><span class="td-price-tag">${item.currency||\'USD\'} ${item.price.toLocaleString(\'es-AR\')}</span>${item.discount > 0 ? `<span style="color:#ffaa00; font-size:0.75rem; font-weight:700; margin-left:6px; background:rgba(255,170,0,0.15); padding:2px 5px; border-radius:4px;">-${item.discount}%</span>` : \'\'}</div></td>\r\n            <td>${statusBadge}</td>\r\n            <td>${visBadge}</td>';

adminJs = adminJs.replace(oldRow, newRow);

fs.writeFileSync('admin/admin.js', adminJs);
console.log('CRM Table updated');

const fs = require('fs');
let code = fs.readFileSync('app_v12.js', 'utf8');

const forkRegex = /<div class="truck-card-mobile-info-v2"[^>]*>\s*<div[^>]*>\$\{fork\.year \|\| new Date\(\)\.getFullYear\(\)\}<\/div>\s*<div[^>]*>Capital Federal - Capital Federal<\/div>\s*<\/div>/g;
const forkNew = `<div class="truck-card-mobile-info-v2" style="display:none; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.6rem;">
                <div style="font-weight: 500; color: var(--text-primary); margin-bottom: 0.2rem; display: flex; gap: 0.4rem; flex-wrap: wrap;">
                  <span style="background: rgba(255,184,0,0.1); color: var(--primary-yellow); padding: 0.15rem 0.4rem; border-radius: 4px;">Año \${fork.year || '-'}</span>
                  <span style="background: rgba(255,255,255,0.05); padding: 0.15rem 0.4rem; border-radius: 4px;">\${fork.specs && fork.specs.hours ? fork.specs.hours + ' hs' : '0 hs'}</span>
                </div>
                <div style="font-size: 0.75rem; line-height: 1.3;">
                  \${fork.motor || 'Motor estándar'} • \${fork.capacity || 'Sin cap. especificada'}
                </div>
              </div>`;

const truckRegex = /<div class="truck-card-mobile-info-v2"[^>]*>\s*<div[^>]*>\$\{truck\.year \|\| new Date\(\)\.getFullYear\(\)\}<\/div>\s*<div[^>]*>Capital Federal - Capital Federal<\/div>\s*<\/div>/g;
const truckNew = `<div class="truck-card-mobile-info-v2" style="display:none; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.6rem;">
                <div style="font-weight: 500; color: var(--text-primary); margin-bottom: 0.2rem; display: flex; gap: 0.4rem; flex-wrap: wrap;">
                  <span style="background: rgba(255,184,0,0.1); color: var(--primary-yellow); padding: 0.15rem 0.4rem; border-radius: 4px;">Año \${truck.year || '-'}</span>
                  <span style="background: rgba(255,255,255,0.05); padding: 0.15rem 0.4rem; border-radius: 4px;">\${truck.specs && truck.specs.hours ? truck.specs.hours : '0 km'}</span>
                </div>
                <div style="font-size: 0.75rem; line-height: 1.3;">
                  \${truck.power || 'Potencia estándar'} • \${truck.capacity || 'Sin cap. especificada'}
                </div>
              </div>`;

code = code.replace(forkRegex, forkNew);
code = code.replace(truckRegex, truckNew);

fs.writeFileSync('app_v12.js', code);
console.log('Mobile info updated in app_v12.js');

const fs = require('fs');
let code = fs.readFileSync('app_v12.js', 'utf8');

const oldLookup = 'const allEquip = [...(parsedDB.autoelevadores || []), ...(parsedDB.camiones || [])];';
const newLookup = 'const allEquip = [...(parsedDB.autoelevadores || []), ...(parsedDB.camiones || [])];\n      console.log("[DEBUG] ID buscado:", id, "| Items:", allEquip.length, "| Primeros IDs:", JSON.stringify(allEquip.slice(0,5).map(e => e.id)));';

const count = (code.split(oldLookup).length - 1);
console.log('Found', count, 'occurrences');

if (count > 0) {
  code = code.replace(oldLookup, newLookup);
  fs.writeFileSync('app_v12.js', code);
  console.log('Added debug logging');
}

const fs = require('fs');
let clientJS = fs.readFileSync('supabase-client.js', 'utf8');

const regex = /let currentDBStr = null;[\s\S]*?let currentDB = \{\};\s*catch\(e\) \{\}\s*\}/g;
const replacement = `let currentDB = {};\n        try {\n          currentDB = await global.M9Cache.get('m9-inventory-db') || {};\n        } catch(e) {}`;

clientJS = clientJS.replace(regex, replacement);

fs.writeFileSync('supabase-client.js', clientJS);
console.log('Fixed supabase-client.js');

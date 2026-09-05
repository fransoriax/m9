const fs = require('fs');
let code = fs.readFileSync('app_v12.js', 'utf8');

// Find and replace the broken forEach block for autoelevadores
const brokenBlock = `        parsedDB.autoelevadores.forEach(crmItem => {
          if (crmItem.visible !== false && crmItem.status !== 'paused') {
              year: crmItem.year || (staticMatch ? staticMatch.year : 2025),
              condition: crmItem.hours > 0 ? "Usado" : (crmItem.condition || (staticMatch ? staticMatch.condition : "Nuevo")),
              price: crmItem.price !== undefined ? crmItem.price : (staticMatch ? staticMatch.price : 25000),
              currency: crmItem.currency || 'USD',
              discount: crmItem.discount || 0,
              image: crmItem.img ? crmItem.img.replace('../', '').replace(/^\\//, '') : (staticMatch ? staticMatch.image : "assets/diesel_forklift.png"),
              description: staticMatch ? staticMatch.description : \`Equipo de elevación industrial \${crmItem.brand} \${crmItem.name}.\`,
              specs: staticMatch ? staticMatch.specs : {
                engine: crmItem.motor || "Convencional",
                transmission: "Powershift",
                hours: crmItem.hours ? \`\${crmItem.hours} hs\` : "0 hs"
              }
            });
          }
        });`;

const fixedBlock = `        parsedDB.autoelevadores.forEach(crmItem => {
          if (crmItem.visible !== false && crmItem.status !== 'paused') {
            let capKg = 2500;
            if (crmItem.capacity) {
              const numMatch = String(crmItem.capacity).replace('.', '').match(/\\d+/);
              if (numMatch) capKg = parseInt(numMatch[0]);
            }
            allEquipments.push({
              id: \`auto-\${crmItem.id}\`,
              name: crmItem.name,
              brand: crmItem.brand,
              type: crmItem.type || "Autoelevador",
              capacity: capKg,
              height: crmItem.height || 4.5,
              hours: crmItem.hours || 0,
              motor: crmItem.motor || '',
              year: crmItem.year || 2025,
              condition: crmItem.hours > 0 ? "Usado" : (crmItem.condition || "Nuevo"),
              price: crmItem.price !== undefined ? crmItem.price : 25000,
              currency: crmItem.currency || 'USD',
              discount: crmItem.discount || 0,
              image: crmItem.img ? crmItem.img.replace('../', '').replace(/^\\//, '') : "assets/diesel_forklift.png",
              description: \`Equipo de elevación industrial \${crmItem.brand} \${crmItem.name}.\`,
              specs: {
                engine: crmItem.motor || "Convencional",
                transmission: "Powershift",
                hours: crmItem.hours ? \`\${crmItem.hours} hs\` : "0 hs"
              }
            });
          }
        });`;

if (code.includes(brokenBlock)) {
  code = code.replace(brokenBlock, fixedBlock);
  console.log('Replaced autoelevadores block successfully');
} else {
  // Try a more targeted approach - find and replace the broken lines
  const lines = code.split('\n');
  const startIdx = lines.findIndex(l => l.includes("parsedDB.autoelevadores.forEach(crmItem =>"));
  const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes("});") && lines[i+1] && lines[i+1].includes("});"));
  
  if (startIdx !== -1 && endIdx !== -1) {
    const before = lines.slice(0, startIdx).join('\n');
    const after = lines.slice(endIdx + 2).join('\n');
    code = before + '\n' + fixedBlock + '\n' + after;
    console.log(`Replaced from line ${startIdx+1} to ${endIdx+2}`);
  } else {
    console.log('Could not find the block. Current lines around the issue:');
    lines.slice(325, 345).forEach((l, i) => console.log(326+i + ': ' + l));
  }
}

fs.writeFileSync('app_v12.js', code);

const fs = require('fs');
let code = fs.readFileSync('app_v12.js', 'utf8');

// ── FIX 1: initDetailPage - read ID from hash fragment first ───────────────
const oldUrlParse = `  console.log("[DETAIL] URL completa:", window.location.href);\r\n  console.log("[DETAIL] search:", window.location.search);\r\n  const urlParams = new URLSearchParams(window.location.search);\r\n  const id = urlParams.get("id") || "toyota-8fg25";\r\n  console.log("[DETAIL] id param:", urlParams.get("id"), "| id final:", id);`;

const newUrlParse = `  const urlParams = new URLSearchParams(window.location.search);
  // Hash fragment (#crm-auto-5) is preferred because serve/vercel's cleanUrls
  // strips query params on redirect; hash is never touched by servers.
  const hashId = window.location.hash ? decodeURIComponent(window.location.hash.substring(1)) : null;
  const id = hashId || urlParams.get("id") || "toyota-8fg25";`;

let applied = false;
if (code.includes(oldUrlParse)) {
  code = code.replace(oldUrlParse, newUrlParse);
  applied = true;
  console.log('✔ FIX 1: hash-based ID reading applied');
} else {
  // Try without \r\n
  const oldUrlParse2 = `  console.log("[DETAIL] URL completa:", window.location.href);\n  console.log("[DETAIL] search:", window.location.search);\n  const urlParams = new URLSearchParams(window.location.search);\n  const id = urlParams.get("id") || "toyota-8fg25";\n  console.log("[DETAIL] id param:", urlParams.get("id"), "| id final:", id);`;
  if (code.includes(oldUrlParse2)) {
    code = code.replace(oldUrlParse2, newUrlParse);
    applied = true;
    console.log('✔ FIX 1 (LF): hash-based ID reading applied');
  } else {
    // Fallback: just replace the id line
    const fallback1 = 'const id = urlParams.get("id") || "toyota-8fg25";';
    if (code.includes(fallback1)) {
      const newFallback1 = `const hashId = window.location.hash ? decodeURIComponent(window.location.hash.substring(1)) : null;
  const id = hashId || urlParams.get("id") || "toyota-8fg25";`;
      code = code.replace(fallback1, newFallback1);
      applied = true;
      console.log('✔ FIX 1 (fallback): hash-based ID reading applied');
    }
  }
}

if (!applied) {
  console.log('✘ FIX 1 not applied');
  const idx = code.indexOf('async function initDetailPage');
  if (idx !== -1) console.log(JSON.stringify(code.substring(idx, idx+500)));
}

// ── FIX 2: Also remove any remaining debug console.logs from detail page ───
code = code.replace(/\s*console\.log\("\[DEBUG\][^"]*",[^;]+\);/g, '');
code = code.replace(/\s*console\.log\("\[DETAIL\][^"]*",[^;]+\);/g, '');

// ── FIX 3: Catalog - change Ver Detalle links to use hash ─────────────────
// For autoelevadores (fork)
const oldForkLink = '`detalle.html?id=${fork.id}&cb=${Date.now()}`';
const newForkLink = '`detalle.html#${fork.id}`';
const forkCount = code.split(oldForkLink).length - 1;
code = code.split(oldForkLink).join(newForkLink);
console.log('✔ FIX 3: fork links updated:', forkCount, 'occurrences');

// Also update data-url attribute on card for consistency
const oldForkDataUrl = 'card.setAttribute("data-url", `detalle.html?id=${fork.id}`);';
const newForkDataUrl = 'card.setAttribute("data-url", `detalle.html#${fork.id}`);';
if (code.includes(oldForkDataUrl)) {
  code = code.replace(oldForkDataUrl, newForkDataUrl);
  console.log('✔ FIX 3b: fork data-url updated');
}

// ── FIX 4: Camiones - change Ver Detalle links to use hash ────────────────
const oldTruckLink = '`detalle.html?id=${truck.id}&cb=${Date.now()}`';
const newTruckLink = '`detalle.html#${truck.id}`';
const truckCount = code.split(oldTruckLink).length - 1;
code = code.split(oldTruckLink).join(newTruckLink);
console.log('✔ FIX 4: truck links updated:', truckCount, 'occurrences');

const oldTruckDataUrl = 'card.setAttribute("data-url", `detalle.html?id=${truck.id}`);';
const newTruckDataUrl = 'card.setAttribute("data-url", `detalle.html#${truck.id}`);';
if (code.includes(oldTruckDataUrl)) {
  code = code.replace(oldTruckDataUrl, newTruckDataUrl);
  console.log('✔ FIX 4b: truck data-url updated');
}

fs.writeFileSync('app_v12.js', code);
console.log('\nDone. Checking syntax...');

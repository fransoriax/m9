const fs = require('fs');
let code = fs.readFileSync('app_v12.js', 'utf8');

// Add full URL log at the very start of initDetailPage
const target = 'async function initDetailPage() {\n  const urlParams = new URLSearchParams(window.location.search);\n  const id = urlParams.get("id") || "toyota-8fg25";';
const replacement = 'async function initDetailPage() {\n  console.log("[DETAIL] URL completa:", window.location.href);\n  console.log("[DETAIL] search:", window.location.search);\n  const urlParams = new URLSearchParams(window.location.search);\n  const id = urlParams.get("id") || "toyota-8fg25";\n  console.log("[DETAIL] id param:", urlParams.get("id"), "| id final:", id);';

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('app_v12.js', code);
  console.log('URL debug added');
} else {
  // Try with \r\n
  const target2 = 'async function initDetailPage() {\r\n  const urlParams = new URLSearchParams(window.location.search);\r\n  const id = urlParams.get("id") || "toyota-8fg25";';
  if (code.includes(target2)) {
    code = code.replace(target2, replacement.replace(/\n/g, '\r\n'));
    fs.writeFileSync('app_v12.js', code);
    console.log('URL debug added (CRLF)');
  } else {
    console.log('NOT FOUND - trying fuzzy match');
    const idx = code.indexOf('async function initDetailPage');
    if (idx !== -1) {
      console.log(JSON.stringify(code.substring(idx, idx+200)));
    }
  }
}

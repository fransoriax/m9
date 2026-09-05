const fs = require('fs');
let code = fs.readFileSync('app_v12.js', 'utf8');

// 1. Add removal of not-found-msg to the cleanup section
const cleanupRegex = /const layout = document\.querySelector\("\.detail-layout"\);\s*if \(layout\) layout\.style\.display = '';/;
const cleanupReplacement = `const layout = document.querySelector(".detail-layout");
  if (layout) layout.style.display = '';
  const notFoundMsg = document.getElementById("not-found-msg");
  if (notFoundMsg) notFoundMsg.remove();`;

code = code.replace(cleanupRegex, cleanupReplacement);

// 2. Replace the destructive innerHTML with a non-destructive insertBefore
const notFoundRegex = /document\.querySelector\("\.detail-layout"\)\.innerHTML = `[\s\S]*?Volver al Catǭlogo<\/a>\s*<\/div>\s*`;/;
const notFoundReplacement = `const dl = document.querySelector(".detail-layout");
    dl.style.display = 'none';
    if (!document.getElementById("not-found-msg")) {
      const msg = document.createElement("div");
      msg.id = "not-found-msg";
      msg.innerHTML = \`<div style="grid-column: 1/-1; text-align: center; padding: 8rem 0;">
        <h2>Unidad no encontrada</h2>
        <p style="margin-bottom: 2rem;">El equipo especificado no se encuentra en nuestro cat\u00E1logo activo.</p>
        <a href="catalog.html" class="btn btn-primary">Volver al Cat\u00E1logo</a>
      </div>\`;
      dl.parentNode.insertBefore(msg, dl);
    }`;

code = code.replace(notFoundRegex, notFoundReplacement);

fs.writeFileSync('app_v12.js', code);
console.log('Fixed detail page crash on slow load');

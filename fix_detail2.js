const fs = require('fs');
let code = fs.readFileSync('app_v12.js', 'utf8');

const targetStr = `document.querySelector(".detail-layout").innerHTML = \`
      <div style="grid-column: 1/-1; text-align: center; padding: 8rem 0;">
        <h2>Unidad no encontrada</h2>
        <p style="margin-bottom: 2rem;">El equipo especificado no se encuentra en nuestro cat\u00E1logo activo.</p>
        <a href="catalog.html" class="btn btn-primary">Volver al Cat\u00E1logo</a>
      </div>
    \`;`;

const replacementStr = `const dl = document.querySelector(".detail-layout");
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

// let's do a substring replace to avoid regex issues
const regex2 = /document\.querySelector\("\.detail-layout"\)\.innerHTML = `[^`]+`;/g;
code = code.replace(regex2, replacementStr);

fs.writeFileSync('app_v12.js', code);
console.log('Fixed detail page crash on slow load (part 2)');

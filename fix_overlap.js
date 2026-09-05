const fs = require('fs');

// 1. Modify HTML
let html = fs.readFileSync('detalle.html', 'utf8');

const targetHTML = `          <!-- Quote Form Container -->
          <div class="quote-form-container">`;

const replacementHTML = `          <!-- Sticky Sidebar Wrapper -->
          <div class="detail-sticky-sidebar">
          <!-- Quote Form Container -->
          <div class="quote-form-container">`;

const targetEndHTML = `          <!-- PDF Download Box -->
          <div class="pdf-download-box">
            <div class="pdf-info">
              <div class="pdf-icon">📄</div>
              <div>
                <div class="pdf-name">Manual & Ficha Técnica</div>
                <div class="pdf-size">PDF • 2.4 MB</div>
                <div class="progress-bar-container">
                  <div class="progress-bar"></div>
                </div>
              </div>
            </div>
            <button id="pdf-download-btn" class="btn btn-outline-yellow" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
              Descargar
            </button>
          </div>

        </div>`;

const replacementEndHTML = `          <!-- PDF Download Box -->
          <div class="pdf-download-box">
            <div class="pdf-info">
              <div class="pdf-icon">📄</div>
              <div>
                <div class="pdf-name">Manual & Ficha Técnica</div>
                <div class="pdf-size">PDF • 2.4 MB</div>
                <div class="progress-bar-container">
                  <div class="progress-bar"></div>
                </div>
              </div>
            </div>
            <button id="pdf-download-btn" class="btn btn-outline-yellow" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
              Descargar
            </button>
          </div>
          </div> <!-- End detail-sticky-sidebar -->

        </div>`;

if (html.includes(targetHTML)) {
  html = html.replace(targetHTML, replacementHTML);
  html = html.replace(targetEndHTML, replacementEndHTML);
  fs.writeFileSync('detalle.html', html);
  console.log('HTML updated');
} else {
  console.log('HTML not updated');
}

// 2. Modify CSS
let css = fs.readFileSync('styles.css', 'utf8');

const quoteStickyCSS = `.quote-form-container {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 2.5rem;
  position: sticky;
  top: 100px;
}`;

// I know there might be different formatting, let's just do a regex replace for the position: sticky.
// Wait, I will just append the new class and remove the old sticky from quote-form-container
css = css.replace(/position:\s*sticky;\s*top:\s*100px;/g, '');
css += `
/* Fix for sticky Quote Form overlapping PDF Box */
.detail-sticky-sidebar {
  position: sticky;
  top: 100px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
@media (max-width: 1200px) {
  .detail-sticky-sidebar {
    position: static;
  }
}
`;

fs.writeFileSync('styles.css', css);
console.log('CSS updated');

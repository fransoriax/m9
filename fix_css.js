const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const targetCSS = `.quote-form-container {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 2.5rem;
  position: sticky;
  top: 100px;
}`;

const newCSS = `.quote-form-container {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 2.5rem;
}`;

if (css.includes(targetCSS)) {
  css = css.replace(targetCSS, newCSS);
} else {
  // Try CRLF
  const targetCSSCRLF = targetCSS.replace(/\n/g, '\r\n');
  if (css.includes(targetCSSCRLF)) {
    css = css.replace(targetCSSCRLF, newCSS.replace(/\n/g, '\r\n'));
  }
}

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
console.log('styles.css properly updated');

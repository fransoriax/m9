const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const fixCSS = `
/* Fix for quote form overflowing on mobile */
@media (max-width: 768px) {
  .quote-form-container {
    padding: 1.5rem 1rem !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    overflow: hidden;
  }
  .pdf-download-box {
    padding: 1rem !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    overflow: hidden;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .detail-sticky-sidebar {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    overflow: hidden;
  }
  #detail-quote-form .btn {
    white-space: normal !important;
    height: auto !important;
    padding: 0.8rem 1rem !important;
  }
  #detail-whatsapp-direct {
    white-space: normal !important;
    height: auto !important;
    padding: 0.8rem 1rem !important;
    text-align: center !important;
  }
}
`;

css += fixCSS;
fs.writeFileSync('styles.css', css);

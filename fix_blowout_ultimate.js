const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const fixCSS = `
/* Global blowout prevention for mobile */
@media (max-width: 768px) {
  body, html {
    max-width: 100vw;
    overflow-x: hidden;
  }
  .detail-specs-grid {
    grid-template-columns: 1fr !important; /* Stack specs on mobile to avoid blowout */
    gap: 0.8rem !important;
  }
  .quote-form-container {
    padding: 1.2rem !important;
  }
  .pdf-download-box {
    padding: 1.2rem !important;
  }
  .btn {
    white-space: normal !important;
    word-wrap: break-word !important;
    height: auto !important;
    min-height: 44px;
  }
  #detail-whatsapp-direct, #modal-whatsapp-direct {
    white-space: normal !important;
    word-wrap: break-word !important;
    height: auto !important;
    min-height: 44px;
  }
  .gallery-thumbnails {
    width: 100vw !important; /* Let it stretch full screen width */
    margin-left: -1.2rem; /* Pull it out of the container padding */
    padding-left: 1.2rem !important; /* Add padding inside so first thumb aligns */
    padding-right: 1.2rem !important; /* Add padding so last thumb doesn't hug edge */
    box-sizing: border-box !important;
  }
}
`;

css += fixCSS;
fs.writeFileSync('styles.css', css);

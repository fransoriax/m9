const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const mobileFix = `
/* Fix for grid blowout on mobile */
@media (max-width: 1200px) {
  .catalog-layout > *, .parts-layout > *, .detail-layout > * {
    min-width: 0 !important;
  }
  .detail-layout {
    display: flex !important;
    flex-direction: column !important;
  }
}
@media (max-width: 768px) {
  .detail-layout {
    overflow: hidden !important;
    max-width: 100vw !important;
    box-sizing: border-box !important;
  }
}
`;

css += mobileFix;
fs.writeFileSync('styles.css', css);

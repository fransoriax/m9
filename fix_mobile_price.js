const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const fixCSS = `
/* Fix mobile price wrapping on cards */
@media (max-width: 768px) {
  .truck-card-price-wrap-v2 {
    flex-shrink: 1 !important;
    min-width: 0 !important;
  }
  .truck-card-price-val-v2 {
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: baseline !important;
    gap: 0.2rem 0.5rem !important;
  }
  .truck-card-price-val-v2 .price-original {
    margin-right: 0 !important;
  }
}
`;

css += fixCSS;
fs.writeFileSync('styles.css', css);
console.log('Added price wrap fix to CSS');

const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const fixCSS = `
/* Fix truck card height on mobile to allow expanding when prices wrap */
@media (max-width: 768px) {
  .truck-card-v2 {
    height: auto !important;
    min-height: 195px;
    align-items: stretch;
  }
  .truck-card-v2 .product-card-img-wrapper {
    height: auto !important;
    align-self: stretch;
  }
}
`;

css += fixCSS;
fs.writeFileSync('styles.css', css);
console.log('Added truck card height fix to CSS');

const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

css += `
@media (max-width: 768px) {
  .detail-info {
    width: 100% !important;
    max-width: 100% !important;
    overflow: hidden;
    box-sizing: border-box;
  }
}
`;

fs.writeFileSync('styles.css', css);

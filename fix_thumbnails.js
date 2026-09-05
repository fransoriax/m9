const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

css += `
/* Fix for gallery thumbnails breaking grid on mobile */
@media (max-width: 768px) {
  .detail-gallery {
    min-width: 0 !important; /* Prevents grid blowout */
  }
  .gallery-thumbnails {
    padding-bottom: 0.5rem !important; /* Room for scrollbar */
    /* Ensure no flex parent blowout */
    width: 100% !important;
    max-width: 100vw !important;
  }
  .gallery-thumb {
    flex: 0 0 80px !important; /* Don't shrink, exact width */
    height: 60px !important;
  }
}
`;

fs.writeFileSync('styles.css', css);

const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

const mobileDetailFix = `
@media (max-width: 768px) {
  .detail-gallery {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }
  .gallery-main {
    width: 100%;
    max-width: 100%;
    aspect-ratio: 4/3;
    overflow: hidden;
  }
  .gallery-main img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .gallery-thumbnails {
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
  }
  .detail-layout {
    overflow: hidden;
    width: 100%;
  }
}
`;

css += mobileDetailFix;
fs.writeFileSync('styles.css', css);
console.log('Mobile detail gallery fix applied');

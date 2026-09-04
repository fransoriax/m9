const fs = require('fs');
let code = fs.readFileSync('app_v12.js', 'utf8');

// Replace fork title
code = code.replace(
  '<h3 class="product-card-title truck-card-title-v2" style="font-size:1.1rem; font-weight:700; color:var(--text-primary); margin-bottom: 0.5rem; line-height:1.3;">${fork.name}</h3>',
  '<h3 class="product-card-title truck-card-title-v2" style="font-size:1.1rem; font-weight:700; color:var(--text-primary); margin-bottom: 0.5rem; line-height:1.3; min-height:2.9rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${fork.name}</h3>'
);

// Replace truck title
code = code.replace(
  '<h3 class="product-title truck-card-title-v2" style="font-family:var(--font-headings); font-size:1.15rem; font-weight:700; color:var(--text-primary); margin-bottom: 0.8rem; line-height:1.3;">${truck.name}</h3>',
  '<h3 class="product-title truck-card-title-v2" style="font-family:var(--font-headings); font-size:1.15rem; font-weight:700; color:var(--text-primary); margin-bottom: 0.8rem; line-height:1.3; min-height:3rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${truck.name}</h3>'
);

fs.writeFileSync('app_v12.js', code);
console.log('Fixed titles in app_v12.js');

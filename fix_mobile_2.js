const fs = require('fs');
let code = fs.readFileSync('app_v12.js', 'utf8');

// Fix fork hours logic
const forkRegex = /\$\{fork\.specs && fork\.specs\.hours \? fork\.specs\.hours \+ ' hs' : '0 hs'\}/g;
code = code.replace(forkRegex, "${fork.hours ? fork.hours + ' hs' : '0 hs'}");

fs.writeFileSync('app_v12.js', code);
console.log('Fixed fork hours in app_v12.js');

let css = fs.readFileSync('styles.css', 'utf8');

// Increase card height to 195px
css = css.replace(/height: 175px;/g, 'height: 195px;');

fs.writeFileSync('styles.css', css);
console.log('Increased card height in styles.css');

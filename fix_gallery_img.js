const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

// The goal is to make .gallery-main bulletproof regarding its aspect ratio.
// I'll replace the .gallery-main img rule block and also the mobile specific ones.

const blockDesktop = `.gallery-main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition-smooth);
}`;

const blockDesktopReplacement = `.gallery-main img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition-smooth);
}`;

const blockMobile = `.gallery-main img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }`;

const blockMobileReplacement = `.gallery-main img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }`;

if (css.includes(blockDesktop)) {
  css = css.replace(blockDesktop, blockDesktopReplacement);
  console.log("Desktop img replaced (LF)");
} else {
  // Try CRLF
  if (css.includes(blockDesktop.replace(/\n/g, '\r\n'))) {
    css = css.replace(blockDesktop.replace(/\n/g, '\r\n'), blockDesktopReplacement.replace(/\n/g, '\r\n'));
    console.log("Desktop img replaced (CRLF)");
  }
}

if (css.includes(blockMobile)) {
  css = css.replace(blockMobile, blockMobileReplacement);
  console.log("Mobile img replaced (LF)");
} else {
  // Try CRLF
  if (css.includes(blockMobile.replace(/\n/g, '\r\n'))) {
    css = css.replace(blockMobile.replace(/\n/g, '\r\n'), blockMobileReplacement.replace(/\n/g, '\r\n'));
    console.log("Mobile img replaced (CRLF)");
  }
}

fs.writeFileSync('styles.css', css);

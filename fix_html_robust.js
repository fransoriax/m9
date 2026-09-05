const fs = require('fs');
let html = fs.readFileSync('detalle.html', 'utf8');

const qStartStr = '<!-- Quote Form Container -->';
const qIdx = html.indexOf(qStartStr);

const pEndStr = 'Descargar\n            </button>\n          </div>';
const pEndStrAlt = 'Descargar\r\n            </button>\r\n          </div>';

let pIdx = html.indexOf(pEndStr, qIdx);
let endStr = pEndStr;
if (pIdx === -1) {
    pIdx = html.indexOf(pEndStrAlt, qIdx);
    endStr = pEndStrAlt;
}

if (qIdx !== -1 && pIdx !== -1) {
    const pEndFull = pIdx + endStr.length;
    const before = html.substring(0, qIdx);
    const content = html.substring(qIdx, pEndFull);
    const after = html.substring(pEndFull);
    
    // Wrap the content
    const newHtml = before + '<div class="detail-sticky-sidebar">\n          ' + content + '\n          </div> <!-- End detail-sticky-sidebar -->' + after;
    fs.writeFileSync('detalle.html', newHtml);
    console.log('HTML wrapped successfully');
} else {
    console.log('Could not find boundaries for HTML wrap');
}

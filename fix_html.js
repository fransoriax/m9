const fs = require('fs');
let html = fs.readFileSync('detalle.html', 'utf8');

const quoteStart = '<!-- Quote Form Container -->';
const pdfEnd = '</div>\n          </div>\n        </section>';
const pdfEndAlt = '</div>\r\n          </div>\r\n        </section>';

const qIdx = html.indexOf(quoteStart);
let pIdx = html.indexOf('</section>', qIdx); // Better to just replace up to section end

if (qIdx !== -1 && pIdx !== -1) {
    const before = html.substring(0, qIdx);
    const content = html.substring(qIdx, pIdx);
    const after = html.substring(pIdx);
    
    // We are grabbing everything from quoteStart until the end of the section, but wait...
    // The section ends with </div> (pdf-download-box) then </div> (detail-info) then </section>
}

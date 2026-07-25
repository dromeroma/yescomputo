/* eslint-disable */
/**
 * Injects real Form-Control checkboxes into the "Vendido" column (G) of the
 * inventory workbook, via a legacy VML drawing. Each checkbox is linked to its
 * own cell (FmlaLink $G$r), so toggling it sets TRUE/FALSE there — which drives
 * the red/strikethrough conditional formatting. Works in Excel (all versions)
 * and LibreOffice.
 *
 * Run AFTER build-inventory-xlsx.cjs.
 * Usage: node tools/add-checkboxes.cjs
 */
const path = require('path');
const AdmZip = require('adm-zip');

const FILE = path.resolve(__dirname, '..', '..', 'Productos', '20260617', 'Inventario_lote_20260617.xlsx');
const FIRST = 4; // first data row (Excel 1-based)
const LAST = 25; // last data row

const zip = new AdmZip(FILE);

// 1) VML drawing with one checkbox shape per data row -------------------------
let shapes = '';
for (let R = FIRST; R <= LAST; R++) {
  const sid = 1024 + (R - FIRST + 1); // 1025, 1026, ...
  const row0 = R - 1; // 0-based row index for the anchor
  const marginTop = 76 + (R - FIRST) * 46 + 14; // pt, approx; Excel uses the anchor
  shapes +=
    `<v:shape id="_x0000_s${sid}" type="#_x0000_t201" ` +
    `style='position:absolute;margin-left:966pt;margin-top:${marginTop}pt;width:16pt;height:16pt;` +
    `mso-wrap-style:square;v-text-anchor:middle' o:button="t" fillcolor="window [65]" ` +
    `strokecolor="windowText [64]">` +
    `<v:fill color2="window [65]"/>` +
    `<o:lock v:ext="edit" rotation="t"/>` +
    `<v:textbox style='mso-direction-alt:auto' o:singleclick="f"><div style='text-align:left'></div></v:textbox>` +
    `<x:ClientData ObjectType="Checkbox">` +
    `<x:Anchor>6, 36, ${row0}, 12, 6, 56, ${row0}, 32</x:Anchor>` +
    `<x:AutoFill>False</x:AutoFill>` +
    `<x:FmlaLink>$G$${R}</x:FmlaLink>` +
    `<x:Checked>0</x:Checked>` +
    `<x:NoThreeD/>` +
    `</x:ClientData>` +
    `</v:shape>`;
}
const vml =
  `<xml xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" ` +
  `xmlns:x="urn:schemas-microsoft-com:office:excel">` +
  `<o:shapelayout v:ext="edit"><o:idmap v:ext="edit" data="1"/></o:shapelayout>` +
  `<v:shapetype id="_x0000_t201" coordsize="21600,21600" o:spt="201" path="m,l,21600r21600,l21600,xe">` +
  `<v:stroke joinstyle="miter"/>` +
  `<v:path shadowok="f" o:extrusionok="f" gradientshapeok="t" o:connecttype="rect"/>` +
  `<o:lock v:ext="edit" shapetype="t"/>` +
  `</v:shapetype>${shapes}</xml>`;
zip.addFile('xl/drawings/vmlDrawing1.vml', Buffer.from(vml, 'utf8'));

// 2) Sheet relationships → point to the VML drawing --------------------------
const sheetRels =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` +
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
  `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/vmlDrawing" ` +
  `Target="../drawings/vmlDrawing1.vml"/>` +
  `</Relationships>`;
zip.addFile('xl/worksheets/_rels/sheet1.xml.rels', Buffer.from(sheetRels, 'utf8'));

// 3) Reference the legacy drawing from the worksheet -------------------------
let sheet = zip.readAsText('xl/worksheets/sheet1.xml');
if (!sheet.includes('<legacyDrawing')) {
  sheet = sheet.replace('</worksheet>', '<legacyDrawing r:id="rId1"/></worksheet>');
}
zip.updateFile('xl/worksheets/sheet1.xml', Buffer.from(sheet, 'utf8'));

// 4) Content types: vml Default is already present (verified) ----------------
let ct = zip.readAsText('[Content_Types].xml');
if (!ct.includes('Extension="vml"')) {
  ct = ct.replace(
    '</Types>',
    '<Default Extension="vml" ContentType="application/vnd.openxmlformats-officedocument.vmlDrawing"/></Types>'
  );
  zip.updateFile('[Content_Types].xml', Buffer.from(ct, 'utf8'));
}

zip.writeZip(FILE);
console.log(`Casillas insertadas (${LAST - FIRST + 1}) → ${FILE}`);

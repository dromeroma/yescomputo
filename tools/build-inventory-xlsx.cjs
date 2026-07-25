/* eslint-disable */
/**
 * Yes Computo — inventory / "sold" tracker for the 2026-06-17 lot.
 *
 * Builds an Excel file listing every product image with its description and a
 * "Vendido" column ready to be checked off. Second-hand units are usually
 * one-of-a-kind, so when one is sold it gets marked here and must be pulled
 * from the website.
 *
 * Output: ../Productos/20260617/Inventario_lote_20260617.xlsx
 * Usage:  node tools/build-inventory-xlsx.cjs
 */
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const PRODUCTS = path.resolve(__dirname, '..', 'src', 'app', 'core', 'data', 'fixtures', 'products.json');
const OUT_DIR = path.resolve(__dirname, '..', '..', 'Productos', '20260617');
const OUT = path.join(OUT_DIR, 'Inventario_lote_20260617.xlsx');

const products = JSON.parse(fs.readFileSync(PRODUCTS, 'utf8'));
// Sort by image filename so it matches equipo-01..22
const rows = products
  .map((p) => ({
    imagen: (p.images?.[0]?.url || '').split('/').pop(),
    equipo: p.name,
    marca: p.brandName,
    condicion: p.condition === 'nuevo' ? 'Nuevo' : 'Reacondicionado',
    descripcion: p.description,
    precio: p.price,
  }))
  .sort((a, b) => a.imagen.localeCompare(b.imagen));

const BRAND = 'FF8BC220'; // lime
const INK = 'FF0A1020';
const RED = 'FFE11D2A';
const RED_BG = 'FFFCE4E6';

(async () => {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Yes Computo';
  wb.created = new Date(2026, 5, 17);
  const ws = wb.addWorksheet('Inventario', {
    views: [{ state: 'frozen', ySplit: 3 }],
    pageSetup: { fitToPage: true, orientation: 'landscape' },
  });

  // Columns
  ws.columns = [
    { key: 'imagen', width: 18 },
    { key: 'equipo', width: 40 },
    { key: 'marca', width: 12 },
    { key: 'condicion', width: 18 },
    { key: 'descripcion', width: 70 },
    { key: 'precio', width: 16 },
    { key: 'vendido', width: 12 },
  ];

  // Title row
  ws.mergeCells('A1:G1');
  const title = ws.getCell('A1');
  title.value = 'YES COMPUTO · Control de inventario — Lote 2026-06-17';
  title.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  title.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: INK } };
  ws.getRow(1).height = 30;

  // Note row
  ws.mergeCells('A2:G2');
  const note = ws.getCell('A2');
  note.value =
    'Marca la casilla "Vendido" cuando se venda un equipo (son únicos). Las filas vendidas se resaltan en rojo y deben retirarse del sitio web.';
  note.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF555555' } };
  note.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true };
  ws.getRow(2).height = 24;

  // Header row (row 3)
  const headers = ['Imagen', 'Equipo', 'Marca', 'Condición', 'Descripción', 'Precio (COP)', 'Vendido'];
  const headerRow = ws.getRow(3);
  headers.forEach((h, i) => {
    const c = headerRow.getCell(i + 1);
    c.value = h;
    c.font = { bold: true, color: { argb: INK }, size: 11 };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND } };
    c.alignment = { vertical: 'middle', horizontal: i >= 5 ? 'center' : 'left', indent: 1 };
    c.border = { bottom: { style: 'thin', color: { argb: INK } } };
  });
  headerRow.height = 22;

  // Data rows (start at row 4)
  rows.forEach((r) => {
    const row = ws.addRow({
      imagen: r.imagen,
      equipo: r.equipo,
      marca: r.marca,
      condicion: r.condicion,
      descripcion: r.descripcion,
      precio: r.precio,
      vendido: false, // boolean → ready for Excel 365 checkbox
    });
    row.getCell('imagen').font = { name: 'Consolas', size: 10 };
    row.getCell('equipo').font = { bold: true, size: 10 };
    row.getCell('descripcion').alignment = { wrapText: true, vertical: 'top' };
    row.getCell('precio').numFmt = '"$"#,##0';
    row.getCell('precio').alignment = { horizontal: 'right' };
    row.getCell('vendido').alignment = { horizontal: 'center' };
    // Hide the TRUE/FALSE text — a form-control checkbox is overlaid on the cell.
    row.getCell('vendido').numFmt = ';;;';
    ['imagen', 'equipo', 'marca', 'condicion', 'precio', 'vendido'].forEach((k) => {
      row.getCell(k).alignment = { ...row.getCell(k).alignment, vertical: 'middle' };
    });
    row.height = 46;
  });

  const firstData = 4;
  const lastData = 3 + rows.length;

  // (Form-control checkboxes are injected by tools/add-checkboxes.cjs; the
  // underlying cell holds the boolean the checkbox toggles.)

  // Conditional formatting: whole row red + strikethrough when sold (G = TRUE)
  ws.addConditionalFormatting({
    ref: `A${firstData}:G${lastData}`,
    rules: [
      {
        type: 'expression',
        formulae: [`$G${firstData}=TRUE`],
        style: {
          fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: RED_BG } },
          font: { strike: true, color: { argb: RED } },
        },
      },
    ],
  });

  // Light borders for the table
  for (let r = 3; r <= lastData; r++) {
    for (let c = 1; c <= 7; c++) {
      const cell = ws.getRow(r).getCell(c);
      cell.border = {
        ...cell.border,
        left: { style: 'hair', color: { argb: 'FFDDDDDD' } },
        right: { style: 'hair', color: { argb: 'FFDDDDDD' } },
        bottom: { style: 'hair', color: { argb: 'FFE5E5E5' } },
      };
    }
  }

  // Auto filter on the header
  ws.autoFilter = { from: { row: 3, column: 1 }, to: { row: lastData, column: 7 } };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  await wb.xlsx.writeFile(OUT);
  console.log(`Excel generado: ${OUT}`);
  console.log(`Filas: ${rows.length}`);
})();

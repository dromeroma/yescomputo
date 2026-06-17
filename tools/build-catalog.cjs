/* eslint-disable */
/**
 * Yes Computo — catalog builder.
 *
 * Maps the seller's compact `catalogo_22_equipos.json` to the full `Product`
 * model the site consumes, filling everything derivable: brand (identified from
 * the product photos), slug, sku, grouped specs, highlights, and a professional
 * Spanish description. Writes src/app/core/data/fixtures/products.json.
 *
 * Usage:  node tools/build-catalog.cjs
 */
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', '..', 'Productos', '20260617', 'catalogo_22_equipos.json');
const OUT = path.resolve(__dirname, '..', 'src', 'app', 'core', 'data', 'fixtures', 'products.json');

// Brand identified per photo (idTemporal → brand). See image review.
const BRAND_BY_ID = {
  1: 'HP', 2: 'HP', 3: 'Dell', 4: 'ASUS', 5: 'Dell', 6: 'HP', 7: 'Acer',
  8: 'ASUS', 9: 'Acer', 10: 'ASUS', 11: 'HP', 12: 'Lenovo', 13: 'Dell',
  14: 'ASUS', 15: 'ASUS', 16: 'HP', 17: 'HP', 18: 'ASUS', 19: 'ASUS',
  20: 'HP', 21: 'Lenovo', 22: 'Lenovo',
};
// Product line where clearly legible on the device.
const LINE_BY_ID = {
  1: 'ProBook', 4: 'VivoBook 14', 6: 'EliteBook', 7: 'Aspire', 8: 'VivoBook',
  9: 'Aspire 5', 10: 'VivoBook', 14: 'VivoBook Go', 15: 'VivoBook',
  18: 'VivoBook', 19: 'VivoBook', 21: 'IdeaPad S340', 22: 'ThinkBook',
};

const BRAND_ID = { HP: 'br-02', Lenovo: 'br-01', Dell: 'br-03', Acer: 'br-04', ASUS: 'br-05' };
const BRAND_CODE = { HP: 'HP', Dell: 'DL', Acer: 'AC', ASUS: 'AS', Lenovo: 'LN' };
const CATEGORY = {
  'Equipos Reacondicionados': { id: 'cat-04', name: 'Equipos Reacondicionados' },
  'Portátiles Corporativos': { id: 'cat-01', name: 'Portátiles Corporativos' },
};

// Home merchandising
const FEATURED = new Set([1, 3, 6, 9, 13, 22]);
const BESTSELLER = new Set([2, 7, 17, 21]);

const pad2 = (n) => String(n).padStart(2, '0');
const slugify = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/ª|º/g, '').toLowerCase()
    .replace(/["'.]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const tidyScreen = (p) => p.replace(/\s*pulgadas/i, '"').replace(/\s+/g, ' ').trim();

function build(item) {
  const id = item.idTemporal;
  const brand = BRAND_BY_ID[id];
  const line = LINE_BY_ID[id];
  const cat = CATEGORY[item.categoria];
  const isNew = item.condicion === 'nuevo';
  const condition = isNew ? 'nuevo' : 'reacondicionado';
  const sp = item.specs || {};

  // Name: enrich with brand/line unless the source already names the brand.
  const core = item.nombre.replace(/^Port[áa]til\s+/i, '').replace(/^Nuevo\s+/i, '').trim();
  const name = item.nombre.toLowerCase().startsWith(brand.toLowerCase())
    ? item.nombre
    : `${brand}${line ? ' ' + line : ''} ${core}`;
  const slug = `${slugify(name)}-${id}`;

  // Highlights (card bullets)
  const highlights = [];
  if (sp.cpu) highlights.push(sp.cpu);
  if (sp.ram) highlights.push(sp.ram.includes('RAM') ? sp.ram : `${sp.ram} RAM`);
  if (sp.disco) highlights.push(sp.disco);
  if (sp.gpu) highlights.push(`Gráfica dedicada ${sp.gpu}`);
  if (sp.pantalla) highlights.push(`Pantalla ${tidyScreen(sp.pantalla)}`);

  // Grouped spec sheet
  const specs = [];
  if (sp.cpu) specs.push({ group: 'Procesamiento', label: 'Procesador', value: sp.cpu });
  if (sp.ram) specs.push({ group: 'Procesamiento', label: 'Memoria RAM', value: sp.ram });
  if (sp.disco) specs.push({ group: 'Almacenamiento', label: 'Disco', value: sp.disco });
  if (sp.gpu) specs.push({ group: 'Gráficos', label: 'Gráfica', value: `Dedicada ${sp.gpu}` });
  if (sp.pantalla) specs.push({ group: 'Pantalla', label: 'Tamaño', value: tidyScreen(sp.pantalla) });
  specs.push({ group: 'General', label: 'Marca', value: brand });
  specs.push({ group: 'General', label: 'Condición', value: isNew ? 'Nuevo' : 'Reacondicionado certificado' });

  // Description (professional, Spanish — no invented claims)
  const condBlurb = isNew
    ? 'Producto nuevo con garantía de fábrica.'
    : 'Reacondicionado y probado pieza por pieza por nuestros técnicos, listo para rendir muchos años más.';
  const partList = [sp.cpu, sp.ram, sp.disco].filter(Boolean).join(', ');
  const screenBit = sp.pantalla ? ` y pantalla de ${tidyScreen(sp.pantalla)}` : '';
  const description =
    `${item.descripcionBase} ${condBlurb} Equipado con ${partList}${screenBit}. ` +
    `Una opción confiable para trabajo, estudio y productividad diaria, con el respaldo y la garantía de Yes Computo.`;

  return {
    id: `p-${pad2(id)}`,
    slug,
    name,
    tagline: item.descripcionBase,
    description,
    brandId: BRAND_ID[brand],
    brandName: brand,
    categoryId: cat.id,
    categoryName: cat.name,
    ...(line ? { productLine: line } : {}),
    condition,
    sku: `YC-${BRAND_CODE[brand]}-${pad2(id)}`,
    price: item.precio,
    availableForRent: false,
    stockStatus: item.stock > 1 ? 'in_stock' : 'low_stock',
    stockUnits: item.stock,
    images: [
      { url: `/img/products/equipo-${pad2(id)}.webp`, alt: name, primary: true },
    ],
    highlights,
    specs,
    isFeatured: FEATURED.has(id) || undefined,
    isNew: isNew || undefined,
    isBestSeller: BESTSELLER.has(id) || undefined,
    warrantyMonths: isNew ? 12 : 6,
    tags: ['tecnologia-circular', 'empresas', isNew ? 'nuevo' : 'reacondicionado'],
    createdAt: '2026-06-17',
  };
}

const src = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const products = src.map(build);
// Drop undefined keys for clean JSON
const clean = JSON.parse(JSON.stringify(products));
fs.writeFileSync(OUT, JSON.stringify(clean, null, 2) + '\n');
console.log(`Wrote ${clean.length} products → ${path.relative(path.resolve(__dirname, '..'), OUT)}`);
// Quick brand/category tally
const by = (k) => clean.reduce((m, p) => ((m[p[k]] = (m[p[k]] || 0) + 1), m), {});
console.log('Brands:', by('brandName'));
console.log('Categories:', by('categoryName'));

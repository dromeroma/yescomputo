/* eslint-disable */
/**
 * Yes Computo — product image studio pipeline.
 *
 * Takes the raw seller photos (laptop on a cluttered background) and turns each
 * into a clean, consistent ecommerce shot:
 *   1. AI background removal (@imgly) → transparent cutout
 *   2. trim + center on a 4:3 light studio gradient
 *   3. soft contact shadow under the device
 *   4. export optimised .webp
 *
 * Usage:
 *   node tools/process-product-images.cjs            # all images found
 *   node tools/process-product-images.cjs 1,6,9      # subset (by idTemporal)
 *   node tools/process-product-images.cjs 1,6,9 verify   # write to .verify/
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { Resvg } = require('@resvg/resvg-js');
const { removeBackground } = require('@imgly/background-removal-node');

const SRC_DIR = path.resolve(
  __dirname,
  '..',
  '..',
  'Productos',
  '20260617'
);
const OUT_DIR = path.resolve(__dirname, '..', 'public', 'img', 'products');

// Canvas + layout
const W = 1600;
const H = 1200; // 4:3 to match the product card aspect
const DEVICE_W = Math.round(W * 0.8); // device target width on canvas

// Studio background: soft cool-white gradient with a subtle vignette.
function studioBackground() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fdfefe"/>
        <stop offset="0.55" stop-color="#f3f6f9"/>
        <stop offset="1" stop-color="#e9edf2"/>
      </linearGradient>
      <radialGradient id="v" cx="0.5" cy="0.42" r="0.75">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.6"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <rect width="${W}" height="${H}" fill="url(#v)"/>
  </svg>`;
  return new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
}

async function processOne(id, outDir, fileBase) {
  const srcPath = path.join(SRC_DIR, `${id}.jpeg`);
  if (!fs.existsSync(srcPath)) throw new Error(`missing ${srcPath}`);

  // 1) Background removal → transparent PNG (pass a Buffer; Windows abs paths
  // get misparsed as a URL protocol by the loader)
  const inputBuf = fs.readFileSync(srcPath);
  const inputBlob = new Blob([inputBuf], { type: 'image/jpeg' });
  const blob = await removeBackground(inputBlob, {
    output: { format: 'image/png' },
  });
  const cutout = Buffer.from(await blob.arrayBuffer());

  // 2) Trim transparent margins, scale to device width
  const trimmed = await sharp(cutout)
    .trim({ threshold: 12 })
    .resize({
      width: DEVICE_W,
      height: Math.round(H * 0.84),
      fit: 'inside',
      withoutEnlargement: false,
    })
    .toBuffer();
  const dm = await sharp(trimmed).metadata();
  const dw = dm.width,
    dh = dm.height;

  // Center horizontally; sit slightly above vertical centre for the shadow.
  const left = Math.round((W - dw) / 2);
  const top = Math.round((H - dh) / 2) - 30;

  // 3) Soft contact shadow from the device alpha
  const alphaMask = await sharp(trimmed).extractChannel('alpha').toBuffer();
  const shadowMask = await sharp(alphaMask)
    .blur(22)
    .linear(0.42, 0) // lower opacity
    .toBuffer();
  const shadow = await sharp({
    create: { width: dw, height: dh, channels: 3, background: { r: 18, g: 26, b: 40 } },
  })
    .joinChannel(shadowMask)
    .png()
    .toBuffer();

  // 4) Composite: bg → shadow (offset down) → device
  const bg = studioBackground();
  const out = await sharp(bg)
    .composite([
      { input: shadow, left: left + 4, top: top + 26 },
      { input: trimmed, left, top },
    ])
    .webp({ quality: 88 })
    .toBuffer();

  const outPath = path.join(outDir, `${fileBase}.webp`);
  fs.writeFileSync(outPath, out);
  return outPath;
}

(async () => {
  const arg = process.argv[2];
  const mode = process.argv[3];
  const verify = mode === 'verify';
  const outDir = verify ? path.resolve(__dirname, '..', '.verify') : OUT_DIR;
  fs.mkdirSync(outDir, { recursive: true });

  const ids = arg
    ? arg.split(',').map((s) => s.trim())
    : Array.from({ length: 22 }, (_, i) => String(i + 1));

  for (const id of ids) {
    const fileBase = verify ? `prod-${id}` : `equipo-${String(id).padStart(2, '0')}`;
    process.stdout.write(`Processing ${id}... `);
    try {
      const p = await processOne(id, outDir, fileBase);
      console.log('✓', path.basename(p));
    } catch (e) {
      console.log('✗', e.message);
    }
  }
})();

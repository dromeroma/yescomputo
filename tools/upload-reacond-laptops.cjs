/* eslint-disable */
/**
 * Procesa y sube las 4 fotos de portátiles reacondicionados (lote 20260617)
 * a Supabase Storage como products/portatil-reacond-0N.webp (blur-fill 1600×1200).
 * Uso:  node tools/upload-reacond-laptops.cjs
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC_DIR = path.resolve(__dirname, '..', '..', 'Productos', '20260617_YesComputo');
const ENV_PATH = path.resolve(__dirname, '..', '..', 'admin-platform', 'api', '.env');

function readEnv(key) {
  const line = fs.readFileSync(ENV_PATH, 'utf8').split(/\r?\n/).find((l) => l.startsWith(key + '='));
  return line ? line.slice(key.length + 1).trim() : '';
}
const SUPABASE_URL = readEnv('SUPABASE_URL').replace(/\/$/, '');
const SERVICE_KEY = readEnv('SUPABASE_SERVICE_KEY');
const BUCKET = 'product-images';
const W = 1600, H = 1200;

async function blurFill(input) {
  const bg = await sharp(input).resize(W, H, { fit: 'cover' }).blur(40)
    .modulate({ brightness: 1.08, saturation: 1.05 }).toBuffer();
  const fg = await sharp(input).resize(Math.round(W * 0.97), Math.round(H * 0.97), { fit: 'inside' }).toBuffer();
  return sharp(bg).composite([{ input: fg, gravity: 'center' }]).webp({ quality: 86 }).toBuffer();
}

async function upload(pathInBucket, buffer) {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${pathInBucket}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'image/webp', 'x-upsert': 'true' },
    body: buffer,
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 160)}`);
}

(async () => {
  console.log(`Storage: ${SUPABASE_URL}`);
  let ok = 0;
  for (const n of [1, 2, 3, 4]) {
    const src = path.join(SRC_DIR, `${n}.jpeg`);
    const dest = `products/portatil-reacond-0${n}.webp`;
    try {
      const webp = await blurFill(src);
      await upload(dest, webp);
      ok++;
      console.log(`  ok: ${dest}  (${(webp.length / 1024) | 0} KB)`);
    } catch (e) {
      console.log(`  ! ${n}: ${e.message}`);
    }
  }
  console.log(`Listo: ${ok}/4 subidas.`);
})();

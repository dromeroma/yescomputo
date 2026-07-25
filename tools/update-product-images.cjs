/* eslint-disable */
/**
 * Reemplaza las imágenes de producto en Supabase Storage por las definitivas
 * (carpeta `Productos/20260617_YesComputo/equipo N.png`).
 *
 * Cada foto (orientación variada) se normaliza a 1600×1200 (4:3) con "blur-fill":
 * la imagen completa centrada sobre un fondo difuminado de sí misma — así se ven
 * uniformes en las cards sin recortar el equipo. Se sube a `products/equipo-NN.webp`
 * (mismo path → no hay que tocar la base).
 *
 * Lee SUPABASE_URL / SUPABASE_SERVICE_KEY del .env del backend (no se hardcodean).
 * Uso:  node tools/update-product-images.cjs
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
  const bg = await sharp(input)
    .resize(W, H, { fit: 'cover' })
    .blur(40)
    .modulate({ brightness: 1.08, saturation: 1.05 })
    .toBuffer();
  const fg = await sharp(input)
    .resize(Math.round(W * 0.97), Math.round(H * 0.97), { fit: 'inside' })
    .toBuffer();
  return sharp(bg).composite([{ input: fg, gravity: 'center' }]).webp({ quality: 86 }).toBuffer();
}

async function upload(pathInBucket, buffer) {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${pathInBucket}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'image/webp',
      'x-upsert': 'true',
    },
    body: buffer,
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 120)}`);
}

(async () => {
  const files = fs.readdirSync(SRC_DIR).filter((f) => /^equipo \d+\.png$/i.test(f));
  console.log(`${files.length} imágenes a procesar. Storage: ${SUPABASE_URL}`);
  let ok = 0;
  for (const f of files.sort((a, b) => +a.match(/\d+/) - +b.match(/\d+/))) {
    const n = String(+f.match(/\d+/)).padStart(2, '0');
    try {
      const webp = await blurFill(path.join(SRC_DIR, f));
      await upload(`products/equipo-${n}.webp`, webp);
      ok++;
      console.log(`  ok: equipo-${n}.webp  (${(webp.length / 1024) | 0} KB)`);
    } catch (e) {
      console.log(`  ! equipo-${n}: ${e.message}`);
    }
  }
  console.log(`Listo: ${ok}/${files.length} actualizadas.`);
})();

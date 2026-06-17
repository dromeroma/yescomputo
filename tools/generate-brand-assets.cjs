/* eslint-disable */
/**
 * Yes Computo — brand asset generator.
 *
 * Source of truth for the logo artwork is the marketing SVG provided by the
 * client (a poster-trace with a glossy halo). This script flattens that trace
 * into the two authentic brand colours, then derives every shipped asset:
 *
 *   public/img/logo.svg        full-colour wordmark (light + dark safe)
 *   public/img/logo-mark.svg   square "[+]" brand mark (favicons, tight slots)
 *   public/favicon.ico         multi-size icon (16/32/48/64) from the mark
 *   public/img/og-cover.png    1200×630 social share card (WhatsApp/FB/IG/X)
 *
 * Run:  node tools/generate-brand-assets.cjs
 * Requires devDeps: @resvg/resvg-js, png-to-ico
 */
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const _pngToIco = require('png-to-ico');
const pngToIco = _pngToIco.default || _pngToIco;

const ROOT = path.resolve(__dirname, '..');
const SRC_SVG = path.resolve(
  ROOT,
  '..',
  'Redes sociales',
  'logo-yescomputo.svg'
);
const OUT_IMG = path.join(ROOT, 'public', 'img');
const OUT_PUBLIC = path.join(ROOT, 'public');

// Authentic brand colours sampled from the marketing artwork.
const GREEN = '#71a40a';
const TEAL = '#09948c';
const NAVY = '#0a1020';

fs.mkdirSync(OUT_IMG, { recursive: true });

// ---------------------------------------------------------------------------
// 1) Flatten the traced wordmark → public/img/logo.svg
// ---------------------------------------------------------------------------
// The trace stacks ~10 light "halo/shading" layers over 2 solid cores. We drop
// all that by recolouring every path to a single flat brand colour, chosen by
// region: the green "yes[+]" wordmark sits top-left, teal "computo" bottom-right.
function flattenWordmark() {
  const base = fs.readFileSync(SRC_SVG, 'utf8');
  const paths = [];
  const re = /<path([^>]*?)\sd="([^"]+)"/g;
  let m;
  while ((m = re.exec(base))) {
    const d = m[2];
    const nums = (d.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
    // "computo" = starts to the lower-right; everything else is the green mark.
    const fill = nums[0] >= 640 && nums[1] >= 660 ? TEAL : GREEN;
    paths.push(`<path fill="${fill}" d="${d}"/>`);
  }
  // Tight viewBox around the actual artwork (measured content bbox is
  // ~x59 y59 w1916 h868 inside the original 2048×980), with a small pad so
  // the wordmark fills its height box instead of floating in whitespace.
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="53 53 1929 880" ` +
    `fill-rule="evenodd" role="img" aria-label="Yes Computo">\n` +
    paths.join('\n') +
    `\n</svg>\n`;
  fs.writeFileSync(path.join(OUT_IMG, 'logo.svg'), svg);
  return svg;
}

// ---------------------------------------------------------------------------
// 2) Square brand mark → public/img/logo-mark.svg
// ---------------------------------------------------------------------------
// A purpose-built, crisp "[+]" cursor glyph on a rounded brand tile. The traced
// wordmark is far too detailed to read at favicon sizes; this is drawn clean so
// it stays sharp from 512px down to 16px.
function buildMark() {
  const S = 512;
  const stroke = 42;
  // Bracket geometry (centred). Gaps are tuned so the "+" still reads at 16px:
  // bracket feet stop well short of the plus arms.
  const topY = 156,
    botY = 356;
  const lx = 142,
    rx = 370,
    foot = 44;
  const cx = 256,
    cy = 256,
    arm = 42; // plus half-length
  const white = '#ffffff';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" role="img" aria-label="Yes Computo">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${GREEN}"/>
      <stop offset="1" stop-color="${TEAL}"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${S}" height="${S}" rx="116" fill="url(#g)"/>
  <g fill="none" stroke="${white}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M ${lx + foot} ${topY} H ${lx} V ${botY} H ${lx + foot}"/>
    <path d="M ${rx - foot} ${topY} H ${rx} V ${botY} H ${rx - foot}"/>
    <path d="M ${cx} ${cy - arm} V ${cy + arm} M ${cx - arm} ${cy} H ${cx + arm}"/>
  </g>
</svg>
`;
  fs.writeFileSync(path.join(OUT_IMG, 'logo-mark.svg'), svg);
  return svg;
}

// ---------------------------------------------------------------------------
// 3) favicon.ico (16/32/48/64) from the mark
// ---------------------------------------------------------------------------
async function buildFavicon(markSvg) {
  const sizes = [64, 48, 32, 16];
  const pngs = sizes.map((s) =>
    Buffer.from(
      new Resvg(markSvg, { fitTo: { mode: 'width', value: s } })
        .render()
        .asPng()
    )
  );
  const ico = await pngToIco(pngs);
  fs.writeFileSync(path.join(OUT_PUBLIC, 'favicon.ico'), ico);

  // Apple touch icon (180×180, opaque — iOS ignores alpha and squares it).
  const apple = new Resvg(markSvg, { fitTo: { mode: 'width', value: 180 } })
    .render()
    .asPng();
  fs.writeFileSync(path.join(OUT_PUBLIC, 'apple-touch-icon.png'), apple);
}

// ---------------------------------------------------------------------------
// 4) Social share card → public/img/og-cover.png (1200×630)
// ---------------------------------------------------------------------------
function buildOgCard(wordmarkSvg) {
  // Inline the flattened wordmark paths into the card, scaled + positioned.
  const inner = wordmarkSvg
    .replace(/^[\s\S]*?>/, '') // drop opening <svg ...>
    .replace(/<\/svg>\s*$/, '');
  // logo native 2048×980 → target width 560
  const lw = 560;
  const scale = lw / 2048;
  const lx = 96;
  const ly = 150;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#04070e"/>
      <stop offset="1" stop-color="#0c1426"/>
    </linearGradient>
    <radialGradient id="glowG" cx="0.85" cy="0.15" r="0.6">
      <stop offset="0" stop-color="${GREEN}" stop-opacity="0.38"/>
      <stop offset="1" stop-color="${GREEN}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowT" cx="0.1" cy="0.95" r="0.6">
      <stop offset="0" stop-color="${TEAL}" stop-opacity="0.30"/>
      <stop offset="1" stop-color="${TEAL}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${GREEN}"/>
      <stop offset="1" stop-color="${TEAL}"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glowG)"/>
  <rect width="1200" height="630" fill="url(#glowT)"/>

  <!-- subtle grid -->
  <g stroke="#ffffff" stroke-opacity="0.04" stroke-width="1">
    ${Array.from({ length: 13 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="630"/>`).join('')}
    ${Array.from({ length: 7 }, (_, i) => `<line x1="0" y1="${i * 100}" x2="1200" y2="${i * 100}"/>`).join('')}
  </g>

  <!-- eyebrow -->
  <g transform="translate(98, 92)">
    <rect x="0" y="-22" width="11" height="11" rx="3" fill="${GREEN}"/>
    <text x="24" y="-12" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="700"
      letter-spacing="3" fill="#9fb0c9">TECNOLOGÍA CIRCULAR · CARTAGENA</text>
  </g>

  <!-- wordmark -->
  <g transform="translate(${lx}, ${ly}) scale(${scale})">
    ${inner}
  </g>

  <!-- tagline -->
  <text x="100" y="486" font-family="Segoe UI, Arial, sans-serif" font-size="40" font-weight="700" fill="#ffffff">Tecnología que evoluciona,</text>
  <text x="100" y="538" font-family="Segoe UI, Arial, sans-serif" font-size="40" font-weight="700" fill="#ffffff">confianza que <tspan fill="${GREEN}">permanece</tspan>.</text>

  <!-- chips -->
  <g font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="600" fill="#c7d2e2">
    <g transform="translate(720, 250)">
      <rect x="0" y="0" width="300" height="56" rx="28" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.12"/>
      <circle cx="36" cy="28" r="7" fill="${GREEN}"/>
      <text x="62" y="36">Reacondicionados premium</text>
    </g>
    <g transform="translate(720, 322)">
      <rect x="0" y="0" width="300" height="56" rx="28" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.12"/>
      <circle cx="36" cy="28" r="7" fill="${TEAL}"/>
      <text x="62" y="36">Garantía y respaldo local</text>
    </g>
    <g transform="translate(720, 394)">
      <rect x="0" y="0" width="300" height="56" rx="28" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.12"/>
      <circle cx="36" cy="28" r="7" fill="${GREEN}"/>
      <text x="62" y="36">Venta · Alquiler · Corporativo</text>
    </g>
  </g>

  <!-- bottom rule + url -->
  <rect x="100" y="566" width="120" height="5" rx="2.5" fill="url(#rule)"/>
  <text x="100" y="600" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="700" fill="#7c8aa3" letter-spacing="1">www.yescomputo.com</text>
</svg>
`;
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
    .render()
    .asPng();
  fs.writeFileSync(path.join(OUT_IMG, 'og-cover.png'), png);
  return svg;
}

(async () => {
  const wordmark = flattenWordmark();
  const mark = buildMark();
  await buildFavicon(mark);
  buildOgCard(wordmark);
  console.log('Brand assets generated:');
  console.log('  public/img/logo.svg');
  console.log('  public/img/logo-mark.svg');
  console.log('  public/favicon.ico');
  console.log('  public/apple-touch-icon.png');
  console.log('  public/img/og-cover.png');
})();

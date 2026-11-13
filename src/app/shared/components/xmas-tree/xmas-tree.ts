import { ChangeDetectionStrategy, Component } from '@angular/core';

let uid = 0;

interface Light {
  x: number;
  y: number;
  c: string;
  d: number;
}
interface Bauble {
  x: number;
  y: number;
  r: number;
  c: 'red' | 'gold' | 'green';
}

/**
 * Premium illustrated Christmas tree (pure inline SVG, no external assets):
 * four layered pine tiers with snow on the edges, golden bead garlands,
 * twinkling lights, glossy baubles, a glowing star and wrapped gifts.
 * Animations live in styles.css (`.xt-*`) so `prefers-reduced-motion` applies.
 */
@Component({
  selector: 'yc-xmas-tree',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block', 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 320 440" class="h-full w-full overflow-visible" role="presentation">
      <defs>
        <linearGradient [attr.id]="id + 'pine'" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#2a9a62" />
          <stop offset=".55" stop-color="#14663f" />
          <stop offset="1" stop-color="#0a3d26" />
        </linearGradient>
        <linearGradient [attr.id]="id + 'pineDark'" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#000" stop-opacity="0" />
          <stop offset=".5" stop-color="#000" stop-opacity="0" />
          <stop offset="1" stop-color="#000" stop-opacity=".32" />
        </linearGradient>
        <linearGradient [attr.id]="id + 'gold'" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fff4d6" />
          <stop offset=".35" stop-color="#f2cf63" />
          <stop offset=".7" stop-color="#c9973a" />
          <stop offset="1" stop-color="#8a6421" />
        </linearGradient>
        <radialGradient [attr.id]="id + 'red'" cx=".35" cy=".3" r=".75">
          <stop offset="0" stop-color="#ff8da1" />
          <stop offset=".35" stop-color="#e0284a" />
          <stop offset="1" stop-color="#7a0f22" />
        </radialGradient>
        <radialGradient [attr.id]="id + 'goldB'" cx=".35" cy=".3" r=".75">
          <stop offset="0" stop-color="#fffaf0" />
          <stop offset=".35" stop-color="#f2cf63" />
          <stop offset="1" stop-color="#8a6421" />
        </radialGradient>
        <radialGradient [attr.id]="id + 'greenB'" cx=".35" cy=".3" r=".75">
          <stop offset="0" stop-color="#b9f5d0" />
          <stop offset=".35" stop-color="#2fbf71" />
          <stop offset="1" stop-color="#0a3d26" />
        </radialGradient>
        <radialGradient [attr.id]="id + 'halo'" cx=".5" cy=".5" r=".5">
          <stop offset="0" stop-color="#f2cf63" stop-opacity=".55" />
          <stop offset="1" stop-color="#f2cf63" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- warm halo behind the tree -->
      <ellipse cx="160" cy="250" rx="170" ry="200" [attr.fill]="'url(#' + id + 'halo)'" opacity=".35" class="xt-breathe" />

      <!-- trunk -->
      <rect x="146" y="372" width="28" height="30" rx="4" fill="#4a2f1c" />
      <rect x="146" y="372" width="10" height="30" rx="3" fill="#6b4529" />

      <!-- tiers (bottom → top) with soft right-side shading -->
      @for (t of tiers; track $index) {
        <path [attr.d]="t" [attr.fill]="'url(#' + id + 'pine)'" />
        <path [attr.d]="t" [attr.fill]="'url(#' + id + 'pineDark)'" />
      }
      <!-- snow resting on each tier edge -->
      @for (s of snow; track $index) {
        <path [attr.d]="s" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" opacity=".92" />
      }

      <!-- golden bead garlands -->
      @for (g of garlands; track $index) {
        <path [attr.d]="g" fill="none" [attr.stroke]="'url(#' + id + 'gold)'" stroke-width="2.6"
          stroke-dasharray="0.1 7" stroke-linecap="round" />
      }

      <!-- baubles -->
      @for (b of baubles; track $index) {
        <g class="xt-bauble" [style.animationDelay]="($index * 0.6) + 's'">
          <rect [attr.x]="b.x - 2.5" [attr.y]="b.y - b.r - 3" width="5" height="4" rx="1" fill="#c9973a" />
          <circle [attr.cx]="b.x" [attr.cy]="b.y" [attr.r]="b.r"
            [attr.fill]="'url(#' + id + (b.c === 'red' ? 'red' : b.c === 'gold' ? 'goldB' : 'greenB') + ')'" />
          <ellipse [attr.cx]="b.x - b.r * 0.35" [attr.cy]="b.y - b.r * 0.4" [attr.rx]="b.r * 0.28" [attr.ry]="b.r * 0.18" fill="#fff" opacity=".75" />
        </g>
      }

      <!-- twinkling lights -->
      @for (l of lights; track $index) {
        <g class="xt-light" [style.animationDelay]="l.d + 's'">
          <circle [attr.cx]="l.x" [attr.cy]="l.y" r="7" [attr.fill]="l.c" opacity=".28" />
          <circle [attr.cx]="l.x" [attr.cy]="l.y" r="2.8" [attr.fill]="l.c" />
          <circle [attr.cx]="l.x - .8" [attr.cy]="l.y - .9" r="1" fill="#fff" />
        </g>
      }

      <!-- star -->
      <g class="xt-star">
        <circle cx="160" cy="36" r="30" [attr.fill]="'url(#' + id + 'halo)'" />
        <path d="M160 12l7.3 15 16.5 2.4-12 11.6 2.8 16.4L160 49.6l-14.7 7.8 2.8-16.4-12-11.6 16.5-2.4z"
          [attr.fill]="'url(#' + id + 'gold)'" stroke="#fff4d6" stroke-width="1" />
      </g>

      <!-- wrapped gifts -->
      <g>
        <rect x="70" y="382" width="58" height="40" rx="4" fill="#b3122e" />
        <rect x="70" y="378" width="58" height="10" rx="3" fill="#c8203f" />
        <rect x="95" y="378" width="8" height="44" [attr.fill]="'url(#' + id + 'gold)'" />
        <path d="M99 378c-10-12-22-8-16 0M99 378c10-12 22-8 16 0" fill="none" stroke="#f2cf63" stroke-width="3" stroke-linecap="round" />

        <rect x="186" y="390" width="46" height="32" rx="4" fill="#14663f" />
        <rect x="186" y="386" width="46" height="9" rx="3" fill="#1f8a55" />
        <rect x="205" y="386" width="7" height="36" [attr.fill]="'url(#' + id + 'gold)'" />
        <path d="M208.5 386c-8-10-18-6-13 0M208.5 386c8-10 18-6 13 0" fill="none" stroke="#f2cf63" stroke-width="2.6" stroke-linecap="round" />

        <rect x="132" y="398" width="40" height="24" rx="3" [attr.fill]="'url(#' + id + 'gold)'" />
        <rect x="148" y="398" width="7" height="24" fill="#c8203f" />
        <rect x="132" y="406" width="40" height="6" fill="#c8203f" />
      </g>
    </svg>
  `,
})
export class XmasTree {
  protected readonly id = `xt${uid++}-`;

  protected readonly tiers = [
    'M160 222 L300 368 Q230 382 160 370 Q90 382 20 368 Z',
    'M160 160 L270 290 Q215 302 160 292 Q105 302 50 290 Z',
    'M160 100 L238 214 Q199 224 160 216 Q121 224 82 214 Z',
    'M160 46 L206 140 Q183 148 160 142 Q137 148 114 140 Z',
  ];

  protected readonly snow = [
    'M24 367 Q92 380 160 369 Q228 380 296 367',
    'M54 289 Q107 300 160 291 Q213 300 266 289',
    'M86 213 Q123 222 160 215 Q197 222 234 213',
    'M118 139 Q139 146 160 141 Q181 146 202 139',
  ];

  protected readonly garlands = [
    'M58 318 Q160 352 268 312',
    'M84 246 Q160 274 240 240',
    'M104 176 Q160 198 218 172',
    'M128 112 Q160 126 190 106',
  ];

  protected readonly baubles: Bauble[] = [
    { x: 96, y: 340, r: 9, c: 'red' },
    { x: 222, y: 346, r: 10, c: 'gold' },
    { x: 160, y: 300, r: 8, c: 'green' },
    { x: 118, y: 262, r: 8, c: 'gold' },
    { x: 206, y: 270, r: 8.5, c: 'red' },
    { x: 140, y: 196, r: 7, c: 'red' },
    { x: 186, y: 200, r: 7, c: 'gold' },
    { x: 160, y: 132, r: 6.5, c: 'gold' },
  ];

  protected readonly lights: Light[] = (() => {
    const colors = ['#F2CF63', '#E0284A', '#FFF4D6', '#2FBF71', '#7FB8FF'];
    // Points sampled along each garland's quadratic curve.
    const curves: [number, number, number, number, number, number, number][] = [
      [58, 318, 160, 352, 268, 312, 9],
      [84, 246, 160, 274, 240, 240, 7],
      [104, 176, 160, 198, 218, 172, 5],
      [128, 112, 160, 126, 190, 106, 3],
    ];
    const out: Light[] = [];
    let k = 0;
    for (const [x0, y0, cx, cy, x1, y1, n] of curves) {
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        const mt = 1 - t;
        out.push({
          x: mt * mt * x0 + 2 * mt * t * cx + t * t * x1,
          y: mt * mt * y0 + 2 * mt * t * cy + t * t * y1 + 2,
          c: colors[k % colors.length],
          d: ((k * 7) % 11) / 5,
        });
        k++;
      }
    }
    return out;
  })();
}

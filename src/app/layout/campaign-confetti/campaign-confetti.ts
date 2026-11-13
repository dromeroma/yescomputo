import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { CampaignService } from '../../core/services/campaign.service';

interface Piece {
  /** confetti = paper strip | flake = soft snow dot | glyph = ❄ | glitter = gold spark */
  kind: 'confetti' | 'flake' | 'glyph' | 'glitter';
  left: number;
  color: string;
  drift: number;
  dur: number;
  delay: number;
  w: number;
  h: number;
  opacity: number;
}

/**
 * Seasonal celebration overlay, styled by the active campaign:
 *  - football → confetti in the flag colours,
 *  - Christmas → a soft snowfall with drifting ❄ and warm gold glitter.
 * Fires on app load (when a mode is on), on every route change, and when the
 * user activates a mode (watches `CampaignService.burst`).
 * Browser-only, decorative (pointer-events-none), self-clearing.
 */
@Component({
  selector: 'yc-campaign-confetti',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Persistent snowfall while Christmas mode is on (compositor-only transforms) -->
    @if (snowing()) {
      <div class="xmas-snowfall" aria-hidden="true">
        @for (f of flakes; track $index) {
          <span
            class="xf"
            [class.xf-glyph]="f.kind === 'glyph'"
            [class.xf-gold]="f.kind === 'glitter'"
            [style.left.%]="f.left"
            [style.--s]="f.w + 'px'"
            [style.--o]="f.opacity"
            [style.--sway]="f.drift + 'px'"
            [style.--dur]="f.dur + 's'"
            [style.animationDelay]="-f.delay + 's'"
          >{{ f.kind === 'glyph' ? '❄' : '' }}</span>
        }
      </div>
    }
    @if (pieces().length) {
      <div class="pointer-events-none fixed inset-0 z-[70] overflow-hidden" aria-hidden="true">
        @for (p of pieces(); track $index) {
          @switch (p.kind) {
            @case ('confetti') {
              <span
                class="confetti-piece"
                [style.left.%]="p.left"
                [style.background]="p.color"
                [style.width.px]="p.w"
                [style.height.px]="p.h"
                [style.--drift]="p.drift + 'px'"
                [style.--dur]="p.dur + 's'"
                [style.animationDelay]="p.delay + 's'"
              ></span>
            }
            @case ('glyph') {
              <span
                class="snow-piece snow-glyph"
                [style.left.%]="p.left"
                [style.color]="p.color"
                [style.fontSize.px]="p.w"
                [style.--o]="p.opacity"
                [style.--drift]="p.drift + 'px'"
                [style.--dur]="p.dur + 's'"
                [style.animationDelay]="p.delay + 's'"
              >❄</span>
            }
            @default {
              <span
                class="snow-piece"
                [class.snow-glitter]="p.kind === 'glitter'"
                [style.left.%]="p.left"
                [style.background]="p.color"
                [style.width.px]="p.w"
                [style.height.px]="p.w"
                [style.--o]="p.opacity"
                [style.--drift]="p.drift + 'px'"
                [style.--dur]="p.dur + 's'"
                [style.animationDelay]="p.delay + 's'"
              ></span>
            }
          }
        }
      </div>
    }
  `,
})
export class CampaignConfetti {
  private readonly campaign = inject(CampaignService);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private timer?: ReturnType<typeof setTimeout>;

  protected readonly pieces = signal<Piece[]>([]);

  /** Christmas keeps a gentle snowfall running the whole time it is on. */
  protected readonly snowing = computed(
    () => this.isBrowser && this.campaign.campaign()?.celebration.kind === 'snow',
  );

  /** Fixed set of looping flakes (negative delays → already falling on load). */
  protected readonly flakes: Piece[] = Array.from({ length: 46 }, (_, i) => {
    const kind: Piece['kind'] = i % 7 === 0 ? 'glyph' : i % 9 === 4 ? 'glitter' : 'flake';
    return {
      kind,
      left: (i * 37.3) % 100,
      color: '#fff',
      drift: ((i * 53) % 90) - 45,
      dur: 11 + ((i * 29) % 13),
      delay: (i * 17) % 24,
      w: kind === 'glyph' ? 12 + (i % 4) * 3 : kind === 'glitter' ? 3 : 2.5 + (i % 4) * 1.4,
      h: 0,
      opacity: kind === 'glyph' ? 0.7 : 0.55 + ((i * 13) % 40) / 100,
    };
  });

  constructor() {
    // Celebrate on first paint (after hydration) if a mode is on.
    afterNextRender(() => {
      if (this.campaign.campaign()) this.fire(true);
    });

    // …and on every subsequent route change while a mode is on (lighter).
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        if (this.isBrowser && this.campaign.campaign()) this.fire(false);
      });

    // …and when the user actively turns a mode ON.
    effect(() => {
      if (this.campaign.burst() > 0 && this.isBrowser) this.fire(true);
    });
  }

  private fire(full: boolean): void {
    const c = this.campaign.campaign();
    if (!c) return;
    const colors = c.celebration.colors;
    const pick = () => colors[Math.floor(Math.random() * colors.length)];
    let pieces: Piece[];
    let lifetime: number;

    if (c.celebration.kind === 'snow') {
      const count = full ? 90 : 45;
      pieces = Array.from({ length: count }, () => {
        const r = Math.random();
        const kind: Piece['kind'] = r < 0.14 ? 'glyph' : r < 0.3 ? 'glitter' : 'flake';
        return {
          kind,
          left: Math.random() * 100,
          color: kind === 'glitter' ? '#F2CF63' : kind === 'glyph' ? '#ffffff' : pick(),
          drift: (Math.random() - 0.5) * 140,
          dur: 5.5 + Math.random() * 3.5,
          delay: Math.random() * 1.8,
          w: kind === 'glyph' ? 11 + Math.round(Math.random() * 9) : kind === 'glitter' ? 3 + Math.round(Math.random() * 2) : 3 + Math.round(Math.random() * 5),
          h: 0,
          opacity: kind === 'glyph' ? 0.75 : 0.6 + Math.random() * 0.4,
        };
      });
      lifetime = 11000;
    } else {
      pieces = Array.from({ length: 64 }, () => ({
        kind: 'confetti' as const,
        left: Math.random() * 100,
        color: pick(),
        drift: (Math.random() - 0.5) * 260,
        dur: 2.4 + Math.random() * 1.6,
        delay: Math.random() * 0.5,
        w: 7 + Math.round(Math.random() * 5),
        h: 12 + Math.round(Math.random() * 8),
        opacity: 1,
      }));
      lifetime = 4200;
    }

    this.pieces.set(pieces);
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.pieces.set([]), lifetime);
  }
}

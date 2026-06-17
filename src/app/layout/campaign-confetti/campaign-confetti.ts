import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CampaignService } from '../../core/services/campaign.service';

interface Piece {
  left: number;
  color: string;
  drift: number;
  dur: number;
  delay: number;
  w: number;
  h: number;
}

/**
 * One-shot celebration confetti in the campaign's flag colours, fired when the
 * user *activates* the seasonal mode (watches `CampaignService.burst`).
 * Browser-only, fully decorative (pointer-events-none), and self-clearing.
 */
@Component({
  selector: 'yc-campaign-confetti',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (pieces().length) {
      <div class="pointer-events-none fixed inset-0 z-[70] overflow-hidden" aria-hidden="true">
        @for (p of pieces(); track $index) {
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
      </div>
    }
  `,
})
export class CampaignConfetti {
  private readonly campaign = inject(CampaignService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private timer?: ReturnType<typeof setTimeout>;

  protected readonly pieces = signal<Piece[]>([]);

  private static readonly COLORS = ['#FCD116', '#1e63d6', '#e23b4e', '#ffffff', '#FCD116', '#1e63d6'];

  constructor() {
    effect(() => {
      const n = this.campaign.burst();
      if (n > 0 && this.isBrowser) this.fire();
    });
  }

  private fire(): void {
    const count = 70;
    const pieces: Piece[] = Array.from({ length: count }, () => ({
      left: Math.random() * 100,
      color: CampaignConfetti.COLORS[Math.floor(Math.random() * CampaignConfetti.COLORS.length)],
      drift: (Math.random() - 0.5) * 260,
      dur: 2.2 + Math.random() * 1.4,
      delay: Math.random() * 0.5,
      w: 7 + Math.round(Math.random() * 5),
      h: 12 + Math.round(Math.random() * 8),
    }));
    this.pieces.set(pieces);

    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.pieces.set([]), 4000);
  }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CampaignService } from '../../core/services/campaign.service';
import { Icon } from '../../shared/components/icon/icon';

/**
 * Festive top ribbon shown only while a seasonal campaign is active. Renders
 * nothing when the campaign is off, so it has zero footprint on the base site.
 * Christmas adds a deep-pine backdrop, drifting snow and a string of softly
 * twinkling lights along its lower edge.
 */
@Component({
  selector: 'yc-campaign-ribbon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    @if (campaign.campaign(); as c) {
      @let xmas = c.id === 'navidad';
      <div class="camp-ribbon relative overflow-hidden bg-ink-950 text-white" [class.xmas-ribbon]="xmas">
        @if (xmas) {
          <div class="xmas-snow xmas-snow--fine opacity-50" aria-hidden="true"></div>
        }
        <div class="flag-flow absolute inset-x-0 top-0 h-[3px]"></div>
        @if (!xmas) {
          <div class="flag-flow absolute inset-x-0 bottom-0 h-[3px] opacity-70"></div>
        }
        <div class="container-page relative flex items-center justify-center gap-x-3 gap-y-1 py-2 pr-8 text-center text-xs sm:text-sm"
          [class.pb-4]="xmas">
          <span class="text-base leading-none camp-pop">{{ c.emoji }}</span>
          <span class="font-medium text-ink-100">
            <span class="font-bold" [class.text-white]="!xmas" [class.xmas-ribbon-text]="xmas">{{ c.ribbon.text }}</span>
          </span>
          <a
            [routerLink]="c.ribbon.cta.link"
            class="hidden shrink-0 items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-semibold backdrop-blur transition-colors sm:inline-flex"
            [class]="xmas
              ? 'border-[#E8C670]/40 bg-[#E8C670]/10 text-[#F6E3A1] hover:bg-[#E8C670]/20'
              : 'border-white/20 bg-white/5 text-white hover:bg-white/15'"
          >
            {{ c.ribbon.cta.label }} <yc-icon name="arrow-right" [size]="13" />
          </a>
        </div>
        @if (xmas) {
          <!-- String of lights hanging along the bottom edge -->
          <div class="xmas-lights" aria-hidden="true">
            @for (b of bulbs; track $index) {
              <span class="xmas-bulb" [style.--bulb]="b.color" [style.animationDelay]="b.delay + 's'"></span>
            }
          </div>
        }
        <button
          type="button"
          (click)="campaign.setEnabled(c.id, false)"
          class="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-ink-300 transition-colors hover:bg-white/10 hover:text-white"
          [attr.aria-label]="'Desactivar ' + c.label"
        >
          <yc-icon name="close" [size]="16" />
        </button>
      </div>
    }
  `,
})
export class CampaignRibbon {
  protected readonly campaign = inject(CampaignService);

  /** Garland bulbs: gold / crimson / emerald / warm white, staggered twinkle. */
  protected readonly bulbs = Array.from({ length: 64 }, (_, i) => ({
    color: ['#F2CF63', '#E0284A', '#2FBF71', '#FFF4D6'][i % 4],
    delay: ((i * 37) % 23) / 10,
  }));
}

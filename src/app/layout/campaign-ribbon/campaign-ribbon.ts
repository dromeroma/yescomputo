import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CampaignService } from '../../core/services/campaign.service';
import { Icon } from '../../shared/components/icon/icon';

/**
 * Festive top ribbon shown only while a seasonal campaign is active. Renders
 * nothing when the campaign is off, so it has zero footprint on the base site.
 */
@Component({
  selector: 'yc-campaign-ribbon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    @if (campaign.campaign(); as c) {
      <div class="relative overflow-hidden bg-ink-950 text-white">
        <div class="flag-flow absolute inset-x-0 top-0 h-[3px]"></div>
        <div class="flag-flow absolute inset-x-0 bottom-0 h-[3px] opacity-70"></div>
        <div class="container-page flex items-center justify-center gap-x-3 gap-y-1 py-2 pr-8 text-center text-xs sm:text-sm">
          <span class="text-base leading-none camp-pop">{{ c.emoji }}</span>
          <span class="font-medium text-ink-100">
            <span class="font-bold text-white">{{ c.ribbon.text }}</span>
          </span>
          <a
            [routerLink]="c.ribbon.cta.link"
            class="hidden shrink-0 items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3 py-0.5 text-xs font-semibold text-white backdrop-blur transition-colors hover:bg-white/15 sm:inline-flex"
          >
            {{ c.ribbon.cta.label }} <yc-icon name="arrow-right" [size]="13" />
          </a>
        </div>
        <button
          type="button"
          (click)="campaign.setEnabled(false)"
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
}

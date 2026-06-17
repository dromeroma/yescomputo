import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CampaignService } from '../../../core/services/campaign.service';
import { WhatsappService } from '../../../core/services/whatsapp.service';
import { Icon } from '../icon/icon';

/**
 * Persistent WhatsApp call-to-action — a clean circular button (no label).
 * In football mode it gains an elegant rotating Colombia-tricolor ring and
 * tricolor pulse waves.
 */
@Component({
  selector: 'yc-whatsapp-fab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <a
      [href]="link"
      target="_blank"
      rel="noopener"
      class="group fixed right-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 block h-14 w-14 lg:bottom-5 lg:right-5"
      aria-label="Escríbenos por WhatsApp"
    >
      <!-- Football: rotating tricolor halo ring -->
      @if (footy()) {
        <span
          class="absolute -inset-[3px] rounded-full opacity-90 animate-[spin_5s_linear_infinite]"
          style="background: conic-gradient(from 0deg, #FCD116, #1e63d6, #e23b4e, #FCD116)"
        ></span>
      }

      <!-- Pulse wave -->
      <span
        class="absolute inset-0 rounded-full animate-ping"
        [class]="footy() ? 'flag-flow opacity-50' : 'bg-[#25D366] opacity-60'"
      ></span>

      <!-- Green button -->
      <span
        class="absolute inset-0 grid place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_32px_-8px_rgba(37,211,102,0.7)] transition-transform duration-300 group-hover:scale-105"
      >
        <yc-icon name="whatsapp" [size]="26" />
      </span>
    </a>
  `,
})
export class WhatsappFab {
  private readonly whatsapp = inject(WhatsappService);
  private readonly campaign = inject(CampaignService);

  protected readonly link = this.whatsapp.link(
    '¡Hola Yes Computo! 👋 Quiero más información sobre sus productos y servicios.',
  );

  /** True while the football/season campaign is active. */
  protected readonly footy = computed(() => !!this.campaign.campaign());
}

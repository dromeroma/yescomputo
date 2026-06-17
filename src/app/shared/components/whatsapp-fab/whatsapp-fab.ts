import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WhatsappService } from '../../../core/services/whatsapp.service';
import { Icon } from '../icon/icon';

/** Persistent WhatsApp call-to-action — the brand's primary conversion channel. */
@Component({
  selector: 'yc-whatsapp-fab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <a
      [href]="link"
      target="_blank"
      rel="noopener"
      class="group fixed right-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 flex items-center gap-3 rounded-full
             bg-[#25D366] p-3 text-white shadow-[0_12px_32px_-8px_rgba(37,211,102,0.7)] transition-transform hover:scale-105
             sm:gap-3 sm:pr-4 lg:bottom-5 lg:right-5"
      aria-label="Escríbenos por WhatsApp"
    >
      <span class="relative grid h-9 w-9 place-items-center rounded-full bg-white/20">
        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/30"></span>
        <yc-icon name="whatsapp" [size]="22" />
      </span>
      <span class="hidden text-sm font-semibold lg:block">¿Hablamos?</span>
    </a>
  `,
})
export class WhatsappFab {
  private readonly whatsapp = inject(WhatsappService);
  protected readonly link = this.whatsapp.link(
    '¡Hola Yes Computo! 👋 Quiero más información sobre sus productos y servicios.',
  );
}

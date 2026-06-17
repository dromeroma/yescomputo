import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_CONFIG } from '../../../core/config/app-config';
import { WhatsappService } from '../../../core/services/whatsapp.service';
import { Icon } from '../icon/icon';

export type LegalBlock = { type: 'p'; text: string } | { type: 'list'; items: string[] };

export interface LegalSection {
  id: string;
  heading: string;
  blocks: LegalBlock[];
}

/**
 * Reusable, minimalist legal document layout — clean header, sticky table of
 * contents, readable prose column and a contact card. Shared by the Terms and
 * Privacy pages so both stay visually consistent.
 */
@Component({
  selector: 'yc-legal-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    <!-- Header -->
    <section class="border-b border-line bg-surface-subtle">
      <div class="container-page py-12 md:py-16">
        <nav class="mb-5 flex items-center gap-1.5 text-sm text-content-muted" aria-label="Ruta">
          <a routerLink="/" class="hover:text-content">Inicio</a>
          <yc-icon name="chevron-right" [size]="14" />
          <span class="font-medium text-content">{{ title() }}</span>
        </nav>
        <span class="eyebrow"><span class="h-1 w-1 rounded-full bg-accent-500"></span>Legal</span>
        <h1 class="mt-3 text-3xl sm:text-4xl">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="mt-3 max-w-2xl text-content-muted">{{ subtitle() }}</p>
        }
        @if (updatedAt()) {
          <p class="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface-raised px-3.5 py-1.5 text-xs font-medium text-content-muted">
            <yc-icon name="clock" [size]="14" class="text-accent-600" /> Última actualización: {{ updatedAt() }}
          </p>
        }
      </div>
    </section>

    <div class="container-page py-12 md:py-16">
      <div class="lg:grid lg:grid-cols-[230px_1fr] lg:gap-14">
        <!-- Table of contents -->
        <aside class="mb-10 lg:mb-0">
          <div class="lg:sticky lg:top-28">
            <p class="mb-3 text-2xs font-semibold uppercase tracking-[0.16em] text-content-subtle">Contenido</p>
            <nav class="flex flex-col gap-1 border-l border-line">
              @for (s of sections(); track s.id; let i = $index) {
                <a [href]="'#' + s.id"
                  class="-ml-px border-l-2 border-transparent py-1.5 pl-4 text-sm text-content-muted transition-colors hover:border-accent-500 hover:text-content">
                  <span class="text-content-subtle">{{ i + 1 }}.</span> {{ s.heading }}
                </a>
              }
            </nav>
          </div>
        </aside>

        <!-- Document -->
        <div class="max-w-3xl">
          @for (s of sections(); track s.id; let i = $index) {
            <section [id]="s.id" class="scroll-mt-28 border-t border-line py-8 first:border-t-0 first:pt-0">
              <h2 class="font-display text-xl font-semibold text-content sm:text-2xl">
                <span class="text-content-subtle">{{ i + 1 }}.</span> {{ s.heading }}
              </h2>
              <div class="mt-4 space-y-4">
                @for (b of s.blocks; track $index) {
                  @if (b.type === 'p') {
                    <p class="leading-relaxed text-content-muted">{{ b.text }}</p>
                  } @else {
                    <ul class="space-y-2">
                      @for (item of b.items; track item) {
                        <li class="flex gap-3 leading-relaxed text-content-muted">
                          <span class="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500"></span>
                          <span>{{ item }}</span>
                        </li>
                      }
                    </ul>
                  }
                }
              </div>
            </section>
          }

          <!-- Contact card -->
          <div class="mt-12 rounded-2xl border border-line bg-surface-subtle p-6 sm:p-7">
            <h3 class="font-display text-lg font-semibold text-content">¿Dudas sobre este documento?</h3>
            <p class="mt-2 text-sm text-content-muted">
              Escríbenos y con gusto te ayudamos. {{ config.company.legalName }} ·
              {{ config.company.address.city }}, {{ config.company.address.country }}.
            </p>
            <div class="mt-5 flex flex-wrap gap-3">
              <a [href]="whatsappLink" target="_blank" rel="noopener"
                class="inline-flex h-11 items-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]">
                <yc-icon name="whatsapp" [size]="18" /> WhatsApp
              </a>
              <a [href]="'mailto:' + config.company.email"
                class="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-5 text-sm font-semibold text-content transition-colors hover:bg-surface-inset">
                <yc-icon name="mail" [size]="18" /> {{ config.company.email }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LegalPage {
  protected readonly config = inject(APP_CONFIG);
  private readonly whatsapp = inject(WhatsappService);

  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly updatedAt = input<string>('');
  readonly sections = input.required<LegalSection[]>();

  protected readonly whatsappLink = this.whatsapp.link(
    '¡Hola Yes Computo! 👋 Tengo una consulta sobre sus políticas/términos.',
  );
}

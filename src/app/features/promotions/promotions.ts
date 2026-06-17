import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';
import { WhatsappService } from '../../core/services/whatsapp.service';

import { Button } from '../../shared/components/button/button';
import { Icon } from '../../shared/components/icon/icon';
import { SectionHeading } from '../../shared/components/section-heading/section-heading';

@Component({
  selector: 'yc-promotions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Button, Icon, SectionHeading],
  template: `
    <!-- 1 · HERO (dark, compact) -->
    <section class="relative overflow-hidden bg-ink-950 text-white">
      <div class="bg-grid absolute inset-0 opacity-40"></div>
      <div class="absolute -right-20 top-0 h-72 w-72 rounded-full bg-brand-500/20 blur-[120px]"></div>
      <div class="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-accent-500/20 blur-[120px]"></div>
      <div class="container-page relative py-16 lg:py-20">
        <div class="mx-auto max-w-3xl text-center">
          <span class="eyebrow mb-4 justify-center">
            <span class="h-1 w-1 rounded-full bg-brand-400"></span>Ofertas
          </span>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl">
            Promociones y soluciones para tu <span class="text-gradient-brand">empresa</span>
          </h1>
          <p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
            Equipos corporativos, reacondicionados certificados y planes de alquiler con descuentos
            reales. Aprovecha nuestras campañas vigentes y equipa tu negocio con confianza.
          </p>
        </div>
      </div>
    </section>

    <!-- 2 · FEATURED PROMO CARDS -->
    <section class="section">
      <div class="container-page">
        <yc-section-heading
          eyebrow="Campañas vigentes"
          title="Ofertas que impulsan tu productividad"
          description="Descuentos en equipos, servicios y reacondicionados. Toca cada oferta para ver más."
        />

        @if (promotions().length) {
          <div class="mt-10 grid gap-6 md:grid-cols-2">
            @for (promo of promotions(); track promo.id) {
              <article
                class="group relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br p-8 text-white shadow-card transition hover:-translate-y-1 hover:shadow-card-hover"
                [class]="themeClass(promo.theme)"
              >
                <div class="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl"></div>

                @if (promo.badge) {
                  <span class="absolute right-6 top-6 inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
                    {{ promo.badge }}
                  </span>
                }

                <div class="relative">
                  @if (promo.subtitle) {
                    <p class="text-sm font-medium text-white/80">{{ promo.subtitle }}</p>
                  }
                  <h3 class="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">{{ promo.title }}</h3>
                  @if (promo.description) {
                    <p class="mt-3 max-w-md text-sm leading-relaxed text-white/75">{{ promo.description }}</p>
                  }
                  <a
                    [routerLink]="basePath(promo.ctaLink)"
                    class="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-white/25"
                  >
                    {{ promo.ctaLabel }} <yc-icon name="arrow-right" [size]="16" />
                  </a>
                </div>
              </article>
            }
          </div>
        } @else {
          <div class="mt-10 rounded-3xl border border-dashed border-line-strong bg-surface-subtle p-12 text-center">
            <span class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-raised text-content-subtle shadow-card">
              <yc-icon name="sparkles" [size]="26" />
            </span>
            <h3 class="mt-5 text-xl">Pronto nuevas promociones</h3>
            <p class="mx-auto mt-2 max-w-md text-sm text-content-muted">
              Estamos preparando ofertas especiales. Mientras tanto, explora todo nuestro catálogo.
            </p>
            <a ycButton variant="primary" size="md" routerLink="/catalogo" class="mt-6 inline-flex">
              Ver catálogo <yc-icon name="arrow-right" [size]="18" />
            </a>
          </div>
        }
      </div>
    </section>

    <!-- 3 · SECONDARY BAND · ¿Buscas algo específico? -->
    <section class="section bg-surface-subtle">
      <div class="container-page">
        <div class="relative overflow-hidden rounded-3xl bg-surface-raised p-8 shadow-card lg:p-12">
          <div class="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-accent-500/10 blur-3xl"></div>
          <div class="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <span class="eyebrow mb-3">
                <span class="h-1 w-1 rounded-full bg-accent-500"></span>Asesoría sin costo
              </span>
              <h2 class="text-3xl sm:text-4xl">¿Buscas algo específico?</h2>
              <p class="mt-4 max-w-xl text-base leading-relaxed text-content-muted">
                Cuéntanos qué equipos necesitas y cuántos. Un asesor te arma una cotización a medida
                con la mejor combinación de precio, garantía y disponibilidad.
              </p>
            </div>
            <div class="flex flex-col gap-3 lg:items-end">
              <a ycButton variant="primary" size="lg" routerLink="/catalogo">
                Explorar catálogo <yc-icon name="search" [size]="18" />
              </a>
              <a ycButton variant="whatsapp" size="lg" [href]="whatsappLink" target="_blank" rel="noopener">
                <yc-icon name="whatsapp" [size]="20" /> Asesoría por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4 · HIGHLIGHT · Tecnología Circular hasta -60% -->
    <section class="relative overflow-hidden bg-ink-950 text-white">
      <div class="absolute -left-20 top-0 h-80 w-80 rounded-full bg-emerald-500/20 blur-[120px]"></div>
      <div class="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-accent-500/20 blur-[120px]"></div>
      <div class="container-page relative section">
        <div class="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <span class="eyebrow mb-3">
              <span class="h-1 w-1 rounded-full bg-emerald-400"></span>Tecnología Circular
            </span>
            <h2 class="text-3xl sm:text-4xl">
              Reacondicionados certificados <span class="text-gradient-brand">hasta -60%</span>
            </h2>
            <p class="mt-5 max-w-xl text-base leading-relaxed text-white/70">
              Equipos probados, renovados y con garantía a una fracción del precio. Ahorra dinero
              mientras cuidas el planeta: reutilizamos hoy para proteger mañana.
            </p>
            <div class="mt-8 flex flex-col gap-4 sm:flex-row">
              <a ycButton variant="primary" size="lg" routerLink="/categoria/reacondicionados">
                Ver reacondicionados <yc-icon name="recycle" [size]="18" />
              </a>
              <a ycButton variant="outline" size="lg" routerLink="/tecnologia-circular">
                Conoce el programa <yc-icon name="leaf" [size]="18" />
              </a>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4">
            @for (s of circularStats; track s.label) {
              <div class="rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur">
                <p class="text-3xl font-bold text-brand-400">{{ s.value }}</p>
                <p class="mt-1 text-xs text-white/60">{{ s.label }}</p>
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class Promotions implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly seo = inject(SeoService);
  private readonly whatsapp = inject(WhatsappService);

  protected readonly promotions = toSignal(this.catalog.getPromotions(), { initialValue: [] });

  protected readonly whatsappLink = this.whatsapp.link(
    '¡Hola Yes Computo! 👋 Vi sus promociones y quiero asesoría para equipar mi empresa.',
  );

  protected readonly circularStats = [
    { value: '-60%', label: 'de ahorro' },
    { value: '100%', label: 'con garantía' },
    { value: '20+', label: 'años de respaldo' },
  ];

  protected basePath(link: string): string {
    return link.split('#')[0];
  }

  protected themeClass(theme: string): string {
    switch (theme) {
      case 'sustainability':
        return 'from-emerald-600 to-accent-700';
      case 'accent':
        return 'from-accent-500 to-accent-700';
      case 'brand':
        return 'from-brand-500 to-brand-700';
      default:
        return 'from-ink-800 to-ink-950';
    }
  }

  ngOnInit(): void {
    this.seo.update({
      title: 'Promociones',
      description:
        'Promociones y soluciones tecnológicas para tu empresa en Cartagena: equipos corporativos, reacondicionados certificados hasta -60% y planes de alquiler con descuentos reales en Yes Computo.',
      path: '/promociones',
    });
  }
}

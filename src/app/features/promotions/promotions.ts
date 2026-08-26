import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
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
    <!-- 1 · HERO dinámico — rota las promociones vigentes -->
    <section
      class="relative isolate overflow-hidden bg-ink-950 text-white"
      (mouseenter)="pause()"
      (mouseleave)="resume()"
    >
      <div class="bg-grid absolute inset-0 opacity-30"></div>

      @if (promotions().length) {
        <div class="relative min-h-[30rem] lg:min-h-[34rem]">
          @for (promo of promotions(); track promo.id; let i = $index) {
            <div
              class="absolute inset-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
              [class.opacity-100]="i === promoIndex()"
              [class.opacity-0]="i !== promoIndex()"
              [class.pointer-events-none]="i !== promoIndex()"
              [attr.aria-hidden]="i !== promoIndex()"
            >
              <!-- Auras de color por tema -->
              <div class="absolute -right-24 -top-16 h-[26rem] w-[26rem] rounded-full blur-[130px] transition-opacity duration-1000"
                [style.background]="glowA(promo.theme)" [style.opacity]="i === promoIndex() ? 0.4 : 0"></div>
              <div class="absolute -left-24 bottom-0 h-[24rem] w-[24rem] rounded-full blur-[130px]"
                [style.background]="glowB(promo.theme)" [style.opacity]="0.28"></div>

              @if (promo.image) {
                <!-- CON imagen: texto a la izquierda, imagen a la derecha -->
                <div class="container-page relative grid min-h-[30rem] items-center gap-8 py-16 lg:min-h-[34rem] lg:grid-cols-[54fr_46fr]">
                  <div class="z-10 text-center lg:text-left">
                    <span class="eyebrow justify-center lg:justify-start" [style.color]="accent(promo.theme)">
                      <span class="h-1 w-1 rounded-full" [style.background]="accent(promo.theme)"></span>Oferta destacada
                    </span>
                    @if (promo.badge) {
                      <span class="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-extrabold uppercase tracking-wider backdrop-blur" [style.color]="accent(promo.theme)">
                        <yc-icon name="sparkles" [size]="15" />{{ promo.badge }}
                      </span>
                    }
                    <h1 class="mt-5 font-display text-4xl font-extrabold leading-[1.03] tracking-tight sm:text-5xl lg:text-6xl">{{ promo.title }}</h1>
                    @if (promo.subtitle) { <p class="mt-4 text-lg font-semibold text-white/85 sm:text-xl">{{ promo.subtitle }}</p> }
                    @if (promo.description) { <p class="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base lg:mx-0">{{ promo.description }}</p> }
                    @if (endsInLabel(promo.endsAt); as lbl) {
                      <p class="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white/85 backdrop-blur">
                        <yc-icon name="clock" [size]="15" [style.color]="accent(promo.theme)" />{{ lbl }}
                      </p>
                    }
                    <div class="mt-8">
                      <a [routerLink]="basePath(promo.ctaLink)" [queryParams]="queryOf(promo.ctaLink)"
                        class="group inline-flex items-center gap-2 rounded-full bg-white py-2.5 pl-6 pr-2.5 text-base font-bold text-ink-950 shadow-[0_12px_44px_-14px_rgba(255,255,255,0.55)] transition-transform hover:scale-[1.03] active:scale-100">
                        {{ promo.ctaLabel }}
                        <span class="grid h-9 w-9 place-items-center rounded-full bg-ink-950 text-white transition-transform group-hover:translate-x-0.5"><yc-icon name="arrow-right" [size]="17" /></span>
                      </a>
                    </div>
                  </div>
                  <div class="relative">
                    <div class="absolute -inset-4 rounded-[2rem] blur-3xl" [style.background]="glowA(promo.theme)" [style.opacity]="0.32"></div>
                    <a [routerLink]="basePath(promo.ctaLink)" [queryParams]="queryOf(promo.ctaLink)" [attr.aria-label]="promo.ctaLabel"
                      class="group relative block aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-white/15 bg-ink-900 shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)] transition-transform duration-300 hover:scale-[1.01]">
                      <img [src]="promo.image" [alt]="promo.title" class="h-full w-full object-cover" loading="lazy" decoding="async" />
                      <div class="absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/10"></div>
                    </a>
                  </div>
                </div>
              } @else {
                <!-- SIN imagen: centrado con la marca de agua elegante -->
                @if (promo.badge) {
                  <span class="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none font-display font-black leading-none text-white/[0.05] lg:block lg:text-[13rem] xl:text-[16rem]">{{ promo.badge }}</span>
                }
                <div class="container-page relative flex min-h-[30rem] flex-col items-center justify-center py-16 text-center lg:min-h-[34rem]">
                  <span class="eyebrow justify-center" [style.color]="accent(promo.theme)">
                    <span class="h-1 w-1 rounded-full" [style.background]="accent(promo.theme)"></span>Oferta destacada
                  </span>
                  @if (promo.badge) {
                    <span class="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-extrabold uppercase tracking-wider backdrop-blur" [style.color]="accent(promo.theme)">
                      <yc-icon name="sparkles" [size]="15" />{{ promo.badge }}
                    </span>
                  }
                  <h1 class="mt-5 max-w-4xl font-display text-4xl font-extrabold leading-[1.03] tracking-tight sm:text-5xl lg:text-6xl">{{ promo.title }}</h1>
                  @if (promo.subtitle) { <p class="mt-4 text-lg font-semibold text-white/85 sm:text-xl">{{ promo.subtitle }}</p> }
                  @if (promo.description) { <p class="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">{{ promo.description }}</p> }
                  @if (endsInLabel(promo.endsAt); as lbl) {
                    <p class="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white/85 backdrop-blur">
                      <yc-icon name="clock" [size]="15" [style.color]="accent(promo.theme)" />{{ lbl }}
                    </p>
                  }
                  <div class="mt-8">
                    <a [routerLink]="basePath(promo.ctaLink)" [queryParams]="queryOf(promo.ctaLink)"
                      class="group inline-flex items-center gap-2 rounded-full bg-white py-2.5 pl-6 pr-2.5 text-base font-bold text-ink-950 shadow-[0_12px_44px_-14px_rgba(255,255,255,0.55)] transition-transform hover:scale-[1.03] active:scale-100">
                      {{ promo.ctaLabel }}
                      <span class="grid h-9 w-9 place-items-center rounded-full bg-ink-950 text-white transition-transform group-hover:translate-x-0.5"><yc-icon name="arrow-right" [size]="17" /></span>
                    </a>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Flechas + puntos (si hay más de una) -->
          @if (promotions().length > 1) {
            <button type="button" (click)="prevPromo()" aria-label="Anterior"
              class="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/5 text-white backdrop-blur transition-colors hover:bg-white/15 md:grid md:left-5">
              <yc-icon name="chevron-left" [size]="22" />
            </button>
            <button type="button" (click)="nextPromo()" aria-label="Siguiente"
              class="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-white/5 text-white backdrop-blur transition-colors hover:bg-white/15 md:grid md:right-5">
              <yc-icon name="chevron-right" [size]="22" />
            </button>
            <div class="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-2.5">
              @for (p of promotions(); track p.id; let i = $index) {
                <button type="button" (click)="goPromo(i)" [attr.aria-label]="'Ir a la promoción ' + (i + 1)"
                  class="h-1.5 rounded-full transition-all duration-500"
                  [class.w-10]="i === promoIndex()" [class.w-5]="i !== promoIndex()"
                  [class.bg-white]="i === promoIndex()" [class.bg-ink-600]="i !== promoIndex()"></button>
              }
            </div>
          }
        </div>
      } @else {
        <!-- Respaldo estático si no hay promociones -->
        <div class="container-page relative py-16 lg:py-20">
          <div class="mx-auto max-w-3xl text-center">
            <span class="eyebrow mb-4 justify-center"><span class="h-1 w-1 rounded-full bg-brand-400"></span>Ofertas</span>
            <h1 class="text-4xl sm:text-5xl lg:text-6xl">Promociones y soluciones para tu <span class="text-gradient-brand">empresa</span></h1>
            <p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
              Equipos corporativos, reacondicionados certificados y planes de alquiler con descuentos reales. Aprovecha nuestras campañas vigentes y equipa tu negocio con confianza.
            </p>
          </div>
        </div>
      }
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
                class="shine group relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br p-8 text-white shadow-card transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-card-hover"
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
                    [queryParams]="queryOf(promo.ctaLink)"
                    class="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-white/25"
                  >
                    {{ promo.ctaLabel }} <yc-icon name="arrow-right" [size]="16" />
                  </a>
                </div>
              </article>
            }
          </div>
        } @else {
          <div class="shine group relative overflow-hidden mt-10 rounded-3xl border border-dashed border-line-strong bg-surface-subtle p-12 text-center transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-card-hover hover:border-line-strong">
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
        <div class="shine group relative overflow-hidden rounded-3xl bg-surface-raised p-8 shadow-card lg:p-12 transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-card-hover">
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
              <a ycButton variant="primary" size="lg" routerLink="/catalogo" [queryParams]="{ condition: 'reacondicionado' }">
                Ver reacondicionados <yc-icon name="recycle" [size]="18" />
              </a>
              <a ycButton variant="outline" size="lg" routerLink="/tecnologia-circular">
                Conoce el programa <yc-icon name="leaf" [size]="18" />
              </a>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-3 sm:gap-4">
            @for (s of circularStats; track s.label) {
              <div class="rounded-2xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur sm:p-5">
                <p class="text-2xl font-bold text-brand-400 sm:text-3xl">{{ s.value }}</p>
                <p class="mt-1 text-xs text-white/60">{{ s.label }}</p>
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class Promotions implements OnInit, OnDestroy {
  private readonly catalog = inject(CatalogService);
  private readonly seo = inject(SeoService);
  private readonly whatsapp = inject(WhatsappService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private timer?: ReturnType<typeof setInterval>;

  protected readonly promotions = toSignal(this.catalog.getPromotions(), { initialValue: [] });

  // --- Hero carousel state ------------------------------------------------
  protected readonly promoIndex = signal(0);
  protected readonly paused = signal(false);

  constructor() {
    // Keep the index valid as promotions load / change.
    effect(() => {
      if (this.promoIndex() >= this.promotions().length) this.promoIndex.set(0);
    });
  }

  protected goPromo(i: number): void {
    const len = this.promotions().length || 1;
    this.promoIndex.set(((i % len) + len) % len);
    this.restart();
  }
  protected nextPromo(): void {
    this.goPromo(this.promoIndex() + 1);
  }
  protected prevPromo(): void {
    this.goPromo(this.promoIndex() - 1);
  }
  protected pause(): void {
    this.paused.set(true);
  }
  protected resume(): void {
    this.paused.set(false);
  }
  private start(): void {
    if (!this.isBrowser) return;
    this.timer = setInterval(() => {
      const len = this.promotions().length;
      if (!this.paused() && len > 1) this.promoIndex.update((i) => (i + 1) % len);
    }, 6500);
  }
  private stop(): void {
    if (this.timer) clearInterval(this.timer);
  }
  private restart(): void {
    this.stop();
    this.start();
  }

  /** Accent + glow colours per promo theme (keeps the hero vibrant). */
  private colors(theme: string): { accent: string; a: string; b: string } {
    switch (theme) {
      case 'sustainability':
        return { accent: '#34d399', a: '#10b981', b: '#22d3ee' };
      case 'accent':
        return { accent: '#38bdf8', a: '#38bdf8', b: '#818cf8' };
      case 'ink':
        return { accent: '#a3e635', a: '#64748b', b: '#22d3ee' };
      default: // brand
        return { accent: '#a3e635', a: '#a3e635', b: '#22d3ee' };
    }
  }
  protected accent(theme: string): string {
    return this.colors(theme).accent;
  }
  protected glowA(theme: string): string {
    return this.colors(theme).a;
  }
  protected glowB(theme: string): string {
    return this.colors(theme).b;
  }

  /** Urgency label from an end date, e.g. "Termina hoy" / "Termina en 5 días". */
  protected endsInLabel(endsAt?: string): string | null {
    if (!endsAt) return null;
    const end = new Date(endsAt).getTime();
    if (isNaN(end)) return null;
    const days = Math.ceil((end - Date.now()) / 86_400_000);
    if (days < 0) return null;
    if (days === 0) return 'Termina hoy';
    if (days === 1) return 'Último día';
    if (days <= 30) return `Termina en ${days} días`;
    return null;
  }

  protected readonly whatsappLink = this.whatsapp.link(
    '¡Hola Yes Computo! 👋 Vi sus promociones y quiero asesoría para equipar mi empresa.',
  );

  protected readonly circularStats = [
    { value: '-60%', label: 'de ahorro' },
    { value: '100%', label: 'con garantía' },
    { value: '20+', label: 'años de respaldo' },
  ];

  /** CTA links may carry filters (e.g. "/catalogo?condition=reacondicionado"). */
  protected basePath(link: string): string {
    return (link || '/').split('#')[0].split('?')[0];
  }
  protected queryOf(link: string): Record<string, string> {
    const qs = (link || '').split('#')[0].split('?')[1];
    if (!qs) return {};
    const out: Record<string, string> = {};
    for (const pair of qs.split('&')) {
      const [k, v] = pair.split('=');
      if (k) out[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
    }
    return out;
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
    this.start();
  }

  ngOnDestroy(): void {
    this.stop();
  }
}

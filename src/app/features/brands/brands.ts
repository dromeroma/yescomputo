import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';

import { Button } from '../../shared/components/button/button';
import { Icon } from '../../shared/components/icon/icon';
import { SectionHeading } from '../../shared/components/section-heading/section-heading';

@Component({
  selector: 'yc-brands',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Button, Icon, SectionHeading],
  template: `
    <!-- 1 · HERO -->
    <section class="relative overflow-hidden bg-ink-950 text-white">
      <div class="bg-grid absolute inset-0 opacity-40"></div>
      <div class="absolute -right-20 top-0 h-80 w-80 rounded-full bg-brand-500/20 blur-[120px]"></div>
      <div class="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-accent-500/20 blur-[120px]"></div>
      <div class="container-page relative section">
        <div class="mx-auto max-w-3xl text-center">
          <span class="eyebrow mb-4 justify-center">
            <span class="h-1 w-1 rounded-full bg-brand-400"></span>Marcas
          </span>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl">
            Las mejores marcas <span class="text-gradient-brand">corporativas</span>
          </h1>
          <p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
            Trabajamos con los fabricantes líderes del mundo —Lenovo, HP, Dell, Acer y ASUS— junto a
            marcas como Epson, Logitech, Samsung, Hikvision y Xiaomi. Equipos corporativos de calidad,
            nuevos y reacondicionados, respaldados por 20 años de experiencia.
          </p>
        </div>
      </div>
    </section>

    <!-- 2 · FEATURED BRANDS -->
    @if (featuredBrands().length) {
      <section class="section">
        <div class="container-page">
          <yc-section-heading
            eyebrow="Marcas destacadas"
            title="Aliados corporativos de referencia"
            description="Las marcas líderes en las que confían las empresas de la región Caribe."
            [centered]="true"
          />
          <div class="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            @for (brand of featuredBrands(); track brand.id) {
              <a
                [routerLink]="'/catalogo'"
                [queryParams]="{ brand: brand.slug }"
                class="shine group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface-raised p-7 shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:border-line-strong hover:shadow-card-hover"
              >
                <div class="flex items-start justify-between">
                  <span
                    class="grid h-12 w-12 place-items-center rounded-xl bg-brand-100 text-brand-700 transition group-hover:bg-brand-500 group-hover:text-ink-950"
                  >
                    <yc-icon name="building" [size]="24" />
                  </span>
                  <yc-icon
                    name="arrow-up-right"
                    [size]="18"
                    class="text-content-subtle transition-all group-hover:text-brand-600"
                  />
                </div>
                <h3 class="mt-5 text-xl leading-snug">{{ brand.name }}</h3>
                @if (brand.tagline) {
                  <p class="mt-1 text-sm font-medium text-accent-600">{{ brand.tagline }}</p>
                }
                @if (brand.description) {
                  <p class="mt-3 line-clamp-2 text-sm leading-relaxed text-content-muted">
                    {{ brand.description }}
                  </p>
                }
                @if (brand.corporateLines?.length) {
                  <div class="mt-4 flex flex-wrap gap-2">
                    @for (line of brand.corporateLines; track line) {
                      <span
                        class="rounded-full bg-surface-inset px-3 py-1 text-xs font-medium text-content-muted transition group-hover:bg-brand-50 group-hover:text-brand-700"
                      >
                        {{ line }}
                      </span>
                    }
                  </div>
                }
                <p class="mt-5 border-t border-line pt-4 text-xs font-medium text-content-subtle">
                  {{ brand.productCount }}
                  {{ brand.productCount === 1 ? 'producto disponible' : 'productos disponibles' }}
                </p>
              </a>
            }
          </div>
        </div>
      </section>
    }

    <!-- 3 · ALL BRANDS GRID -->
    <section class="section" [class.pt-0]="featuredBrands().length">
      <div class="container-page">
        <yc-section-heading
          eyebrow="Todas las marcas"
          title="Catálogo completo de marcas"
          description="Explora todas las marcas que distribuimos y encuentra tus equipos favoritos."
          [centered]="true"
        />
        @if (brands().length) {
          <div class="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            @for (brand of brands(); track brand.id) {
              <a
                [routerLink]="'/catalogo'"
                [queryParams]="{ brand: brand.slug }"
                class="shine group relative overflow-hidden flex items-center justify-between rounded-2xl border border-line bg-surface-raised p-5 shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:border-line-strong hover:shadow-card-hover"
              >
                <div>
                  <h3 class="text-base leading-snug">{{ brand.name }}</h3>
                  <p class="mt-1 text-xs font-medium text-content-subtle">
                    {{ brand.productCount }} {{ brand.productCount === 1 ? 'producto' : 'productos' }}
                  </p>
                </div>
                <yc-icon
                  name="chevron-right"
                  [size]="18"
                  class="text-content-subtle transition-all group-hover:translate-x-1 group-hover:text-brand-600"
                />
              </a>
            }
          </div>
        } @else {
          <p class="mt-12 text-center text-content-subtle">No hay marcas disponibles por el momento.</p>
        }
      </div>
    </section>

    <!-- 4 · CIRCULAR TECH BAND -->
    <section class="section pt-0">
      <div class="container-page">
        <div class="relative overflow-hidden rounded-3xl bg-brand-50 p-8 shadow-card lg:p-12">
          <div class="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-brand-500/15 blur-3xl"></div>
          <div class="absolute -left-10 -bottom-10 h-52 w-52 rounded-full bg-accent-500/10 blur-3xl"></div>
          <div class="relative grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <span class="eyebrow mb-3">
                <span class="h-1 w-1 rounded-full bg-accent-500"></span>Tecnología Circular
              </span>
              <h2 class="text-3xl sm:text-4xl">
                La verdadera tecnología corporativa no se desecha, se transforma
              </h2>
              <p class="mt-4 max-w-xl text-base leading-relaxed text-content-muted">
                Los equipos de las grandes marcas tienen una segunda vida. Reacondicionamos
                portátiles y equipos corporativos con la misma calidad y garantía, alargando su vida
                útil y cuidando el planeta.
              </p>
            </div>
            <div class="flex flex-col gap-3 lg:items-end">
              <a ycButton variant="primary" size="lg" routerLink="/catalogo" [queryParams]="{ condition: 'reacondicionado' }">
                Ver reacondicionados <yc-icon name="recycle" [size]="18" />
              </a>
              <a ycButton variant="ghost" size="md" routerLink="/catalogo">
                Ver catálogo <yc-icon name="arrow-right" [size]="18" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class Brands implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly seo = inject(SeoService);

  protected readonly brands = toSignal(this.catalog.getBrands(), { initialValue: [] });
  protected readonly featuredBrands = computed(() => this.brands().filter((b) => b.featured));

  ngOnInit(): void {
    this.seo.update({
      title: 'Marcas',
      description:
        'Distribuimos las mejores marcas corporativas: Lenovo, HP, Dell, Acer, ASUS, Epson, Logitech, Samsung, Hikvision y Xiaomi. Equipos nuevos y reacondicionados con garantía en Cartagena.',
      path: '/marcas',
    });
  }
}

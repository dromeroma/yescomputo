import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';

import { Button } from '../../shared/components/button/button';
import { Icon } from '../../shared/components/icon/icon';
import { SectionHeading } from '../../shared/components/section-heading/section-heading';

@Component({
  selector: 'yc-categories',
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
            <span class="h-1 w-1 rounded-full bg-brand-400"></span>Catálogo
          </span>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl">
            Explora por <span class="text-gradient-brand">categoría</span>
          </h1>
          <p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
            Encuentra el equipo ideal navegando por nuestras categorías de tecnología corporativa:
            portátiles, equipos de escritorio, componentes, periféricos y mucho más, todo con la
            confianza de 20 años de experiencia en Cartagena.
          </p>
        </div>
      </div>
    </section>

    <!-- 2 · CATEGORIES GRID -->
    <section class="section">
      <div class="container-page">
        <yc-section-heading
          eyebrow="Categorías"
          title="Todas nuestras categorías"
          description="Selecciona una categoría para descubrir todos los equipos disponibles."
          [centered]="true"
        />

        @if (categories().length) {
          <div class="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            @for (cat of categories(); track cat.id) {
              <a
                [routerLink]="['/categoria', cat.slug]"
                class="shine group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface-raised p-6 shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:border-line-strong hover:shadow-card-hover"
              >
                <div class="flex items-start justify-between">
                  <span
                    class="grid h-12 w-12 place-items-center rounded-xl bg-brand-100 text-brand-700 transition group-hover:bg-brand-500 group-hover:text-ink-950"
                  >
                    <yc-icon [name]="cat.icon" [size]="24" />
                  </span>
                  <yc-icon
                    name="arrow-right"
                    [size]="18"
                    class="text-content-subtle transition-all group-hover:translate-x-1 group-hover:text-brand-600"
                  />
                </div>
                <h3 class="mt-5 text-lg leading-snug">{{ cat.name }}</h3>
                <p class="mt-2 line-clamp-2 text-sm leading-relaxed text-content-muted">
                  {{ cat.description }}
                </p>
                <p class="mt-4 text-xs font-medium text-content-subtle">
                  {{ cat.productCount }} {{ cat.productCount === 1 ? 'producto' : 'productos' }}
                </p>
              </a>
            }
          </div>
        } @else {
          <p class="mt-12 text-center text-content-subtle">No hay categorías disponibles por el momento.</p>
        }
      </div>
    </section>

    <!-- 3 · CTA BAND -->
    <section class="section pt-0">
      <div class="container-page">
        <div class="relative overflow-hidden rounded-3xl bg-ink-950 p-8 text-white shadow-ink lg:p-12">
          <div class="bg-grid absolute inset-0 opacity-30"></div>
          <div class="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-500/20 blur-[120px]"></div>
          <div class="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-accent-500/20 blur-[120px]"></div>
          <div class="relative grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <span class="eyebrow mb-3">
                <span class="h-1 w-1 rounded-full bg-brand-400"></span>¿No sabes por dónde empezar?
              </span>
              <h2 class="text-3xl sm:text-4xl">Explora todo nuestro catálogo</h2>
              <p class="mt-4 max-w-xl text-base leading-relaxed text-white/70">
                Filtra por marca, precio y condición, o déjate asesorar por nuestro equipo para
                encontrar exactamente lo que tu empresa necesita.
              </p>
            </div>
            <div class="flex flex-col gap-3 lg:items-end">
              <a ycButton variant="primary" size="lg" routerLink="/catalogo">
                Ver todo el catálogo <yc-icon name="arrow-right" [size]="18" />
              </a>
              <a ycButton variant="outline" size="md" routerLink="/contacto">
                Pedir asesoría <yc-icon name="chevron-right" [size]="18" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class Categories implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly seo = inject(SeoService);

  protected readonly categories = toSignal(this.catalog.getCategories(), { initialValue: [] });

  ngOnInit(): void {
    this.seo.update({
      title: 'Categorías',
      description:
        'Explora la tecnología corporativa de Yes Computo por categoría: portátiles, equipos de escritorio, componentes, periféricos, redes y más. Equipos nuevos y reacondicionados con garantía en Cartagena.',
      path: '/categorias',
    });
  }
}

import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SeoService } from '../../core/services/seo.service';

import { Button } from '../../shared/components/button/button';
import { Icon } from '../../shared/components/icon/icon';
import { Logo } from '../../shared/components/logo/logo';

@Component({
  selector: 'yc-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Button, Icon, Logo],
  template: `
    <section class="relative grid min-h-[70vh] place-items-center overflow-hidden bg-ink-950 text-white">
      <div class="bg-grid absolute inset-0 opacity-40"></div>
      <div class="absolute -right-24 top-0 h-80 w-80 rounded-full bg-brand-500/20 blur-[120px]"></div>
      <div class="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-accent-500/20 blur-[120px]"></div>

      <div class="container-page relative py-16 text-center">
        <yc-logo [size]="40" tone="light" class="mx-auto mb-10 block w-fit" />

        <p class="text-gradient-brand text-8xl font-bold leading-none sm:text-9xl">404</p>

        <h1 class="mt-6 text-3xl sm:text-4xl">Página no encontrada</h1>
        <p class="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/70">
          Lo sentimos, la página que buscas no existe o fue movida. Pero no te preocupes: tenemos
          tecnología corporativa, reacondicionados y servicio técnico esperándote.
        </p>

        <div class="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a ycButton variant="primary" size="lg" routerLink="/">
            Volver al inicio <yc-icon name="arrow-right" [size]="18" />
          </a>
          <a ycButton variant="outline" size="lg" routerLink="/catalogo">
            Ver catálogo <yc-icon name="search" [size]="18" />
          </a>
        </div>

        <div class="mt-10 flex flex-wrap items-center justify-center gap-3">
          @for (link of quickLinks; track link.path) {
            <a
              [routerLink]="link.path"
              [queryParams]="link.query ?? {}"
              class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur transition hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              <yc-icon [name]="link.icon" [size]="16" />{{ link.label }}
            </a>
          }
        </div>
      </div>
    </section>
  `,
})
export class NotFound implements OnInit {
  private readonly seo = inject(SeoService);

  protected readonly quickLinks: {
    label: string;
    path: string;
    icon: string;
    query?: Record<string, string>;
  }[] = [
    { label: 'Servicios', path: '/servicios', icon: 'wrench' },
    { label: 'Contacto', path: '/contacto', icon: 'phone' },
    // ALL refurbished (any category), not just the "Portátiles Reacondicionados" one.
    { label: 'Reacondicionados', path: '/catalogo', icon: 'recycle', query: { condition: 'reacondicionado' } },
  ];

  ngOnInit(): void {
    this.seo.update({
      title: 'Página no encontrada',
      description:
        'La página que buscas no existe o fue movida. Vuelve al inicio o explora el catálogo de tecnología corporativa, reacondicionados y servicios de Yes Computo en Cartagena.',
      path: '/404',
    });
  }
}

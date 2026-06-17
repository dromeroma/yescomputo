import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { Icon } from '../../shared/components/icon/icon';

/**
 * Thumb-friendly bottom navigation, shown only on phones/tablets (hidden ≥lg).
 * Keeps the primary destinations one tap away in the natural thumb zone —
 * the standard premium mobile-commerce pattern. Respects iOS safe-area inset.
 */
@Component({
  selector: 'yc-mobile-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, Icon],
  host: { class: 'lg:hidden' },
  template: `
    <nav
      class="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 backdrop-blur-xl lg:hidden"
      style="padding-bottom: env(safe-area-inset-bottom)"
      aria-label="Navegación principal"
    >
      <ul class="mx-auto grid max-w-md grid-cols-4">
        @for (item of items; track item.link) {
          <li>
            <a
              [routerLink]="item.link"
              routerLinkActive="text-brand-600 dark:text-brand-400"
              [routerLinkActiveOptions]="{ exact: item.exact }"
              #rla="routerLinkActive"
              class="relative flex flex-col items-center gap-1 py-2.5 text-content-subtle transition-colors"
            >
              <span class="relative">
                <yc-icon [name]="item.icon" [size]="23" [strokeWidth]="rla.isActive ? 2.4 : 1.9" />
                @if (item.link === '/carrito' && cartCount() > 0) {
                  <span
                    class="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-500 px-1 text-[0.6rem] font-bold text-ink-950"
                    >{{ cartCount() }}</span
                  >
                }
              </span>
              <span class="text-[0.65rem] font-semibold tracking-wide">{{ item.label }}</span>
              @if (rla.isActive) {
                <span class="absolute top-0 h-0.5 w-8 rounded-full bg-brand-500"></span>
              }
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
})
export class MobileNav {
  private readonly cartService = inject(CartService);
  protected readonly cartCount = this.cartService.count;

  protected readonly items = [
    { label: 'Inicio', icon: 'home', link: '/', exact: true },
    { label: 'Catálogo', icon: 'grid', link: '/catalogo', exact: false },
    { label: 'Categorías', icon: 'sliders', link: '/categorias', exact: false },
    { label: 'Carrito', icon: 'cart', link: '/carrito', exact: false },
  ];
}

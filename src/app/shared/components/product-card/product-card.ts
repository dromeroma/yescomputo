import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models';
import { CartService } from '../../../core/services/cart.service';
import { CopCurrencyPipe } from '../../pipes/cop-currency.pipe';
import { Badge } from '../badge/badge';
import { Icon } from '../icon/icon';
import { ProductImage } from '../product-image/product-image';
import { Rating } from '../rating/rating';

/**
 * Reusable product card used across home rails, catalog grid and related
 * products. Self-contained: links to the detail page and can add to cart.
 */
@Component({
  selector: 'yc-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CopCurrencyPipe, Badge, Icon, ProductImage, Rating],
  host: { class: 'group block h-full reveal' },
  template: `
    <article
      class="shine relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface-raised
             shadow-card transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
             hover:-translate-y-1.5 hover:border-line-strong hover:shadow-card-hover"
    >
      <!-- Hover accent line -->
      <span
        class="card-accent absolute inset-x-0 top-0 z-10 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-brand-500 to-accent-500
               transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
      ></span>

      <!-- Image -->
      <a
        [routerLink]="['/producto', product().slug]"
        class="relative block aspect-[4/3] overflow-hidden bg-white"
        [attr.aria-label]="product().name"
      >
        <div class="h-full w-full transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]">
          <yc-product-image
            [src]="product().images[0]?.url"
            [icon]="categoryIcon()"
            [label]="product().brandName"
            [seed]="product().id"
          />
        </div>

        <!-- Flags -->
        <div class="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          @if (discount() > 0) {
            <yc-badge tone="brand">-{{ discount() }}%</yc-badge>
          }
          @if (product().isNew) {
            <yc-badge tone="accent">Nuevo</yc-badge>
          }
          @if (product().condition === 'reacondicionado') {
            <yc-badge tone="success"><yc-icon name="leaf" [size]="11" />Reacond.</yc-badge>
          }
        </div>

        @if (product().availableForRent) {
          <span
            class="absolute right-2.5 top-2.5 hidden rounded-full bg-ink-900/85 px-2.5 py-1 text-2xs font-semibold uppercase tracking-wider text-white backdrop-blur sm:block"
            >También en alquiler</span
          >
        }

        <!-- Colombia flag pin — shown only in football mode (pure CSS) -->
        <span class="camp-flag pointer-events-none absolute bottom-2.5 right-2.5 z-[6]">
          <span class="flag-co block h-4 w-6 rounded-[3px] shadow-md ring-1 ring-white/70"></span>
        </span>
      </a>

      <!-- Body -->
      <div class="flex flex-1 flex-col p-3 sm:p-5">
        <div class="mb-1 flex items-center justify-between gap-2">
          <span class="truncate text-2xs font-semibold uppercase tracking-wider text-accent-600">{{
            product().categoryName
          }}</span>
          @if (product().rating) {
            <span class="hidden sm:inline-flex"><yc-rating [value]="product().rating!" /></span>
          }
        </div>

        <h3 class="line-clamp-2 min-h-[2.5rem] font-display text-sm font-semibold leading-snug text-content sm:min-h-[2.75rem] sm:text-base">
          <a [routerLink]="['/producto', product().slug]" class="hover:text-brand-700">{{
            product().name
          }}</a>
        </h3>
        <p class="mt-1 hidden line-clamp-2 text-sm text-content-muted sm:block sm:min-h-[2.5rem]">{{ product().tagline }}</p>

        <!-- Price (anchored to the bottom so every card lines up) -->
        <div class="mt-auto flex items-end justify-between gap-1.5 pt-3 sm:gap-2 sm:pt-4">
          <div class="min-w-0">
            <!-- Reserve one line for the strike-through price always (min-h: 1lh)
                 so discounted and non-discounted cards have identical height. -->
            <span class="block min-h-[1lh] truncate text-2xs text-content-subtle line-through sm:text-xs">
              @if (product().compareAtPrice) { {{ product().compareAtPrice | cop }} }
            </span>
            <span class="block truncate font-display text-sm font-bold tabular-nums text-content sm:text-xl">{{ product().price | cop }}</span>
            @if (product().availableForRent && product().rentalMonthlyPrice) {
              <span class="hidden text-xs text-content-muted sm:block"
                >o {{ product().rentalMonthlyPrice | cop }}/mes</span
              >
            }
          </div>

          <button
            type="button"
            (click)="addToCart()"
            class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink-950 text-white
                   transition-all hover:bg-brand-500 hover:text-ink-950 active:scale-95 sm:h-11 sm:w-11"
            [attr.aria-label]="'Agregar ' + product().name + ' al carrito'"
          >
            <yc-icon name="cart" [size]="18" />
          </button>
        </div>

        <!-- Stock hint -->
        <div class="mt-2.5 flex items-center gap-1.5 text-2xs sm:mt-3 sm:text-xs" [class]="stockClass()">
          <span class="h-1.5 w-1.5 shrink-0 rounded-full" [class]="stockDotClass()"></span>
          <span class="truncate">{{ stockLabel() }}</span>
        </div>
      </div>
    </article>
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();
  /** Category glyph for the placeholder image. */
  readonly categoryIcon = input('cpu');

  private readonly cart = inject(CartService);

  protected readonly discount = computed(() => {
    const p = this.product();
    if (!p.compareAtPrice || p.compareAtPrice <= p.price) return 0;
    return Math.round((1 - p.price / p.compareAtPrice) * 100);
  });

  protected readonly stockLabel = computed(() => {
    switch (this.product().stockStatus) {
      case 'in_stock':
        return 'Disponible · entrega inmediata';
      case 'low_stock':
        return `Pocas unidades${this.product().stockUnits ? ' (' + this.product().stockUnits + ')' : ''}`;
      case 'on_demand':
        return 'Bajo pedido';
      default:
        return 'Agotado';
    }
  });

  protected readonly stockClass = computed(() => {
    const s = this.product().stockStatus;
    return s === 'out_of_stock' ? 'text-content-subtle' : 'text-content-muted';
  });

  protected readonly stockDotClass = computed(() => {
    switch (this.product().stockStatus) {
      case 'in_stock':
        return 'bg-emerald-500';
      case 'low_stock':
        return 'bg-amber-500';
      case 'on_demand':
        return 'bg-accent-500';
      default:
        return 'bg-ink-300';
    }
  });

  protected addToCart(): void {
    this.cart.add(this.product());
  }
}

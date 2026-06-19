import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartService } from '../../../core/services/cart.service';
import { WhatsappService } from '../../../core/services/whatsapp.service';
import { FeaturesService } from '../../../core/services/features.service';
import { CartItem } from '../../../core/models';
import { categoryIcon } from '../../utils/category-icons';

import { Button } from '../button/button';
import { Icon } from '../icon/icon';
import { ProductImage } from '../product-image/product-image';
import { CopCurrencyPipe } from '../../pipes/cop-currency.pipe';

/**
 * Slide-over mini-cart. Opens automatically when an item is added and from the
 * header cart button. Mirrors the full cart page but stays in context — the
 * pattern every professional store uses to keep shoppers in the flow.
 */
@Component({
  selector: 'yc-cart-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Button, Icon, ProductImage, CopCurrencyPipe],
  host: { '(document:keydown.escape)': 'onEscape()' },
  templateUrl: './cart-drawer.html',
})
export class CartDrawer {
  private readonly cart = inject(CartService);
  private readonly whatsapp = inject(WhatsappService);
  private readonly features = inject(FeaturesService);
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly catIcon = categoryIcon;

  protected readonly open = this.cart.drawerOpen;
  protected readonly items = this.cart.items;
  protected readonly summary = this.cart.summary;
  protected readonly count = this.cart.count;
  protected readonly isEmpty = this.cart.isEmpty;

  protected readonly quoteLink = computed(() => this.whatsapp.cartQuote(this.items()));

  /** Premium Checkout por WhatsApp (gated by whatsapp_checkout). */
  protected readonly checkoutEnabled = this.features.flag('whatsapp_checkout');
  protected readonly checkoutLink = computed(() =>
    this.whatsapp.cartCheckout(this.items(), this.summary()),
  );

  /** Key of the line item pending removal confirmation (null = none). */
  protected readonly confirmingKey = signal<string | null>(null);

  protected keyOf(item: CartItem): string {
    return item.product.id + ':' + item.mode;
  }

  constructor() {
    // Lock body scroll while the drawer is open (browser only).
    effect(() => {
      if (!this.isBrowser) return;
      this.doc.body.style.overflow = this.open() ? 'hidden' : '';
    });
  }

  protected close(): void {
    this.cart.closeDrawer();
  }

  // Public so the `host` keydown binding resolves under strict host type-checks.
  onEscape(): void {
    if (this.open()) this.close();
  }

  protected unitPrice(item: CartItem): number {
    return item.mode === 'rent'
      ? item.product.rentalMonthlyPrice ?? item.product.price
      : item.product.price;
  }

  protected setQty(item: CartItem, qty: number): void {
    this.cart.setQuantity(item.product.id, item.mode, qty);
  }

  protected askRemove(item: CartItem): void {
    this.confirmingKey.set(this.keyOf(item));
  }

  protected cancelRemove(): void {
    this.confirmingKey.set(null);
  }

  protected confirmRemove(item: CartItem): void {
    this.cart.remove(item.product.id, item.mode);
    this.confirmingKey.set(null);
  }
}

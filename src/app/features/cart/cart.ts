import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartService } from '../../core/services/cart.service';
import { SeoService } from '../../core/services/seo.service';
import { WhatsappService } from '../../core/services/whatsapp.service';
import { AcquisitionMode, CartItem } from '../../core/models';
import { categoryIcon } from '../../shared/utils/category-icons';

import { Button } from '../../shared/components/button/button';
import { Icon } from '../../shared/components/icon/icon';
import { ProductImage } from '../../shared/components/product-image/product-image';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';

@Component({
  selector: 'yc-cart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Button, Icon, ProductImage, CopCurrencyPipe],
  templateUrl: './cart.html',
})
export class Cart implements OnInit {
  private readonly cart = inject(CartService);
  private readonly whatsapp = inject(WhatsappService);
  private readonly seo = inject(SeoService);

  readonly catIcon = categoryIcon;

  protected readonly items = this.cart.items;
  protected readonly summary = this.cart.summary;
  protected readonly isEmpty = this.cart.isEmpty;

  protected readonly quoteLink = computed(() => this.whatsapp.cartQuote(this.items()));

  /** Key of the line item pending removal confirmation (null = none). */
  protected readonly confirmingKey = signal<string | null>(null);

  protected keyOf(item: CartItem): string {
    return item.product.id + ':' + item.mode;
  }

  ngOnInit(): void {
    this.seo.update({
      title: 'Carrito de cotización',
      description: 'Revisa los equipos seleccionados y solicita tu cotización a Yes Computo.',
      path: '/carrito',
    });
  }

  protected unitPrice(item: CartItem): number {
    return item.mode === 'rent'
      ? item.product.rentalMonthlyPrice ?? item.product.price
      : item.product.price;
  }

  protected setQty(item: CartItem, qty: number): void {
    this.cart.setQuantity(item.product.id, item.mode, qty);
  }

  /** Step 1: ask for confirmation. */
  protected askRemove(item: CartItem): void {
    this.confirmingKey.set(this.keyOf(item));
  }

  protected cancelRemove(): void {
    this.confirmingKey.set(null);
  }

  /** Step 2: confirmed — actually remove. */
  protected confirmRemove(item: CartItem): void {
    this.cart.remove(item.product.id, item.mode);
    this.confirmingKey.set(null);
  }

  protected readonly confirmingClear = signal(false);

  protected askClear(): void {
    this.confirmingClear.set(true);
  }

  protected cancelClear(): void {
    this.confirmingClear.set(false);
  }

  protected confirmClear(): void {
    this.cart.clear();
    this.confirmingClear.set(false);
  }
}

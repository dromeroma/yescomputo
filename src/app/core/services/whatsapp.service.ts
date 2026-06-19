import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';
import { CartItem, CartSummary, Product } from '../models';

/**
 * Builds deep-links to WhatsApp Business — the primary conversion channel for
 * Yes Computo. Centralised so every CTA across the site uses the same number
 * and message conventions.
 */
@Injectable({ providedIn: 'root' })
export class WhatsappService {
  private readonly config = inject(APP_CONFIG);

  /** Generic chat link with an optional prefilled message. */
  link(message?: string): string {
    const number = this.config.company.whatsappNumber;
    const text = message ? `?text=${encodeURIComponent(message)}` : '';
    return `https://wa.me/${number}${text}`;
  }

  /** "I'm interested in this product" message. */
  productInquiry(product: Product): string {
    const msg =
      `¡Hola Yes Computo! 👋 Estoy interesado(a) en el producto ` +
      `*${product.name}* (SKU ${product.sku}). ¿Me pueden dar más información?`;
    return this.link(msg);
  }

  /** Rental enquiry for a specific product. */
  rentalInquiry(product: Product): string {
    const msg =
      `¡Hola Yes Computo! 👋 Quiero información sobre el *alquiler* de ` +
      `*${product.name}*. ¿Qué planes manejan?`;
    return this.link(msg);
  }

  /**
   * Premium "Checkout por WhatsApp": a complete, itemised order with unit
   * prices, line totals, the estimated total and optional customer details —
   * everything pre-written so the client just hits send. Gated by the
   * `whatsapp_checkout` feature flag.
   */
  cartCheckout(
    items: CartItem[],
    summary: CartSummary,
    opts: { name?: string; note?: string } = {},
  ): string {
    const lines = items
      .map((i) => {
        const unit = i.mode === 'rent' ? i.product.rentalMonthlyPrice ?? i.product.price : i.product.price;
        const rent = i.mode === 'rent' ? '/mes' : '';
        const lineTotal = unit * i.quantity;
        const detail =
          i.quantity > 1
            ? `${this.cop(unit)}${rent} c/u = ${this.cop(lineTotal)}${rent}`
            : `${this.cop(unit)}${rent}`;
        return `• ${i.quantity}× ${i.product.name} — ${detail}`;
      })
      .join('\n');

    const parts = [
      '¡Hola Yes Computo! 🛒 Quiero finalizar este pedido:',
      '',
      lines,
      '',
      `Subtotal: ${this.cop(summary.subtotal)}`,
      `Total estimado: ${this.cop(summary.total)} (IVA incl.)`,
    ];
    if (opts.name?.trim()) parts.push('', `Cliente: ${opts.name.trim()}`);
    if (opts.note?.trim()) parts.push(`Nota: ${opts.note.trim()}`);
    parts.push('', '¿Me confirman disponibilidad y forma de pago? 🙌');
    return this.link(parts.join('\n'));
  }

  /** Format a COP amount for plain-text messages (e.g. $1.250.000). */
  private cop(value: number): string {
    return '$' + Math.round(value).toLocaleString('es-CO');
  }

  /** Send the whole cart as a quote request. */
  cartQuote(items: CartItem[]): string {
    const lines = items
      .map(
        (i) =>
          `• ${i.quantity}× ${i.product.name}` +
          (i.mode === 'rent' ? ' (alquiler)' : ''),
      )
      .join('\n');
    const msg =
      `¡Hola Yes Computo! 👋 Quiero cotizar los siguientes equipos:\n\n${lines}\n\n` +
      `¿Me ayudan con la cotización?`;
    return this.link(msg);
  }
}

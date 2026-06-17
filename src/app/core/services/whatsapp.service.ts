import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';
import { CartItem, Product } from '../models';

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

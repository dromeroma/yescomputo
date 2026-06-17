import { Product } from './product.model';

/** Purchase mode for a line item: outright purchase or monthly rental. */
export type AcquisitionMode = 'buy' | 'rent';

export interface CartItem {
  product: Product;
  quantity: number;
  mode: AcquisitionMode;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  /** Estimated only — final quote is confirmed via WhatsApp/checkout. */
  estimatedTax: number;
  total: number;
}

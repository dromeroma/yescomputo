import {
  afterNextRender,
  computed,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AcquisitionMode, CartItem, CartSummary, Product } from '../models';

const STORAGE_KEY = 'yc.cart.v1';
const TAX_RATE = 0.19; // IVA Colombia — indicative only; final quote via checkout.

/**
 * Signal-based shopping cart with localStorage persistence and a mini-cart
 * drawer.
 *
 * Hydration-safe: state starts empty (matching SSR), then `afterNextRender`
 * restores the saved cart on the client *after* hydration completes — avoiding
 * the badge count mismatching between server and client render. All state is
 * exposed as readonly signals so the header badge, drawer and cart page react
 * automatically. A future `OrderService` will turn the cart into a quote/order
 * against FastAPI.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** Starts empty so SSR and the first client render agree (count = 0). */
  private readonly _items = signal<CartItem[]>([]);
  private readonly _drawerOpen = signal(false);

  /** Reactive list of line items. */
  readonly items = this._items.asReadonly();
  /** Mini-cart drawer visibility. */
  readonly drawerOpen = this._drawerOpen.asReadonly();

  /** Total unit count across all line items (drives the header badge). */
  readonly count = computed(() =>
    this._items().reduce((sum, item) => sum + item.quantity, 0),
  );

  /** Number of distinct line items. */
  readonly lineCount = computed(() => this._items().length);

  readonly isEmpty = computed(() => this._items().length === 0);

  /** Money summary; tax is indicative. */
  readonly summary = computed<CartSummary>(() => {
    const subtotal = this._items().reduce(
      (sum, item) => sum + this.unitPrice(item) * item.quantity,
      0,
    );
    const estimatedTax = Math.round(subtotal * TAX_RATE);
    return {
      itemCount: this.count(),
      subtotal,
      estimatedTax,
      total: subtotal + estimatedTax,
    };
  });

  constructor() {
    // Restore the persisted cart only after hydration, in the browser.
    afterNextRender(() => {
      const restored = this.restore();
      if (restored.length) this._items.set(restored);
    });
  }

  add(product: Product, mode: AcquisitionMode = 'buy', quantity = 1): void {
    this._items.update((items) => {
      const existing = items.find(
        (i) => i.product.id === product.id && i.mode === mode,
      );
      if (existing) {
        return items.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...items, { product, mode, quantity }];
    });
    this.persist();
    if (this.isBrowser) this._drawerOpen.set(true);
  }

  openDrawer(): void {
    this._drawerOpen.set(true);
  }

  closeDrawer(): void {
    this._drawerOpen.set(false);
  }

  setQuantity(productId: string, mode: AcquisitionMode, quantity: number): void {
    if (quantity <= 0) return this.remove(productId, mode);
    this._items.update((items) =>
      items.map((i) =>
        i.product.id === productId && i.mode === mode ? { ...i, quantity } : i,
      ),
    );
    this.persist();
  }

  remove(productId: string, mode: AcquisitionMode): void {
    this._items.update((items) =>
      items.filter((i) => !(i.product.id === productId && i.mode === mode)),
    );
    this.persist();
  }

  clear(): void {
    this._items.set([]);
    this.persist();
  }

  private unitPrice(item: CartItem): number {
    return item.mode === 'rent'
      ? item.product.rentalMonthlyPrice ?? item.product.price
      : item.product.price;
  }

  // --- persistence ---------------------------------------------------------

  private persist(): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._items()));
    } catch {
      /* storage may be unavailable (private mode); cart stays in-memory. */
    }
  }

  private restore(): CartItem[] {
    if (!this.isBrowser) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  }
}

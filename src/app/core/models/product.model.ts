/**
 * Product domain model.
 *
 * This interface is the contract between the UI and the data layer. It is
 * intentionally framed as the shape a FastAPI + Supabase backend would return,
 * so migrating from the local JSON fixtures to live endpoints is a drop-in
 * change at the data-source level (see `core/data`).
 */

/** Stock / availability state. Mirrors a future `products.condition` enum. */
export type ProductCondition = 'nuevo' | 'reacondicionado' | 'outlet';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_demand';

/** A single technical specification row (e.g. "RAM" → "16 GB DDR4"). */
export interface SpecItem {
  label: string;
  value: string;
  /** Optional grouping, e.g. "Procesamiento", "Pantalla", "Conectividad". */
  group?: string;
}

/** Product image with responsive/alt metadata. */
export interface ProductImage {
  url: string;
  alt: string;
  /** Marks the primary catalog/thumbnail image. */
  primary?: boolean;
}

export interface Product {
  id: string;
  /** URL-friendly identifier used in routes: /producto/:slug */
  slug: string;
  name: string;
  /** Short marketing line shown on cards. */
  tagline: string;
  description: string;

  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  /** Free-form line within a brand, e.g. "ThinkPad T Series". */
  productLine?: string;

  condition: ProductCondition;
  sku: string;

  /** Pricing in Colombian Pesos (COP), integers. */
  price: number;
  /** Optional strike-through original price for promos. */
  compareAtPrice?: number;
  /** True when this product is available for rental/leasing. */
  availableForRent: boolean;
  /** Monthly rental price in COP, when rentable. */
  rentalMonthlyPrice?: number;

  stockStatus: StockStatus;
  /** Indicative units available (UI shows "pocas unidades" under a threshold). */
  stockUnits?: number;

  images: ProductImage[];
  /** Headline bullet features for cards / quick view. */
  highlights: string[];
  /** Full technical spec sheet. */
  specs: SpecItem[];

  rating?: number;
  reviewCount?: number;

  /** Merchandising flags drive badges & home-page rails. */
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  /** Warranty in months. */
  warrantyMonths?: number;

  tags?: string[];
  createdAt?: string;
}

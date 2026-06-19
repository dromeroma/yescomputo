/**
 * Transport-level contracts shared across services.
 *
 * These mirror the envelopes a paginated FastAPI catalog endpoint would
 * return, so list components can be wired to the real API without changes.
 */

/** Standard paginated list envelope. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  /** True when a search found no exact match and these are closest suggestions. */
  approximate?: boolean;
}

export type SortOption =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'name_asc'
  | 'rating_desc';

/** Query/filter parameters for the catalog. Serialises 1:1 to query params. */
export interface ProductQuery {
  search?: string;
  categorySlug?: string;
  brandSlugs?: string[];
  conditions?: string[];
  minPrice?: number;
  maxPrice?: number;
  rentableOnly?: boolean;
  inStockOnly?: boolean;
  tags?: string[];
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

/** A computed facet (e.g. available brands with counts) for filter sidebars. */
export interface Facet {
  value: string;
  label: string;
  count: number;
}

export interface CatalogFacets {
  brands: Facet[];
  conditions: Facet[];
  priceRange: { min: number; max: number };
}

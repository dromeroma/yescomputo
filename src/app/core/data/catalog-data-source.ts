import { Observable } from 'rxjs';
import { Brand, CatalogFacets, Category, Paginated, Product, ProductQuery, Promotion } from '../models';

/**
 * Catalog data-access contract.
 *
 * The entire application talks to the catalog through this abstract class only.
 * Today it is fulfilled by {@link LocalCatalogDataSource} (reads JSON fixtures);
 * tomorrow an `ApiCatalogDataSource` backed by FastAPI can be provided in its
 * place with zero changes to feature code — see `app.config.ts` provider.
 *
 * Every method returns an Observable so the local and HTTP implementations are
 * interchangeable.
 */
export abstract class CatalogDataSource {
  /** Paginated, filtered, sorted product query. */
  abstract getProducts(query: ProductQuery): Observable<Paginated<Product>>;

  /** Single product by its URL slug. Emits `undefined` when not found. */
  abstract getProductBySlug(slug: string): Observable<Product | undefined>;

  /** Computed facets (brands, conditions, price range) for filter sidebars. */
  abstract getFacets(query: ProductQuery): Observable<CatalogFacets>;

  /** Lightweight related-products lookup (same category, excluding self). */
  abstract getRelatedProducts(slug: string, limit?: number): Observable<Product[]>;

  abstract getCategories(): Observable<Category[]>;
  abstract getCategoryBySlug(slug: string): Observable<Category | undefined>;

  abstract getBrands(): Observable<Brand[]>;
  abstract getBrandBySlug(slug: string): Observable<Brand | undefined>;

  abstract getPromotions(): Observable<Promotion[]>;
}

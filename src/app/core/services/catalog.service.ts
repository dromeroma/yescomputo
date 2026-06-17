import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { CatalogDataSource } from '../data/catalog-data-source';
import {
  Brand,
  CatalogFacets,
  Category,
  Paginated,
  Product,
  ProductQuery,
  Promotion,
} from '../models';

/**
 * Application-facing catalog facade.
 *
 * Feature components depend on this service, never on a concrete data source.
 * It adds light caching for reference data (categories/brands/promotions) that
 * rarely changes, while product queries always hit the source so filters stay
 * fresh.
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly source = inject(CatalogDataSource);

  private categories$?: Observable<Category[]>;
  private brands$?: Observable<Brand[]>;
  private promotions$?: Observable<Promotion[]>;

  getProducts(query: ProductQuery = {}): Observable<Paginated<Product>> {
    return this.source.getProducts(query);
  }

  getProductBySlug(slug: string): Observable<Product | undefined> {
    return this.source.getProductBySlug(slug);
  }

  getFacets(query: ProductQuery = {}): Observable<CatalogFacets> {
    return this.source.getFacets(query);
  }

  getRelatedProducts(slug: string, limit?: number): Observable<Product[]> {
    return this.source.getRelatedProducts(slug, limit);
  }

  getCategories(): Observable<Category[]> {
    return (this.categories$ ??= this.source.getCategories().pipe(shareReplay(1)));
  }

  getCategoryBySlug(slug: string): Observable<Category | undefined> {
    return this.source.getCategoryBySlug(slug);
  }

  getBrands(): Observable<Brand[]> {
    return (this.brands$ ??= this.source.getBrands().pipe(shareReplay(1)));
  }

  getBrandBySlug(slug: string): Observable<Brand | undefined> {
    return this.source.getBrandBySlug(slug);
  }

  getPromotions(): Observable<Promotion[]> {
    return (this.promotions$ ??= this.source.getPromotions().pipe(shareReplay(1)));
  }
}

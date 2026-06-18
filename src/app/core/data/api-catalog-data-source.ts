import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';
import {
  Brand,
  CatalogFacets,
  Category,
  Paginated,
  Product,
  ProductQuery,
  Promotion,
} from '../models';
import { CatalogDataSource } from './catalog-data-source';

/**
 * HTTP implementation of {@link CatalogDataSource}, backed by the FastAPI public
 * API (`/v1/catalog/*`). Activated by setting `AppConfig.dataSource = 'api'`;
 * the rest of the app is unchanged. Query params map 1:1 to `ProductQuery`
 * (camelCase; array filters are sent as CSV, matching the backend contract).
 */
@Injectable()
export class ApiCatalogDataSource extends CatalogDataSource {
  private readonly http = inject(HttpClient);
  /** AppConfig.apiBaseUrl already ends with `/v1`. */
  private readonly base = inject(APP_CONFIG).apiBaseUrl.replace(/\/$/, '');

  private url(path: string): string {
    return `${this.base}${path}`;
  }

  private params(q: ProductQuery): HttpParams {
    let p = new HttpParams();
    const set = (k: string, v: unknown) => {
      if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
    };
    const csv = (k: string, v?: string[]) => {
      if (v && v.length) p = p.set(k, v.join(','));
    };
    set('search', q.search);
    set('categorySlug', q.categorySlug);
    csv('brandSlugs', q.brandSlugs);
    csv('conditions', q.conditions);
    set('minPrice', q.minPrice);
    set('maxPrice', q.maxPrice);
    if (q.rentableOnly) p = p.set('rentableOnly', 'true');
    if (q.inStockOnly) p = p.set('inStockOnly', 'true');
    csv('tags', q.tags);
    set('sort', q.sort);
    set('page', q.page);
    set('pageSize', q.pageSize);
    return p;
  }

  override getProducts(query: ProductQuery): Observable<Paginated<Product>> {
    return this.http.get<Paginated<Product>>(this.url('/catalog/products'), {
      params: this.params(query),
    });
  }

  override getProductBySlug(slug: string): Observable<Product | undefined> {
    return this.http
      .get<Product>(this.url(`/catalog/products/${encodeURIComponent(slug)}`))
      .pipe(catchError(() => of(undefined)));
  }

  override getFacets(query: ProductQuery): Observable<CatalogFacets> {
    return this.http.get<CatalogFacets>(this.url('/catalog/facets'), {
      params: this.params(query),
    });
  }

  override getRelatedProducts(slug: string, limit = 4): Observable<Product[]> {
    return this.http
      .get<Product[]>(this.url(`/catalog/products/${encodeURIComponent(slug)}/related`), {
        params: new HttpParams().set('limit', String(limit)),
      })
      .pipe(catchError(() => of([])));
  }

  override getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.url('/catalog/categories'));
  }

  override getCategoryBySlug(slug: string): Observable<Category | undefined> {
    return this.http
      .get<Category>(this.url(`/catalog/categories/${encodeURIComponent(slug)}`))
      .pipe(catchError(() => of(undefined)));
  }

  override getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(this.url('/catalog/brands'));
  }

  override getBrandBySlug(slug: string): Observable<Brand | undefined> {
    return this.http
      .get<Brand>(this.url(`/catalog/brands/${encodeURIComponent(slug)}`))
      .pipe(catchError(() => of(undefined)));
  }

  override getPromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(this.url('/catalog/promotions'));
  }
}

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  Brand,
  CatalogFacets,
  Category,
  Facet,
  Paginated,
  Product,
  ProductQuery,
  Promotion,
  SortOption,
} from '../models';
import { CatalogDataSource } from './catalog-data-source';

import productsJson from './fixtures/products.json';
import categoriesJson from './fixtures/categories.json';
import brandsJson from './fixtures/brands.json';
import promotionsJson from './fixtures/promotions.json';

/**
 * Local, in-memory implementation of {@link CatalogDataSource}.
 *
 * Reads typed JSON fixtures bundled at build time (SSR-safe — no network) and
 * performs filtering, sorting, pagination and faceting client-side, mimicking
 * exactly what the FastAPI catalog endpoints will eventually do server-side.
 *
 * To go live, implement `ApiCatalogDataSource` with `HttpClient` against
 * `AppConfig.apiBaseUrl` and swap the provider in `app.config.ts`. No feature
 * code changes.
 */
@Injectable()
export class LocalCatalogDataSource extends CatalogDataSource {
  private readonly products = productsJson as Product[];
  private readonly categories = categoriesJson as Category[];
  private readonly brands = brandsJson as Brand[];
  private readonly promotions = promotionsJson as Promotion[];

  override getProducts(query: ProductQuery): Observable<Paginated<Product>> {
    const filtered = this.applyFilters(query);
    const sorted = this.applySort(filtered, query.sort ?? 'relevance');

    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, query.pageSize ?? 12);
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const items = sorted.slice(start, start + pageSize);

    return of({ items, total, page, pageSize, totalPages });
  }

  override getProductBySlug(slug: string): Observable<Product | undefined> {
    return of(this.products.find((p) => p.slug === slug));
  }

  override getFacets(query: ProductQuery): Observable<CatalogFacets> {
    // Cross-faceting: each facet group is computed against the full query while
    // ignoring ONLY its own selection — so the counts stay coherent and a click
    // never yields an empty result. In particular, brand counts respect the
    // active condition filter (e.g. the fixed "reacondicionado" view), so a
    // brand with no matching products simply doesn't appear.
    const forBrands = this.applyFilters({ ...query, brandSlugs: undefined });
    const brandFacets: Facet[] = this.brands
      .map((b) => ({
        value: b.slug,
        label: b.name,
        count: forBrands.filter((p) => p.brandId === b.id).length,
      }))
      .filter((f) => f.count > 0);

    const conditionLabels: Record<string, string> = {
      nuevo: 'Nuevo',
      reacondicionado: 'Reacondicionado',
      outlet: 'Outlet',
    };
    const forConditions = this.applyFilters({ ...query, conditions: undefined });
    const conditionFacets: Facet[] = Object.keys(conditionLabels)
      .map((value) => ({
        value,
        label: conditionLabels[value],
        count: forConditions.filter((p) => p.condition === value).length,
      }))
      .filter((f) => f.count > 0);

    const forPrice = this.applyFilters({ ...query, minPrice: undefined, maxPrice: undefined });
    const prices = forPrice.map((p) => p.price);
    const priceRange = {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
    };

    return of({ brands: brandFacets, conditions: conditionFacets, priceRange });
  }

  override getRelatedProducts(slug: string, limit = 4): Observable<Product[]> {
    const current = this.products.find((p) => p.slug === slug);
    if (!current) return of([]);
    const related = this.products
      .filter((p) => p.slug !== slug && p.categoryId === current.categoryId)
      .slice(0, limit);
    // Backfill with same-brand items if the category is thin.
    if (related.length < limit) {
      const extra = this.products.filter(
        (p) => p.slug !== slug && p.brandId === current.brandId && !related.includes(p),
      );
      related.push(...extra.slice(0, limit - related.length));
    }
    return of(related);
  }

  override getCategories(): Observable<Category[]> {
    return of([...this.categories].sort((a, b) => (a.order ?? 99) - (b.order ?? 99)));
  }

  override getCategoryBySlug(slug: string): Observable<Category | undefined> {
    return of(this.categories.find((c) => c.slug === slug));
  }

  override getBrands(): Observable<Brand[]> {
    return of([...this.brands].sort((a, b) => a.name.localeCompare(b.name)));
  }

  override getBrandBySlug(slug: string): Observable<Brand | undefined> {
    return of(this.brands.find((b) => b.slug === slug));
  }

  override getPromotions(): Observable<Promotion[]> {
    return of(this.promotions);
  }

  // --- internals -----------------------------------------------------------

  private applyFilters(query: ProductQuery): Product[] {
    let list = this.products;

    if (query.search) {
      const q = query.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.brandName.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          (p.tags ?? []).some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (query.categorySlug) {
      const cat = this.categories.find((c) => c.slug === query.categorySlug);
      if (cat) list = list.filter((p) => p.categoryId === cat.id);
    }

    if (query.brandSlugs?.length) {
      const ids = this.brands
        .filter((b) => query.brandSlugs!.includes(b.slug))
        .map((b) => b.id);
      list = list.filter((p) => ids.includes(p.brandId));
    }

    if (query.conditions?.length) {
      list = list.filter((p) => query.conditions!.includes(p.condition));
    }

    if (query.minPrice != null) list = list.filter((p) => p.price >= query.minPrice!);
    if (query.maxPrice != null) list = list.filter((p) => p.price <= query.maxPrice!);

    if (query.rentableOnly) list = list.filter((p) => p.availableForRent);
    if (query.inStockOnly) list = list.filter((p) => p.stockStatus !== 'out_of_stock');

    if (query.tags?.length) {
      list = list.filter((p) => (p.tags ?? []).some((t) => query.tags!.includes(t)));
    }

    return list;
  }

  private applySort(list: Product[], sort: SortOption): Product[] {
    const copy = [...list];
    switch (sort) {
      case 'price_asc':
        return copy.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return copy.sort((a, b) => b.price - a.price);
      case 'newest':
        return copy.sort(
          (a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
        );
      case 'name_asc':
        return copy.sort((a, b) => a.name.localeCompare(b.name));
      case 'rating_desc':
        return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case 'relevance':
      default:
        // Featured & best-sellers float to the top.
        return copy.sort(
          (a, b) =>
            Number(b.isFeatured ?? false) - Number(a.isFeatured ?? false) ||
            Number(b.isBestSeller ?? false) - Number(a.isBestSeller ?? false) ||
            (b.rating ?? 0) - (a.rating ?? 0),
        );
    }
  }
}

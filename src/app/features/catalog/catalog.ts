import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { combineLatest, map, switchMap } from 'rxjs';

import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';
import { CatalogFacets, Category, Paginated, Product, ProductQuery, SortOption } from '../../core/models';
import { categoryIcon } from '../../shared/utils/category-icons';

import { Button } from '../../shared/components/button/button';
import { Icon } from '../../shared/components/icon/icon';
import { ProductCard } from '../../shared/components/product-card/product-card';

const EMPTY_RESULT: Paginated<Product> = {
  items: [], total: 0, page: 1, pageSize: 12, totalPages: 1,
};
const EMPTY_FACETS: CatalogFacets = { brands: [], conditions: [], priceRange: { min: 0, max: 0 } };

/**
 * Unified catalog page. Serves both `/catalogo` and `/categoria/:slug`.
 *
 * All filter state lives in the URL (query params) so results are shareable,
 * bookmarkable and SEO-friendly; navigating updates the query which re-fetches
 * via the reactive `toObservable` → `switchMap` pipeline.
 */
@Component({
  selector: 'yc-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Button, Icon, ProductCard],
  templateUrl: './catalog.html',
})
export class Catalog {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(CatalogService);
  private readonly seo = inject(SeoService);

  readonly catIcon = categoryIcon;
  protected readonly filtersOpen = signal(false);

  readonly sortOptions: { value: SortOption; label: string }[] = [
    { value: 'relevance', label: 'Relevancia' },
    { value: 'price_asc', label: 'Precio: menor a mayor' },
    { value: 'price_desc', label: 'Precio: mayor a menor' },
    { value: 'newest', label: 'Más recientes' },
    { value: 'rating_desc', label: 'Mejor calificados' },
    { value: 'name_asc', label: 'Nombre (A-Z)' },
  ];

  /** Route param `:slug` (present on /categoria/:slug). */
  private readonly slug = toSignal(this.route.paramMap.pipe(map((p) => p.get('slug') ?? undefined)), {
    initialValue: undefined,
  });
  private readonly params = toSignal(this.route.queryParamMap, { initialValue: null });

  /** Special "reacondicionados" landing filters by condition, not category. */
  private readonly isRefurbView = computed(() => this.slug() === 'reacondicionados');

  /** The active query, derived entirely from the URL. */
  protected readonly query = computed<ProductQuery>(() => {
    const p = this.params();
    const slug = this.slug();
    const csv = (key: string) => p?.get(key)?.split(',').filter(Boolean) ?? [];
    return {
      search: p?.get('search') ?? undefined,
      categorySlug: this.isRefurbView() ? undefined : slug,
      conditions: this.isRefurbView() ? ['reacondicionado'] : csv('condition'),
      brandSlugs: csv('brand'),
      rentableOnly: p?.get('rent') === '1',
      inStockOnly: p?.get('stock') === '1',
      sort: (p?.get('sort') as SortOption) ?? 'relevance',
      page: Number(p?.get('page')) || 1,
      pageSize: 12,
    };
  });

  /** Current category (for the hero), if browsing one. */
  protected readonly category = toSignal<Category | undefined>(
    this.route.paramMap.pipe(
      map((p) => p.get('slug') ?? undefined),
      switchMap((slug) =>
        slug && slug !== 'reacondicionados'
          ? this.catalog.getCategoryBySlug(slug)
          : [undefined],
      ),
    ),
    { initialValue: undefined },
  );

  private readonly data = toSignal(
    combineLatest([this.route.paramMap, this.route.queryParamMap]).pipe(
      switchMap(() =>
        this.catalog.getProducts(this.query()).pipe(map((res) => ({ res, q: this.query() }))),
      ),
    ),
    { initialValue: { res: EMPTY_RESULT, q: {} as ProductQuery } },
  );

  protected readonly result = computed(() => this.data().res);

  protected readonly facets = toSignal(
    combineLatest([this.route.paramMap, this.route.queryParamMap]).pipe(
      switchMap(() => this.catalog.getFacets(this.query())),
    ),
    { initialValue: EMPTY_FACETS },
  );

  protected readonly activeBrands = computed(() => this.query().brandSlugs ?? []);
  protected readonly activeConditions = computed(() => this.query().conditions ?? []);

  protected readonly activeFilterCount = computed(() => {
    const q = this.query();
    return (
      (q.brandSlugs?.length ?? 0) +
      (this.isRefurbView() ? 0 : q.conditions?.length ?? 0) +
      (q.rentableOnly ? 1 : 0) +
      (q.inStockOnly ? 1 : 0) +
      (q.search ? 1 : 0)
    );
  });

  protected readonly heading = computed(() => {
    if (this.isRefurbView()) return 'Equipos Reacondicionados';
    if (this.category()) return this.category()!.name;
    if (this.query().search) return `Resultados para "${this.query().search}"`;
    return 'Catálogo completo';
  });

  protected readonly pages = computed(() =>
    Array.from({ length: this.result().totalPages }, (_, i) => i + 1),
  );

  constructor() {
    effect(() => {
      this.seo.update({
        title: this.heading(),
        description:
          this.category()?.description ??
          'Explora el catálogo de tecnología corporativa de Yes Computo: portátiles, escritorios, workstations y más.',
        path: this.router.url,
      });
    });
  }

  // --- URL mutations -------------------------------------------------------

  private patch(params: Params): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: null, ...params },
      queryParamsHandling: 'merge',
    });
  }

  protected toggleCsv(key: string, value: string): void {
    const current = new Set(this.params()?.get(key)?.split(',').filter(Boolean) ?? []);
    current.has(value) ? current.delete(value) : current.add(value);
    this.patch({ [key]: current.size ? [...current].join(',') : null });
  }

  protected toggleFlag(key: string): void {
    this.patch({ [key]: this.params()?.get(key) === '1' ? null : '1' });
  }

  protected setSearch(term: string): void {
    this.patch({ search: term.trim() || null });
  }

  protected setSort(value: string): void {
    this.patch({ sort: value === 'relevance' ? null : value });
  }

  protected goToPage(page: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page === 1 ? null : page },
      queryParamsHandling: 'merge',
    });
  }

  protected clearFilters(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }
}

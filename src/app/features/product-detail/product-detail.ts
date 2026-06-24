import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap, map } from 'rxjs';

import { CatalogService } from '../../core/services/catalog.service';
import { CartService } from '../../core/services/cart.service';
import { SeoService } from '../../core/services/seo.service';
import { WhatsappService } from '../../core/services/whatsapp.service';
import { FeaturesService } from '../../core/services/features.service';
import { AcquisitionMode, Product, ProductPassport, SpecItem } from '../../core/models';
import { categoryIcon } from '../../shared/utils/category-icons';

import { Button } from '../../shared/components/button/button';
import { Icon } from '../../shared/components/icon/icon';
import { Badge } from '../../shared/components/badge/badge';
import { Rating } from '../../shared/components/rating/rating';
import { ProductImage } from '../../shared/components/product-image/product-image';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';

@Component({
  selector: 'yc-product-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Button, Icon, Badge, Rating, ProductImage, ProductCard, CopCurrencyPipe],
  templateUrl: './product-detail.html',
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(CatalogService);
  private readonly cart = inject(CartService);
  private readonly seo = inject(SeoService);
  private readonly whatsapp = inject(WhatsappService);
  private readonly features = inject(FeaturesService);

  readonly catIcon = categoryIcon;

  /** Premium "Pasaporte del equipo" (gated by equipment_passport). */
  private readonly passportEnabled = this.features.flag('equipment_passport');

  /** The passport panel shows only when the feature is on AND there is data. */
  protected readonly passport = computed<ProductPassport | null>(() => {
    if (!this.passportEnabled()) return null;
    const pp = this.product()?.passport;
    if (!pp) return null;
    const hasData =
      pp.grade ||
      pp.batteryHealth != null ||
      pp.diskHealth != null ||
      pp.serial ||
      (pp.tested?.length ?? 0) > 0 ||
      pp.notes;
    return hasData ? pp : null;
  });

  protected readonly gradeLabels: Record<string, string> = {
    A: 'Grado A · Como nuevo',
    B: 'Grado B · Buen estado',
    C: 'Grado C · Con detalles de uso',
  };

  protected readonly product = toSignal<Product | undefined>(
    this.route.paramMap.pipe(
      map((p) => p.get('slug') ?? ''),
      switchMap((slug) => this.catalog.getProductBySlug(slug)),
    ),
    { initialValue: undefined },
  );

  protected readonly related = toSignal(
    this.route.paramMap.pipe(
      map((p) => p.get('slug') ?? ''),
      switchMap((slug) => this.catalog.getRelatedProducts(slug, 4)),
    ),
    { initialValue: [] as Product[] },
  );

  protected readonly mode = signal<AcquisitionMode>('buy');
  protected readonly qty = signal(1);
  protected readonly added = signal(false);

  // --- Gallery: large main image + thumbnails (hover/tap to switch) ---------
  /** User-picked image, scoped to the product so it resets on navigation. */
  private readonly picked = signal<{ pid: string; url: string } | null>(null);
  protected readonly fading = signal(false);
  /** The image shown large: the picked one (if for this product) or the first. */
  protected readonly mainImage = computed<string | undefined>(() => {
    const p = this.product();
    const pick = this.picked();
    return pick && pick.pid === p?.id ? pick.url : p?.images?.[0]?.url;
  });

  /** Switch the large image with a soft fade. */
  protected selectImage(url: string): void {
    const p = this.product();
    if (!p || url === this.mainImage()) return;
    this.fading.set(true);
    setTimeout(() => {
      this.picked.set({ pid: p.id, url });
      this.fading.set(false);
    }, 170);
  }

  protected readonly discount = computed(() => {
    const p = this.product();
    if (!p?.compareAtPrice || p.compareAtPrice <= p.price) return 0;
    return Math.round((1 - p.price / p.compareAtPrice) * 100);
  });

  /** Specs grouped by their `group` field for a tidy spec sheet. */
  protected readonly specGroups = computed<{ group: string; items: SpecItem[] }[]>(() => {
    const specs = this.product()?.specs ?? [];
    const groups = new Map<string, SpecItem[]>();
    for (const s of specs) {
      const key = s.group ?? 'Especificaciones';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(s);
    }
    return [...groups.entries()].map(([group, items]) => ({ group, items }));
  });

  protected readonly whatsappLink = computed(() => {
    const p = this.product();
    if (!p) return this.whatsapp.link();
    return this.mode() === 'rent' ? this.whatsapp.rentalInquiry(p) : this.whatsapp.productInquiry(p);
  });

  protected readonly trustItems = [
    { icon: 'shield-check', label: 'Garantía incluida' },
    { icon: 'wrench', label: 'Servicio técnico propio' },
    { icon: 'truck', label: 'Entrega en Cartagena' },
    { icon: 'check-circle', label: 'Equipo probado y certificado' },
  ];

  constructor() {
    effect(() => {
      const p = this.product();
      if (!p) return;
      this.seo.update({
        title: `${p.name} · ${p.brandName}`,
        description: p.tagline,
        path: `/producto/${p.slug}`,
        type: 'product',
        // Share preview shows this product's own photo (falls back to the
        // branded og-cover when the product has no image).
        image: p.images?.find((i) => i.primary)?.url ?? p.images?.[0]?.url,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: p.name,
          sku: p.sku,
          brand: { '@type': 'Brand', name: p.brandName },
          description: p.description,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'COP',
            price: p.price,
            availability:
              p.stockStatus === 'out_of_stock'
                ? 'https://schema.org/OutOfStock'
                : 'https://schema.org/InStock',
          },
          ...(p.rating
            ? {
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: p.rating,
                  reviewCount: p.reviewCount ?? 0,
                },
              }
            : {}),
        },
      });
    });
  }

  protected setMode(m: AcquisitionMode): void {
    this.mode.set(m);
  }

  protected changeQty(delta: number): void {
    this.qty.update((q) => Math.max(1, q + delta));
  }

  protected addToCart(): void {
    const p = this.product();
    if (!p) return;
    this.cart.add(p, this.mode(), this.qty());
    this.added.set(true);
    setTimeout(() => this.added.set(false), 2200);
  }
}

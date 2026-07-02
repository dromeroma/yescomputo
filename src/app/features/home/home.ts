import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { APP_CONFIG } from '../../core/config/app-config';
import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';
import { WhatsappService } from '../../core/services/whatsapp.service';
import { CampaignService } from '../../core/services/campaign.service';
import { FeaturesService } from '../../core/services/features.service';
import { BrandingService } from '../../core/services/branding.service';
import { Product } from '../../core/models';
import { categoryIcon } from '../../shared/utils/category-icons';

import { Button } from '../../shared/components/button/button';
import { Icon } from '../../shared/components/icon/icon';
import { Logo } from '../../shared/components/logo/logo';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { SectionHeading } from '../../shared/components/section-heading/section-heading';
import { HeroCarousel } from '../../shared/components/hero-carousel/hero-carousel';
import { MarqueeRow } from '../../shared/components/marquee-row/marquee-row';

interface FeaturedRow {
  title: string;
  icon: string;
  link: (string | number)[];
  query?: Record<string, string>;
  products: Product[];
}

@Component({
  selector: 'yc-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Button, Icon, Logo, ProductCard, SectionHeading, HeroCarousel, MarqueeRow],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly seo = inject(SeoService);
  private readonly whatsapp = inject(WhatsappService);
  protected readonly config = inject(APP_CONFIG);
  protected readonly campaign = inject(CampaignService);
  private readonly features = inject(FeaturesService);

  /** True for clients with their own brand → clean, generic, catalog-focused
   * home (hides the Yes-Computo-specific marketing sections). */
  protected readonly isCustom = inject(BrandingService).custom;

  /** Premium "Asesor de compra" entry point (gated by buy_advisor). */
  protected readonly advisorEnabled = this.features.flag('buy_advisor');
  /** Premium "Trade-in" entry point (gated by tradein). */
  protected readonly tradeinEnabled = this.features.flag('tradein');

  protected readonly categories = toSignal(this.catalog.getCategories(), { initialValue: [] });
  protected readonly promotions = toSignal(this.catalog.getPromotions(), { initialValue: [] });

  private readonly allProducts = toSignal(
    this.catalog.getProducts({ pageSize: 100 }).pipe(map((r) => r.items)),
    { initialValue: [] as Product[] },
  );

  /** Categories that are NOT computers — excluded from the "Nuevos" row. */
  private static readonly NON_COMPUTER = ['Monitores', 'Audio y Diademas', 'Accesorios'];

  /** "Selección destacada": auto-scrolling carousels.
      Row 1 = all NEW computers (laptops, desktops, CPUs) across categories;
      then one carousel per active category. Each row scrolls in the alternating
      direction set in the template. */
  protected readonly featuredRows = computed<FeaturedRow[]>(() => {
    const products = this.allProducts();
    const rows: FeaturedRow[] = [];

    const nuevos = products.filter(
      (p) => p.condition === 'nuevo' && !Home.NON_COMPUTER.includes(p.categoryName),
    );
    if (nuevos.length) {
      rows.push({
        title: 'Equipos nuevos',
        icon: 'sparkles',
        link: ['/catalogo'],
        query: { condition: 'nuevo' },
        products: nuevos,
      });
    }

    for (const cat of this.categories()) {
      // 'equipos-nuevos' is already covered by the Nuevos row above.
      if (cat.slug === 'equipos-nuevos') continue;
      const items = products.filter((p) => p.categoryId === cat.id);
      if (items.length) {
        rows.push({ title: cat.name, icon: cat.icon, link: ['/categoria', cat.slug], products: items });
      }
    }
    return rows;
  });

  /** "Favoritos de nuestros clientes": best-sellers first, then featured, then
      a spread of the rest so the section is always nicely filled (up to 8). */
  protected readonly bestSellers = computed(() => {
    const all = this.allProducts();
    const seen = new Set<string>();
    const take = (list: Product[]) =>
      list.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
    return [
      ...take(all.filter((p) => p.isBestSeller)),
      ...take(all.filter((p) => p.isFeatured)),
      ...take(all),
    ].slice(0, 8);
  });

  protected readonly whatsappLink = computed(() => {
    const name = this.config.company.name;
    const msg = this.isCustom()
      ? `¡Hola ${name}! 👋 Quisiera más información sobre sus productos.`
      : `¡Hola ${name}! 👋 Quiero asesoría para elegir los equipos ideales para mi empresa.`;
    return this.whatsapp.link(msg);
  });

  protected readonly stats = [
    { value: '20+', label: 'Años de experiencia', icon: 'sparkles' },
    { value: '5.000+', label: 'Equipos entregados', icon: 'truck' },
    { value: '12', label: 'Categorías de producto', icon: 'grid' },
    { value: '100%', label: 'Garantía y soporte', icon: 'shield-check' },
  ];

  protected readonly circularSteps = [
    { icon: 'wrench', title: 'Reparar', text: 'Damos una segunda oportunidad a los equipos.' },
    { icon: 'refresh', title: 'Renovar', text: 'Mejoramos y actualizamos para mayor rendimiento.' },
    { icon: 'recycle', title: 'Reutilizar', text: 'Alargamos la vida útil en excelente estado.' },
    { icon: 'leaf', title: 'Reciclar', text: 'Recuperamos materiales y reducimos residuos.' },
  ];

  protected readonly benefits = [
    { icon: 'shield-check', title: 'Productos garantizados', text: 'Equipos revisados pieza por pieza, con garantía y respaldo real.' },
    { icon: 'users', title: 'Atención personalizada', text: 'Asesoría experta para elegir la tecnología ideal para tu operación.' },
    { icon: 'truck', title: 'Entrega y soporte', text: 'Disponibilidad inmediata y servicio técnico especializado.' },
    { icon: 'recycle', title: 'Compromiso con el planeta', text: 'Tecnología circular que reduce residuos y costos a la vez.' },
  ];

  protected readonly segments = [
    { icon: 'building', label: 'Oficinas y empresas' },
    { icon: 'users', label: 'PYMES' },
    { icon: 'graduation', label: 'Instituciones educativas' },
    { icon: 'shield', label: 'Entidades públicas' },
    { icon: 'headphones', label: 'Call centers' },
    { icon: 'rocket', label: 'Startups' },
  ];

  readonly catIcon = categoryIcon;

  ngOnInit(): void {
    const c = this.config.company;
    this.seo.update({
      title: this.isCustom()
        ? `${c.name}${c.tagline ? ' · ' + c.tagline : ''}`
        : 'Yes Computo · Tecnología Circular para empresas',
      description: this.isCustom()
        ? c.tagline || `Catálogo de ${c.name}. Conoce nuestros productos y escríbenos por WhatsApp.`
        : '20 años liderando la Tecnología Circular en Cartagena. Equipos corporativos, portátiles, ' +
          'workstations, alquiler de tecnología y servicio técnico especializado para empresas.',
      path: '/',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: this.config.company.name,
        url: this.config.company.website,
        telephone: '+57' + this.config.company.whatsappNumber.slice(2),
        address: {
          '@type': 'PostalAddress',
          streetAddress: this.config.company.address.street,
          addressLocality: this.config.company.address.city,
          addressCountry: 'CO',
        },
      },
    });
  }

  /** Per-promo accent colour (glow, icon, badge) — keeps the cards cohesive
      with the dark sections while staying distinguishable. */
  protected promoAccent(theme: string): string {
    switch (theme) {
      case 'sustainability':
        return '#84cc16';
      case 'accent':
        return '#2dd4bf';
      case 'brand':
        return '#a3e635';
      default:
        return '#22d3ee'; // ink → cyan
    }
  }

  protected promoIcon(theme: string): string {
    switch (theme) {
      case 'sustainability':
        return 'recycle';
      case 'accent':
        return 'wrench';
      case 'brand':
        return 'laptop';
      default:
        return 'refresh'; // ink → alquiler
    }
  }
}

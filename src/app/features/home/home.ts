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
import { Product } from '../../core/models';
import { categoryIcon } from '../../shared/utils/category-icons';

import { Button } from '../../shared/components/button/button';
import { Icon } from '../../shared/components/icon/icon';
import { Logo } from '../../shared/components/logo/logo';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { SectionHeading } from '../../shared/components/section-heading/section-heading';
import { HeroCarousel } from '../../shared/components/hero-carousel/hero-carousel';

@Component({
  selector: 'yc-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Button, Icon, Logo, ProductCard, SectionHeading, HeroCarousel],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly seo = inject(SeoService);
  private readonly whatsapp = inject(WhatsappService);
  protected readonly config = inject(APP_CONFIG);
  protected readonly campaign = inject(CampaignService);
  private readonly features = inject(FeaturesService);

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

  /** "Selección destacada": one row per active category (max 4 products each),
      with a link to that category's full listing. Categories with no loaded
      products are skipped. Order follows the categories' sort order. */
  protected readonly categorySections = computed(() => {
    const products = this.allProducts();
    return this.categories()
      .map((category) => ({
        category,
        products: products.filter((p) => p.categoryId === category.id).slice(0, 4),
      }))
      .filter((section) => section.products.length > 0);
  });

  protected readonly bestSellers = computed(() =>
    this.allProducts()
      .filter((p) => p.isBestSeller)
      .slice(0, 4),
  );

  protected readonly whatsappLink = this.whatsapp.link(
    '¡Hola Yes Computo! 👋 Quiero asesoría para elegir los equipos ideales para mi empresa.',
  );

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
    this.seo.update({
      title: 'Yes Computo · Tecnología Circular para empresas',
      description:
        '20 años liderando la Tecnología Circular en Cartagena. Equipos corporativos, portátiles, ' +
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

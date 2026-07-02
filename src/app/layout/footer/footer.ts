import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { APP_CONFIG } from '../../core/config/app-config';
import { CatalogService } from '../../core/services/catalog.service';
import { BrandingService } from '../../core/services/branding.service';
import { Logo } from '../../shared/components/logo/logo';
import { Icon } from '../../shared/components/icon/icon';

@Component({
  selector: 'yc-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Logo, Icon],
  templateUrl: './footer.html',
})
export class Footer {
  private readonly catalog = inject(CatalogService);
  protected readonly config = inject(APP_CONFIG);
  protected readonly year = 2026;

  /** Clients with their own brand get a generic footer (no Yes-Computo copy). */
  protected readonly isCustom = inject(BrandingService).custom;

  protected readonly categories = toSignal(this.catalog.getCategories(), { initialValue: [] });

  private readonly companyAll = [
    { label: 'Nosotros', link: '/nosotros' },
    { label: 'Tecnología Circular', link: '/tecnologia-circular' },
    { label: 'Servicios', link: '/servicios' },
    { label: 'Marcas', link: '/marcas' },
    { label: 'Promociones', link: '/promociones' },
    { label: 'Contacto', link: '/contacto' },
  ];
  /** Drop the Yes-Computo-specific links for white-label clients. */
  protected readonly company = computed(() =>
    this.isCustom()
      ? this.companyAll.filter((c) => !['/tecnologia-circular', '/servicios'].includes(c.link))
      : this.companyAll,
  );

  protected readonly services = [
    { label: 'Alquiler de equipos', link: '/servicios' },
    { label: 'Servicio técnico', link: '/servicios' },
    { label: 'Redes y conectividad', link: '/categoria/redes-conectividad' },
    { label: 'Videovigilancia', link: '/categoria/camaras-seguridad' },
    { label: 'Soporte empresarial', link: '/contacto' },
  ];
}

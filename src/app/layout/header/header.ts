import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { APP_CONFIG } from '../../core/config/app-config';
import { CatalogService } from '../../core/services/catalog.service';
import { CartService } from '../../core/services/cart.service';
import { ThemeService } from '../../core/services/theme.service';
import { CampaignService } from '../../core/services/campaign.service';
import { Logo } from '../../shared/components/logo/logo';
import { Icon } from '../../shared/components/icon/icon';

@Component({
  selector: 'yc-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, Logo, Icon],
  host: {
    class: 'sticky top-0 z-50 block',
    '(window:scroll)': 'onScroll()',
    '(document:keydown.escape)': 'closeAll()',
  },
  templateUrl: './header.html',
})
export class Header {
  private readonly catalog = inject(CatalogService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  protected readonly config = inject(APP_CONFIG);
  protected readonly theme = inject(ThemeService);
  protected readonly campaign = inject(CampaignService);

  protected readonly categories = toSignal(this.catalog.getCategories(), { initialValue: [] });
  protected readonly cartCount = this.cartService.count;

  protected openCart(): void {
    this.cartService.openDrawer();
  }

  protected readonly mobileOpen = signal(false);
  protected readonly megaOpen = signal(false);
  protected readonly scrolled = signal(false);

  protected readonly mainNav = [
    { label: 'Inicio', link: '/' },
    { label: 'Reacondicionados', link: '/categoria/reacondicionados' },
    { label: 'Servicios', link: '/servicios' },
    { label: 'Tecnología Circular', link: '/tecnologia-circular' },
    { label: 'Nosotros', link: '/nosotros' },
    { label: 'Contacto', link: '/contacto' },
  ];

  protected onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  protected toggleMega(): void {
    this.megaOpen.update((v) => !v);
  }

  protected closeAll(): void {
    this.megaOpen.set(false);
    this.mobileOpen.set(false);
  }

  protected search(term: string): void {
    const q = term.trim();
    this.closeAll();
    this.router.navigate(['/catalogo'], q ? { queryParams: { search: q } } : {});
  }
}

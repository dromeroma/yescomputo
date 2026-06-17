import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { MobileNav } from './layout/mobile-nav/mobile-nav';
import { CampaignRibbon } from './layout/campaign-ribbon/campaign-ribbon';
import { CampaignConfetti } from './layout/campaign-confetti/campaign-confetti';
import { WhatsappFab } from './shared/components/whatsapp-fab/whatsapp-fab';
import { CartDrawer } from './shared/components/cart-drawer/cart-drawer';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    Header,
    Footer,
    MobileNav,
    CampaignRibbon,
    CampaignConfetti,
    WhatsappFab,
    CartDrawer,
  ],
  template: `
    <yc-campaign-ribbon />
    <yc-header />
    <main id="contenido" class="min-h-[60vh]">
      <router-outlet />
    </main>
    <yc-footer />
    <!-- Spacer so the fixed mobile bottom nav never covers footer content. -->
    <div class="h-[calc(4rem+env(safe-area-inset-bottom))] lg:hidden" aria-hidden="true"></div>
    <yc-whatsapp-fab />
    <yc-mobile-nav />
    <yc-cart-drawer />
    <yc-campaign-confetti />
  `,
})
export class App {}

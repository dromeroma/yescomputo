import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, PLATFORM_ID, inject, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { APP_CONFIG } from '../../core/config/app-config';

/** Componente de la tarjeta digital, publicado por la plataforma Savvy Sites. */
const WIDGET = 'https://sites.savvytrix.com/embed/tarjeta.js';

type SavvyCardApi = { mount: (el: HTMLElement, o: Record<string, string>) => () => void };

/**
 * Tarjeta digital de presentación en el dominio del sitio: /tarjeta/:slug.
 * Se administra en Savvy Sites (Tarjetas) y se dibuja a pantalla completa con
 * "Guardar contacto", acciones rápidas y QR. Mismo diseño en todos los sitios.
 */
@Component({
  selector: 'app-business-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div #host></div>`,
})
export class BusinessCardPage implements AfterViewInit, OnDestroy {
  private readonly config = inject(APP_CONFIG);
  private readonly route = inject(ActivatedRoute);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private unmount: (() => void) | null = null;

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser) return;
    const w = window as unknown as { SavvyCard?: SavvyCardApi };
    if (!w.SavvyCard) {
      await new Promise<void>((ok, fail) => {
        const s = document.createElement('script');
        s.src = WIDGET; s.async = true;
        s.onload = () => ok(); s.onerror = () => fail(new Error('tarjeta'));
        document.head.appendChild(s);
      }).catch(() => undefined);
    }
    if (!w.SavvyCard) return;
    const cfg = this.config as unknown as { apiBaseUrl: string; tenantSlug?: string };
    this.unmount = w.SavvyCard.mount(this.host().nativeElement, {
      tenant: cfg.tenantSlug || '_',
      card: this.route.snapshot.paramMap.get('slug') ?? '',
      api: cfg.apiBaseUrl,
    });
  }

  ngOnDestroy(): void {
    this.unmount?.();
  }
}

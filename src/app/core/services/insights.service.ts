import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { APP_CONFIG } from '../config/app-config';
import { CartItem } from '../models';

interface TrackEvent {
  e: string;
  r?: string;
}

const SOCIAL = /(^|\.)(instagram|facebook|fb|tiktok|linkedin|youtube|x|twitter)\.com$/i;
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * Analítica propia de Savvy Sites (sección "Resultados" del panel): visitas,
 * páginas vistas y clics a WhatsApp / teléfono / correo / redes. Sin cookies ni
 * datos personales: los eventos se agrupan por día en el servidor.
 *
 * También genera el código de pedido (P-XXXXX) que va en el mensaje del carrito
 * y registra el pedido en el panel ("Pedidos") cuando el cliente lo envía.
 *
 * Se envía con navigator.sendBeacon (text/plain, sin preflight CORS) en lotes.
 */
@Injectable({ providedIn: 'root' })
export class InsightsService {
  private readonly config = inject(APP_CONFIG);
  private readonly doc = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private queue: TrackEvent[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private started = false;

  /** Código del pedido en curso; cambia después de cada envío del carrito. */
  readonly orderCode = signal(this.newCode());

  private get slug(): string {
    return (this.config as { tenantSlug?: string }).tenantSlug ?? '';
  }

  /** Arranca el seguimiento. Seguro de llamar desde el inicializador de la app. */
  start(): void {
    if (!this.isBrowser || this.started) return;
    this.started = true;
    try {
      if (!sessionStorage.getItem('svy.s')) {
        sessionStorage.setItem('svy.s', '1');
        this.push({ e: 'session' });
      }
    } catch {
      this.push({ e: 'session' });
    }
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      this.push({ e: 'page_view', r: (e as NavigationEnd).urlAfterRedirects.split(/[?#]/)[0] || '/' });
    });
    this.doc.addEventListener('click', (ev) => this.onClick(ev), true);
    const flushNow = () => this.flush();
    this.doc.addEventListener('visibilitychange', () => {
      if (this.doc.visibilityState === 'hidden') flushNow();
    });
    this.doc.defaultView?.addEventListener('pagehide', flushNow);
  }

  /** Registra el pedido del carrito (el panel recalcula precios con la BD). */
  order(items: CartItem[], isM2: (i: CartItem) => boolean): void {
    if (!this.isBrowser || !items.length) return;
    this.send('/orders', {
      tenant: this.slug,
      code: this.orderCode(),
      items: items.map((i) => ({ id: i.product.id, qty: i.quantity, mode: i.mode, m2: isM2(i) })),
      source: this.doc.location.pathname,
    });
    // Nuevo código para el siguiente pedido, después de que se abra WhatsApp
    // con el mensaje actual (el enlace todavía lleva el código enviado).
    setTimeout(() => this.orderCode.set(this.newCode()), 1500);
  }

  private onClick(ev: Event): void {
    const a = (ev.target as Element | null)?.closest?.('a');
    const href = a?.getAttribute('href') ?? '';
    if (!href) return;
    const here = this.doc.location.pathname;
    if (href.startsWith('tel:')) return this.push({ e: 'phone_click', r: here });
    if (href.startsWith('mailto:')) return this.push({ e: 'email_click', r: here });
    let host = '';
    try {
      host = new URL(href, this.doc.location.href).hostname;
    } catch {
      return;
    }
    if (host === 'api.whatsapp.com' || host === 'wa.me' || host === 'web.whatsapp.com') {
      this.push({ e: 'whatsapp_click', r: here });
    } else if (SOCIAL.test(host)) {
      this.push({ e: 'social_click', r: host.replace(/^www\./, '') });
    }
  }

  private push(ev: TrackEvent): void {
    this.queue.push(ev);
    // los clics de contacto suelen abrir otra app: se envían de inmediato
    if (ev.e.endsWith('_click') || this.queue.length >= 20) return this.flush();
    if (!this.timer) this.timer = setTimeout(() => this.flush(), 3000);
  }

  private flush(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    if (!this.queue.length) return;
    const events = this.queue.splice(0, 40);
    this.send('/track', { tenant: this.slug, events });
  }

  private send(path: string, body: unknown): void {
    const url = this.config.apiBaseUrl + path;
    const data = JSON.stringify(body);
    try {
      const nav = this.doc.defaultView?.navigator;
      if (nav?.sendBeacon && nav.sendBeacon(url, new Blob([data], { type: 'text/plain' }))) return;
      void fetch(url, { method: 'POST', body: data, headers: { 'Content-Type': 'text/plain' }, keepalive: true }).catch(() => {});
    } catch {
      /* la analítica nunca debe romper el sitio */
    }
  }

  private newCode(): string {
    let s = 'P-';
    for (let i = 0; i < 5; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    return s;
  }
}

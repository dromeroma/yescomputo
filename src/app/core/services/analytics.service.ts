import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

export interface AnalyticsConfig {
  ga4Id?: string;
  metaPixelId?: string;
}

/**
 * Injects Google Analytics (GA4 / gtag.js) and Meta Pixel into the document
 * head — but only in the browser and only when the marketing add-on
 * (`web_analytics`) is active and the client has configured its IDs.
 *
 * The IDs come from `/catalog/settings` (see FeaturesService). Injection is
 * idempotent: calling activate twice never duplicates a tag.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private done = false;

  /** Wire up the configured trackers. Safe to call from the app initializer. */
  activate(config: AnalyticsConfig | null | undefined): void {
    if (!this.isBrowser || this.done || !config) return;
    const ga4 = (config.ga4Id || '').trim();
    const pixel = (config.metaPixelId || '').trim();
    if (!ga4 && !pixel) return;
    this.done = true;
    if (ga4) this.injectGa4(ga4);
    if (pixel) this.injectMetaPixel(pixel);
  }

  private injectGa4(id: string): void {
    // Loader
    const loader = this.doc.createElement('script');
    loader.async = true;
    loader.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    loader.id = 'ga4-loader';
    this.doc.head.appendChild(loader);
    // Init
    const init = this.doc.createElement('script');
    init.id = 'ga4-init';
    init.text =
      `window.dataLayer=window.dataLayer||[];` +
      `function gtag(){dataLayer.push(arguments);}` +
      `gtag('js',new Date());` +
      `gtag('config','${id}');`;
    this.doc.head.appendChild(init);
  }

  private injectMetaPixel(id: string): void {
    const script = this.doc.createElement('script');
    script.id = 'meta-pixel';
    script.text =
      `!function(f,b,e,v,n,t,s)` +
      `{if(f.fbq)return;n=f.fbq=function(){n.callMethod?` +
      `n.callMethod.apply(n,arguments):n.queue.push(arguments)};` +
      `if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';` +
      `n.queue=[];t=b.createElement(e);t.async=!0;` +
      `t.src=v;s=b.getElementsByTagName(e)[0];` +
      `s.parentNode.insertBefore(t,s)}(window,document,'script',` +
      `'https://connect.facebook.net/en_US/fbevents.js');` +
      `fbq('init','${id}');fbq('track','PageView');`;
    this.doc.head.appendChild(script);
    // <noscript> fallback pixel
    const ns = this.doc.createElement('noscript');
    const img = this.doc.createElement('img');
    img.height = 1;
    img.width = 1;
    img.style.display = 'none';
    img.src = `https://www.facebook.com/tr?id=${encodeURIComponent(id)}&ev=PageView&noscript=1`;
    ns.appendChild(img);
    this.doc.head.appendChild(ns);
  }
}

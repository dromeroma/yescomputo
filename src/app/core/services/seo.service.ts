import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { APP_CONFIG } from '../config/app-config';

export interface SeoData {
  title: string;
  description?: string;
  /** Canonical path, e.g. "/catalogo". Defaults to current document URL. */
  path?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  /** Optional JSON-LD structured data object. */
  jsonLd?: Record<string, unknown>;
}

/**
 * Centralised SEO + social metadata management.
 *
 * Works during SSR (where Title/Meta render into the served HTML) and on the
 * client during navigation. Keeps title format and canonical/OG/Twitter tags
 * consistent across every route.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);
  private readonly config = inject(APP_CONFIG);

  update(data: SeoData): void {
    const brand = this.config.company.name;
    const fullTitle = data.title.includes(brand)
      ? data.title
      : `${data.title} · ${brand}`;
    const description =
      data.description ?? this.config.company.tagline;
    const url = this.config.company.website + (data.path ?? '');

    this.title.setTitle(fullTitle);
    this.setTag('name', 'description', description);

    // Open Graph
    this.setTag('property', 'og:title', fullTitle);
    this.setTag('property', 'og:description', description);
    this.setTag('property', 'og:type', data.type ?? 'website');
    this.setTag('property', 'og:url', url);
    if (data.image) this.setTag('property', 'og:image', data.image);

    // Twitter
    this.setTag('name', 'twitter:card', data.image ? 'summary_large_image' : 'summary');
    this.setTag('name', 'twitter:title', fullTitle);
    this.setTag('name', 'twitter:description', description);

    this.setCanonical(url);
    this.setJsonLd(data.jsonLd);
  }

  private setTag(attr: 'name' | 'property', key: string, content: string): void {
    this.meta.updateTag({ [attr]: key, content } as Record<string, string>);
  }

  private setCanonical(url: string): void {
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setJsonLd(data?: Record<string, unknown>): void {
    const existing = this.doc.getElementById('yc-jsonld');
    if (existing) existing.remove();
    if (!data) return;
    const script = this.doc.createElement('script');
    script.id = 'yc-jsonld';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    this.doc.head.appendChild(script);
  }
}

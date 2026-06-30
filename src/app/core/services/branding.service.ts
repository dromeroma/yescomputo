import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { APP_CONFIG } from '../config/app-config';

/** Per-tenant branding, as stored in site_settings.branding. All fields optional —
 * anything missing keeps the site's built-in default (so Yes Computo is unchanged). */
interface Branding {
  name?: string;
  legalName?: string;
  tagline?: string;
  logoUrl?: string;
  website?: string;
  ogImage?: string;
  colors?: { brand?: string; accent?: string };
  phoneDisplay?: string;
  whatsappNumber?: string;
  email?: string;
  address?: { street?: string; neighborhood?: string; city?: string; country?: string };
  hours?: { label: string; value: string }[];
  socials?: { platform: string; url: string }[];
}

// Tonal scale generated from a single brand color: how far each shade is mixed
// toward white (lighter) or black (darker). 500 is the base color itself.
const STOPS: Record<string, ['white' | 'black' | 'base', number]> = {
  '50': ['white', 0.92],
  '100': ['white', 0.82],
  '200': ['white', 0.62],
  '300': ['white', 0.4],
  '400': ['white', 0.18],
  '500': ['base', 0],
  '600': ['black', 0.12],
  '700': ['black', 0.28],
  '800': ['black', 0.42],
  '900': ['black', 0.55],
  '950': ['black', 0.72],
};

@Injectable({ providedIn: 'root' })
export class BrandingService {
  private readonly http = inject(HttpClient);
  private readonly doc = inject(DOCUMENT);
  private readonly config = inject(APP_CONFIG);

  /** Called by an app initializer before first render (SSR + client). */
  load(): Observable<unknown> {
    return this.http
      .get<{ branding?: Branding }>(`${this.config.apiBaseUrl}/catalog/settings`)
      .pipe(
        tap((res) => this.apply(res?.branding ?? {})),
        catchError(() => of(null)), // keep built-in defaults (fail safe)
      );
  }

  private apply(b: Branding): void {
    const c = this.config.company;
    if (b.name) c.name = b.name;
    if (b.legalName) c.legalName = b.legalName;
    if (b.tagline) c.tagline = b.tagline;
    if (b.logoUrl) c.logoUrl = b.logoUrl;
    if (b.website) c.website = b.website;
    if (b.ogImage) c.ogImage = b.ogImage;
    if (b.phoneDisplay) c.phoneDisplay = b.phoneDisplay;
    if (b.whatsappNumber) c.whatsappNumber = b.whatsappNumber;
    if (b.email) c.email = b.email;
    if (b.address) c.address = { ...c.address, ...b.address };
    if (b.hours?.length) c.hours = b.hours;
    if (b.socials?.length) {
      c.socials = b.socials as CompanySocials;
    }

    if (b.colors?.brand) this.applyPalette('brand', b.colors.brand);
    if (b.colors?.accent) this.applyPalette('accent', b.colors.accent);
  }

  /** Build a coherent 50–950 palette from one base color and set the CSS vars.
   * Works on the server (Angular's DOCUMENT) so the SSR HTML already carries the
   * colors — no flash on load. */
  private applyPalette(name: 'brand' | 'accent', baseHex: string): void {
    const base = hexToRgb(baseHex);
    if (!base) return;
    const root = this.doc.documentElement as HTMLElement;
    for (const stop of Object.keys(STOPS)) {
      const [toward, t] = STOPS[stop];
      const target = toward === 'white' ? [255, 255, 255] : toward === 'black' ? [0, 0, 0] : base;
      const col = toward === 'base' ? base : mix(base, target, t);
      root.style.setProperty(`--color-${name}-${stop}`, rgbToHex(col));
    }
  }
}

type CompanySocials = { platform: 'facebook' | 'instagram' | 'whatsapp' | 'tiktok'; url: string }[];

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.trim().replace('#', '');
  const v = m.length === 3 ? m.split('').map((x) => x + x).join('') : m;
  if (!/^[0-9a-fA-F]{6}$/.test(v)) return null;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

function mix(a: number[], b: number[], t: number): number[] {
  return [0, 1, 2].map((i) => Math.round(a[i] * (1 - t) + b[i] * t));
}

function rgbToHex(c: number[]): string {
  return '#' + c.map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0')).join('');
}

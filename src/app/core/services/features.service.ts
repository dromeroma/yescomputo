import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';

import { APP_CONFIG } from '../config/app-config';
import { AnalyticsConfig, AnalyticsService } from './analytics.service';

/** Known premium feature keys (mirror of the backend registry). */
export type FeatureKey =
  | 'whatsapp_checkout'
  | 'equipment_passport'
  | 'buy_advisor'
  | 'tradein'
  | 'whatsapp_bot'
  | 'service_tracking'
  | 'web_analytics';

/** A hero/portada slide as configured from the admin panel. */
export interface HeroSlideDTO {
  id: string;
  eyebrow: string;
  titleTop: string;
  titleMain: string;
  subtitle: string;
  image: string;
  ctaLabel: string;
  ctaLink: string;
}

interface SettingsResponse {
  features: Partial<Record<FeatureKey, boolean>>;
  analytics?: AnalyticsConfig;
  hero?: HeroSlideDTO[];
}

/**
 * Holds the site's feature flags, loaded once at startup from
 * `/catalog/settings`. Every premium feature gates on `isOn(key)` — when the
 * admin turns a flag off, the feature disappears from the public site.
 *
 * Fails safe: if the request errors, all flags resolve to OFF.
 */
@Injectable({ providedIn: 'root' })
export class FeaturesService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly analytics = inject(AnalyticsService);
  private readonly flags = signal<Partial<Record<FeatureKey, boolean>>>({});
  private readonly heroSlides = signal<HeroSlideDTO[]>([]);

  /** Admin-configured hero slides (empty → the site uses its built-in hero). */
  readonly hero = this.heroSlides.asReadonly();

  /** Called by an app initializer before first render. */
  load(): Observable<unknown> {
    return this.http
      .get<SettingsResponse>(`${this.config.apiBaseUrl}/catalog/settings`)
      .pipe(
        tap((res) => {
          this.flags.set(res?.features ?? {});
          this.heroSlides.set(Array.isArray(res?.hero) ? res!.hero! : []);
          // Marketing add-on: inject GA4 / Meta Pixel (browser-only, gated).
          if (res?.features?.web_analytics) this.analytics.activate(res.analytics);
        }),
        catchError(() => {
          this.flags.set({});
          this.heroSlides.set([]);
          return of(null);
        }),
      );
  }

  /** Reactive read — true only when the flag is explicitly enabled. */
  isOn(key: FeatureKey): boolean {
    return this.flags()[key] === true;
  }

  /** Signal factory for templates/computed gating. */
  flag(key: FeatureKey) {
    return computed(() => this.flags()[key] === true);
  }
}

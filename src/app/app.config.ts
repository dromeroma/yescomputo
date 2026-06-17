import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';
import { APP_CONFIG, DEFAULT_APP_CONFIG } from './core/config/app-config';
import { CatalogDataSource } from './core/data/catalog-data-source';
import { LocalCatalogDataSource } from './core/data/local-catalog-data-source';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      // Restore scroll position on back/forward, jump to anchors.
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      // Smooth, native cross-route animations.
      withViewTransitions(),
    ),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),

    // --- Application configuration -----------------------------------------
    { provide: APP_CONFIG, useValue: DEFAULT_APP_CONFIG },

    // --- Catalog data source ------------------------------------------------
    // Swap `LocalCatalogDataSource` for an `ApiCatalogDataSource` (HttpClient +
    // AppConfig.apiBaseUrl) to go live against FastAPI. Nothing else changes.
    { provide: CatalogDataSource, useClass: LocalCatalogDataSource },
  ],
};

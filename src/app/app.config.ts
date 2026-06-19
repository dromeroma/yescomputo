import {
  ApplicationConfig,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  inject,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';
import { AppConfig, APP_CONFIG, DEFAULT_APP_CONFIG } from './core/config/app-config';
import { CatalogDataSource } from './core/data/catalog-data-source';
import { LocalCatalogDataSource } from './core/data/local-catalog-data-source';
import { ApiCatalogDataSource } from './core/data/api-catalog-data-source';
import { FeaturesService } from './core/services/features.service';

// Resolve the runtime config: in dev the FastAPI backend runs locally; in a
// production build the deployed API URL from DEFAULT_APP_CONFIG is used.
const appRuntimeConfig: AppConfig = {
  ...DEFAULT_APP_CONFIG,
  // 127.0.0.1 (not "localhost") so Node's SSR fetch hits the IPv4 the API
  // binds to, instead of preferring IPv6 ::1 and getting ECONNREFUSED.
  apiBaseUrl: isDevMode() ? 'http://127.0.0.1:8000/v1' : DEFAULT_APP_CONFIG.apiBaseUrl,
};

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
    { provide: APP_CONFIG, useValue: appRuntimeConfig },

    // --- Feature flags (white-label premium on/off) ------------------------
    // Loads the site's enabled features before first render; premium UI gates
    // on FeaturesService.isOn(...). Fails safe to all-off.
    provideAppInitializer(() => inject(FeaturesService).load()),

    // --- Catalog data source ------------------------------------------------
    // Driven by AppConfig.dataSource: 'api' → FastAPI (HttpClient), 'local' →
    // JSON fixtures. Flip the switch in app-config.ts to fall back to local.
    {
      provide: CatalogDataSource,
      useClass:
        appRuntimeConfig.dataSource === 'api' ? ApiCatalogDataSource : LocalCatalogDataSource,
    },
  ],
};

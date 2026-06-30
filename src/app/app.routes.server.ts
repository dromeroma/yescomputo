import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Server render strategy.
 *
 * EVERY route is server-rendered on demand so each request resolves the right
 * client by its domain (multi-tenant / white-label) and bakes THAT client's
 * branding into the server HTML — no prerendered HTML shared across domains.
 * (Single-tenant Yes Computo is unaffected: same content, just SSR not static.)
 */
export const serverRoutes: ServerRoute[] = [
  { path: '**', renderMode: RenderMode.Server },
];

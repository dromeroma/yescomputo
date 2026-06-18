import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Server render strategy.
 *
 * Static marketing pages are prerendered to fast static HTML. Catalog routes
 * with dynamic params (and the cart) are server-rendered on demand so they
 * always reflect live data once the FastAPI backend is connected.
 */
export const serverRoutes: ServerRoute[] = [
  // Home shows live featured products → server-rendered on demand (cacheable),
  // so builds don't depend on the API and the page reflects live data.
  { path: '', renderMode: RenderMode.Server },
  { path: 'nosotros', renderMode: RenderMode.Prerender },
  { path: 'servicios', renderMode: RenderMode.Prerender },
  { path: 'contacto', renderMode: RenderMode.Prerender },
  { path: 'tecnologia-circular', renderMode: RenderMode.Prerender },
  { path: 'terminos-y-condiciones', renderMode: RenderMode.Prerender },
  { path: 'politica-de-privacidad', renderMode: RenderMode.Prerender },
  // Dynamic / data-driven routes → server render on demand.
  { path: '**', renderMode: RenderMode.Server },
];

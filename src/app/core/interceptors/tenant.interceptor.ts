import { HttpInterceptorFn } from '@angular/common/http';
import { inject, REQUEST } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';

/**
 * Multi-tenant resolution during SSR.
 *
 * The browser already sends `Origin` on its API calls, so the backend can map
 * the request to the right client by domain. But during server-side rendering
 * the API call comes from the Node server (no Origin), so we forward the
 * end-user's host as `X-Tenant-Host`. The backend matches it against each
 * client's domains; if it matches nothing it falls back to the only/first
 * client — so the single-tenant (Yes Computo) setup is unaffected.
 */
export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(APP_CONFIG);
  const request = inject(REQUEST, { optional: true }); // present only on the server

  if (request && req.url.startsWith(config.apiBaseUrl)) {
    const host = request.headers.get('x-forwarded-host') || safeHost(request.url);
    if (host) {
      return next(req.clone({ setHeaders: { 'X-Tenant-Host': host } }));
    }
  }
  return next(req);
};

function safeHost(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

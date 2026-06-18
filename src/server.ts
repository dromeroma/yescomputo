import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

// Allowlist the production hosts for Angular's SSR host-header check (SSRF
// protection). Without this, unknown Host headers de-opt to client-side
// rendering (no server-rendered data / SEO). A real NG_ALLOWED_HOSTS env var,
// if set on the host, takes precedence. Read at AngularNodeAppEngine construction.
process.env['NG_ALLOWED_HOSTS'] ??=
  'yescomputo.com,www.yescomputo.com,*.vercel.app,*.onrender.com,localhost,127.0.0.1';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Hosting proxies (e.g. Vercel) add x-forwarded-* headers. Angular SSR only
 * trusts host/proto by default and de-opts to client-side rendering (no
 * server-rendered data) if it sees the others. Drop the untrusted ones so SSR
 * renders normally; x-forwarded-host/proto are kept for correct URL resolution.
 */
app.use((req, _res, next) => {
  delete req.headers['x-forwarded-for'];
  delete req.headers['x-forwarded-port'];
  delete req.headers['x-forwarded-prefix'];
  next();
});

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => {
      if (!response) return next();
      // Don't let the CDN cache SSR responses: a render made while the backend
      // was cold would otherwise be cached empty. Always serve fresh data
      // (also means admin changes show immediately). Static assets are still
      // cached by the filesystem layer.
      response.headers.set('Cache-Control', 'no-store');
      return writeResponseToNodeResponse(response, res);
    })
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

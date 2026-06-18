/**
 * Transforms the Angular SSR build (`dist/yescomputo/{browser,server}`) into the
 * Vercel Build Output API (v3) layout, so Vercel deploys the SSR server as a
 * Serverless Function instead of serving the app statically (Vercel's Angular
 * preset doesn't deploy the new application-builder SSR on its own).
 *
 * Layout produced:
 *   .vercel/output/
 *     config.json                 → serve static first, else hand to the function
 *     static/                     → browser assets
 *     functions/ssr.func/
 *       index.mjs                 → re-exports the Node request handler
 *       .vc-config.json           → Node runtime config
 *       server/  browser/  ...    → the self-contained SSR bundle (+ ../browser)
 *
 * Run via the Vercel Build Command: `npm run vercel-build` (= ng build + this).
 */
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist/yescomputo';
const OUT = '.vercel/output';
const FUNC = join(OUT, 'functions', 'ssr.func');

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'static'), { recursive: true });
mkdirSync(FUNC, { recursive: true });

// 1) Static assets (served by Vercel's filesystem handler, first priority).
cpSync(join(DIST, 'browser'), join(OUT, 'static'), { recursive: true });

// 2) SSR function: ship the whole dist so server.mjs finds its chunks and the
//    sibling `../browser` folder it serves static from.
cpSync(join(DIST, 'server'), join(FUNC, 'server'), { recursive: true });
cpSync(join(DIST, 'browser'), join(FUNC, 'browser'), { recursive: true });

// 3) Function entry — Vercel's Node launcher calls this default export (req,res).
writeFileSync(
  join(FUNC, 'index.mjs'),
  `import { reqHandler } from './server/server.mjs';\nexport default reqHandler;\n`,
);

// 4) Function runtime config.
writeFileSync(
  join(FUNC, '.vc-config.json'),
  JSON.stringify(
    {
      runtime: 'nodejs22.x',
      handler: 'index.mjs',
      launcherType: 'Nodejs',
      supportsResponseStreaming: true,
    },
    null,
    2,
  ),
);

// 5) Routing: try the filesystem (static) first; everything else → SSR function.
writeFileSync(
  join(OUT, 'config.json'),
  JSON.stringify(
    {
      version: 3,
      routes: [{ handle: 'filesystem' }, { src: '/.*', dest: '/ssr' }],
    },
    null,
    2,
  ),
);

console.log('✓ .vercel/output listo (Build Output API)');

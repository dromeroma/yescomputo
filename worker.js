/**
 * Worker mínimo para servir la SPA de Angular en Cloudflare.
 * - Sirve el archivo estático si existe (js, css, imágenes, páginas…).
 * - Si no existe (rutas del cliente como /catalogo, /producto/xyz, o /),
 *   devuelve el shell de la app tal cual (200) para que Angular enrute.
 *
 * Prueba tanto index.html (build estático) como index.csr.html (build SSR),
 * así funciona sin importar el comando de build que use Cloudflare.
 * Devolvemos la respuesta de ASSETS SIN re-empaquetarla (no rompe el body).
 */
const SHELLS = ['/index.html', '/index.csr.html'];

export default {
  async fetch(request, env) {
    const res = await env.ASSETS.fetch(request);
    if (res.status !== 404) return res;

    for (const path of SHELLS) {
      const url = new URL(path, request.url).toString();
      const shell = await env.ASSETS.fetch(new Request(url, request));
      if (shell.status === 200) return shell;
    }
    return res;
  },
};

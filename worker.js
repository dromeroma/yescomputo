/**
 * Worker mínimo para servir la SPA de Angular en Cloudflare.
 * - Sirve el archivo estático si existe (js, css, imágenes, index.html…).
 * - Si no existe (rutas del cliente como /catalogo, /producto/xyz, o /),
 *   devuelve index.html tal cual (200) para que Angular enrute en el navegador.
 *
 * Importante: devolvemos la respuesta de ASSETS SIN re-empaquetarla, para no
 * romper el content-encoding (gzip/br) del cuerpo.
 */
export default {
  async fetch(request, env) {
    const res = await env.ASSETS.fetch(request);
    if (res.status !== 404) return res;

    // Fallback SPA → el shell de la app (index.html), servido tal cual.
    const indexUrl = new URL('/index.html', request.url).toString();
    return env.ASSETS.fetch(new Request(indexUrl, request));
  },
};

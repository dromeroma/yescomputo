/**
 * Worker mínimo para servir la SPA de Angular en Cloudflare.
 * - Sirve el archivo estático si existe (js, css, imágenes, páginas
 *   prerenderizadas).
 * - Si no existe (rutas del cliente como /catalogo, /producto/xyz, o /),
 *   devuelve index.html con estado 200 para que Angular enrute en el navegador.
 */
export default {
  async fetch(request, env) {
    const res = await env.ASSETS.fetch(request);
    if (res.status !== 404) return res;

    // Fallback SPA → el shell de la app.
    const url = new URL(request.url);
    url.pathname = '/index.html';
    const shell = await env.ASSETS.fetch(new Request(url.toString(), request));
    return new Response(shell.body, {
      status: 200,
      headers: shell.headers,
    });
  },
};

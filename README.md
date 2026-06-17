# Yes Computo · Sitio Web

Sitio público de **Yes Computo** — líderes en _Tecnología Circular_ en Cartagena de Indias.
Plataforma de ecommerce de tecnología corporativa: portátiles y equipos reacondicionados,
workstations, alquiler de equipos, servicio técnico y más.

> **Fase actual: sitio público (frontend).** Sin panel administrativo, sin base de datos y sin
> backend todavía. El catálogo se sirve desde JSON local, detrás de una capa de datos diseñada
> para reemplazarse por una API de FastAPI + Supabase con cambios mínimos.

## Stack

- **Angular 20** (standalone components, signals, control flow `@if/@for`, SSR + prerender)
- **Tailwind CSS v4** (configuración CSS-first con tokens de marca)
- **TypeScript** estricto
- Arquitectura por características (_feature-based_) + principios de _clean architecture_

## Scripts

```bash
npm start        # servidor de desarrollo  → http://localhost:4200
npm run build    # build de producción (browser + server + prerender)
npm run serve:ssr:yescomputo   # sirve el build SSR (Node/Express)
```

## Arquitectura

```
src/app/
├── core/                         # Lógica de dominio y datos (sin UI)
│   ├── config/app-config.ts      # InjectionToken APP_CONFIG: datos de empresa + fuente de datos
│   ├── models/                   # Interfaces de dominio (contrato de la futura API)
│   ├── data/
│   │   ├── catalog-data-source.ts        # Contrato abstracto del catálogo
│   │   ├── local-catalog-data-source.ts  # Implementación con JSON local
│   │   └── fixtures/*.json                # Datos: products, categories, brands, promotions
│   └── services/                 # Fachadas: CatalogService, CartService, SeoService, WhatsappService
├── shared/                       # UI reutilizable, agnóstica de dominio
│   ├── components/               # icon, button, badge, rating, product-card, logo, etc.
│   ├── pipes/cop-currency.pipe.ts
│   └── utils/
├── layout/                       # header (+ mega-menú), footer
└── features/                     # Páginas (lazy-loaded): home, catalog, product-detail,
                                  # categories, brands, promotions, services, circular-tech,
                                  # about, contact, cart, not-found
```

### Conectar la API real (FastAPI + Supabase)

Toda la app consume el catálogo a través de la clase abstracta **`CatalogDataSource`**.
Para pasar de JSON a la API en producción:

1. Crear `ApiCatalogDataSource` (usa `HttpClient` contra `AppConfig.apiBaseUrl`) implementando
   los mismos métodos que devuelven `Observable`.
2. En [`app.config.ts`](src/app/app.config.ts) cambiar el proveedor:
   ```ts
   { provide: CatalogDataSource, useClass: ApiCatalogDataSource }
   ```
3. Ajustar `dataSource: 'api'` en `DEFAULT_APP_CONFIG`.

Ningún componente de feature cambia: los modelos ya tienen la forma de la respuesta esperada del
backend (envoltorios `Paginated<T>`, `ProductQuery`, `CatalogFacets`).

## Diseño

Sistema de diseño definido como tokens en [`src/styles.css`](src/styles.css) (`@theme` de Tailwind v4):

- **brand** (verde lima) — energía, tecnología, "yes"
- **accent** (teal) — sostenibilidad, confianza, "computo"
- **ink** (azul marino profundo) — superficies premium oscuras
- Tipografías: **Sora** (display) + **Inter** (texto)

## Integraciones preparadas (estructura lista, sin backend)

Carrito (signals + localStorage), cotización por WhatsApp, SEO + JSON-LD por ruta, búsqueda y
filtros sincronizados con la URL, paginación, y puntos de extensión para autenticación, cuentas
de cliente, checkout y seguimiento de pedidos.

## Nota sobre SSR en local

El servidor SSR de Angular 20.3 valida el header `Host` (protección SSRF). Al servir el build con
Node y probar con `curl http://localhost:4000`, las rutas dinámicas hacen _fallback_ a render de
cliente; con un host real configurado funcionan con SSR completo. En desarrollo usa `npm start`.

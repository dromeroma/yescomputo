import { Routes } from '@angular/router';

/**
 * Application routes. Every feature is lazy-loaded via `loadComponent` so each
 * page ships in its own chunk — keeping the initial bundle small and the site
 * fast. Spanish slugs match the brand's market (Colombia).
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
    title: 'Yes Computo · Tecnología Circular para empresas',
  },
  {
    path: 'catalogo',
    loadComponent: () => import('./features/catalog/catalog').then((m) => m.Catalog),
    title: 'Catálogo · Yes Computo',
  },
  {
    path: 'categoria/:slug',
    loadComponent: () => import('./features/catalog/catalog').then((m) => m.Catalog),
  },
  {
    path: 'producto/:slug',
    loadComponent: () =>
      import('./features/product-detail/product-detail').then((m) => m.ProductDetail),
  },
  {
    path: 'categorias',
    loadComponent: () => import('./features/categories/categories').then((m) => m.Categories),
    title: 'Categorías · Yes Computo',
  },
  {
    path: 'marcas',
    loadComponent: () => import('./features/brands/brands').then((m) => m.Brands),
    title: 'Marcas · Yes Computo',
  },
  {
    path: 'promociones',
    loadComponent: () => import('./features/promotions/promotions').then((m) => m.Promotions),
    title: 'Promociones · Yes Computo',
  },
  {
    path: 'servicios',
    loadComponent: () => import('./features/services/services').then((m) => m.Services),
    title: 'Servicios · Yes Computo',
  },
  {
    path: 'tecnologia-circular',
    loadComponent: () =>
      import('./features/circular-tech/circular-tech').then((m) => m.CircularTech),
    title: 'Tecnología Circular · Yes Computo',
  },
  {
    path: 'nosotros',
    loadComponent: () => import('./features/about/about').then((m) => m.About),
    title: 'Nosotros · Yes Computo',
  },
  {
    path: 'contacto',
    loadComponent: () => import('./features/contact/contact').then((m) => m.Contact),
    title: 'Contacto · Yes Computo',
  },
  {
    path: 'carrito',
    loadComponent: () => import('./features/cart/cart').then((m) => m.Cart),
    title: 'Carrito · Yes Computo',
  },
  {
    path: 'terminos-y-condiciones',
    loadComponent: () => import('./features/legal/terminos').then((m) => m.Terminos),
    title: 'Términos y Condiciones · Yes Computo',
  },
  {
    path: 'politica-de-privacidad',
    loadComponent: () => import('./features/legal/privacidad').then((m) => m.Privacidad),
    title: 'Política de Privacidad · Yes Computo',
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
    title: 'Página no encontrada · Yes Computo',
  },
];

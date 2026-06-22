import { InjectionToken } from '@angular/core';

/**
 * Central, environment-agnostic application configuration.
 *
 * Everything the UI needs to know about the business and its data source lives
 * here behind an InjectionToken, so it can be overridden per-environment or in
 * tests without touching components.
 */
export interface AppConfig {
  /** Where the catalog data comes from. Flip to 'api' once FastAPI is live. */
  dataSource: 'local' | 'api';
  /** Base URL for the future FastAPI backend. */
  apiBaseUrl: string;
  /** Path (or URL) to the local JSON fixtures used while `dataSource === 'local'`. */
  localDataPath: string;
  /** Application version shown in the footer. Keep in sync with package.json. */
  appVersion: string;

  company: CompanyInfo;
}

export interface CompanyInfo {
  name: string;
  legalName: string;
  tagline: string;
  yearsInBusiness: number;
  foundedYear: number;
  phoneDisplay: string;
  /** Digits-only international format for wa.me / tel: links. */
  whatsappNumber: string;
  email: string;
  website: string;
  address: {
    street: string;
    neighborhood: string;
    city: string;
    country: string;
  };
  hours: { label: string; value: string }[];
  socials: { platform: 'facebook' | 'instagram' | 'whatsapp' | 'tiktok'; url: string }[];
  /** Default localisation. */
  currency: 'COP';
  locale: 'es-CO';
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

/** Default production-ready configuration for Yes Computo. */
export const DEFAULT_APP_CONFIG: AppConfig = {
  dataSource: 'api',
  // Backend (FastAPI) on Render. Public catalog endpoints live under /v1.
  apiBaseUrl: 'https://yescomputo-admin.onrender.com/v1',
  localDataPath: 'data',
  appVersion: '0.0.1',
  company: {
    name: 'Yes Computo',
    legalName: 'Yes Computo S.A.S.',
    tagline: 'Tecnología que evoluciona, confianza que permanece.',
    yearsInBusiness: 20,
    foundedYear: 2005,
    phoneDisplay: '301 217 2061',
    whatsappNumber: '573012172061',
    email: 'yescomputo@gmail.com',
    website: 'https://www.yescomputo.com',
    address: {
      street: 'Calle 30 #58A-99, Local 1',
      neighborhood: 'Barrio 5 de Noviembre',
      city: 'Cartagena de Indias',
      country: 'Colombia',
    },
    hours: [
      { label: 'Lunes a Viernes', value: '8:00 a.m. – 6:00 p.m.' },
      { label: 'Sábados', value: '9:00 a.m. – 6:00 p.m.' },
      { label: 'Domingos y festivos', value: 'Cerrado' },
    ],
    socials: [
      { platform: 'facebook', url: 'https://facebook.com/yescomputo' },
      { platform: 'instagram', url: 'https://instagram.com/yescomputo' },
      { platform: 'whatsapp', url: 'https://wa.me/573012172061' },
    ],
    currency: 'COP',
    locale: 'es-CO',
  },
};

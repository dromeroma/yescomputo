/**
 * Seasonal "campaign" theming engine.
 *
 * A campaign is a switchable visual layer (like light/dark) that dresses the
 * site for an occasion — the World Cup, Mother's/Father's Day, etc. It is
 * orthogonal to light/dark: it sets `data-campaign="<id>"` on <html>, scoping
 * decorative CSS and conditional UI, and adds an accent palette + a hero slide,
 * ribbon and promo.
 *
 * Turning it off is trivial and safe:
 *   • set `SEASONAL_CAMPAIGN = null`  → no campaign exists anywhere, or
 *   • the user toggles "Modo Fútbol" off in the header.
 * Either way the attribute/blocks disappear and the base site is untouched.
 *
 * Adding a new occasion = add one entry to `CAMPAIGNS` and point
 * `SEASONAL_CAMPAIGN` at it. The same toggle adapts automatically.
 */

export type CampaignId = 'mundial' | 'madres' | 'padres' | 'profesor' | 'ingeniero';

export interface CampaignAccent {
  /** Primary festive accent (hex). */
  primary: string;
  /** Secondary accent (hex). */
  secondary: string;
  /** Tertiary accent (hex). */
  tertiary: string;
}

export interface CampaignHero {
  eyebrow: string;
  titleTop: string;
  titleMain: string;
  subtitle: string;
  /** Real photo behind the hero showcase / mobile background. */
  image: string;
  ctaLabel: string;
  ctaLink: string;
  chips: { icon: string; label: string }[];
}

export interface CampaignPromo {
  badge: string;
  subtitle: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaLink: string;
  icon: string;
}

export interface CampaignDef {
  id: CampaignId;
  /** Name shown on the header toggle / tooltip. */
  label: string;
  /** Glyph for the toggle (see Icon set). */
  icon: string;
  /** Small flourish used in copy. */
  emoji: string;
  accent: CampaignAccent;
  /** Top festive ribbon. */
  ribbon: { text: string; cta: { label: string; link: string } };
  hero: CampaignHero;
  promo: CampaignPromo;
}

export const CAMPAIGNS: Partial<Record<CampaignId, CampaignDef>> = {
  mundial: {
    id: 'mundial',
    label: 'Modo Fútbol',
    icon: 'soccer',
    emoji: '⚽',
    accent: {
      primary: '#FCD116', // Colombia yellow
      secondary: '#003893', // Colombia blue
      tertiary: '#CE1126', // Colombia red
    },
    ribbon: {
      text: '¡Vamos, Colombia! Vive el Mundial con la mejor tecnología.',
      cta: { label: 'Ver ofertas', link: '/catalogo' },
    },
    hero: {
      eyebrow: 'Edición Mundial',
      titleTop: 'Vive cada partido',
      titleMain: 'con la mejor pantalla',
      subtitle:
        'Monitores, portátiles y equipos para no perderte ni un gol. Tecnología que rinde dentro y fuera de la cancha. ¡Vamos, Colombia!',
      image: '/img/hero/mundial.jpg',
      ctaLabel: '¡Ver ofertas Mundial!',
      ctaLink: '/catalogo',
      chips: [
        { icon: 'monitor', label: 'Pantallas para el partido' },
        { icon: 'sparkles', label: 'Ofertas especiales' },
      ],
    },
    promo: {
      badge: '¡Vamos Colombia!',
      subtitle: 'Edición Mundial',
      title: 'Arma tu setup mundialista',
      description:
        'Monitores grandes, equipos veloces y todo para vivir el Mundial como se debe. Aprovecha precios especiales de temporada.',
      ctaLabel: 'Ver equipos',
      ctaLink: '/categoria/monitores',
      icon: 'soccer',
    },
  },
};

/**
 * The campaign currently "in season". Set to `null` to disable the whole
 * feature (the toggle hides and no campaign styling exists).
 */
export const SEASONAL_CAMPAIGN: CampaignId | null = 'mundial';

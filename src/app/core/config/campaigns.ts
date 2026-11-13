/**
 * Seasonal "campaign" theming engine.
 *
 * A campaign is a switchable visual layer (like light/dark) that dresses the
 * site for an occasion — the World Cup, Christmas, Mother's Day, etc. It is
 * orthogonal to light/dark: it sets `data-campaign="<id>"` on <html>, scoping
 * decorative CSS and conditional UI, and adds an accent palette + a hero slide,
 * ribbon and promo.
 *
 * Several campaigns can be "in season" at once (`SEASONAL_CAMPAIGNS`): each one
 * gets its OWN header button and its OWN persisted on/off state. Only one skin
 * is painted at a time — activating one switches the others off.
 *
 * Turning it off is trivial and safe:
 *   • remove the id from `SEASONAL_CAMPAIGNS` → that campaign (and its button)
 *     no longer exists anywhere, or
 *   • the user toggles its header button off.
 * Either way the attribute/blocks disappear and the base site is untouched.
 *
 * Adding a new occasion = add one entry to `CAMPAIGNS` (+ its CSS palette under
 * `[data-campaign='<id>']` in styles.css) and list it in `SEASONAL_CAMPAIGNS`.
 * Remember to mirror the list in the pre-paint script of `index.html`.
 */

export type CampaignId = 'mundial' | 'navidad' | 'madres' | 'padres' | 'profesor' | 'ingeniero';

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

/** Celebration played on load / navigation / activation. */
export interface CampaignCelebration {
  /** `confetti` = flag-coloured paper | `snow` = soft snowfall + gold glitter. */
  kind: 'confetti' | 'snow';
  colors: string[];
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
  /** Class for the highlighted hero title (animated gradient, see styles.css). */
  titleClass: string;
  celebration: CampaignCelebration;
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
    titleClass: 'text-gradient-co',
    celebration: {
      kind: 'confetti',
      colors: ['#FCD116', '#1e63d6', '#e23b4e', '#ffffff', '#FCD116', '#1e63d6'],
    },
    ribbon: {
      text: '¡Vamos, Colombia! Vive el Mundial con la mejor tecnología.',
      cta: { label: 'Ver ofertas', link: '/catalogo' },
    },
    hero: {
      eyebrow: 'Edición Mundial',
      titleTop: 'Vive cada partido',
      titleMain: 'con la mejor tecnología',
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

  navidad: {
    id: 'navidad',
    label: 'Modo Navidad',
    icon: 'tree',
    emoji: '🎄',
    accent: {
      primary: '#E8C670', // champagne gold
      secondary: '#C8203F', // crimson
      tertiary: '#1F8A55', // pine emerald
    },
    titleClass: 'text-gradient-xmas',
    celebration: {
      kind: 'snow',
      colors: ['#ffffff', '#ffffff', '#f4f7fb', '#E8C670', '#f6e3a1'],
    },
    ribbon: {
      text: 'Feliz Navidad — regala tecnología que se usa todo el año.',
      cta: { label: 'Ideas de regalo', link: '/catalogo' },
    },
    hero: {
      eyebrow: 'Edición Navidad',
      titleTop: 'Esta Navidad,',
      titleMain: 'regala tecnología',
      subtitle:
        'Portátiles, monitores y accesorios con garantía para sorprender en casa o premiar a tu equipo de trabajo. Celebra con lo mejor de Yes Computo.',
      image: '/img/hero/workspace.jpg',
      ctaLabel: 'Ver ideas de regalo',
      ctaLink: '/catalogo',
      chips: [
        { icon: 'gift', label: 'Regalos con garantía' },
        { icon: 'sparkles', label: 'Precios de temporada' },
      ],
    },
    promo: {
      badge: 'Temporada navideña',
      subtitle: 'Regalos corporativos y para el hogar',
      title: 'Una Navidad con tecnología que dura',
      description:
        'Equipos listos para regalar: portátiles, monitores y accesorios con garantía. Cotiza regalos para tu equipo de trabajo y recibe asesoría personalizada.',
      ctaLabel: 'Explorar regalos',
      ctaLink: '/catalogo',
      icon: 'gift',
    },
  },
};

/**
 * Campaigns currently "in season", in priority order. Each one shows its own
 * header button. Empty array = feature disabled (no toggles, no styling).
 * The FIRST one is on by default; the rest start off until the user turns
 * them on. Keep in sync with the pre-paint script in `index.html`.
 */
export const SEASONAL_CAMPAIGNS: CampaignId[] = ['navidad'];

/** Christmas light-string bulbs (gold / crimson / emerald / warm white),
 * with staggered twinkle delays. Shared by the ribbon and header garland. */
export const XMAS_BULBS = Array.from({ length: 64 }, (_, i) => ({
  color: ['#F2CF63', '#E0284A', '#2FBF71', '#FFF4D6'][i % 4],
  delay: ((i * 37) % 23) / 10,
}));

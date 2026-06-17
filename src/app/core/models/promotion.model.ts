/** Promotional banner / campaign. Maps to a future `promotions` table. */
export interface Promotion {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  /** Short label badge, e.g. "-20%", "ENVÍO GRATIS". */
  badge?: string;
  /** CTA link target (internal route or external). */
  ctaLabel: string;
  ctaLink: string;
  /** Theme key driving the gradient/treatment of the banner. */
  theme: 'brand' | 'ink' | 'accent' | 'sustainability';
  image?: string;
  /** ISO dates; UI may show countdowns / "termina pronto". */
  startsAt?: string;
  endsAt?: string;
  featured?: boolean;
}

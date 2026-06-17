/** Manufacturer / brand. Maps to a future `brands` table. */
export interface Brand {
  id: string;
  slug: string;
  name: string;
  /** Tagline used on the brand landing page. */
  tagline?: string;
  /** Wordmark/logo asset (SVG preferred). */
  logo?: string;
  description?: string;
  /** Corporate product lines carried for this brand. */
  corporateLines?: string[];
  productCount: number;
  featured?: boolean;
}

/** Product category. Maps to a future `categories` table. */
export interface Category {
  id: string;
  slug: string;
  name: string;
  /** Short description for category landing pages & SEO. */
  description: string;
  /** Lucide-style icon key resolved by the <yc-icon> component. */
  icon: string;
  /** Optional hero/illustration image. */
  image?: string;
  /** Denormalised count for badges; backend would compute this. */
  productCount: number;
  /** Ordering weight for menus. */
  order?: number;
  /** Highlight in the primary navigation / mega-menu. */
  featured?: boolean;
}

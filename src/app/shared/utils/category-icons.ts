/**
 * Maps a category id to its glyph key (see {@link Icon}). Kept as a tiny static
 * lookup so synchronous components (e.g. product cards) can resolve an icon
 * without an async category fetch. Mirrors `categories.json`.
 */
export const CATEGORY_ICONS: Record<string, string> = {
  'cat-01': 'laptop',
  'cat-02': 'desktop',
  'cat-03': 'cpu',
  'cat-04': 'recycle',
  'cat-05': 'monitor',
  'cat-06': 'printer',
  'cat-07': 'keyboard',
  'cat-08': 'network',
  'cat-09': 'camera',
  'cat-10': 'headphones',
  'cat-11': 'smartphone',
  'cat-12': 'zap',
};

export function categoryIcon(categoryId: string): string {
  return CATEGORY_ICONS[categoryId] ?? 'cpu';
}

import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';
const STORAGE_KEY = 'yc.theme';

/**
 * Light/dark theme controller.
 *
 * - Default is **light**.
 * - Choice persists in localStorage and is reflected as a `.dark` class on
 *   <html> (matched by the Tailwind `dark` custom variant).
 * - SSR-safe: on the server it stays light. A tiny inline script in
 *   `index.html` applies the stored class before first paint to avoid a flash.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _mode = signal<ThemeMode>(this.initial());
  readonly mode = this._mode.asReadonly();

  toggle(): void {
    this.set(this._mode() === 'dark' ? 'light' : 'dark');
  }

  set(mode: ThemeMode): void {
    this._mode.set(mode);
    if (!this.isBrowser) return;
    this.doc.documentElement.classList.toggle('dark', mode === 'dark');
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* storage unavailable — keep in-memory only */
    }
  }

  private initial(): ThemeMode {
    if (!this.isBrowser) return 'light';
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {
      /* ignore */
    }
    // Default light, regardless of OS preference (per product decision).
    return 'light';
  }
}

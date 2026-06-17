import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { CAMPAIGNS, CampaignDef, SEASONAL_CAMPAIGN } from '../config/campaigns';

const STORAGE_KEY = 'yc.campaign';

/**
 * Controls the seasonal campaign overlay (e.g. "Modo Fútbol").
 *
 * - When `SEASONAL_CAMPAIGN` is set, the campaign is **on by default** (per
 *   product decision) but the user can toggle it off; the choice persists.
 * - Reflects state as `data-campaign="<id>"` on <html> (mirrored by a pre-paint
 *   script in index.html to avoid a flash), and exposes the active definition
 *   as a signal so components can render festive UI behind `@if (campaign())`.
 * - Fully reversible: toggling off (or `SEASONAL_CAMPAIGN = null`) removes the
 *   attribute and the base site is untouched.
 */
@Injectable({ providedIn: 'root' })
export class CampaignService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** The campaign configured for this season (null = feature disabled). */
  readonly seasonal: CampaignDef | null = SEASONAL_CAMPAIGN
    ? CAMPAIGNS[SEASONAL_CAMPAIGN] ?? null
    : null;

  /** Whether a toggle should be offered at all. */
  readonly available = this.seasonal !== null;

  private readonly _enabled = signal<boolean>(this.initialEnabled());

  /** User on/off preference. */
  readonly enabled = this._enabled.asReadonly();

  /** Increments each time the user *activates* the mode → triggers confetti. */
  private readonly _burst = signal(0);
  readonly burst = this._burst.asReadonly();

  /** The active campaign definition, or null when off / unavailable. */
  readonly campaign = computed<CampaignDef | null>(() =>
    this.seasonal && this._enabled() ? this.seasonal : null,
  );

  constructor() {
    // Keep the <html data-campaign> attribute in sync (browser only).
    effect(() => {
      if (!this.isBrowser) return;
      const active = this.campaign();
      const root = this.doc.documentElement;
      if (active) root.setAttribute('data-campaign', active.id);
      else root.removeAttribute('data-campaign');
    });
  }

  toggle(): void {
    this.setEnabled(!this._enabled());
  }

  setEnabled(on: boolean): void {
    const wasOn = this._enabled();
    this._enabled.set(on);
    // Celebrate only when the user actively turns it ON.
    if (on && !wasOn && this.isBrowser) this._burst.update((n) => n + 1);
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
    } catch {
      /* storage unavailable */
    }
  }

  private initialEnabled(): boolean {
    if (!this.seasonal) return false;
    if (!this.isBrowser) return false; // off during SSR; the FOUC script + effect set it client-side
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'off') return false;
      if (stored === 'on') return true;
    } catch {
      /* ignore */
    }
    return true; // default ON in season
  }
}

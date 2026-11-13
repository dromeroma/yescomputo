import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { CAMPAIGNS, CampaignDef, CampaignId, SEASONAL_CAMPAIGNS } from '../config/campaigns';

/** Per-campaign persisted preference: `yc.campaign.<id>` = 'on' | 'off'. */
const storageKey = (id: CampaignId) => `yc.campaign.${id}`;

/**
 * Controls the seasonal campaign overlays (e.g. "Modo Fútbol", "Modo Navidad").
 *
 * - Every campaign listed in `SEASONAL_CAMPAIGNS` gets its own toggle and its
 *   own persisted on/off state. Only one skin is painted at a time: turning
 *   one on switches the others off.
 * - The first in-season campaign is **on by default** (per product decision);
 *   the user can turn it off and the choice persists.
 * - Reflects state as `data-campaign="<id>"` on <html> (mirrored by a pre-paint
 *   script in index.html to avoid a flash), and exposes the active definition
 *   as a signal so components can render festive UI behind `@if (campaign())`.
 * - Fully reversible: toggling off (or emptying `SEASONAL_CAMPAIGNS`) removes
 *   the attribute and the base site is untouched.
 */
@Injectable({ providedIn: 'root' })
export class CampaignService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** Campaigns configured for this season, each with its own toggle. */
  readonly seasonals: CampaignDef[] = SEASONAL_CAMPAIGNS.map((id) => CAMPAIGNS[id]).filter(
    (c): c is CampaignDef => !!c,
  );

  /** Whether any toggle should be offered at all. */
  readonly available = this.seasonals.length > 0;

  private readonly activeId = signal<CampaignId | null>(this.initialActive());

  /** Increments each time the user *activates* a mode → triggers celebration. */
  private readonly _burst = signal(0);
  readonly burst = this._burst.asReadonly();

  /** The active campaign definition, or null when all are off / unavailable. */
  readonly campaign = computed<CampaignDef | null>(
    () => this.seasonals.find((c) => c.id === this.activeId()) ?? null,
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

  isEnabled(id: CampaignId): boolean {
    return this.activeId() === id;
  }

  toggle(id: CampaignId): void {
    this.setEnabled(id, !this.isEnabled(id));
  }

  setEnabled(id: CampaignId, on: boolean): void {
    if (!this.seasonals.some((c) => c.id === id)) return;
    const wasOn = this.isEnabled(id);
    if (on) this.activeId.set(id);
    else if (wasOn) this.activeId.set(null);
    // Celebrate only when the user actively turns a mode ON.
    if (on && !wasOn && this.isBrowser) this._burst.update((n) => n + 1);
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(storageKey(id), on ? 'on' : 'off');
      // One skin at a time: switching one on turns the other ones off.
      if (on) {
        for (const c of this.seasonals) {
          if (c.id !== id) localStorage.setItem(storageKey(c.id), 'off');
        }
      }
    } catch {
      /* storage unavailable */
    }
  }

  /** Mirrors the pre-paint script in index.html — keep both in sync. */
  private initialActive(): CampaignId | null {
    if (!this.available || !this.isBrowser) return null; // SSR: the FOUC script + effect set it client-side
    try {
      const explicit = this.seasonals.find((c) => localStorage.getItem(storageKey(c.id)) === 'on');
      if (explicit) return explicit.id;
      const first = this.seasonals[0];
      return localStorage.getItem(storageKey(first.id)) === 'off' ? null : first.id;
    } catch {
      return this.seasonals[0].id; // default ON in season
    }
  }
}

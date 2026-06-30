import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { APP_CONFIG } from '../../../core/config/app-config';

/**
 * Yes Computo wordmark — the official brand artwork (flat two-colour SVG,
 * derived from the marketing logo). Scales crisply at any size and reads on
 * both light and dark surfaces, so a single asset covers every placement.
 *
 * `size` is the rendered height in px; width is derived from the logo's
 * intrinsic 2048×980 aspect ratio (and set as an attribute to avoid layout
 * shift while the SVG loads). The `tone` input is kept for call-site
 * compatibility — the full-colour mark is used regardless.
 */
@Component({
  selector: 'yc-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex items-center' },
  template: `
    <img
      [src]="src()"
      [alt]="alt()"
      class="block w-auto select-none"
      draggable="false"
      [attr.width]="custom() ? null : width()"
      [height]="size()"
      [style.height.px]="size()"
    />
  `,
})
export class Logo {
  private readonly config = inject(APP_CONFIG);

  /** Rendered height of the wordmark in px. */
  readonly size = input(26);
  /** Retained for API compatibility; the full-colour logo is used either way. */
  readonly tone = input<'dark' | 'light'>('dark');

  /** Per-tenant logo when set, else the built-in Yes Computo wordmark. */
  protected readonly src = computed(() => this.config.company.logoUrl || '/img/logo.svg');
  protected readonly custom = computed(() => !!this.config.company.logoUrl);
  protected readonly alt = computed(() => this.config.company.name);

  /** Intrinsic aspect ratio of the built-in artwork (tight viewBox 1929×880). */
  protected readonly width = computed(() => Math.round(this.size() * (1929 / 880)));
}

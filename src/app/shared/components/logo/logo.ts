import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

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
      src="/img/logo.svg"
      alt="Yes Computo"
      class="block w-auto select-none"
      draggable="false"
      [width]="width()"
      [height]="size()"
      [style.height.px]="size()"
    />
  `,
})
export class Logo {
  /** Rendered height of the wordmark in px. */
  readonly size = input(26);
  /** Retained for API compatibility; the full-colour logo is used either way. */
  readonly tone = input<'dark' | 'light'>('dark');

  /** Intrinsic aspect ratio of the logo artwork (2048×980). */
  protected readonly width = computed(() => Math.round(this.size() * (2048 / 980)));
}

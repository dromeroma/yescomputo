import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Yes Computo wordmark. Reconstructed as crisp markup (not a raster) so it
 * stays sharp at any size and adapts to light/dark surfaces via the `tone`
 * input. The bracket-plus glyph echoes the brand's cursor motif.
 */
@Component({
  selector: 'yc-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex items-center' },
  template: `
    <span class="inline-flex items-baseline font-display font-extrabold leading-none tracking-tight"
      [style.font-size.px]="size()">
      <span class="text-brand-500">yes</span>
      <span
        class="mx-[0.12em] inline-grid place-items-center rounded-[0.18em] border-[0.09em] text-brand-500"
        [style.width.em]="0.66"
        [style.height.em]="0.66"
        [class.border-brand-500]="true"
        aria-hidden="true"
      >
        <span class="text-[0.5em] leading-none">+</span>
      </span>
      <span [class]="tone() === 'light' ? 'text-white' : 'text-accent-600'">computo</span>
    </span>
    <span class="sr-only">Yes Computo</span>
  `,
})
export class Logo {
  /** Pixel font-size of the wordmark. */
  readonly size = input(26);
  /** `dark` → teal "computo" (light backgrounds); `light` → white (dark backgrounds). */
  readonly tone = input<'dark' | 'light'>('dark');
}

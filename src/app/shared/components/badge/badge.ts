import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeTone = 'brand' | 'accent' | 'ink' | 'success' | 'warning' | 'neutral' | 'outline';

/** Small pill label used for conditions, flags and statuses. */
@Component({
  selector: 'yc-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
  template: `<ng-content />`,
})
export class Badge {
  readonly tone = input<BadgeTone>('neutral');

  protected readonly classes = computed(() => {
    const base =
      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-2xs font-semibold uppercase tracking-wider';
    const tones: Record<BadgeTone, string> = {
      brand: 'bg-brand-100 text-brand-800',
      accent: 'bg-accent-100 text-accent-800',
      ink: 'bg-ink-900 text-white',
      success: 'bg-emerald-100 text-emerald-700',
      warning: 'bg-amber-100 text-amber-700',
      neutral: 'bg-surface-inset text-content-muted',
      outline: 'border border-line-strong text-content-muted',
    };
    return `${base} ${tones[this.tone()]}`;
  });
}

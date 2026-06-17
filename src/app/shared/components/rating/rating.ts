import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Compact star-rating display (read-only). */
@Component({
  selector: 'yc-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex items-center gap-1.5' },
  template: `
    <span class="inline-flex" [attr.aria-label]="'Calificación ' + value() + ' de 5'">
      @for (star of stars(); track $index) {
        <svg width="14" height="14" viewBox="0 0 24 24" [attr.fill]="star ? '#f5a623' : '#e4eaf3'">
          <path
            d="m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17l-6.1 3.5 1.6-6.8L2 9.1l7-.6z"
          />
        </svg>
      }
    </span>
    @if (count() != null) {
      <span class="text-xs text-ink-500">{{ value() }} ({{ count() }})</span>
    }
  `,
})
export class Rating {
  readonly value = input(0);
  readonly count = input<number | null>(null);

  protected readonly stars = computed(() =>
    Array.from({ length: 5 }, (_, i) => i < Math.round(this.value())),
  );
}

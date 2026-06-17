import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Consistent section header: eyebrow + title + optional description, with an
 * optional right-aligned action slot (e.g. a "ver todo" link).
 */
@Component({
  selector: 'yc-section-heading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block reveal' },
  template: `
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      [class.text-center]="centered()"
      [class.sm:text-left]="centered()"
    >
      <div [class.mx-auto]="centered()" [class.max-w-2xl]="centered()">
        @if (eyebrow()) {
          <span class="eyebrow mb-3">
            <span class="h-1 w-1 rounded-full bg-accent-500"></span>{{ eyebrow() }}
          </span>
        }
        <h2 class="text-3xl sm:text-4xl">{{ title() }}</h2>
        @if (description()) {
          <p class="mt-3 text-content-muted text-base leading-relaxed">{{ description() }}</p>
        }
      </div>
      <div [class.hidden]="centered()"><ng-content /></div>
    </div>
  `,
})
export class SectionHeading {
  readonly eyebrow = input<string>('');
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly centered = input(false);
}

import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { Icon } from '../icon/icon';

/**
 * Product visual. Renders the real product photo (object-cover on a clean
 * surface) and gracefully falls back to an on-brand gradient + category glyph
 * if the image is missing or fails to load. SSR-safe.
 */
@Component({
  selector: 'yc-product-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: { class: 'block w-full h-full' },
  template: `
    @if (src() && !failed()) {
      <div class="relative h-full w-full overflow-hidden bg-white">
        <img
          [src]="src()"
          [alt]="label()"
          loading="lazy"
          decoding="async"
          class="h-full w-full object-cover transition-opacity duration-500"
          [class.opacity-0]="!loaded()"
          [class.opacity-100]="loaded()"
          (load)="loaded.set(true)"
          (error)="failed.set(true)"
        />
        @if (!loaded()) {
          <div class="absolute inset-0 skeleton"></div>
        }
      </div>
    } @else {
      <!-- Branded fallback -->
      <div
        class="relative flex h-full w-full items-center justify-center overflow-hidden"
        [style.background]="gradient()"
      >
        <div
          class="absolute inset-0 opacity-50"
          style="background-image:linear-gradient(rgba(15,28,50,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(15,28,50,.04) 1px,transparent 1px);background-size:22px 22px"
        ></div>
        <div
          class="absolute -right-8 -top-10 h-40 w-40 rounded-full opacity-40 blur-3xl"
          [style.background]="glow()"
        ></div>
        <yc-icon [name]="icon()" [size]="84" [strokeWidth]="1.25" class="relative text-ink-900/80" />
        @if (label()) {
          <span
            class="absolute bottom-3 left-3 text-2xs font-semibold uppercase tracking-widest text-ink-500/80"
            >{{ label() }}</span
          >
        }
      </div>
    }
  `,
})
export class ProductImage {
  /** Real product image URL. When absent/broken, the branded fallback shows. */
  readonly src = input<string | undefined>(undefined);
  readonly icon = input('cpu');
  readonly label = input<string>('');
  readonly seed = input('0');

  protected readonly failed = signal(false);
  protected readonly loaded = signal(false);

  private static readonly palettes = [
    ['#f4fbe5', '#e6f5c4'],
    ['#ecfdfa', '#cffaf1'],
    ['#f3f6fb', '#e4eaf3'],
    ['#eef7e6', '#dff0ec'],
  ];

  private readonly index = computed(() => {
    const s = this.seed();
    let hash = 0;
    for (let i = 0; i < s.length; i++) hash = (hash + s.charCodeAt(i)) % 997;
    return hash % ProductImage.palettes.length;
  });

  protected readonly gradient = computed(() => {
    const [a, b] = ProductImage.palettes[this.index()];
    return `linear-gradient(135deg, ${a}, ${b})`;
  });

  protected readonly glow = computed(() => {
    const glows = ['#b6df5c', '#65e4d3', '#9fb5d4', '#9ed032'];
    return glows[this.index()];
  });
}

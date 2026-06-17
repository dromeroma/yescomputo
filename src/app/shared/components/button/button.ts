import { computed, Directive, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'dark' | 'whatsapp';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Design-system button, implemented as an attribute directive so it can style
 * `<button>`, `<a>` and `[routerLink]` elements identically:
 *   <a ycButton variant="primary" routerLink="/catalogo">Ver catálogo</a>
 *   <button ycButton variant="outline" size="sm">Filtrar</button>
 */
@Directive({
  selector: '[ycButton]',
  host: { '[class]': 'classes()' },
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly block = input(false);

  protected readonly classes = computed(() => {
    const base =
      'inline-flex items-center justify-center gap-2 font-semibold rounded-full ' +
      'transition-all duration-200 ease-out select-none whitespace-nowrap ' +
      'focus-visible:outline-2 focus-visible:outline-offset-2 ' +
      'disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const sizes: Record<ButtonSize, string> = {
      sm: 'text-sm px-4 h-9',
      md: 'text-sm px-6 h-11',
      lg: 'text-base px-8 h-13',
    };

    const variants: Record<ButtonVariant, string> = {
      primary:
        'bg-brand-500 text-ink-950 hover:bg-brand-400 shadow-[0_8px_24px_-8px_rgba(132,184,31,0.6)] ' +
        'hover:shadow-[0_12px_32px_-8px_rgba(132,184,31,0.7)] hover:-translate-y-0.5 active:translate-y-0',
      secondary:
        'bg-accent-500 text-white hover:bg-accent-600 shadow-[0_8px_24px_-8px_rgba(20,176,164,0.5)] ' +
        'hover:-translate-y-0.5 active:translate-y-0',
      dark: 'bg-ink-900 text-white hover:bg-ink-800 dark:bg-white dark:text-ink-950 dark:hover:bg-ink-100 hover:-translate-y-0.5 active:translate-y-0',
      outline:
        'border border-line-strong text-content bg-surface-raised hover:border-content hover:bg-surface-inset',
      ghost: 'text-content-muted hover:bg-surface-inset hover:text-content',
      whatsapp:
        'yc-wa relative bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-[0_8px_24px_-8px_rgba(37,211,102,0.6)] ' +
        'hover:-translate-y-0.5 active:translate-y-0',
    };

    return [
      base,
      sizes[this.size()],
      variants[this.variant()],
      this.block() ? 'w-full' : '',
    ].join(' ');
  });
}

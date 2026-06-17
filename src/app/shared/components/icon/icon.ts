import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Lightweight, SSR-safe inline SVG icon set (Lucide-style line icons).
 *
 * Icons are rendered through a template `@switch` so no `innerHTML`
 * sanitisation is needed and they tree-shake cleanly. Size is driven by the
 * `size` input (px); colour follows `currentColor`, so usage is simply:
 *   <yc-icon name="cart" [size]="20" class="text-brand-500" />
 */
@Component({
  selector: 'yc-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.display]': '"inline-flex"', '[attr.aria-hidden]': 'true' },
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      @switch (name()) {
        @case ('laptop') {
          <path d="M3 5h18v11H3z" /><path d="M2 20h20" />
        }
        @case ('desktop') {
          <rect x="3" y="4" width="18" height="12" rx="1" /><path d="M8 20h8M12 16v4" />
        }
        @case ('cpu') {
          <rect x="6" y="6" width="12" height="12" rx="1" /><rect x="9" y="9" width="6" height="6" />
          <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
        }
        @case ('recycle') {
          <path d="M7 19H5a2 2 0 0 1-1.7-3l1.3-2.2" /><path d="m9 22 3-3-3-3" />
          <path d="M14 4.5 13 3a2 2 0 0 0-3.4 0L8 5.5" /><path d="m7 9 1.5-4.5L13 6" />
          <path d="M17 5.5 18.3 8a2 2 0 0 1 0 2L17 12.5" /><path d="m22 13-4 .5L16 9" />
        }
        @case ('monitor') {
          <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
        }
        @case ('printer') {
          <path d="M6 9V2h12v7" /><rect x="6" y="14" width="12" height="8" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2" />
        }
        @case ('keyboard') {
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
        }
        @case ('network') {
          <rect x="9" y="2" width="6" height="6" rx="1" /><rect x="2" y="16" width="6" height="6" rx="1" />
          <rect x="16" y="16" width="6" height="6" rx="1" /><path d="M12 8v4M5 16v-2h14v2M12 12v2" />
        }
        @case ('camera') {
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z" />
          <circle cx="12" cy="13" r="3.5" />
        }
        @case ('headphones') {
          <path d="M3 14v-2a9 9 0 0 1 18 0v2" />
          <path d="M21 16a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2zM3 16a2 2 0 0 0 2 2h1v-6H5a2 2 0 0 0-2 2z" />
        }
        @case ('smartphone') {
          <rect x="6" y="2" width="12" height="20" rx="2" /><path d="M11 18h2" />
        }
        @case ('zap') {
          <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
        }
        @case ('search') {
          <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
        }
        @case ('cart') {
          <circle cx="9" cy="21" r="1.5" /><circle cx="18" cy="21" r="1.5" />
          <path d="M2 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.6L23 7H6" />
        }
        @case ('menu') {
          <path d="M3 6h18M3 12h18M3 18h18" />
        }
        @case ('close') {
          <path d="M18 6 6 18M6 6l12 12" />
        }
        @case ('chevron-down') {
          <path d="m6 9 6 6 6-6" />
        }
        @case ('chevron-right') {
          <path d="m9 6 6 6-6 6" />
        }
        @case ('chevron-left') {
          <path d="m15 6-6 6 6 6" />
        }
        @case ('arrow-right') {
          <path d="M5 12h14M13 6l6 6-6 6" />
        }
        @case ('arrow-up-right') {
          <path d="M7 17 17 7M8 7h9v9" />
        }
        @case ('check') {
          <path d="M20 6 9 17l-5-5" />
        }
        @case ('check-circle') {
          <circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" />
        }
        @case ('star') {
          <path d="m12 2 3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17l-6.1 3.5 1.6-6.8L2 9.1l7-.6z" />
        }
        @case ('shield') {
          <path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5z" />
        }
        @case ('shield-check') {
          <path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5z" /><path d="m9 12 2 2 4-4" />
        }
        @case ('truck') {
          <path d="M14 17V5a1 1 0 0 0-1-1H2v12" /><path d="M14 8h5l3 3v6h-8" />
          <circle cx="6.5" cy="18" r="1.5" /><circle cx="17.5" cy="18" r="1.5" />
        }
        @case ('phone') {
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
        }
        @case ('map-pin') {
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" />
        }
        @case ('mail') {
          <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 6 10-6" />
        }
        @case ('clock') {
          <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
        }
        @case ('leaf') {
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8a8 8 0 0 1-10 10z" />
          <path d="M2 22c2-3 4.5-5 9-7" />
        }
        @case ('sparkles') {
          <path d="M12 3v6M12 15v6M3 12h6M15 12h6" /><path d="m6 6 2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" />
        }
        @case ('wrench') {
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3 18v3h3l6.5-6.3a4 4 0 0 0 5.2-5.4l-2.7 2.7-2.3-2.3z" />
        }
        @case ('refresh') {
          <path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" />
        }
        @case ('plus') {
          <path d="M12 5v14M5 12h14" />
        }
        @case ('minus') {
          <path d="M5 12h14" />
        }
        @case ('trash') {
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" />
        }
        @case ('sliders') {
          <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
        }
        @case ('whatsapp') {
          <path d="M12 2a9.8 9.8 0 0 0-8.4 14.9L2 22l5.3-1.4A10 10 0 1 0 12 2z" />
          <path d="M8.5 7.8c.2-.5.4-.5.6-.5h.5c.2 0 .4 0 .6.5l.7 1.6c.1.2.1.4 0 .6l-.5.7c-.1.2-.2.3 0 .6.3.6.9 1.4 1.7 2 .9.6 1.3.7 1.6.6l.7-.5c.2-.1.4-.1.6 0l1.5.9c.4.2.5.4.5.6s0 .9-.4 1.4c-.4.5-1.3 1-2 1-1.3 0-3.3-.8-5-2.5s-2.6-3.8-2.6-5c0-.5.2-1.2.6-1.6z" fill="currentColor" stroke="none" />
        }
        @case ('facebook') {
          <path d="M14 9V7c0-1 .5-2 2-2h2V2h-3c-2.5 0-4 1.6-4 4v3H8v3h3v8h3v-8h3l1-3z" fill="currentColor" stroke="none" />
        }
        @case ('instagram') {
          <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="3.5" />
          <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
        }
        @case ('users') {
          <path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="8" r="4" />
          <path d="M22 20v-2a4 4 0 0 0-3-3.9M16 4.1A4 4 0 0 1 16 12" />
        }
        @case ('building') {
          <rect x="4" y="2" width="16" height="20" rx="1" />
          <path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M16 14h.01" />
        }
        @case ('graduation') {
          <path d="M22 9 12 5 2 9l10 4 10-4z" /><path d="M6 11v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
        }
        @case ('rocket') {
          <path d="M5 13c-1.5 1.3-2 5-2 5s3.7-.5 5-2a3 3 0 0 0-3-3z" />
          <path d="M9 15c1-5 4-9 11-11 0 6-3 10-8 11l-3-3z" /><circle cx="15" cy="9" r="1.3" />
        }
        @case ('sun') {
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        }
        @case ('moon') {
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        }
        @case ('chevrons-down') {
          <path d="m7 6 5 5 5-5M7 13l5 5 5-5" />
        }
        @case ('home') {
          <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6h5v6" />
        }
        @case ('soccer') {
          <circle cx="12" cy="12" r="9.5" />
          <path d="M12 8.4l3.4 2.5-1.3 4h-4.2l-1.3-4z" />
          <path d="M12 8.4V4.2M15.4 10.9l3.6-2.4M14.1 14.9l2 3.3M9.9 14.9l-2 3.3M8.6 10.9 5 8.5" />
        }
        @case ('trophy') {
          <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
          <path d="M7 6H5a2 2 0 0 0 0 4h2M17 6h2a2 2 0 0 1 0 4h-2" />
        }
        @case ('grid') {
          <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
        }
        @default {
          <circle cx="12" cy="12" r="9" />
        }
      }
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<string>();
  readonly size = input(24);
  readonly strokeWidth = input(2);
}

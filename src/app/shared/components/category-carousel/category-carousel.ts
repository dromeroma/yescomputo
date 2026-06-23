import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnDestroy,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';

import { Product } from '../../../core/models';
import { categoryIcon } from '../../utils/category-icons';
import { ProductCard } from '../product-card/product-card';

/**
 * Auto-scrolling, draggable product carousel (marquee-style).
 *
 * - Continuously scrolls in its default direction (alternating per row via the
 *   `reverse` input) with a peek of the next/previous card.
 * - The user can drag/swipe it; it follows the user's direction.
 * - After ~1 minute without interaction it recovers its default direction.
 * - Infinite, seamless loop. SSR-safe (animation only runs in the browser).
 */
@Component({
  selector: 'yc-category-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductCard],
  template: `
    <div
      #viewport
      class="overflow-hidden py-4 sm:py-6"
      style="-webkit-mask-image: linear-gradient(to right, transparent 0, #000 2rem, #000 calc(100% - 2rem), transparent 100%); mask-image: linear-gradient(to right, transparent 0, #000 2rem, #000 calc(100% - 2rem), transparent 100%);"
      (pointerenter)="hovered.set(true)"
      (pointerleave)="hovered.set(false)"
    >
      <div
        #track
        class="flex select-none items-stretch gap-3 will-change-transform sm:gap-5"
        [class.cursor-grab]="!dragging()"
        [class.cursor-grabbing]="dragging()"
        style="touch-action: pan-y"
        [style.transform]="'translate3d(' + offset() + 'px,0,0)'"
        (pointerdown)="onDown($event)"
        (pointermove)="onMove($event)"
        (pointerup)="onUp()"
        (pointercancel)="onUp()"
      >
        @for (p of loop(); track $index) {
          <div
            class="relative w-[62%] shrink-0 transition-transform duration-300 ease-out hover:z-20 hover:[transform:scale(1.04)] sm:w-52 lg:w-60"
          >
            <yc-product-card [product]="p" [categoryIcon]="catIcon(p.categoryId)" />
          </div>
        }
      </div>
    </div>
  `,
})
export class CategoryCarousel implements OnDestroy {
  readonly products = input.required<Product[]>();
  /** false → scrolls right-to-left (default), true → left-to-right. */
  readonly reverse = input(false);

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly trackRef = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly viewportRef = viewChild.required<ElementRef<HTMLElement>>('viewport');

  readonly catIcon = categoryIcon;
  protected readonly copies = signal(2);
  protected readonly offset = signal(0);
  protected readonly dragging = signal(false);
  /** Pause + slightly enlarge the row while the cursor is over it. */
  protected readonly hovered = signal(false);

  /** Items repeated enough times to fill the viewport and loop seamlessly. */
  protected readonly loop = computed(() => {
    const items = this.products();
    const out: Product[] = [];
    for (let i = 0; i < this.copies(); i++) out.push(...items);
    return out;
  });

  private offsetVal = 0;
  private setWidth = 0;
  private dir = -1;
  private defaultDir = -1;
  private readonly speed = 34; // px/s
  private lastT = 0;
  private raf = 0;
  private lastInteraction = 0;
  private suppressClick = false;
  // drag state
  private startX = 0;
  private startOffset = 0;
  private lastX = 0;
  private dragDist = 0;

  constructor() {
    afterNextRender(() => {
      this.defaultDir = this.reverse() ? 1 : -1;
      this.dir = this.defaultDir;
      this.measure();
      // Cancel a card's navigation if the pointer actually dragged.
      this.trackRef().nativeElement.addEventListener(
        'click',
        (e) => {
          if (this.suppressClick) {
            e.preventDefault();
            e.stopPropagation();
            this.suppressClick = false;
          }
        },
        true,
      );
      new ResizeObserver(() => this.measure()).observe(this.viewportRef().nativeElement);
      this.lastT = performance.now();
      this.raf = requestAnimationFrame(this.step);
    });
  }

  private measure(): void {
    const track = this.trackRef().nativeElement;
    const n = this.products().length;
    const kids = track.children;
    if (n === 0 || kids.length <= n) return;
    const w = (kids[n] as HTMLElement).offsetLeft - (kids[0] as HTMLElement).offsetLeft;
    if (w > 0) this.setWidth = w;
    const vw = this.viewportRef().nativeElement.clientWidth;
    const needed = Math.max(2, Math.ceil(vw / Math.max(1, this.setWidth)) + 1);
    if (needed > this.copies()) {
      this.copies.set(needed);
      requestAnimationFrame(() => this.measure());
    }
  }

  /** Keep the offset within (-setWidth, 0] for a seamless infinite loop. */
  private wrap(o: number): number {
    const w = this.setWidth;
    if (w <= 0) return o;
    while (o <= -w) o += w;
    while (o > 0) o -= w;
    return o;
  }

  private step = (t: number): void => {
    const dt = Math.min(0.05, (t - this.lastT) / 1000);
    this.lastT = t;
    // Pause while dragging or hovered (so the user can read / click).
    if (!this.dragging() && !this.hovered()) {
      // Recover the default direction after a minute of no interaction.
      if (
        this.lastInteraction &&
        performance.now() - this.lastInteraction > 60_000 &&
        this.dir !== this.defaultDir
      ) {
        this.dir = this.defaultDir;
      }
      const o = this.wrap(this.offsetVal + this.dir * this.speed * dt);
      this.offsetVal = o;
      this.offset.set(o);
    }
    this.raf = requestAnimationFrame(this.step);
  };

  protected onDown(e: PointerEvent): void {
    if (!this.products().length) return;
    this.dragging.set(true);
    this.startX = e.clientX;
    this.lastX = e.clientX;
    this.startOffset = this.offsetVal;
    this.dragDist = 0;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  protected onMove(e: PointerEvent): void {
    if (!this.dragging()) return;
    const dx = e.clientX - this.startX;
    this.dragDist = Math.max(this.dragDist, Math.abs(dx));
    if (e.clientX !== this.lastX) this.dir = e.clientX > this.lastX ? 1 : -1;
    this.lastX = e.clientX;
    const o = this.wrap(this.startOffset + dx);
    this.offsetVal = o;
    this.offset.set(o);
  }

  protected onUp(): void {
    if (!this.dragging()) return;
    this.dragging.set(false);
    this.lastInteraction = performance.now();
    if (this.dragDist > 6) this.suppressClick = true;
  }

  ngOnDestroy(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}

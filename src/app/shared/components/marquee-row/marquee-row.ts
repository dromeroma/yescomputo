import { NgTemplateOutlet } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  ElementRef,
  inject,
  input,
  OnDestroy,
  PLATFORM_ID,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';

/**
 * Generic auto-scrolling, draggable marquee row.
 *
 * - Continuously scrolls (alternating direction via `reverse`) with a peek and
 *   soft faded edges.
 * - Pauses while hovered/dragged; the hovered item grows slightly (handled by
 *   each wrapper's CSS hover). After ~1 min idle it recovers the default
 *   direction. Infinite seamless loop. SSR-safe.
 *
 * Render any card via a projected template:
 *   <yc-marquee-row [items]="list">
 *     <ng-template let-item>…</ng-template>
 *   </yc-marquee-row>
 */
@Component({
  selector: 'yc-marquee-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
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
        @for (item of loop(); track $index) {
          <div
            [class]="
              'relative shrink-0 transition-transform duration-300 ease-out hover:z-20 hover:[transform:scale(1.04)] ' +
              itemClass()
            "
          >
            <ng-container *ngTemplateOutlet="tpl(); context: { $implicit: item }" />
          </div>
        }
      </div>
    </div>
  `,
})
export class MarqueeRow implements OnDestroy {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly items = input.required<readonly any[]>();
  /** false → right-to-left (default), true → left-to-right. */
  readonly reverse = input(false);
  readonly speed = input(34); // px/s
  /** Tailwind width/sizing classes for each item wrapper. */
  readonly itemClass = input('w-[62%] sm:w-52 lg:w-60');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected readonly tpl = contentChild.required<TemplateRef<{ $implicit: any }>>(TemplateRef);

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly trackRef = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly viewportRef = viewChild.required<ElementRef<HTMLElement>>('viewport');

  protected readonly copies = signal(2);
  protected readonly offset = signal(0);
  protected readonly dragging = signal(false);
  protected readonly hovered = signal(false);

  protected readonly loop = computed(() => {
    const items = this.items();
    const out: unknown[] = [];
    for (let i = 0; i < this.copies(); i++) out.push(...(items as unknown[]));
    return out;
  });

  private offsetVal = 0;
  private setWidth = 0;
  private dir = -1;
  private defaultDir = -1;
  private lastT = 0;
  private raf = 0;
  private lastInteraction = 0;
  private suppressClick = false;
  private startX = 0;
  private startOffset = 0;
  private lastX = 0;
  private dragDist = 0;

  constructor() {
    afterNextRender(() => {
      this.defaultDir = this.reverse() ? 1 : -1;
      this.dir = this.defaultDir;
      this.measure();
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
    const n = this.items().length;
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
    if (!this.dragging() && !this.hovered()) {
      if (
        this.lastInteraction &&
        performance.now() - this.lastInteraction > 60_000 &&
        this.dir !== this.defaultDir
      ) {
        this.dir = this.defaultDir;
      }
      const o = this.wrap(this.offsetVal + this.dir * this.speed() * dt);
      this.offsetVal = o;
      this.offset.set(o);
    }
    this.raf = requestAnimationFrame(this.step);
  };

  protected onDown(e: PointerEvent): void {
    if (!this.items().length) return;
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

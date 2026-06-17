import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';
import { CampaignService } from '../../../core/services/campaign.service';
import { CampaignDef } from '../../../core/config/campaigns';

interface HeroSlide {
  eyebrow: string;
  titleTop: string;
  titleMain: string;
  subtitle: string;
  icon: string;
  /** Real product image shown in the hero showcase. */
  image: string;
  ctaLabel: string;
  ctaLink: string;
  /** Override for the highlighted title gradient (e.g. campaign tricolor). */
  titleClass?: string;
  /** Vibrant gradient used for ambient glow accents. */
  aurora: string;
  /** Two accent hues for the background light rays. */
  streakA: string;
  streakB: string;
  chips: { icon: string; label: string }[];
}

/**
 * Cinematic, auto-playing hero banner. Occupies ~58% of the viewport height
 * (excluding the header) so the trust counters and category grid are visible
 * on first paint. Each slide spotlights a product world with an aurora-lit
 * device showcase. Crossfade, autoplay w/ hover-pause, dot + arrow controls,
 * keyboard support. SSR-safe (autoplay only runs in the browser).
 */
@Component({
  selector: 'yc-hero-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  host: {
    class: 'block',
    '(mouseenter)': 'pause()',
    '(mouseleave)': 'resume()',
    '(keydown.arrowRight)': 'next()',
    '(keydown.arrowLeft)': 'prev()',
    tabindex: '0',
    'aria-roledescription': 'carousel',
    'aria-label': 'Destacados de Yes Computo',
  },
  templateUrl: './hero-carousel.html',
})
export class HeroCarousel implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly campaignService = inject(CampaignService);
  private timer?: ReturnType<typeof setInterval>;
  private readonly intervalMs = 6000;

  protected readonly index = signal(0);
  protected readonly paused = signal(false);

  private readonly baseSlides: HeroSlide[] = [
    {
      eyebrow: 'Nueva línea corporativa',
      titleTop: 'Portátiles que',
      titleMain: 'rinden por años',
      subtitle: 'ThinkPad · EliteBook · Latitude. Potencia empresarial con garantía y soporte propio.',
      icon: 'laptop',
      image: '/img/hero/laptop.jpg',
      ctaLabel: '¡Comprar ahora!',
      ctaLink: '/categoria/portatiles-corporativos',
      aurora: 'linear-gradient(125deg, #22d3ee 0%, #a3e635 48%, #fde047 100%)',
      streakA: '#a3e635',
      streakB: '#22d3ee',
      chips: [
        { icon: 'cpu', label: 'Intel Core i5 / i7' },
        { icon: 'shield-check', label: 'Garantía incluida' },
      ],
    },
    {
      eyebrow: 'Movilidad total',
      titleTop: 'Celulares y tablets',
      titleMain: 'para tu equipo',
      subtitle: 'Dispositivos ágiles para ventas, inventario y atención en terreno, donde sea.',
      icon: 'smartphone',
      image: '/img/hero/phone.jpg',
      ctaLabel: 'Ver dispositivos',
      ctaLink: '/categoria/celulares-tablets',
      aurora: 'linear-gradient(125deg, #818cf8 0%, #22d3ee 50%, #34d399 100%)',
      streakA: '#818cf8',
      streakB: '#22d3ee',
      chips: [
        { icon: 'zap', label: 'Batería de larga duración' },
        { icon: 'refresh', label: 'También en alquiler' },
      ],
    },
    {
      eyebrow: 'Oficina sin límites',
      titleTop: 'Impresión',
      titleMain: 'de bajo costo',
      subtitle: 'Multifuncionales de tanque con el menor costo por página. Imprime, escanea y copia por Wi-Fi.',
      icon: 'printer',
      image: '/img/hero/printer.jpg',
      ctaLabel: 'Ver impresoras',
      ctaLink: '/categoria/impresoras',
      aurora: 'linear-gradient(125deg, #a3e635 0%, #22d3ee 55%, #38bdf8 100%)',
      streakA: '#a3e635',
      streakB: '#38bdf8',
      chips: [
        { icon: 'check-circle', label: 'Wi-Fi Direct' },
        { icon: 'leaf', label: 'Bajo costo por página' },
      ],
    },
    {
      eyebrow: 'Productividad visual',
      titleTop: 'Pantallas que',
      titleMain: 'enamoran',
      subtitle: 'Monitores Full HD y QHD para oficina, diseño y videovigilancia. Más enfoque, menos fatiga.',
      icon: 'monitor',
      image: '/img/hero/monitor.jpg',
      ctaLabel: 'Ver monitores',
      ctaLink: '/categoria/monitores',
      aurora: 'linear-gradient(125deg, #2dd4bf 0%, #22d3ee 50%, #818cf8 100%)',
      streakA: '#2dd4bf',
      streakB: '#818cf8',
      chips: [
        { icon: 'sparkles', label: 'Hasta QHD · USB-C' },
        { icon: 'shield', label: 'Cuidado visual' },
      ],
    },
    {
      eyebrow: 'Tecnología Circular',
      titleTop: 'Reacondicionados',
      titleMain: 'hasta -60%',
      subtitle: 'Equipos corporativos revisados, optimizados y garantizados. Reutilizamos hoy, protegemos mañana.',
      icon: 'recycle',
      image: '/img/hero/workspace.jpg',
      ctaLabel: 'Ver oportunidades',
      ctaLink: '/categoria/reacondicionados',
      aurora: 'linear-gradient(125deg, #84cc16 0%, #10b981 52%, #06b6d4 100%)',
      streakA: '#84cc16',
      streakB: '#10b981',
      chips: [
        { icon: 'leaf', label: 'Impacto positivo' },
        { icon: 'shield-check', label: 'Calidad garantizada' },
      ],
    },
  ];

  /** Active slides — a seasonal campaign slide is prepended when on. */
  protected readonly slides = computed<HeroSlide[]>(() => {
    const c = this.campaignService.campaign();
    return c ? [this.campaignSlide(c), ...this.baseSlides] : this.baseSlides;
  });

  constructor() {
    // Keep the index valid when the slide set changes (campaign on/off).
    effect(() => {
      if (this.index() >= this.slides().length) this.index.set(0);
    });
  }

  private campaignSlide(c: CampaignDef): HeroSlide {
    const a = c.accent;
    return {
      eyebrow: c.hero.eyebrow,
      titleTop: c.hero.titleTop,
      titleMain: c.hero.titleMain,
      subtitle: c.hero.subtitle,
      icon: c.icon,
      image: c.hero.image,
      ctaLabel: c.hero.ctaLabel,
      ctaLink: c.hero.ctaLink,
      aurora: `linear-gradient(125deg, ${a.primary} 0%, ${a.secondary} 55%, ${a.tertiary} 100%)`,
      streakA: a.primary,
      streakB: a.secondary,
      chips: c.hero.chips,
      titleClass: 'text-gradient-co',
    };
  }

  ngOnInit(): void {
    if (this.isBrowser) this.start();
  }

  ngOnDestroy(): void {
    this.stop();
  }

  protected go(i: number): void {
    const len = this.slides().length;
    this.index.set(((i % len) + len) % len);
    this.restart();
  }

  protected next(): void {
    this.go(this.index() + 1);
  }

  protected prev(): void {
    this.go(this.index() - 1);
  }

  protected pause(): void {
    this.paused.set(true);
  }

  protected resume(): void {
    this.paused.set(false);
  }

  private start(): void {
    this.timer = setInterval(() => {
      if (!this.paused()) this.index.update((i) => (i + 1) % this.slides().length);
    }, this.intervalMs);
  }

  private stop(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private restart(): void {
    if (!this.isBrowser) return;
    this.stop();
    this.start();
  }
}

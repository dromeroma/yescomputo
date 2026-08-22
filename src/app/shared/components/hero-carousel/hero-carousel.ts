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
import { FeaturesService, HeroSlideDTO } from '../../../core/services/features.service';

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
  /** Optional query params for the CTA (e.g. the "all refurbished" filter). */
  ctaQuery?: Record<string, string>;
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
  private readonly featuresService = inject(FeaturesService);
  private timer?: ReturnType<typeof setInterval>;
  private readonly intervalMs = 6000;

  /** Vibrant color sets cycled across admin-configured slides so they keep the
   * same aurora/streak look without the admin having to pick colors. */
  private readonly PALETTE = [
    { aurora: 'linear-gradient(125deg, #22d3ee 0%, #a3e635 48%, #fde047 100%)', streakA: '#a3e635', streakB: '#22d3ee' },
    { aurora: 'linear-gradient(125deg, #818cf8 0%, #22d3ee 50%, #34d399 100%)', streakA: '#818cf8', streakB: '#22d3ee' },
    { aurora: 'linear-gradient(125deg, #a3e635 0%, #22d3ee 55%, #38bdf8 100%)', streakA: '#a3e635', streakB: '#38bdf8' },
    { aurora: 'linear-gradient(125deg, #2dd4bf 0%, #22d3ee 50%, #818cf8 100%)', streakA: '#2dd4bf', streakB: '#818cf8' },
    { aurora: 'linear-gradient(125deg, #84cc16 0%, #10b981 52%, #06b6d4 100%)', streakA: '#84cc16', streakB: '#10b981' },
  ];

  protected readonly index = signal(0);
  protected readonly paused = signal(false);

  private readonly baseSlides: HeroSlide[] = [
    {
      eyebrow: 'Equipos nuevos',
      titleTop: 'Portátiles que',
      titleMain: 'rinden por años',
      subtitle: 'Equipos nuevos con potencia empresarial, garantía y soporte propio.',
      icon: 'laptop',
      image: '/img/hero/laptop.jpg',
      ctaLabel: '¡Comprar ahora!',
      ctaLink: '/categoria/equipos-nuevos',
      aurora: 'linear-gradient(125deg, #22d3ee 0%, #a3e635 48%, #fde047 100%)',
      streakA: '#a3e635',
      streakB: '#22d3ee',
      chips: [
        { icon: 'cpu', label: 'Intel Core i5 / i7' },
        { icon: 'shield-check', label: 'Garantía incluida' },
      ],
    },
    {
      eyebrow: 'Listos para trabajar',
      titleTop: 'Equipos de',
      titleMain: 'escritorio completos',
      subtitle: 'Torre, monitor, teclado y mouse. Equipos completos para producir desde el primer día.',
      icon: 'desktop',
      image: '/img/hero/workspace.jpg',
      ctaLabel: 'Ver equipos',
      ctaLink: '/categoria/computadores-escritorio',
      aurora: 'linear-gradient(125deg, #818cf8 0%, #22d3ee 50%, #34d399 100%)',
      streakA: '#818cf8',
      streakB: '#22d3ee',
      chips: [
        { icon: 'cpu', label: 'Intel Core i3 / i5 / i7' },
        { icon: 'monitor', label: 'Monitor incluido' },
      ],
    },
    {
      eyebrow: 'Sonido y accesorios',
      titleTop: 'Audio que',
      titleMain: 'suena increíble',
      subtitle: 'Parlantes y audífonos para tu día a día. Conéctate, trabaja y disfruta con mejor sonido.',
      icon: 'headphones',
      image: '/img/hero/audio.jpg',
      ctaLabel: 'Ver audio',
      ctaLink: '/categoria/audio-diademas',
      aurora: 'linear-gradient(125deg, #a3e635 0%, #22d3ee 55%, #38bdf8 100%)',
      streakA: '#a3e635',
      streakB: '#38bdf8',
      chips: [
        { icon: 'zap', label: 'Conexión USB / 3.5mm' },
        { icon: 'check-circle', label: 'Listo para usar' },
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
      image: '/img/products/equipo-01.webp',
      ctaLabel: 'Ver oportunidades',
      // ALL refurbished (any category), not just the "Portátiles Reacondicionados" one.
      ctaLink: '/catalogo',
      ctaQuery: { condition: 'reacondicionado' },
      aurora: 'linear-gradient(125deg, #84cc16 0%, #10b981 52%, #06b6d4 100%)',
      streakA: '#84cc16',
      streakB: '#10b981',
      chips: [
        { icon: 'leaf', label: 'Impacto positivo' },
        { icon: 'shield-check', label: 'Calidad garantizada' },
      ],
    },
  ];

  /** Admin-configured slides (from the panel) if any, else the built-in ones.
   * A seasonal campaign slide is prepended when active. */
  protected readonly slides = computed<HeroSlide[]>(() => {
    const configured = this.featuresService.hero();
    const base = configured.length
      ? configured.map((s, i) => this.fromConfig(s, i))
      : this.baseSlides;
    const c = this.campaignService.campaign();
    return c ? [this.campaignSlide(c), ...base] : base;
  });

  /** Map an admin slide to the full internal slide (auto colors, link parsing). */
  private fromConfig(dto: HeroSlideDTO, i: number): HeroSlide {
    const p = this.PALETTE[i % this.PALETTE.length];
    let ctaLink = (dto.ctaLink || '/catalogo').trim();
    let ctaQuery: Record<string, string> | undefined;
    const q = ctaLink.indexOf('?');
    if (q >= 0) {
      const qs = ctaLink.slice(q + 1);
      ctaLink = ctaLink.slice(0, q) || '/catalogo';
      ctaQuery = {};
      for (const pair of qs.split('&')) {
        const [k, v] = pair.split('=');
        if (k) ctaQuery[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
      }
    }
    return {
      eyebrow: dto.eyebrow || '',
      titleTop: dto.titleTop || '',
      titleMain: dto.titleMain || '',
      subtitle: dto.subtitle || '',
      icon: 'sparkles',
      image: dto.image || '/img/hero/laptop.jpg',
      ctaLabel: dto.ctaLabel || 'Ver catálogo',
      ctaLink,
      ctaQuery,
      aurora: p.aurora,
      streakA: p.streakA,
      streakB: p.streakB,
      chips: [],
    };
  }

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

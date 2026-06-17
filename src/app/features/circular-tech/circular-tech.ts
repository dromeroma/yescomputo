import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_CONFIG } from '../../core/config/app-config';
import { SeoService } from '../../core/services/seo.service';
import { WhatsappService } from '../../core/services/whatsapp.service';

import { Badge } from '../../shared/components/badge/badge';
import { Button } from '../../shared/components/button/button';
import { Icon } from '../../shared/components/icon/icon';
import { SectionHeading } from '../../shared/components/section-heading/section-heading';

@Component({
  selector: 'yc-circular-tech',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Badge, Button, Icon, SectionHeading],
  template: `
    <!-- 1 · HERO (dark / green) -->
    <section class="relative overflow-hidden bg-ink-950 text-white">
      <div class="bg-grid absolute inset-0 opacity-40"></div>
      <div class="absolute -right-24 top-0 h-96 w-96 rounded-full bg-brand-500/25 blur-[130px]"></div>
      <div class="absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-accent-500/20 blur-[130px]"></div>
      <div class="container-page relative section">
        <div class="mx-auto max-w-3xl text-center">
          <span class="eyebrow mb-4 justify-center">
            <span class="h-1 w-1 rounded-full bg-brand-400"></span>Tecnología Circular
          </span>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl">
            Innovación que <span class="text-gradient-brand">cuida nuestro planeta</span>
          </h1>
          <p class="mx-auto mt-6 max-w-2xl text-xl font-medium text-white/80">
            Reutilizamos hoy, protegemos mañana.
          </p>
          <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/60">
            En {{ config.company.name }} alargamos la vida útil de los equipos corporativos para reducir
            residuos, conservar recursos y ofrecer tecnología de calidad a un precio responsable.
          </p>
          <div class="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a ycButton variant="primary" size="lg" routerLink="/categoria/reacondicionados">
              Ver reacondicionados <yc-icon name="arrow-right" [size]="18" />
            </a>
            <a ycButton variant="whatsapp" size="lg" [href]="whatsappLink" target="_blank" rel="noopener">
              <yc-icon name="whatsapp" [size]="20" /> Habla con un asesor
            </a>
          </div>
          <div class="mt-10 flex flex-wrap items-center justify-center gap-2">
            <yc-badge tone="brand">Reparar</yc-badge>
            <yc-badge tone="accent">Renovar</yc-badge>
            <yc-badge tone="success">Reutilizar</yc-badge>
            <yc-badge tone="neutral">Reciclar</yc-badge>
          </div>
        </div>
      </div>
    </section>

    <!-- 2 · ¿QUÉ ES? -->
    <section class="section">
      <div class="container-page">
        <div class="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <span class="eyebrow mb-3">
              <span class="h-1 w-1 rounded-full bg-accent-500"></span>El concepto
            </span>
            <h2 class="text-3xl sm:text-4xl">¿Qué es la tecnología circular?</h2>
            <p class="mt-5 text-base leading-relaxed text-content-muted">
              Es un modelo que rompe con la lógica de «usar y desechar». En lugar de descartar un equipo cuando
              parece obsoleto, lo <span class="font-semibold text-content">reparamos, renovamos y reutilizamos</span>
              para mantenerlo en óptimas condiciones durante mucho más tiempo. Cuando ya no es viable, recuperamos
              sus materiales mediante un reciclaje responsable.
            </p>
            <p class="mt-4 text-base leading-relaxed text-content-muted">
              Así, cada portátil Lenovo ThinkPad, cada Dell Latitude o cada HP EliteBook reacondicionado vive una
              segunda —o tercera— vida útil con la misma confiabilidad corporativa, generando menos residuos y un
              menor impacto ambiental.
            </p>
            <a ycButton variant="dark" size="md" routerLink="/catalogo" class="mt-7">
              Explorar el catálogo <yc-icon name="chevron-right" [size]="18" />
            </a>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            @for (h of highlights; track h.title) {
              <div class="rounded-2xl border border-line bg-surface-raised p-6 shadow-card">
                <span class="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <yc-icon [name]="h.icon" [size]="22" />
                </span>
                <h3 class="mt-4 text-base font-semibold text-content">{{ h.title }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-content-muted">{{ h.text }}</p>
              </div>
            }
          </div>
        </div>
      </div>
    </section>

    <!-- 3 · EL CICLO DE 4 PASOS -->
    <section class="section bg-surface-subtle">
      <div class="container-page">
        <yc-section-heading
          eyebrow="El ciclo"
          title="Las 4 etapas de la tecnología circular"
          description="Un proceso continuo diseñado para extraer el máximo valor de cada equipo."
          [centered]="true"
        />
        <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          @for (step of cycle; track step.title) {
            <div class="group relative overflow-hidden rounded-3xl bg-surface-raised p-7 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover">
              <span class="absolute right-5 top-4 text-5xl font-bold text-ink-100">{{ step.step }}</span>
              <span class="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 transition group-hover:bg-brand-500 group-hover:text-white">
                <yc-icon [name]="step.icon" [size]="26" />
              </span>
              <h3 class="relative mt-6 text-xl">{{ step.title }}</h3>
              <p class="relative mt-3 text-sm leading-relaxed text-content-muted">{{ step.text }}</p>
            </div>
          }
        </div>
        <p class="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-content-muted">
          <yc-icon name="refresh" [size]="18" class="text-brand-500" />
          Un ciclo que se repite para alargar al máximo la vida útil de la tecnología.
        </p>
      </div>
    </section>

    <!-- 4 · IMPACTO POSITIVO -->
    <section class="section">
      <div class="container-page">
        <yc-section-heading
          eyebrow="Sostenibilidad"
          title="Impacto positivo en el planeta"
          description="Elegir tecnología circular es elegir un futuro más responsable."
          [centered]="true"
        />
        <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          @for (i of impact; track i.title) {
            <div class="rounded-3xl border border-line bg-surface-raised p-7 text-center shadow-card transition hover:shadow-card-hover">
              <span class="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent-50 text-accent-600">
                <yc-icon [name]="i.icon" [size]="26" />
              </span>
              <h3 class="mt-5 text-lg">{{ i.title }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-content-muted">{{ i.text }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- 5 · IDEAL PARA -->
    <section class="section bg-surface-subtle">
      <div class="container-page">
        <yc-section-heading
          eyebrow="¿Para quién?"
          title="Ideal para cada tipo de organización"
          description="Arrendar o comprar reacondicionados es la decisión inteligente para muchos perfiles."
          [centered]="true"
        />
        <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          @for (seg of segments; track seg.title) {
            <div class="flex items-start gap-4 rounded-2xl bg-surface-raised p-6 shadow-card transition hover:shadow-card-hover">
              <span class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <yc-icon [name]="seg.icon" [size]="24" />
              </span>
              <div>
                <h3 class="text-base font-semibold text-content">{{ seg.title }}</h3>
                <p class="mt-1 text-sm leading-relaxed text-content-muted">{{ seg.text }}</p>
              </div>
            </div>
          }
        </div>

        <div class="mt-10 grid gap-6 lg:grid-cols-2">
          <div class="rounded-3xl border border-brand-200 bg-brand-50/60 p-8">
            <span class="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-white">
              <yc-icon name="refresh" [size]="22" />
            </span>
            <h3 class="mt-5 text-xl">Arrendar</h3>
            <p class="mt-2 text-sm text-ink-600">Cuando buscas flexibilidad y cuidar el flujo de caja.</p>
            <ul class="mt-5 space-y-2">
              @for (a of rentPros; track a) {
                <li class="flex items-center gap-2 text-sm text-ink-700">
                  <yc-icon name="check-circle" [size]="16" class="text-brand-600" />{{ a }}
                </li>
              }
            </ul>
          </div>
          <div class="rounded-3xl border border-line bg-surface-raised p-8 shadow-card">
            <span class="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500 text-white">
              <yc-icon name="shield-check" [size]="22" />
            </span>
            <h3 class="mt-5 text-xl">Comprar reacondicionado</h3>
            <p class="mt-2 text-sm text-content-muted">Cuando quieres un activo propio a un costo responsable.</p>
            <ul class="mt-5 space-y-2">
              @for (b of buyPros; track b) {
                <li class="flex items-center gap-2 text-sm text-content-muted">
                  <yc-icon name="check-circle" [size]="16" class="text-accent-600" />{{ b }}
                </li>
              }
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- 6 · COMPROMISO YES COMPUTO -->
    <section class="section">
      <div class="container-page">
        <yc-section-heading
          eyebrow="Nuestro compromiso"
          title="Tecnología con propósito"
          description="Cuatro promesas que respaldan cada equipo que sale de Yes Computo."
          [centered]="true"
        />
        <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          @for (c of commitments; track c.title) {
            <div class="group rounded-3xl bg-surface-raised p-7 shadow-card transition hover:shadow-card-hover">
              <span class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600 transition group-hover:bg-accent-500 group-hover:text-white">
                <yc-icon [name]="c.icon" [size]="24" />
              </span>
              <h3 class="mt-5 text-lg">{{ c.title }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-content-muted">{{ c.text }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- 7 · CTA FINAL DARK -->
    <section class="relative overflow-hidden bg-ink-950 text-white">
      <div class="absolute -left-20 top-0 h-80 w-80 rounded-full bg-brand-500/25 blur-[120px]"></div>
      <div class="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-accent-500/20 blur-[120px]"></div>
      <div class="container-page relative section">
        <div class="mx-auto max-w-3xl text-center">
          <span class="eyebrow mb-4 justify-center">
            <span class="h-1 w-1 rounded-full bg-brand-400"></span>Tecnología con propósito
          </span>
          <h2 class="text-3xl sm:text-4xl">Súmate a la Tecnología Circular</h2>
          <p class="mx-auto mt-5 max-w-2xl text-lg text-white/70">
            Descubre nuestros equipos reacondicionados certificados o pregúntanos por planes de alquiler.
            Tecnología de calidad, precio responsable y un planeta más sano.
          </p>
          <div class="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a ycButton variant="primary" size="lg" routerLink="/categoria/reacondicionados">
              Ver reacondicionados <yc-icon name="arrow-right" [size]="18" />
            </a>
            <a ycButton variant="whatsapp" size="lg" [href]="whatsappLink" target="_blank" rel="noopener">
              <yc-icon name="whatsapp" [size]="20" /> Escríbenos por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class CircularTech implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly whatsapp = inject(WhatsappService);
  protected readonly config = inject(APP_CONFIG);

  protected readonly whatsappLink = this.whatsapp.link(
    '¡Hola Yes Computo! 👋 Me interesa la Tecnología Circular. ¿Me asesoran con equipos reacondicionados o alquiler?',
  );

  protected readonly highlights = [
    {
      icon: 'recycle',
      title: 'Segunda vida útil',
      text: 'Equipos corporativos restaurados al máximo rendimiento.',
    },
    {
      icon: 'leaf',
      title: 'Menos residuos',
      text: 'Reducimos la basura electrónica que llega a los vertederos.',
    },
    {
      icon: 'shield-check',
      title: 'Calidad garantizada',
      text: 'Pruebas, limpieza y garantía en cada equipo entregado.',
    },
    {
      icon: 'zap',
      title: 'Precio responsable',
      text: 'Tecnología de marca a un costo accesible para tu empresa.',
    },
  ];

  protected readonly cycle = [
    {
      step: '01',
      icon: 'wrench',
      title: 'Reparar',
      text: 'Diagnosticamos y reparamos cada equipo para devolverle plena funcionalidad.',
    },
    {
      step: '02',
      icon: 'refresh',
      title: 'Renovar',
      text: 'Actualizamos componentes —RAM, almacenamiento, batería— para mejorar el rendimiento.',
    },
    {
      step: '03',
      icon: 'recycle',
      title: 'Reutilizar',
      text: 'Ponemos en circulación equipos reacondicionados, listos para una nueva vida útil.',
    },
    {
      step: '04',
      icon: 'leaf',
      title: 'Reciclar',
      text: 'Recuperamos materiales de forma responsable cuando ya no es viable reutilizar.',
    },
  ];

  protected readonly impact = [
    {
      icon: 'recycle',
      title: 'Reduce los residuos',
      text: 'Menos basura electrónica gracias a equipos que viven mucho más tiempo.',
    },
    {
      icon: 'leaf',
      title: 'Conserva recursos',
      text: 'Aprovechamos materiales existentes y evitamos la fabricación de nuevos.',
    },
    {
      icon: 'cpu',
      title: 'Menos contaminación',
      text: 'Disminuimos las emisiones de CO₂ asociadas a producir equipos desde cero.',
    },
    {
      icon: 'users',
      title: 'Genera valor social',
      text: 'Acercamos tecnología de calidad a más empresas y personas a un precio justo.',
    },
  ];

  protected readonly segments = [
    {
      icon: 'building',
      title: 'Oficinas',
      text: 'Equipa puestos de trabajo confiables sin disparar la inversión inicial.',
    },
    {
      icon: 'users',
      title: 'Pymes',
      text: 'Crece con flexibilidad: compra o alquila según el momento de tu negocio.',
    },
    {
      icon: 'graduation',
      title: 'Instituciones educativas',
      text: 'Dota aulas y salas de cómputo con un presupuesto responsable.',
    },
    {
      icon: 'shield',
      title: 'Entidades públicas',
      text: 'Soluciones costo-eficientes y sostenibles para el sector público.',
    },
    {
      icon: 'headphones',
      title: 'Call centers',
      text: 'Despliega muchos puestos rápidamente con equipos homogéneos y soporte.',
    },
    {
      icon: 'rocket',
      title: 'Startups',
      text: 'Arranca ligero: alquila o adquiere reacondicionados y escala sin fricción.',
    },
  ];

  protected readonly rentPros = [
    'Sin gran inversión inicial',
    'Renovación y soporte incluidos',
    'Escala según tu crecimiento',
    'Flujo de caja saludable',
  ];

  protected readonly buyPros = [
    'Activo propio para tu empresa',
    'Costo menor que un equipo nuevo',
    'Garantía y respaldo técnico',
    'Decisión sostenible y responsable',
  ];

  protected readonly commitments = [
    {
      icon: 'shield-check',
      title: 'Calidad certificada',
      text: 'Cada equipo se prueba, limpia y certifica antes de entregarse.',
    },
    {
      icon: 'wrench',
      title: 'Soporte continuo',
      text: 'Servicio técnico especializado durante toda la vida útil del equipo.',
    },
    {
      icon: 'leaf',
      title: 'Reciclaje responsable',
      text: 'Disposición final de componentes con criterios ambientales.',
    },
    {
      icon: 'check-circle',
      title: 'Transparencia total',
      text: 'Informamos el estado y grado de cada equipo reacondicionado.',
    },
  ];

  ngOnInit(): void {
    this.seo.update({
      title: 'Tecnología Circular',
      description:
        'Conoce la Tecnología Circular de Yes Computo: reparamos, renovamos, reutilizamos y reciclamos equipos corporativos para reducir residuos, conservar recursos y ofrecer tecnología de calidad a un precio responsable.',
      path: '/tecnologia-circular',
    });
  }
}

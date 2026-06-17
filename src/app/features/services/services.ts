import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_CONFIG } from '../../core/config/app-config';
import { SeoService } from '../../core/services/seo.service';
import { WhatsappService } from '../../core/services/whatsapp.service';

import { Badge } from '../../shared/components/badge/badge';
import { Button } from '../../shared/components/button/button';
import { Icon } from '../../shared/components/icon/icon';
import { SectionHeading } from '../../shared/components/section-heading/section-heading';

interface ServiceCard {
  icon: string;
  title: string;
  text: string;
  anchor: string;
}

@Component({
  selector: 'yc-services',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Badge, Button, Icon, SectionHeading],
  template: `
    <!-- (1) HERO -->
    <section class="relative overflow-hidden bg-ink-950 text-white">
      <div class="bg-grid absolute inset-0 opacity-40"></div>
      <div class="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl"></div>
      <div class="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-accent-500/20 blur-3xl"></div>
      <div class="container-page relative section">
        <div class="mx-auto max-w-3xl text-center">
          <span class="eyebrow mb-5 justify-center">
            <span class="h-1 w-1 rounded-full bg-brand-400"></span>Servicios
          </span>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl">
            Soluciones tecnológicas para <span class="text-gradient-brand">tu empresa</span>
          </h1>
          <p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-200">
            Más de {{ config.company.yearsInBusiness }} años en Cartagena ayudando a empresas a operar
            mejor: alquiler de equipos, servicio técnico especializado, redes, videovigilancia y más.
            Tecnología circular, soporte real y respuesta rápida.
          </p>
          <div class="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a ycButton variant="whatsapp" size="lg" [href]="heroWa" target="_blank" rel="noopener">
              <yc-icon name="whatsapp" [size]="20" />
              Hablar con un asesor
            </a>
            <a ycButton variant="outline" size="lg" routerLink="/contacto" class="!border-white/25 !bg-white/5 !text-white hover:!bg-white/10">
              Contáctanos
              <yc-icon name="arrow-right" [size]="18" />
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- (2) SERVICES OVERVIEW -->
    <section class="section bg-surface">
      <div class="container-page">
        <yc-section-heading
          eyebrow="Qué hacemos"
          title="Un ecosistema completo de servicios"
          description="Cubrimos cada necesidad tecnológica de tu operación con un solo aliado de confianza."
          [centered]="true"
        />
        <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          @for (s of services; track s.title) {
            <div class="shine group relative overflow-hidden rounded-2xl border border-line bg-surface-raised p-6 shadow-card transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-line-strong hover:shadow-card-hover">
              <div class="grid h-12 w-12 place-items-center rounded-xl bg-brand-100 text-brand-700">
                <yc-icon [name]="s.icon" [size]="24" />
              </div>
              <h3 class="mt-5 text-xl">{{ s.title }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-content-muted">{{ s.text }}</p>
              @if (s.anchor) {
                <a
                  [routerLink]="['/servicios']"
                  [fragment]="s.anchor"
                  class="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-700 transition-colors hover:text-accent-800"
                >
                  Más información
                  <yc-icon name="chevron-right" [size]="16" class="transition-transform group-hover:translate-x-0.5" />
                </a>
              } @else {
                <a
                  [href]="heroWa"
                  target="_blank"
                  rel="noopener"
                  class="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-700 transition-colors hover:text-accent-800"
                >
                  Más información
                  <yc-icon name="chevron-right" [size]="16" class="transition-transform group-hover:translate-x-0.5" />
                </a>
              }
            </div>
          }
        </div>
      </div>
    </section>

    <!-- (3) ALQUILER -->
    <section id="alquiler" class="section scroll-mt-24 bg-surface-subtle">
      <div class="container-page">
        <div class="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <yc-badge tone="brand">Alquiler de equipos</yc-badge>
            <h2 class="mt-4 text-3xl sm:text-4xl">Arrendar es avanzar</h2>
            <p class="mt-4 text-base leading-relaxed text-content-muted">
              Accede a tecnología de última generación sin inmovilizar tu capital. Alquilamos portátiles,
              equipos de escritorio, workstations e infraestructura
              <span class="font-semibold text-content">por días, semanas o meses</span>, con soporte y
              mantenimiento incluidos durante todo el contrato.
            </p>
            <ul class="mt-7 grid gap-3 sm:grid-cols-2">
              @for (b of rentalBenefits; track b) {
                <li class="flex items-start gap-2.5 text-sm text-content-muted">
                  <yc-icon name="check-circle" [size]="20" class="mt-0.5 shrink-0 text-brand-600" />
                  <span>{{ b }}</span>
                </li>
              }
            </ul>
            <div class="mt-8">
              <a ycButton variant="whatsapp" size="lg" [href]="rentalWa" target="_blank" rel="noopener">
                <yc-icon name="whatsapp" [size]="20" />
                Cotizar alquiler
              </a>
            </div>
            <p class="mt-6 text-sm text-content-muted">
              <span class="font-semibold text-content-muted">Ideal para:</span>
              empresas en crecimiento, startups, pymes y proyectos temporales.
            </p>
          </div>

          <!-- Arrendar vs Comprar -->
          <div class="shine group relative overflow-hidden rounded-3xl border border-line bg-surface-raised p-7 shadow-card transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-line-strong hover:shadow-card-hover">
            <h3 class="text-xl">Arrendar vs. Comprar</h3>
            <p class="mt-1 text-sm text-content-muted">Por qué el alquiler es la decisión más inteligente.</p>
            <div class="mt-6 grid grid-cols-2 gap-4">
              <div class="rounded-2xl border border-brand-200 bg-brand-50 p-5">
                <span class="eyebrow text-brand-700">Arrendar</span>
                <ul class="mt-3 space-y-2.5">
                  @for (r of rentVs.rent; track r) {
                    <li class="flex items-start gap-2 text-sm text-ink-700">
                      <yc-icon name="check" [size]="16" class="mt-0.5 shrink-0 text-brand-600" />
                      <span>{{ r }}</span>
                    </li>
                  }
                </ul>
              </div>
              <div class="shine group relative overflow-hidden rounded-2xl border border-line bg-surface-inset p-5 transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-line-strong hover:shadow-card-hover">
                <span class="eyebrow text-content-muted">Comprar</span>
                <ul class="mt-3 space-y-2.5">
                  @for (c of rentVs.buy; track c) {
                    <li class="flex items-start gap-2 text-sm text-content-muted">
                      <yc-icon name="minus" [size]="16" class="mt-0.5 shrink-0 text-content-subtle" />
                      <span>{{ c }}</span>
                    </li>
                  }
                </ul>
              </div>
            </div>
            <div class="mt-6 rounded-2xl bg-ink-950 p-5 text-white">
              <p class="text-sm leading-relaxed text-ink-200">
                Con el alquiler conviertes una gran inversión en un
                <span class="font-semibold text-brand-400">gasto operativo predecible</span> y siempre
                trabajas con equipos al día.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- (4) SERVICIO TÉCNICO -->
    <section id="tecnico" class="section scroll-mt-24 bg-surface">
      <div class="container-page">
        <div class="mx-auto max-w-3xl text-center">
          <yc-badge tone="accent">Servicio técnico</yc-badge>
          <h2 class="mt-4 text-3xl sm:text-4xl">Servicio Técnico Especializado</h2>
          <p class="mt-4 text-lg font-medium text-content-muted">Tu tecnología en las mejores manos</p>
          <p class="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-content-muted">
            Con más de {{ config.company.yearsInBusiness }} años de experiencia, nuestro equipo
            diagnostica, repara y optimiza tus equipos con la seriedad y rapidez que tu operación necesita.
          </p>
        </div>

        <div class="mt-12 grid gap-6 sm:grid-cols-3">
          @for (p of pillars; track p.title) {
            <div class="shine group relative overflow-hidden rounded-2xl border border-line bg-surface-raised p-7 text-center shadow-card transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-line-strong hover:shadow-card-hover">
              <div class="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent-100 text-accent-700">
                <yc-icon [name]="p.icon" [size]="26" />
              </div>
              <h3 class="mt-5 text-lg">{{ p.title }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-content-muted">{{ p.text }}</p>
            </div>
          }
        </div>

        <div class="shine group relative mt-12 grid items-center gap-10 overflow-hidden rounded-3xl border border-line bg-surface-inset p-8 transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-line-strong hover:shadow-card-hover lg:grid-cols-2 lg:p-10">
          <div>
            <h3 class="text-2xl">Lo que hacemos por ti</h3>
            <p class="mt-2 text-sm text-content-muted">
              Soluciones integrales para empresas y particulares, con repuestos garantizados.
            </p>
          </div>
          <ul class="grid gap-3">
            @for (t of techServices; track t) {
              <li class="shine group relative flex items-start gap-3 overflow-hidden rounded-xl border border-line bg-surface-raised p-3.5 text-sm text-content-muted shadow-card transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-line-strong hover:shadow-card-hover">
                <yc-icon name="check-circle" [size]="20" class="mt-0.5 shrink-0 text-accent-600" />
                <span>{{ t }}</span>
              </li>
            }
          </ul>
        </div>

        <div class="mt-10 text-center">
          <a ycButton variant="secondary" size="lg" [href]="techWa" target="_blank" rel="noopener">
            <yc-icon name="wrench" [size]="20" />
            Agendar servicio
          </a>
        </div>
      </div>
    </section>

    <!-- (5) PROCESO -->
    <section class="section bg-surface-subtle">
      <div class="container-page">
        <yc-section-heading
          eyebrow="Nuestro método"
          title="¿Cómo trabajamos?"
          description="Un proceso claro y transparente, de principio a fin."
          [centered]="true"
        />
        <ol class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          @for (step of process; track step.title; let i = $index) {
            <li class="shine group relative overflow-hidden rounded-2xl border border-line bg-surface-raised p-6 shadow-card transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-line-strong hover:shadow-card-hover">
              <span class="grid h-11 w-11 place-items-center rounded-xl bg-ink-950 text-base font-bold text-brand-400">
                {{ i + 1 }}
              </span>
              <h3 class="mt-5 text-lg">{{ step.title }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-content-muted">{{ step.text }}</p>
              @if (i < process.length - 1) {
                <yc-icon
                  name="chevron-right"
                  [size]="22"
                  class="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-ink-300 lg:block"
                />
              }
            </li>
          }
        </ol>
      </div>
    </section>

    <!-- (6) FINAL CTA -->
    <section class="section bg-surface">
      <div class="container-page">
        <div class="relative overflow-hidden rounded-3xl bg-ink-950 px-8 py-14 text-center text-white shadow-ink sm:px-12">
          <div class="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl"></div>
          <div class="absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl"></div>
          <div class="relative mx-auto max-w-2xl">
            <h2 class="text-3xl sm:text-4xl">¿Listo para llevar tu tecnología al siguiente nivel?</h2>
            <p class="mt-4 text-lg leading-relaxed text-ink-200">
              Cuéntanos qué necesitas y un asesor de {{ config.company.name }} te responde en minutos.
            </p>
            <div class="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a ycButton variant="whatsapp" size="lg" [href]="heroWa" target="_blank" rel="noopener">
                <yc-icon name="whatsapp" [size]="20" />
                Escríbenos por WhatsApp
              </a>
              <a ycButton variant="primary" size="lg" routerLink="/contacto">
                Ir a contacto
                <yc-icon name="arrow-right" [size]="18" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class Services implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly whatsapp = inject(WhatsappService);
  protected readonly config = inject(APP_CONFIG);

  protected readonly heroWa = this.whatsapp.link(
    '¡Hola Yes Computo! 👋 Quiero conocer sus servicios tecnológicos para mi empresa.',
  );
  protected readonly rentalWa = this.whatsapp.link(
    '¡Hola Yes Computo! 👋 Quiero cotizar el *alquiler de equipos* para mi empresa.',
  );
  protected readonly techWa = this.whatsapp.link(
    '¡Hola Yes Computo! 👋 Necesito *agendar servicio técnico* para mis equipos.',
  );

  protected readonly services: ServiceCard[] = [
    { icon: 'refresh', title: 'Alquiler de equipos', text: 'Portátiles, escritorio y workstations por días, semanas o meses, con soporte incluido.', anchor: 'alquiler' },
    { icon: 'wrench', title: 'Servicio técnico especializado', text: 'Mantenimiento, reparación y optimización con más de 20 años de experiencia.', anchor: 'tecnico' },
    { icon: 'network', title: 'Redes y conectividad', text: 'Diseño, cableado estructurado y configuración de redes estables y seguras.', anchor: '' },
    { icon: 'camera', title: 'Videovigilancia y control de accesos', text: 'CCTV, cámaras IP y control de accesos para proteger tu empresa 24/7.', anchor: '' },
    { icon: 'cpu', title: 'Software original', text: 'Licenciamiento legal de sistemas operativos y suites para tu operación.', anchor: '' },
    { icon: 'shield-check', title: 'Respaldo y recuperación de datos', text: 'Backups automáticos y recuperación de información ante cualquier incidente.', anchor: '' },
  ];

  protected readonly rentalBenefits = [
    'Menor inversión inicial',
    'Renovación constante',
    'Soporte y mantenimiento incluidos',
    'Gastos predecibles',
    'Mayor productividad',
    'Flexibilidad total',
  ];

  protected readonly rentVs = {
    rent: ['Baja inversión inicial', 'Equipos siempre actualizados', 'Soporte incluido', 'Costo mensual fijo'],
    buy: ['Alto desembolso inicial', 'Obsolescencia acelerada', 'Mantenimiento aparte', 'Depreciación del activo'],
  };

  protected readonly pillars = [
    { icon: 'shield-check', title: 'Seriedad', text: 'Procesos transparentes, repuestos garantizados y respaldo en cada intervención.' },
    { icon: 'clock', title: 'Rapidez', text: 'Diagnóstico ágil y tiempos de respuesta que mantienen tu operación en marcha.' },
    { icon: 'sparkles', title: 'Experiencia', text: 'Más de 20 años resolviendo todo tipo de fallas en equipos de cómputo.' },
  ];

  protected readonly techServices = [
    'Mantenimiento preventivo y correctivo',
    'Reparación de portátiles y de escritorio',
    'Actualización y optimización de equipos',
    'Instalación de software y respaldo de datos',
    'Soluciones para empresas y particulares',
  ];

  protected readonly process = [
    { title: 'Diagnóstico', text: 'Evaluamos tus equipos y necesidades sin compromiso.' },
    { title: 'Propuesta', text: 'Te entregamos una solución clara con tiempos y costos.' },
    { title: 'Ejecución', text: 'Implementamos con repuestos garantizados y estándares altos.' },
    { title: 'Soporte', text: 'Acompañamiento continuo para que todo siga funcionando.' },
  ];

  protected readonly stepCount = computed(() => this.process.length);

  ngOnInit(): void {
    this.seo.update({
      title: 'Servicios',
      description:
        'Alquiler de equipos, servicio técnico especializado, redes, videovigilancia y software ' +
        'original para empresas en Cartagena. Tecnología circular con más de 20 años de experiencia.',
      path: '/servicios',
    });
  }
}

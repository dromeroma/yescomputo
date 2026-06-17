import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_CONFIG } from '../../core/config/app-config';
import { SeoService } from '../../core/services/seo.service';
import { WhatsappService } from '../../core/services/whatsapp.service';

import { Badge } from '../../shared/components/badge/badge';
import { Button } from '../../shared/components/button/button';
import { Icon } from '../../shared/components/icon/icon';
import { Logo } from '../../shared/components/logo/logo';
import { SectionHeading } from '../../shared/components/section-heading/section-heading';

@Component({
  selector: 'yc-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Badge, Button, Icon, Logo, SectionHeading],
  template: `
    <!-- 1 · HERO -->
    <section class="relative overflow-hidden bg-ink-950 text-white">
      <div class="bg-grid absolute inset-0 opacity-40"></div>
      <div class="absolute -right-20 top-0 h-80 w-80 rounded-full bg-brand-500/20 blur-[120px]"></div>
      <div class="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-accent-500/20 blur-[120px]"></div>
      <div class="container-page relative section">
        <div class="mx-auto max-w-3xl text-center">
          <span class="eyebrow mb-4 justify-center">
            <span class="h-1 w-1 rounded-full bg-brand-400"></span>Nosotros · {{ config.company.address.city }}
          </span>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl">
            20 años impulsando la <span class="text-gradient-brand">tecnología</span> en Cartagena
          </h1>
          <p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
            En {{ config.company.name }} llevamos dos décadas equipando empresas, instituciones y emprendedores
            con tecnología corporativa de calidad. Combinamos equipos nuevos y reacondicionados bajo una premisa
            clara: <span class="text-white">tecnología que evoluciona, confianza que permanece.</span>
          </p>
          <div class="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a ycButton variant="primary" size="lg" routerLink="/contacto">
              Contáctanos <yc-icon name="arrow-right" [size]="18" />
            </a>
            <a ycButton variant="outline" size="lg" routerLink="/catalogo">
              Ver catálogo <yc-icon name="chevron-right" [size]="18" />
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- 2 · STATS -->
    <section class="section">
      <div class="container-page">
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          @for (s of stats; track s.label) {
            <div class="rounded-2xl bg-surface-raised p-6 text-center shadow-card transition hover:shadow-card-hover lg:p-8">
              <p class="text-4xl font-bold text-gradient-brand lg:text-5xl">{{ s.value }}</p>
              <p class="mt-2 text-sm font-medium text-content-muted">{{ s.label }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- 3 · HISTORIA / QUIÉNES SOMOS -->
    <section class="section bg-surface-subtle">
      <div class="container-page">
        <div class="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <span class="eyebrow mb-3">
              <span class="h-1 w-1 rounded-full bg-accent-500"></span>Nuestra historia
            </span>
            <h2 class="text-3xl sm:text-4xl">Una trayectoria construida sobre la confianza</h2>
            <p class="mt-5 text-base leading-relaxed text-content-muted">
              Desde {{ config.company.foundedYear }}, Yes Computo nació en Cartagena de Indias con la
              convicción de que la tecnología debe ser accesible, confiable y sostenible. Comenzamos atendiendo
              a pequeñas empresas locales y hoy somos aliados estratégicos de organizaciones de todos los
              tamaños en toda la región Caribe.
            </p>
            <p class="mt-4 text-base leading-relaxed text-content-muted">
              A lo largo de {{ config.company.yearsInBusiness }} años hemos entregado miles de equipos
              corporativos —Lenovo ThinkPad, HP EliteBook, Dell Latitude y más— acompañados de servicio
              técnico especializado y planes de alquiler. Lideramos la
              <span class="font-semibold text-content">Tecnología Circular</span>: reutilizamos hoy para
              proteger mañana.
            </p>
            <div class="mt-7 flex flex-wrap gap-2">
              <yc-badge tone="brand">Equipos corporativos</yc-badge>
              <yc-badge tone="accent">Reacondicionados certificados</yc-badge>
              <yc-badge tone="neutral">Alquiler de equipos</yc-badge>
              <yc-badge tone="outline">Servicio técnico</yc-badge>
            </div>
          </div>
          <div class="relative">
            <div class="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl"></div>
            <div class="relative overflow-hidden rounded-3xl bg-ink-950 p-10 text-white shadow-ink">
              <div class="bg-grid absolute inset-0 opacity-30"></div>
              <div class="absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-accent-500/20 blur-[120px]"></div>
              <div class="relative">
                <yc-logo [size]="40" tone="light" />
                <p class="mt-8 text-2xl font-semibold leading-snug">
                  «Reutilizamos hoy, protegemos mañana.»
                </p>
                <p class="mt-4 text-white/60">{{ config.company.tagline }}</p>
                <dl class="mt-8 grid grid-cols-2 gap-6 border-t border-white/10 pt-8">
                  <div>
                    <dt class="text-3xl font-bold text-brand-400">{{ config.company.foundedYear }}</dt>
                    <dd class="text-sm text-white/60">Año de fundación</dd>
                  </div>
                  <div>
                    <dt class="text-3xl font-bold text-brand-400">100%</dt>
                    <dd class="text-sm text-white/60">Garantía en cada equipo</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4 · MISIÓN / VISIÓN / VALORES -->
    <section class="section">
      <div class="container-page">
        <yc-section-heading
          eyebrow="Nuestro propósito"
          title="Misión, visión y valores"
          description="El norte que guía cada decisión y cada equipo que entregamos."
          [centered]="true"
        />
        <div class="mt-12 grid gap-6 lg:grid-cols-3">
          @for (p of purpose; track p.title) {
            <div class="rounded-3xl border border-line bg-surface-raised p-8 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover">
              <span class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <yc-icon [name]="p.icon" [size]="26" />
              </span>
              <h3 class="mt-6 text-xl">{{ p.title }}</h3>
              <p class="mt-3 text-sm leading-relaxed text-content-muted">{{ p.text }}</p>
              @if (p.values.length) {
                <ul class="mt-5 space-y-2">
                  @for (v of p.values; track v) {
                    <li class="flex items-center gap-2 text-sm text-content-muted">
                      <yc-icon name="check-circle" [size]="16" class="text-brand-500" />{{ v }}
                    </li>
                  }
                </ul>
              }
            </div>
          }
        </div>
      </div>
    </section>

    <!-- 5 · POR QUÉ CONFIAR -->
    <section class="section bg-surface-subtle">
      <div class="container-page">
        <yc-section-heading
          eyebrow="Confianza corporativa"
          title="Por qué confiar en nosotros"
          description="Cuatro razones que respaldan a cientos de empresas que ya trabajan con nosotros."
          [centered]="true"
        />
        <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          @for (b of benefits; track b.title) {
            <div class="group rounded-3xl bg-surface-raised p-7 shadow-card transition hover:shadow-card-hover">
              <span class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600 transition group-hover:bg-accent-500 group-hover:text-white">
                <yc-icon [name]="b.icon" [size]="24" />
              </span>
              <h3 class="mt-5 text-lg">{{ b.title }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-content-muted">{{ b.text }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- 6 · BAND → TECNOLOGÍA CIRCULAR -->
    <section class="section">
      <div class="container-page">
        <div class="relative overflow-hidden rounded-3xl bg-brand-50 p-8 shadow-card lg:p-12">
          <div class="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-brand-500/15 blur-3xl"></div>
          <div class="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <span class="eyebrow mb-3">
                <span class="h-1 w-1 rounded-full bg-accent-500"></span>Tecnología con propósito
              </span>
              <h2 class="text-3xl sm:text-4xl">Lideramos la Tecnología Circular en el Caribe</h2>
              <p class="mt-4 max-w-xl text-base leading-relaxed text-ink-600">
                Reparamos, renovamos, reutilizamos y reciclamos para alargar la vida útil de los equipos,
                reducir residuos y ofrecer tecnología de calidad a un precio responsable. Descubre cómo
                cuidamos el planeta mientras impulsamos tu productividad.
              </p>
            </div>
            <div class="flex flex-col gap-3 lg:items-end">
              <a ycButton variant="primary" size="lg" routerLink="/tecnologia-circular">
                Conoce la Tecnología Circular <yc-icon name="arrow-right" [size]="18" />
              </a>
              <a ycButton variant="ghost" size="md" routerLink="/categoria/reacondicionados">
                Ver reacondicionados <yc-icon name="recycle" [size]="18" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 7 · CTA FINAL DARK -->
    <section class="relative overflow-hidden bg-ink-950 text-white">
      <div class="absolute -left-20 top-0 h-80 w-80 rounded-full bg-brand-500/20 blur-[120px]"></div>
      <div class="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-accent-500/20 blur-[120px]"></div>
      <div class="container-page relative section">
        <div class="mx-auto max-w-3xl text-center">
          <h2 class="text-3xl sm:text-4xl">¿Listo para equipar tu empresa con confianza?</h2>
          <p class="mx-auto mt-5 max-w-2xl text-lg text-white/70">
            Cuéntanos qué necesitas y un asesor te ayudará a elegir los equipos ideales. Escríbenos por
            WhatsApp o llámanos al {{ config.company.phoneDisplay }}.
          </p>
          <div class="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a ycButton variant="whatsapp" size="lg" [href]="whatsappLink" target="_blank" rel="noopener">
              <yc-icon name="whatsapp" [size]="20" /> Escríbenos por WhatsApp
            </a>
            <a ycButton variant="outline" size="lg" routerLink="/contacto">
              Ir a contacto <yc-icon name="arrow-right" [size]="18" />
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class About implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly whatsapp = inject(WhatsappService);
  protected readonly config = inject(APP_CONFIG);

  protected readonly whatsappLink = this.whatsapp.link(
    '¡Hola Yes Computo! 👋 Conocí su trayectoria de 20 años y quiero asesoría para equipar mi empresa.',
  );

  protected readonly stats = [
    { value: '20+', label: 'Años de experiencia' },
    { value: '5.000+', label: 'Equipos entregados' },
    { value: '12', label: 'Categorías de producto' },
    { value: '100%', label: 'Garantía y soporte' },
  ];

  protected readonly purpose: {
    icon: string;
    title: string;
    text: string;
    values: string[];
  }[] = [
    {
      icon: 'rocket',
      title: 'Misión',
      text: 'Proveer soluciones tecnológicas corporativas —nuevas y reacondicionadas— confiables y sostenibles, acompañadas de servicio y asesoría que impulsen la productividad de nuestros clientes.',
      values: [],
    },
    {
      icon: 'sparkles',
      title: 'Visión',
      text: 'Ser el referente de Tecnología Circular en la región Caribe, reconocidos por la calidad de nuestros equipos, la confianza que generamos y nuestro compromiso con el planeta.',
      values: [],
    },
    {
      icon: 'shield-check',
      title: 'Valores',
      text: 'Principios que vivimos todos los días con cada cliente y cada equipo.',
      values: ['Confianza', 'Innovación', 'Calidad corporativa', 'Sostenibilidad', 'Profesionalismo'],
    },
  ];

  protected readonly benefits = [
    {
      icon: 'shield-check',
      title: 'Garantía real',
      text: 'Cada equipo —nuevo o reacondicionado— pasa por pruebas y se entrega con garantía y soporte.',
    },
    {
      icon: 'users',
      title: 'Asesoría experta',
      text: 'Un equipo humano con 20 años de experiencia te ayuda a elegir según tus necesidades y presupuesto.',
    },
    {
      icon: 'wrench',
      title: 'Servicio técnico',
      text: 'Mantenimiento, reparación y soporte especializado para mantener tus equipos siempre operativos.',
    },
    {
      icon: 'recycle',
      title: 'Compromiso sostenible',
      text: 'Practicamos la Tecnología Circular: alargamos la vida útil de los equipos y reducimos residuos.',
    },
  ];

  ngOnInit(): void {
    this.seo.update({
      title: 'Nosotros',
      description:
        '20 años de experiencia en Cartagena de Indias entregando tecnología corporativa nueva y reacondicionada, con servicio técnico, alquiler y un compromiso real con la Tecnología Circular.',
      path: '/nosotros',
    });
  }
}

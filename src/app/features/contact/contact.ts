import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import { APP_CONFIG } from '../../core/config/app-config';
import { SeoService } from '../../core/services/seo.service';
import { WhatsappService } from '../../core/services/whatsapp.service';

import { Button } from '../../shared/components/button/button';
import { Icon } from '../../shared/components/icon/icon';
import { SectionHeading } from '../../shared/components/section-heading/section-heading';

/**
 * Contacto — premium contact page for Yes Computo.
 *
 * Left: a signal-driven form whose submit button is an `<a>` linking to a
 * prefilled WhatsApp message (the brand's primary conversion channel). Right:
 * contact info cards (WhatsApp, dirección + styled map placeholder, email,
 * horarios, redes). A closing CTA band invites a phone call.
 */
@Component({
  selector: 'yc-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Icon, SectionHeading],
  template: `
    <!-- (1) HERO -->
    <section class="section bg-grid">
      <div class="container-page">
        <div class="mx-auto max-w-3xl text-center">
          <span class="eyebrow mb-4">
            <span class="h-1 w-1 rounded-full bg-accent-500"></span>Contacto
          </span>
          <h1 class="text-4xl sm:text-5xl">
            Hablemos de tu próximo
            <span class="text-gradient-brand">proyecto tecnológico</span>
          </h1>
          <p class="mt-5 text-lg leading-relaxed text-content-muted">
            En {{ config.company.name }} llevamos {{ config.company.yearsInBusiness }} años
            acompañando a empresas y personas en Cartagena. Cuéntanos qué necesitas y te
            respondemos por WhatsApp en minutos.
          </p>
        </div>
      </div>
    </section>

    <!-- (2) FORM + INFO -->
    <section class="section pt-0">
      <div class="container-page">
        <div class="grid gap-8 lg:grid-cols-5 lg:gap-10">
          <!-- LEFT: form card -->
          <div class="lg:col-span-3">
            <div class="shine group relative overflow-hidden rounded-3xl border border-line bg-surface-raised p-6 shadow-card transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-line-strong hover:shadow-card-hover sm:p-8">
              <yc-section-heading
                eyebrow="Escríbenos"
                title="Cuéntanos qué necesitas"
                description="Completa el formulario y se abrirá WhatsApp con tu mensaje listo para enviar."
              />

              <form class="mt-8 grid gap-5 sm:grid-cols-2" (submit)="$event.preventDefault()">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-content-muted" for="name">Nombre</label>
                  <input
                    id="name"
                    class="h-12 w-full rounded-xl border border-line-strong bg-surface-raised px-4 text-sm outline-none focus:border-accent-400"
                    placeholder="Tu nombre"
                    [value]="name()"
                    (input)="name.set($any($event.target).value)"
                  />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-content-muted" for="company">
                    Empresa <span class="text-content-subtle">(opcional)</span>
                  </label>
                  <input
                    id="company"
                    class="h-12 w-full rounded-xl border border-line-strong bg-surface-raised px-4 text-sm outline-none focus:border-accent-400"
                    placeholder="Nombre de tu empresa"
                    [value]="company()"
                    (input)="company.set($any($event.target).value)"
                  />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-content-muted" for="email">Correo</label>
                  <input
                    id="email"
                    type="email"
                    class="h-12 w-full rounded-xl border border-line-strong bg-surface-raised px-4 text-sm outline-none focus:border-accent-400"
                    placeholder="correo@ejemplo.com"
                    [value]="email()"
                    (input)="email.set($any($event.target).value)"
                  />
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-content-muted" for="phone">Teléfono</label>
                  <input
                    id="phone"
                    type="tel"
                    class="h-12 w-full rounded-xl border border-line-strong bg-surface-raised px-4 text-sm outline-none focus:border-accent-400"
                    placeholder="300 000 0000"
                    [value]="phone()"
                    (input)="phone.set($any($event.target).value)"
                  />
                </div>

                <div class="flex flex-col gap-2 sm:col-span-2">
                  <label class="text-sm font-medium text-content-muted" for="subject">Asunto / Interés</label>
                  <select
                    id="subject"
                    class="h-12 w-full rounded-xl border border-line-strong bg-surface-raised px-4 text-sm outline-none focus:border-accent-400"
                    [value]="subject()"
                    (change)="subject.set($any($event.target).value)"
                  >
                    @for (opt of subjects; track opt) {
                      <option [value]="opt">{{ opt }}</option>
                    }
                  </select>
                </div>

                <div class="flex flex-col gap-2 sm:col-span-2">
                  <label class="text-sm font-medium text-content-muted" for="message">Mensaje</label>
                  <textarea
                    id="message"
                    rows="5"
                    class="w-full rounded-xl border border-line-strong bg-surface-raised px-4 py-3 text-sm outline-none focus:border-accent-400"
                    placeholder="Cuéntanos los detalles de tu solicitud…"
                    [value]="message()"
                    (input)="message.set($any($event.target).value)"
                  ></textarea>
                </div>

                <div class="sm:col-span-2">
                  <a
                    ycButton
                    variant="whatsapp"
                    [block]="true"
                    [href]="waLink()"
                    target="_blank"
                    rel="noopener"
                  >
                    <yc-icon name="whatsapp" [size]="20" />
                    Enviar por WhatsApp
                  </a>
                  <p class="mt-3 flex items-center justify-center gap-1.5 text-xs text-content-subtle">
                    <yc-icon name="shield-check" [size]="14" />
                    Al enviar se abrirá WhatsApp con tu mensaje listo. No compartimos tus datos.
                  </p>
                </div>
              </form>
            </div>
          </div>

          <!-- RIGHT: info cards -->
          <div class="flex flex-col gap-5 lg:col-span-2">
            <!-- WhatsApp -->
            <a
              [href]="directWaLink()"
              target="_blank"
              rel="noopener"
              class="shine group relative overflow-hidden flex items-start gap-4 rounded-2xl border border-line bg-surface-raised p-5 shadow-card transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-line-strong hover:shadow-card-hover"
            >
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/10 text-[#25D366]">
                <yc-icon name="whatsapp" [size]="22" />
              </span>
              <div>
                <p class="text-sm font-semibold text-content">WhatsApp</p>
                <p class="text-sm text-content-muted">{{ config.company.phoneDisplay }}</p>
                <span class="mt-1 inline-flex items-center gap-1 text-xs font-medium text-accent-600">
                  Chatea con nosotros
                  <yc-icon name="arrow-up-right" [size]="13" />
                </span>
              </div>
            </a>

            <!-- Dirección + map placeholder -->
            <div class="shine group relative overflow-hidden rounded-2xl border border-line bg-surface-raised p-5 shadow-card transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-line-strong hover:shadow-card-hover">
              <div class="flex items-start gap-4">
                <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600">
                  <yc-icon name="map-pin" [size]="22" />
                </span>
                <div>
                  <p class="text-sm font-semibold text-content">Dirección</p>
                  <p class="text-sm text-content-muted">{{ config.company.address.street }}</p>
                  <p class="text-sm text-content-muted">
                    {{ config.company.address.neighborhood }}, {{ config.company.address.city }}
                  </p>
                </div>
              </div>
              <!-- Styled map placeholder (no external iframe) -->
              <div class="relative mt-4 flex h-36 items-center justify-center overflow-hidden rounded-2xl bg-ink-950 bg-grid text-white">
                <div class="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-accent-500/30 blur-2xl"></div>
                <div class="absolute -bottom-8 -right-6 h-24 w-24 rounded-full bg-brand-500/30 blur-2xl"></div>
                <div class="relative flex flex-col items-center gap-2 px-4 text-center">
                  <yc-icon name="map-pin" [size]="28" class="text-brand-400" />
                  <span class="text-xs font-medium text-white/80">
                    {{ config.company.address.street }} · {{ config.company.address.city }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Email -->
            <a
              [href]="'mailto:' + config.company.email"
              class="shine group relative overflow-hidden flex items-start gap-4 rounded-2xl border border-line bg-surface-raised p-5 shadow-card transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-line-strong hover:shadow-card-hover"
            >
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600">
                <yc-icon name="mail" [size]="22" />
              </span>
              <div>
                <p class="text-sm font-semibold text-content">Correo</p>
                <p class="text-sm text-content-muted">{{ config.company.email }}</p>
              </div>
            </a>

            <!-- Horarios -->
            <div class="shine group relative overflow-hidden rounded-2xl border border-line bg-surface-raised p-5 shadow-card transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-line-strong hover:shadow-card-hover">
              <div class="flex items-center gap-4">
                <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-inset text-content-muted">
                  <yc-icon name="clock" [size]="22" />
                </span>
                <p class="text-sm font-semibold text-content">Horarios de atención</p>
              </div>
              <ul class="mt-4 flex flex-col divide-y divide-line">
                @for (h of config.company.hours; track h.label) {
                  <li class="flex items-center justify-between py-2.5 text-sm">
                    <span class="text-content-muted">{{ h.label }}</span>
                    <span class="font-medium text-content">{{ h.value }}</span>
                  </li>
                }
              </ul>
            </div>

            <!-- Redes sociales -->
            <div class="shine group relative overflow-hidden rounded-2xl border border-line bg-surface-raised p-5 shadow-card transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-line-strong hover:shadow-card-hover">
              <p class="text-sm font-semibold text-content">Síguenos</p>
              <div class="mt-3 flex gap-3">
                @for (s of config.company.socials; track s.platform) {
                  <a
                    [href]="s.url"
                    target="_blank"
                    rel="noopener"
                    [attr.aria-label]="s.platform"
                    class="flex h-11 w-11 items-center justify-center rounded-xl border border-line-strong text-content-muted transition hover:border-ink-900 hover:bg-surface-inset hover:text-content"
                  >
                    <yc-icon [name]="s.platform" [size]="20" />
                  </a>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- (3) CTA BAND -->
    <section class="section pt-0">
      <div class="container-page">
        <div class="shine group relative overflow-hidden rounded-3xl bg-ink-950 px-6 py-12 text-center text-white shadow-ink sm:px-12 sm:py-16">
          <div class="absolute -left-10 top-0 h-40 w-40 rounded-full bg-accent-500/20 blur-3xl"></div>
          <div class="absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-brand-500/20 blur-3xl"></div>
          <div class="relative mx-auto max-w-2xl">
            <span class="eyebrow mb-4 text-brand-400">
              <span class="h-1 w-1 rounded-full bg-brand-400"></span>Atención directa
            </span>
            <h2 class="text-3xl sm:text-4xl">¿Prefieres llamar?</h2>
            <p class="mt-3 text-base leading-relaxed text-white/70">
              Nuestro equipo está listo para asesorarte. Llámanos o escríbenos por WhatsApp y
              resolvemos tu solicitud al instante.
            </p>
            <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a ycButton variant="primary" size="lg" [href]="'tel:+' + config.company.whatsappNumber">
                <yc-icon name="phone" [size]="18" />
                {{ config.company.phoneDisplay }}
              </a>
              <a
                ycButton
                variant="whatsapp"
                size="lg"
                [href]="directWaLink()"
                target="_blank"
                rel="noopener"
              >
                <yc-icon name="whatsapp" [size]="18" />
                Escribir por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class Contact implements OnInit {
  protected readonly config = inject(APP_CONFIG);
  private readonly whatsapp = inject(WhatsappService);
  private readonly seo = inject(SeoService);

  protected readonly subjects = [
    'Compra de equipos',
    'Alquiler',
    'Servicio técnico',
    'Redes/Seguridad',
    'Otro',
  ] as const;

  // Form fields as signals.
  protected readonly name = signal('');
  protected readonly company = signal('');
  protected readonly email = signal('');
  protected readonly phone = signal('');
  protected readonly subject = signal<string>(this.subjects[0]);
  protected readonly message = signal('');

  /** WhatsApp link built from the current form values. */
  protected readonly waLink = computed(() => {
    const lines = [
      `¡Hola ${this.config.company.name}! 👋`,
      '',
      `*Interés:* ${this.subject()}`,
      `*Nombre:* ${this.name() || '—'}`,
    ];
    if (this.company().trim()) lines.push(`*Empresa:* ${this.company()}`);
    if (this.email().trim()) lines.push(`*Correo:* ${this.email()}`);
    if (this.phone().trim()) lines.push(`*Teléfono:* ${this.phone()}`);
    if (this.message().trim()) {
      lines.push('', `*Mensaje:*`, this.message());
    }
    return this.whatsapp.link(lines.join('\n'));
  });

  /** Plain "I want to talk" link used by the info card and CTA band. */
  protected readonly directWaLink = computed(() =>
    this.whatsapp.link(
      `¡Hola ${this.config.company.name}! 👋 Quiero más información sobre sus productos y servicios.`,
    ),
  );

  ngOnInit(): void {
    this.seo.update({
      title: 'Contacto',
      description:
        'Contáctanos para compra y alquiler de equipos, servicio técnico y redes. Estamos en Cartagena · WhatsApp 300 496 4276.',
      path: '/contacto',
    });
  }
}

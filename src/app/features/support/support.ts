import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { APP_CONFIG } from '../../core/config/app-config';
import { SeoService } from '../../core/services/seo.service';
import { WhatsappService } from '../../core/services/whatsapp.service';
import {
  ServiceTrackingService,
  TrackResult,
} from '../../core/services/service-tracking.service';

import { Button } from '../../shared/components/button/button';
import { Icon } from '../../shared/components/icon/icon';

/** Public "Seguimiento de servicio": the customer enters their guide code and
 * sees the owner, device, current status, estimated ready date and timeline. */
@Component({
  selector: 'yc-support',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, Button, Icon],
  templateUrl: './support.html',
})
export class Support implements OnInit {
  protected readonly config = inject(APP_CONFIG);
  private readonly tracking = inject(ServiceTrackingService);
  private readonly whatsapp = inject(WhatsappService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);

  protected readonly code = signal('');
  protected readonly loading = signal(false);
  protected readonly notFound = signal(false);
  protected readonly result = signal<TrackResult | null>(null);

  /** The customer-facing flow shown in the stepper (short labels under each step). */
  private readonly STEPS: { key: string; label: string }[] = [
    { key: 'received', label: 'Recibido' },
    { key: 'diagnosing', label: 'Diagnóstico' },
    { key: 'repairing', label: 'Reparación' },
    { key: 'ready', label: 'Listo' },
    { key: 'delivered', label: 'Entregado' },
  ];

  /** Real status → index in the visible stepper (awaiting_parts folds into repair). */
  private readonly STEP_INDEX: Record<string, number> = {
    received: 0,
    diagnosing: 1,
    repairing: 2,
    awaiting_parts: 2,
    ready: 3,
    delivered: 4,
  };

  protected readonly isCancelled = computed(() => this.result()?.status.key === 'cancelled');

  /** Index of the current step in the stepper (-1 when cancelled/unknown). */
  private readonly currentIdx = computed(() => {
    const r = this.result();
    return r ? this.STEP_INDEX[r.status.key] ?? -1 : -1;
  });

  protected readonly steps = computed(() => {
    if (!this.result() || this.isCancelled()) return [];
    const cur = this.currentIdx();
    return this.STEPS.map((s, i) => ({
      key: s.key,
      label: s.label,
      reached: cur >= 0 && i <= cur,
      current: i === cur,
    }));
  });

  /** Progress 0–100 for the fill bar behind the steps. */
  protected readonly progressPct = computed(() => {
    const cur = this.currentIdx();
    if (cur < 0) return 0;
    return Math.round((cur / (this.STEPS.length - 1)) * 100);
  });

  protected readonly whatsappLink = computed(() => {
    const r = this.result();
    const msg = r
      ? `¡Hola ${this.config.company.name}! 👋 Consulto por mi servicio, guía ${r.code}.`
      : `¡Hola ${this.config.company.name}! 👋 Quiero consultar por un servicio.`;
    return this.whatsapp.link(msg);
  });

  ngOnInit(): void {
    this.seo.update({
      title: `Seguimiento de servicio · ${this.config.company.name}`,
      description: 'Consulta el estado de tu equipo en servicio con tu número de guía.',
      path: '/soporte',
    });
    // Prefill the guide from the share link, but let the customer press
    // "Consultar" themselves (no auto-search).
    const guia = this.route.snapshot.queryParamMap.get('guia');
    if (guia) {
      this.code.set(guia.toUpperCase());
    }
  }

  protected onInput(e: Event): void {
    this.code.set((e.target as HTMLInputElement).value.toUpperCase());
  }

  protected search(): void {
    const code = this.code().trim();
    if (!code || this.loading()) return;
    this.loading.set(true);
    this.notFound.set(false);
    this.result.set(null);
    this.tracking.track(code).subscribe({
      next: (r) => {
        this.result.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  protected reset(): void {
    this.result.set(null);
    this.notFound.set(false);
    this.code.set('');
  }
}

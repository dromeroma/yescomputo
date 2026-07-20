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

  /** The forward flow of statuses for the progress bar (excludes cancelled). */
  private readonly FLOW = ['received', 'diagnosing', 'awaiting_approval', 'repairing', 'awaiting_parts', 'ready', 'delivered'];

  protected readonly steps = computed(() => {
    const r = this.result();
    if (!r) return [];
    const done = new Set(r.timeline.map((e) => e.status.key));
    const currentIdx = this.FLOW.indexOf(r.status.key);
    return this.FLOW.filter((k) => k !== 'awaiting_parts').map((key, i) => ({
      key,
      reached: done.has(key) || (currentIdx >= 0 && this.FLOW.indexOf(key) <= currentIdx),
      current: key === r.status.key,
    }));
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

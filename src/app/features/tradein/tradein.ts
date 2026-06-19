import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SeoService } from '../../core/services/seo.service';
import { FeaturesService } from '../../core/services/features.service';
import { TradeinService } from '../../core/services/tradein.service';

import { Button } from '../../shared/components/button/button';
import { Icon } from '../../shared/components/icon/icon';

/**
 * Plan Trade-in / recompra — public form for customers to quote their used
 * device as part-payment. Submissions land in the admin panel. Gated by the
 * `tradein` feature flag (also enforced server-side).
 */
@Component({
  selector: 'yc-tradein',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Button, Icon],
  templateUrl: './tradein.html',
})
export class Tradein implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly features = inject(FeaturesService);
  private readonly api = inject(TradeinService);

  protected readonly enabled = this.features.flag('tradein');

  protected readonly deviceTypes = ['Portátil', 'Computador de escritorio', 'Monitor', 'Otro'];
  protected readonly conditions = ['Excelente', 'Bueno', 'Regular', 'No enciende'];

  protected readonly name = signal('');
  protected readonly phone = signal('');
  protected readonly deviceType = signal('');
  protected readonly brand = signal('');
  protected readonly model = signal('');
  protected readonly specs = signal('');
  protected readonly condition = signal('');
  protected readonly notes = signal('');

  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly error = signal(false);

  protected readonly valid = computed(
    () => this.name().trim().length >= 2 && this.phone().trim().length >= 5,
  );

  ngOnInit(): void {
    this.seo.update({
      title: 'Plan Trade-in · Vende tu equipo · Yes Computo',
      description: 'Cotiza tu equipo usado como parte de pago. Te respondemos por WhatsApp.',
      path: '/recompra',
    });
  }

  protected set(sig: WritableSignal<string>, e: Event): void {
    sig.set((e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value);
  }

  protected submit(): void {
    if (!this.valid() || this.submitting()) return;
    this.submitting.set(true);
    this.error.set(false);
    this.api
      .submit({
        name: this.name().trim(),
        phone: this.phone().trim(),
        deviceType: this.deviceType() || undefined,
        brand: this.brand().trim() || undefined,
        model: this.model().trim() || undefined,
        specs: this.specs().trim() || undefined,
        condition: this.condition() || undefined,
        notes: this.notes().trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.submitted.set(true);
        },
        error: () => {
          this.submitting.set(false);
          this.error.set(true);
        },
      });
  }
}

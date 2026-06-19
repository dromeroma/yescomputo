import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';
import { FeaturesService } from '../../core/services/features.service';
import { Product } from '../../core/models';

import { Button } from '../../shared/components/button/button';
import { Icon } from '../../shared/components/icon/icon';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { categoryIcon } from '../../shared/utils/category-icons';

interface QOption {
  key: string;
  label: string;
  hint?: string;
  icon: string;
}
interface Question {
  id: 'tipo' | 'condicion' | 'presupuesto' | 'uso';
  title: string;
  subtitle: string;
  options: QOption[];
}

/** Categories that are NOT laptops — used to isolate "portátil". */
const NON_LAPTOP = ['Monitores', 'Audio y Diademas', 'Computadores de Escritorio'];

/**
 * Asesor de compra — a guided quiz (no AI/API) that maps the shopper's answers
 * to the live catalog and recommends the best-fit equipment. Gated by the
 * `buy_advisor` feature flag.
 */
@Component({
  selector: 'yc-asesor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Button, Icon, ProductCard],
  templateUrl: './asesor.html',
})
export class Asesor implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly seo = inject(SeoService);
  private readonly features = inject(FeaturesService);

  readonly catIcon = categoryIcon;
  protected readonly enabled = this.features.flag('buy_advisor');

  /** Whole published catalog (small), filtered client-side for recommendations. */
  private readonly all = toSignal(
    this.catalog.getProducts({ pageSize: 50 }).pipe(map((r) => r.items)),
    { initialValue: [] as Product[] },
  );

  protected readonly questions: Question[] = [
    {
      id: 'tipo',
      title: '¿Qué tipo de equipo buscas?',
      subtitle: 'Así filtramos por la categoría correcta.',
      options: [
        { key: 'portatil', label: 'Portátil', hint: 'Para llevar a todos lados', icon: 'laptop' },
        { key: 'escritorio', label: 'Equipo de escritorio', hint: 'Torre + monitor', icon: 'desktop' },
        { key: 'monitor', label: 'Monitor', hint: 'Pantalla', icon: 'monitor' },
        { key: 'cualquiera', label: 'No estoy seguro', hint: 'Muéstrame opciones', icon: 'sparkles' },
      ],
    },
    {
      id: 'condicion',
      title: '¿Prefieres nuevo o reacondicionado?',
      subtitle: 'Los reacondicionados rinden igual a menor precio.',
      options: [
        { key: 'nuevo', label: 'Nuevo', hint: 'De fábrica', icon: 'sparkles' },
        { key: 'reacondicionado', label: 'Reacondicionado', hint: 'Mejor precio, garantizado', icon: 'recycle' },
        { key: 'cualquiera', label: 'Cualquiera', hint: 'Lo que mejor encaje', icon: 'check-circle' },
      ],
    },
    {
      id: 'presupuesto',
      title: '¿Cuál es tu presupuesto?',
      subtitle: 'Buscamos lo mejor dentro de tu rango.',
      options: [
        { key: 'b1', label: 'Hasta $700.000', icon: 'tag' },
        { key: 'b2', label: '$700.000 – $1.200.000', icon: 'tag' },
        { key: 'b3', label: '$1.200.000 – $2.000.000', icon: 'tag' },
        { key: 'b4', label: 'Más de $2.000.000', icon: 'tag' },
        { key: 'b5', label: 'Sin límite definido', icon: 'sparkles' },
      ],
    },
    {
      id: 'uso',
      title: '¿Para qué lo usarás principalmente?',
      subtitle: 'Ajustamos la recomendación a tu uso.',
      options: [
        { key: 'oficina', label: 'Oficina / administrativo', icon: 'building' },
        { key: 'hogar', label: 'Hogar / estudio', icon: 'users' },
        { key: 'diseno', label: 'Diseño / edición', icon: 'sparkles' },
        { key: 'gaming', label: 'Alto rendimiento / gaming', icon: 'rocket' },
      ],
    },
  ];

  protected readonly step = signal(0);
  protected readonly answers = signal<Record<string, string>>({});

  protected readonly isResults = computed(() => this.step() >= this.questions.length);
  protected readonly current = computed(() => this.questions[this.step()]);
  protected readonly progress = computed(() =>
    Math.round((Math.min(this.step(), this.questions.length) / this.questions.length) * 100),
  );

  ngOnInit(): void {
    this.seo.update({
      title: 'Asesor de compra · Yes Computo',
      description: 'Responde unas preguntas y te recomendamos el equipo ideal para ti.',
      path: '/asesor',
    });
  }

  protected pick(option: QOption): void {
    const q = this.current();
    this.answers.update((a) => ({ ...a, [q.id]: option.key }));
    this.step.update((s) => s + 1);
  }

  protected back(): void {
    if (this.step() > 0) this.step.update((s) => s - 1);
  }

  protected restart(): void {
    this.answers.set({});
    this.step.set(0);
  }

  protected isSelected(id: string, key: string): boolean {
    return this.answers()[id] === key;
  }

  // --- Recommendation engine (rule-based, never empty) ----------------------

  private budgetRange(key: string | undefined): [number, number] {
    switch (key) {
      case 'b1': return [0, 700_000];
      case 'b2': return [700_000, 1_200_000];
      case 'b3': return [1_200_000, 2_000_000];
      case 'b4': return [2_000_000, Number.MAX_SAFE_INTEGER];
      default: return [0, Number.MAX_SAFE_INTEGER];
    }
  }

  private matchesTipo(p: Product, tipo: string | undefined): boolean {
    switch (tipo) {
      case 'escritorio': return p.categoryName === 'Computadores de Escritorio';
      case 'monitor': return p.categoryName === 'Monitores';
      case 'portatil': return !NON_LAPTOP.includes(p.categoryName);
      default: return true;
    }
  }

  protected readonly recommendations = computed<Product[]>(() => {
    const a = this.answers();
    const all = this.all();
    if (!all.length) return [];

    // 1) tipo (relax if empty)
    let pool = all.filter((p) => this.matchesTipo(p, a['tipo']));
    if (!pool.length) pool = all;

    // 2) condición (relax if empty)
    if (a['condicion'] && a['condicion'] !== 'cualquiera') {
      const byCond = pool.filter((p) => p.condition === a['condicion']);
      if (byCond.length) pool = byCond;
    }

    // 3) presupuesto (relax if empty)
    const [min, max] = this.budgetRange(a['presupuesto']);
    const byBudget = pool.filter((p) => p.price >= min && p.price <= max);
    if (byBudget.length) pool = byBudget;

    // 4) uso → ordena por valor (precio asc) o por potencia (precio desc)
    const power = a['uso'] === 'diseno' || a['uso'] === 'gaming';
    pool = [...pool].sort((x, y) => (power ? y.price - x.price : x.price - y.price));

    return pool.slice(0, 4);
  });

  protected reason(p: Product): string {
    const uso = this.answers()['uso'];
    const base: Record<string, string> = {
      oficina: 'Equilibrio ideal de precio y rendimiento para tareas de oficina.',
      hogar: 'Práctico y económico para el hogar y el estudio.',
      diseno: 'Potencia y memoria suficientes para diseño y edición.',
      gaming: 'De los más potentes dentro de tu presupuesto.',
    };
    const fit = uso ? base[uso] ?? '' : '';
    const cond = p.condition === 'reacondicionado' ? ' Reacondicionado y garantizado.' : '';
    return (fit + cond).trim() || `${p.brandName} recomendado para ti.`;
  }
}

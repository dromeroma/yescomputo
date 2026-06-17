import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats an integer COP amount as Colombian pesos, e.g. 2499000 → "$2.499.000".
 * Uses Intl with es-CO so it works identically on server and browser.
 */
@Pipe({ name: 'cop' })
export class CopCurrencyPipe implements PipeTransform {
  private static readonly formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });

  transform(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return '';
    return CopCurrencyPipe.formatter.format(value);
  }
}

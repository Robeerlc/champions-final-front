import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localTime',
  standalone: true
})
export class LocalTimePipe implements PipeTransform {
  transform(value: string | Date, format: 'time' | 'date' | 'datetime' = 'time', locale: string = 'es'): string {
    if (!value) return '';

    let dateString = typeof value === 'string' ? value : value.toISOString();

    // Si la fecha no tiene Z (no está en UTC), agregarla para forzar interpretación como UTC
    if (typeof value === 'string' && !dateString.includes('Z') && !dateString.includes('+') && !dateString.includes('-00:')) {
      dateString = dateString + 'Z';
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const options: Intl.DateTimeFormatOptions = {};

    if (format === 'time' || format === 'datetime') {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    if (format === 'date' || format === 'datetime') {
      options.weekday = 'short';
      options.day = '2-digit';
      options.month = 'short';
    }

    if (format === 'datetime') {
      options.year = 'numeric';
    }

    return date.toLocaleString(locale, options);
  }
}


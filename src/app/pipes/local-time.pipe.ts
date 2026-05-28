import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localTime',
  standalone: true
})
export class LocalTimePipe implements PipeTransform {
  transform(value: string | Date, format: 'time' | 'date' | 'datetime' = 'time', locale: string = 'es'): string {
    if (!value) return '';

    const date = new Date(value);
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

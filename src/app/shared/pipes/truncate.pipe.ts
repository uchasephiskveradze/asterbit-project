import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
})
export class TruncatePipe implements PipeTransform {
  public transform(value: string | null | undefined, limit = 120, suffix = '…'): string {
    if (!value) {
      return '';
    }

    if (value.length <= limit) {
      return value;
    }

    return `${value.slice(0, limit).trimEnd()}${suffix}`;
  }
}

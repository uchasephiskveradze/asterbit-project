import { Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-posts-pagination',
  imports: [TranslatePipe],
  templateUrl: './posts-pagination.component.html',
  styleUrl: './posts-pagination.component.scss',
})
export class PostsPaginationComponent {
  public readonly currentPage = input.required<number>();
  public readonly totalPages = input.required<number>();
  public readonly totalItems = input.required<number>();
  public readonly rangeStart = input.required<number>();
  public readonly rangeEnd = input.required<number>();

  public readonly pageChange = output<number>();

  public readonly visiblePages = computed(() =>
    this.buildVisiblePages(this.currentPage(), this.totalPages()),
  );

  private buildVisiblePages(
    current: number,
    total: number,
  ): Array<number | 'ellipsis'> {
    if (total <= 5) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    const pages = new Set<number>([1, total, current]);

    if (current > 1) {
      pages.add(current - 1);
    }

    if (current < total) {
      pages.add(current + 1);
    }

    const sorted = [...pages].sort((left, right) => left - right);
    const result: Array<number | 'ellipsis'> = [];

    for (let index = 0; index < sorted.length; index++) {
      const page = sorted[index];
      const previous = sorted[index - 1];

      if (previous !== undefined && page - previous > 1) {
        result.push('ellipsis');
      }

      result.push(page);
    }

    return result;
  }
}

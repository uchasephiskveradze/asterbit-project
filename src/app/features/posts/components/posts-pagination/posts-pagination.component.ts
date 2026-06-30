import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-posts-pagination',
  templateUrl: './posts-pagination.component.html',
  styleUrl: './posts-pagination.component.scss',
})
export class PostsPaginationComponent {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly totalItems = input.required<number>();
  readonly rangeStart = input.required<number>();
  readonly rangeEnd = input.required<number>();

  readonly pageChange = output<number>();

  readonly visiblePages = computed(() =>
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

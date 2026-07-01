import { Component, input } from '@angular/core';

export type PageHeaderActionsAlign = 'end' | 'start';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  public readonly title = input.required<string>();
  public readonly subtitle = input<string>();
  public readonly actionsAlign = input<PageHeaderActionsAlign>('end');
}

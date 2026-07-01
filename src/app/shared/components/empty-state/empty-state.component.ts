import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  public readonly title = input.required<string>();
  public readonly description = input.required<string>();
  public readonly icon = input('description');
  public readonly badgeIcon = input<string | null>('draft');
  public readonly showVisual = input(true);
}

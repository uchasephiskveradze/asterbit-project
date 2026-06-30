import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-posts-error-state',
  templateUrl: './posts-error-state.component.html',
  styleUrl: './posts-error-state.component.scss',
})
export class PostsErrorStateComponent {
  public readonly message = input('Unable to load posts. Please try again.');
  public readonly retry = output<void>();
}

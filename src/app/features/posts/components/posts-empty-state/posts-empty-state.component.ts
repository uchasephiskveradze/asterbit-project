import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type PostsEmptyVariant = 'no-posts' | 'no-results';

@Component({
  selector: 'app-posts-empty-state',
  imports: [RouterLink],
  templateUrl: './posts-empty-state.component.html',
  styleUrl: './posts-empty-state.component.scss',
})
export class PostsEmptyStateComponent {
  public readonly variant = input<PostsEmptyVariant>('no-posts');
}

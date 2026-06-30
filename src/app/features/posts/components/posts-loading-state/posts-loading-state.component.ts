import { Component } from '@angular/core';

@Component({
  selector: 'app-posts-loading-state',
  templateUrl: './posts-loading-state.component.html',
  styleUrl: './posts-loading-state.component.scss',
})
export class PostsLoadingStateComponent {
  public readonly columns = [1, 2, 3, 4];
  public readonly rows = [1, 2, 3, 4, 5];
}

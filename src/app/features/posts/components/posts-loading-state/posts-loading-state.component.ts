import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-posts-loading-state',
  imports: [TranslatePipe],
  templateUrl: './posts-loading-state.component.html',
  styleUrl: './posts-loading-state.component.scss',
})
export class PostsLoadingStateComponent {
  public readonly columns = [1, 2, 3, 4];
  public readonly rows = [1, 2, 3, 4, 5];
}

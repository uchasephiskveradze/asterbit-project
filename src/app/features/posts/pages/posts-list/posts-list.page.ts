import { Component, computed, inject, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';
import { InfiniteScrollDirective } from '../../../../shared/directives/infinite-scroll.directive';
import { PostsEmptyStateComponent } from '../../components/posts-empty-state/posts-empty-state.component';
import { PostsErrorStateComponent } from '../../components/posts-error-state/posts-error-state.component';
import { PostsFiltersComponent } from '../../components/posts-filters/posts-filters.component';
import { PostsLoadingStateComponent } from '../../components/posts-loading-state/posts-loading-state.component';
import { PostsTableComponent } from '../../components/posts-table/posts-table.component';
import { PostsListStore } from '../../store/posts-list.store';

export type PostsListViewState = 'loading' | 'error' | 'empty' | 'content';

@Component({
  selector: 'app-posts-list-page',
  imports: [
    RouterLink,
    MatProgressSpinnerModule,
    InfiniteScrollDirective,
    PostsFiltersComponent,
    PostsTableComponent,
    PostsLoadingStateComponent,
    PostsEmptyStateComponent,
    PostsErrorStateComponent,
  ],
  providers: [PostsListStore],
  templateUrl: './posts-list.page.html',
  styleUrl: './posts-list.page.scss',
})
export class PostsListPage implements OnInit {
  public readonly store = inject(PostsListStore);
  public readonly auth = inject(AuthService);

  public readonly viewState = computed<PostsListViewState>(() => {
    if (this.store.loading()) {
      return 'loading';
    }

    if (this.store.error()) {
      return 'error';
    }

    if (this.store.isEmpty()) {
      return 'empty';
    }

    return 'content';
  });

  public ngOnInit(): void {
    this.store.loadPosts();
  }
}

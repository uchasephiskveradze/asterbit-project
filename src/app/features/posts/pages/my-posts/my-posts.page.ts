import { Component, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';
import { PostsEmptyStateComponent } from '../../components/posts-empty-state/posts-empty-state.component';
import { PostsErrorStateComponent } from '../../components/posts-error-state/posts-error-state.component';
import { PostsLoadingStateComponent } from '../../components/posts-loading-state/posts-loading-state.component';
import { PostsTableComponent } from '../../components/posts-table/posts-table.component';
import { MY_POSTS_TAB_LABELS, MY_POSTS_TABS } from '../../models/post-status.model';
import { MyPostsStore } from '../../store/my-posts.store';

@Component({
  selector: 'app-my-posts-page',
  imports: [
    RouterLink,
    PostsTableComponent,
    PostsLoadingStateComponent,
    PostsEmptyStateComponent,
    PostsErrorStateComponent,
  ],
  providers: [MyPostsStore],
  templateUrl: './my-posts.page.html',
  styleUrl: './my-posts.page.scss',
})
export class MyPostsPage {
  public readonly store = inject(MyPostsStore);
  public readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  public readonly tabs = MY_POSTS_TABS;
  public readonly tabLabels = MY_POSTS_TAB_LABELS;

  public readonly isEmpty = computed(
    () => !this.store.loading() && !this.store.error() && this.store.filteredPosts().length === 0,
  );

  public readonly showOwnerEdit = computed(() => this.store.activeTab() === 'approved');

  public constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.store.setTabFromQuery(params.get('tab'));
      });
  }
}

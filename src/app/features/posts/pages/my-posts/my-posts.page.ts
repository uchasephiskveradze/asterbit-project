import { Component, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { PostsLoadingStateComponent } from '../../components/posts-loading-state/posts-loading-state.component';
import { PostsTableComponent } from '../../components/posts-table/posts-table.component';
import { MY_POSTS_TAB_LABELS, MY_POSTS_TABS } from '../../models/post-status.model';
import { MyPostsStore } from '../../store/my-posts.store';

@Component({
  selector: 'app-my-posts-page',
  imports: [
    RouterLink,
    TranslatePipe,
    PostsTableComponent,
    PostsLoadingStateComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    PageHeaderComponent,
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

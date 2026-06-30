import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PostsEmptyStateComponent } from '../../components/posts-empty-state/posts-empty-state.component';
import { PostsErrorStateComponent } from '../../components/posts-error-state/posts-error-state.component';
import { PostsFiltersComponent } from '../../components/posts-filters/posts-filters.component';
import { PostsLoadingStateComponent } from '../../components/posts-loading-state/posts-loading-state.component';
import { PostsPaginationComponent } from '../../components/posts-pagination/posts-pagination.component';
import { PostsTableComponent } from '../../components/posts-table/posts-table.component';
import { PostsListStore } from '../../store/posts-list.store';

@Component({
  selector: 'app-posts-list-page',
  imports: [
    RouterLink,
    PostsFiltersComponent,
    PostsTableComponent,
    PostsPaginationComponent,
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

  public ngOnInit(): void {
    this.store.loadPosts();
  }
}

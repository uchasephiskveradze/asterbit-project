import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, of, tap } from 'rxjs';

import { AuthService } from '../../../core/auth/services/auth.service';
import { PostsApiService } from '../services/posts-api.service';
import { Post } from '../models/post.model';
import { PostsListQuery } from '../models/posts-list-query.model';
import {
  isMyPostsTab,
  MY_POSTS_TAB_STATUS,
  MyPostsTab,
} from '../models/post-status.model';

@Injectable()
export class MyPostsStore {
  private readonly api = inject(PostsApiService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  private loadGeneration = 0;

  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly posts = signal<Post[]>([]);
  public readonly activeTab = signal<MyPostsTab>('under-review');

  public readonly filteredPosts = computed(() => {
    const user = this.auth.currentUser();

    if (!user) {
      return [];
    }

    const owned = this.posts().filter((post) => post.submittedBy === user.id);

    if (this.activeTab() !== 'rejected') {
      return owned;
    }

    return [...owned].sort((left, right) => {
      const leftTime = Date.parse(left.rejectedAt ?? left.createdAt);
      const rightTime = Date.parse(right.rejectedAt ?? right.createdAt);

      return rightTime - leftTime;
    });
  });

  public initializeTab(tab: string | null): void {
    const resolvedTab = isMyPostsTab(tab) ? tab : 'under-review';
    this.activeTab.set(resolvedTab);
    this.loadPosts();
  }

  public setTab(tab: MyPostsTab): void {
    if (this.activeTab() === tab) {
      return;
    }

    this.activeTab.set(tab);
    this.loadPosts();
  }

  public setTabFromQuery(tab: string | null): void {
    if (!isMyPostsTab(tab) || this.activeTab() === tab) {
      return;
    }

    this.activeTab.set(tab);
    this.loadPosts();
  }

  public loadPosts(force = false): void {
    const generation = ++this.loadGeneration;

    this.loading.set(true);
    this.error.set(null);

    this.api
      .getPosts({ force, query: this.buildListQuery() })
      .pipe(
        catchError(() => {
          if (generation !== this.loadGeneration) {
            return of({ posts: [], totalItems: 0 });
          }

          this.error.set('errors.posts.myPostsLoad');
          return of({ posts: [], totalItems: 0 });
        }),
        finalize(() => {
          if (generation === this.loadGeneration) {
            this.loading.set(false);
          }
        }),
        tap((result) => {
          if (generation !== this.loadGeneration) {
            return;
          }

          this.posts.set(result.posts);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  public retry(): void {
    this.loadPosts(true);
  }

  private buildListQuery(): PostsListQuery {
    const query: PostsListQuery = {
      status: MY_POSTS_TAB_STATUS[this.activeTab()],
    };

    if (this.activeTab() === 'rejected') {
      query.sort = 'rejectedAt';
      query.order = 'desc';
    }

    return query;
  }
}

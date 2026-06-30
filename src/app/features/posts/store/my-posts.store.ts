import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, of } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { PostsApiService } from '../data-access/posts-api.service';
import { Post } from '../models/post.model';
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

  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly posts = signal<Post[]>([]);
  public readonly activeTab = signal<MyPostsTab>('under-review');

  public readonly filteredPosts = computed(() => {
    const user = this.auth.currentUser();
    const status = MY_POSTS_TAB_STATUS[this.activeTab()];

    if (!user) {
      return [];
    }

    return this.posts().filter(
      (post) => post.submittedBy === user.id && post.status === status,
    );
  });

  public constructor() {
    this.loadPosts();
  }

  public setTab(tab: MyPostsTab): void {
    this.activeTab.set(tab);
  }

  public setTabFromQuery(tab: string | null): void {
    if (isMyPostsTab(tab)) {
      this.activeTab.set(tab);
    }
  }

  public loadPosts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api
      .getPosts()
      .pipe(
        catchError(() => {
          this.error.set('Unable to load your posts. Please try again.');
          return of([]);
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((posts) => this.posts.set(posts));
  }
}

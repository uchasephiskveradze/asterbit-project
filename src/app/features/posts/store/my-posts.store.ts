import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, of } from 'rxjs';

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

    return this.posts().filter((post) => post.submittedBy === user.id);
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
            return of([]);
          }

          this.error.set('errors.posts.myPostsLoad');
          return of([]);
        }),
        finalize(() => {
          if (generation === this.loadGeneration) {
            this.loading.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((posts) => {
        if (generation !== this.loadGeneration) {
          return;
        }

        this.posts.set(posts);
      });
  }

  public retry(): void {
    this.loadPosts(true);
  }

  private buildListQuery(): PostsListQuery {
    return {
      status: MY_POSTS_TAB_STATUS[this.activeTab()],
    };
  }
}

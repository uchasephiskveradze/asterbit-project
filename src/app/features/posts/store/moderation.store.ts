import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, of, tap } from 'rxjs';

import { PostsApiService } from '../services/posts-api.service';
import { Post } from '../models/post.model';
import { PostsListQuery } from '../models/posts-list-query.model';
import { POST_STATUS } from '../models/post-status.model';

@Injectable()
export class ModerationStore {
  private readonly api = inject(PostsApiService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly loading = signal(false);
  public readonly actingOnId = signal<string | null>(null);
  public readonly error = signal<string | null>(null);
  public readonly posts = signal<Post[]>([]);

  public readonly pendingPosts = computed(() => this.posts());

  public constructor() {
    this.loadPosts();
  }

  public loadPosts(force = false): void {
    this.loading.set(true);
    this.error.set(null);

    this.api
      .getPosts({ force, query: this.buildListQuery() })
      .pipe(
        catchError(() => {
          this.error.set('errors.posts.moderationLoad');
          return of({ posts: [], totalItems: 0 });
        }),
        finalize(() => this.loading.set(false)),
        tap((result) => this.posts.set(result.posts)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  public moderatePost(
    id: string,
    status: typeof POST_STATUS.approved | typeof POST_STATUS.rejected,
    rejectionReason?: string,
  ): void {
    this.actingOnId.set(id);
    this.error.set(null);

    this.api
      .updatePostStatus(id, status, {
        rejectionReason: status === POST_STATUS.rejected ? rejectionReason : undefined,
      })
      .pipe(
        catchError(() => {
          this.error.set('errors.posts.updateStatus');
          return of(null);
        }),
        finalize(() => this.actingOnId.set(null)),
        tap((post) => {
          if (!post) {
            return;
          }

          this.posts.update((items) => items.filter((item) => item.id !== post.id));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private buildListQuery(): PostsListQuery {
    return {
      status: POST_STATUS.pending,
    };
  }
}

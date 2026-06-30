import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, of } from 'rxjs';

import { PostsApiService } from '../services/posts-api.service';
import { Post } from '../models/post.model';
import { PostStatus } from '../models/post-status.model';

@Injectable()
export class ModerationStore {
  private readonly api = inject(PostsApiService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly loading = signal(false);
  public readonly actingOnId = signal<string | null>(null);
  public readonly error = signal<string | null>(null);
  public readonly posts = signal<Post[]>([]);

  public readonly pendingPosts = computed(() =>
    this.posts().filter((post) => post.status === 'pending'),
  );

  public constructor() {
    this.loadPosts();
  }

  public loadPosts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api
      .getPosts()
      .pipe(
        catchError(() => {
          this.error.set('Unable to load moderation queue. Please try again.');
          return of([]);
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((posts) => this.posts.set(posts));
  }

  public moderatePost(id: string, status: Extract<PostStatus, 'approved' | 'rejected'>): void {
    this.actingOnId.set(id);
    this.error.set(null);

    this.api
      .updatePostStatus(id, status)
      .pipe(
        catchError(() => {
          this.error.set('Unable to update post status. Please try again.');
          return of(null);
        }),
        finalize(() => this.actingOnId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((post) => {
        if (!post) {
          return;
        }

        this.posts.update((items) => items.map((item) => (item.id === post.id ? post : item)));
        this.reloadPosts();
      });
  }

  private reloadPosts(): void {
    this.api
      .getPosts({ force: true })
      .pipe(
        catchError(() => of(this.posts())),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((posts) => this.posts.set(posts));
  }
}

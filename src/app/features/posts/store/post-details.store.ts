import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize, Observable, of, Subject, switchMap, tap } from 'rxjs';

import { PostsApiService } from '../data-access/posts-api.service';
import { Post } from '../models/post.model';
import { PostStatus } from '../models/post-status.model';
import { PostResolverResult } from '../models/post-resolver-result.model';

@Injectable()
export class PostDetailsStore {
  private readonly api = inject(PostsApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadRequest$ = new Subject<string>();

  private lastId: string | null = null;

  public readonly loading = signal(false);
  public readonly deleting = signal(false);
  public readonly moderating = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly notFound = signal(false);
  public readonly post = signal<Post | null>(null);

  public constructor() {
    this.loadRequest$
      .pipe(
        tap((id) => {
          this.lastId = id;
          this.loading.set(true);
          this.error.set(null);
          this.notFound.set(false);
          this.post.set(null);
        }),
        switchMap((id) =>
          this.api.getPostById(id).pipe(
            catchError((err: HttpErrorResponse) => {
              if (err.status === 404) {
                this.notFound.set(true);
                return of(null);
              }

              this.error.set('Unable to load post. Please try again.');
              return of(null);
            }),
            finalize(() => this.loading.set(false)),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((post) => {
        if (post) {
          this.post.set(post);
        }
      });
  }

  public loadPost(id: string): void {
    this.loadRequest$.next(id);
  }

  public applyResolverResult(id: string, result: PostResolverResult): void {
    this.lastId = id;
    this.loading.set(false);
    this.error.set(result.error);
    this.notFound.set(result.notFound);
    this.post.set(result.post);
  }

  public retry(): void {
    if (this.lastId) {
      this.loadPost(this.lastId);
    }
  }

  public deletePost(id: string): Observable<void> {
    this.deleting.set(true);
    this.error.set(null);

    return this.api.deletePost(id).pipe(
      catchError(() => {
        this.error.set('Unable to delete post. Please try again.');
        return EMPTY;
      }),
      finalize(() => this.deleting.set(false)),
    );
  }

  public moderatePost(status: Extract<PostStatus, 'approved' | 'rejected'>): void {
    const post = this.post();
    if (!post || this.moderating()) {
      return;
    }

    this.moderating.set(true);
    this.error.set(null);

    this.api
      .updatePostStatus(post.id, status)
      .pipe(
        catchError(() => {
          this.error.set('Unable to update post status. Please try again.');
          return of(null);
        }),
        finalize(() => this.moderating.set(false)),
      )
      .subscribe((updated) => {
        if (updated) {
          this.post.set(updated);
        }
      });
  }
}

import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, of, Subject, switchMap, tap } from 'rxjs';

import { PostsApiService } from '../data-access/posts-api.service';
import { Post } from '../models/post.model';

@Injectable()
export class PostDetailsStore {
  private readonly api = inject(PostsApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadRequest$ = new Subject<string>();

  private lastId: string | null = null;

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly post = signal<Post | null>(null);

  constructor() {
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

  loadPost(id: string): void {
    this.loadRequest$.next(id);
  }

  retry(): void {
    if (this.lastId) {
      this.loadPost(this.lastId);
    }
  }
}

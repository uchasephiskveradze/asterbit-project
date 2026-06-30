import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, finalize, of, Subject, switchMap, tap } from 'rxjs';

import { PostFormValue } from '../components/post-form/types/post-form.types';
import { PostsApiService } from '../data-access/posts-api.service';
import { CreatePostDto } from '../models/create-post.dto';
import { Post } from '../models/post.model';
import { UpdatePostDto } from '../models/update-post.dto';

@Injectable()
export class PostUpsertStore {
  private readonly api = inject(PostsApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadRequest$ = new Subject<string>();

  public readonly loading = signal(false);
  public readonly saving = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly post = signal<Post | null>(null);

  public constructor() {
    this.loadRequest$
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
          this.post.set(null);
        }),
        switchMap((id) =>
          this.api.getPostById(id).pipe(
            catchError(() => {
              this.error.set('Unable to load post for editing.');
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

  public createPost(value: PostFormValue): void {
    this.persist(() => this.api.createPost(value as CreatePostDto));
  }

  public updatePost(id: string, value: PostFormValue): void {
    const payload: UpdatePostDto = { ...value };
    this.persist(() => this.api.updatePost(id, payload));
  }

  private persist(request: () => ReturnType<PostsApiService['createPost']>): void {
    this.saving.set(true);
    this.error.set(null);

    request()
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.error.set('Unable to save post. Please try again.');
          return of(null);
        }),
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((post) => {
        if (post) {
          void this.router.navigate(['/posts', post.id]);
        }
      });
  }
}

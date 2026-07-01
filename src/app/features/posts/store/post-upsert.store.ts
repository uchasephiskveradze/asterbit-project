import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

import { navigateSafely } from '../../../core/router/navigate.util';

import { AuthService } from '../../../core/auth/services/auth.service';
import { PostFormValue } from '../components/post-form/types/post-form.types';
import { PostsApiService } from '../services/posts-api.service';
import { CreatePostDto } from '../models/create-post.dto';
import { Post } from '../models/post.model';
import { PostResolverResult } from '../models/post-resolver-result.model';
import { POST_PENDING_REASON } from '../models/post-revision.model';
import { POST_STATUS } from '../models/post-status.model';
import { UpdatePostDto } from '../models/update-post.dto';

@Injectable()
export class PostUpsertStore {
  private readonly api = inject(PostsApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  public readonly saving = signal(false);
  public readonly notFound = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly post = signal<Post | null>(null);

  public applyResolverResult(result: PostResolverResult): void {
    this.notFound.set(result.notFound);

    if (result.error) {
      this.error.set(result.error);
      this.post.set(null);
      return;
    }

    if (result.notFound || !result.post) {
      this.error.set(null);
      this.post.set(null);
      return;
    }

    this.error.set(null);
    this.post.set(result.post);
  }

  public reloadPost(id: string): void {
    this.error.set(null);
    this.notFound.set(false);

    this.api
      .getPostById(id, { force: true })
      .pipe(
        catchError(() => {
          this.error.set('errors.posts.loadOne');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((post) => {
        if (!post) {
          this.notFound.set(true);
          this.post.set(null);
          return;
        }

        this.post.set(post);
      });
  }

  public createPost(value: PostFormValue): void {
    const user = this.auth.currentUser();
    if (!user) {
      return;
    }

    const payload: CreatePostDto = {
      ...value,
      author: user.name,
      status: this.auth.isAdmin() ? POST_STATUS.approved : POST_STATUS.pending,
      submittedBy: user.id,
      pendingReason: this.auth.isAdmin() ? undefined : POST_PENDING_REASON.new,
    };

    this.persist(() => this.api.createPost(payload), (post) => {
      if (this.auth.isAdmin()) {
        navigateSafely(this.router, ['/posts', post.id]);
        return;
      }

      navigateSafely(this.router, ['/posts/my'], {
        queryParams: { tab: 'under-review' },
      });
    });
  }

  public updatePost(id: string, value: PostFormValue): void {
    const user = this.auth.currentUser();
    const existingPost = this.post();

    if (!user) {
      return;
    }

    const payload: UpdatePostDto = { ...value };
    const isOwnerApprovedResubmit =
      !this.auth.isAdmin() &&
      existingPost?.submittedBy === user.id &&
      existingPost.status === POST_STATUS.approved;
    const isOwnerRejectedResubmit =
      !this.auth.isAdmin() &&
      existingPost?.submittedBy === user.id &&
      existingPost.status === POST_STATUS.rejected;

    if (isOwnerApprovedResubmit) {
      payload.status = POST_STATUS.pending;
      payload.pendingReason = POST_PENDING_REASON.edited;
      payload.previousVersion = {
        title: existingPost.title,
        author: existingPost.author,
        description: existingPost.description,
        content: existingPost.content,
        capturedAt: new Date().toISOString(),
      };
    } else if (isOwnerRejectedResubmit) {
      payload.status = POST_STATUS.pending;
      payload.pendingReason = POST_PENDING_REASON.new;
      payload.rejectionReason = null;
      payload.previousVersion = null;
    }

    const redirectToUnderReview = isOwnerApprovedResubmit || isOwnerRejectedResubmit;

    this.persist(
      () => this.api.updatePost(id, payload),
      (post) => {
        if (redirectToUnderReview) {
          navigateSafely(this.router, ['/posts/my'], {
            queryParams: { tab: 'under-review' },
          });
          return;
        }

        navigateSafely(this.router, ['/posts', post.id]);
      },
    );
  }

  private persist(
    request: () => ReturnType<PostsApiService['createPost']>,
    onSuccess: (post: Post) => void,
  ): void {
    this.saving.set(true);
    this.error.set(null);

    request()
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.error.set('errors.posts.save');
          return of(null);
        }),
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((post) => {
        if (post) {
          onSuccess(post);
        }
      });
  }
}

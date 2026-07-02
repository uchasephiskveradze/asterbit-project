import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { NavigationExtras, Router } from '@angular/router';
import { catchError, finalize, of, pipe, switchMap, tap } from 'rxjs';

import { AuthService } from '../../../core/auth/services/auth.service';
import { PostFormValue } from '../components/post-form/types/post-form.types';
import { PostsApiService } from '../services/posts-api.service';
import { CreatePostDto } from '../models/create-post.dto';
import { Post } from '../models/post.model';
import { PostResolverResult } from '../models/post-resolver-result.model';
import { POST_PENDING_REASON } from '../models/post-revision.model';
import { POST_STATUS } from '../models/post-status.model';
import { UpdatePostDto } from '../models/update-post.dto';

type PostUpsertState = {
  saving: boolean;
  notFound: boolean;
  error: string | null;
  post: Post | null;
};

export const PostUpsertStore = signalStore(
  withState<PostUpsertState>({
    saving: false,
    notFound: false,
    error: null,
    post: null,
  }),
  withMethods((store, api = inject(PostsApiService), auth = inject(AuthService), router = inject(Router)) => {
    const reloadPostRx = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { error: null, notFound: false })),
        switchMap((id) =>
          api.getPostById(id, { force: true }).pipe(
            catchError(() => {
              patchState(store, { error: 'errors.posts.loadOne' });
              return of(null);
            }),
            tap((post) => {
              if (!post) {
                patchState(store, { notFound: true, post: null });
                return;
              }

              patchState(store, { post });
            }),
          ),
        ),
      ),
    );

    const persistRx = rxMethod<{
      request: () => ReturnType<PostsApiService['createPost']>;
      onSuccess: (post: Post) => void;
    }>(
      pipe(
        tap(() => patchState(store, { saving: true, error: null })),
        tap(() => {}),
        switchMap(({ request, onSuccess }) =>
          request().pipe(
            catchError((err: HttpErrorResponse) => {
              patchState(store, { error: 'errors.posts.save' });
              return of(null);
            }),
            finalize(() => patchState(store, { saving: false })),
            tap((post) => {
              if (post) {
                onSuccess(post);
              }
            }),
          ),
        ),
      ),
    );

    return {
      applyResolverResult(result: PostResolverResult): void {
        patchState(store, {
          notFound: result.notFound,
          error: result.error || null,
          post: result.error || result.notFound || !result.post ? null : result.post,
        });
      },
      reloadPost(id: string): void {
        reloadPostRx(id);
      },
      createPost(value: PostFormValue): void {
        const user = auth.currentUser();
        if (!user) {
          return;
        }

        const payload: CreatePostDto = {
          ...value,
          author: value.author,
          status: auth.isAdmin() ? POST_STATUS.approved : POST_STATUS.pending,
          submittedBy: user.id,
          pendingReason: auth.isAdmin() ? undefined : POST_PENDING_REASON.new,
        };

        persistRx({
          request: () => api.createPost(payload),
          onSuccess: (post) => {
            if (auth.isAdmin()) {
              navigate(router, ['/posts', post.id]);
              return;
            }

            navigate(router, ['/posts/my'], {
              queryParams: { tab: 'under-review' },
            });
          },
        });
      },
      updatePost(id: string, value: PostFormValue): void {
        const user = auth.currentUser();
        const existingPost = store.post();

        if (!user) {
          return;
        }

        const payload: UpdatePostDto = { ...value };
        const isOwnerApprovedResubmit =
          !auth.isAdmin() &&
          existingPost?.submittedBy === user.id &&
          existingPost.status === POST_STATUS.approved;
        const isOwnerRejectedResubmit =
          !auth.isAdmin() &&
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
          payload.rejectedAt = null;
          payload.previousVersion = null;
        }

        const redirectToUnderReview = isOwnerApprovedResubmit || isOwnerRejectedResubmit;

        persistRx({
          request: () => api.updatePost(id, payload),
          onSuccess: (post) => {
            if (redirectToUnderReview) {
              navigate(router, ['/posts/my'], {
                queryParams: { tab: 'under-review' },
              });
              return;
            }

            navigate(router, ['/posts', post.id]);
          },
        });
      },
    };
  }),
);

function navigate(router: Router, commands: unknown[], extras?: NavigationExtras): void {
  void router.navigate(commands, extras);
}

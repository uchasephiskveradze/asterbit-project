import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, finalize, Observable, of, pipe, switchMap, tap } from 'rxjs';

import { PostsApiService } from '../services/posts-api.service';
import { Post } from '../models/post.model';
import { POST_STATUS, PostStatus } from '../models/post-status.model';
import { PostResolverResult } from '../models/post-resolver-result.model';

type PostDetailsState = {
  loading: boolean;
  deleting: boolean;
  moderating: boolean;
  error: string | null;
  notFound: boolean;
  post: Post | null;
  _lastId: string | null;
};

export const PostDetailsStore = signalStore(
  withState<PostDetailsState>({
    loading: false,
    deleting: false,
    moderating: false,
    error: null,
    notFound: false,
    post: null,
    _lastId: null,
  }),
  withMethods((store, api = inject(PostsApiService)) => {
    const loadPostRx = rxMethod<{ id: string; force?: boolean }>(
      pipe(
        tap(({ id }) =>
          patchState(store, {
            _lastId: id,
            loading: true,
            error: null,
            notFound: false,
            post: null,
          }),
        ),
        switchMap(({ id, force }) =>
          api.getPostById(id, force ? { force: true } : undefined).pipe(
            catchError((err: HttpErrorResponse) => {
              if (err.status === 404) {
                patchState(store, { notFound: true });
                return of(null);
              }

              patchState(store, { error: 'errors.posts.loadOne' });
              return of(null);
            }),
            finalize(() => patchState(store, { loading: false })),
          ),
        ),
        tap((post) => {
          if (post) {
            patchState(store, { post });
          }
        }),
      ),
    );

    const moderatePostRx = rxMethod<{
      postId: string;
      status: typeof POST_STATUS.approved | typeof POST_STATUS.rejected;
      rejectionReason?: string;
    }>(
      pipe(
        tap(() => patchState(store, { moderating: true, error: null })),
        switchMap(({ postId, status, rejectionReason }) =>
          api.updatePostStatus(postId, status, {
            rejectionReason: status === POST_STATUS.rejected ? rejectionReason : undefined,
          }).pipe(
            catchError(() => {
              patchState(store, { error: 'errors.posts.updateStatus' });
              return of(null);
            }),
            finalize(() => patchState(store, { moderating: false })),
          ),
        ),
        tap((updated) => {
          if (updated) {
            patchState(store, { post: updated });
          }
        }),
      ),
    );

    return {
      loadPost(id: string, options?: { force?: boolean }): void {
        loadPostRx({ id, force: options?.force });
      },
      applyResolverResult(id: string, result: PostResolverResult): void {
        patchState(store, {
          _lastId: id,
          loading: false,
          error: result.error,
          notFound: result.notFound,
          post: result.post,
        });
      },
      retry(): void {
        const lastId = store._lastId();
        if (lastId) {
          loadPostRx({ id: lastId, force: true });
        }
      },
      deletePost(id: string): Observable<void> {
        patchState(store, { deleting: true, error: null });
        return api.deletePost(id).pipe(
          catchError(() => {
            patchState(store, { error: 'errors.posts.delete' });
            return EMPTY;
          }),
          finalize(() => patchState(store, { deleting: false })),
        );
      },
      moderatePost(
        status: typeof POST_STATUS.approved | typeof POST_STATUS.rejected,
        rejectionReason?: string,
      ): void {
        const post = store.post();
        if (!post || store.moderating()) {
          return;
        }

        moderatePostRx({ postId: post.id, status, rejectionReason });
      },
    };
  }),
);

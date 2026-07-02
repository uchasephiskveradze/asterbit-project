import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, finalize, of, pipe, switchMap, tap } from 'rxjs';

import { PostsApiService } from '../services/posts-api.service';
import { Post } from '../models/post.model';
import { PostsListQuery } from '../models/posts-list-query.model';
import { POST_STATUS } from '../models/post-status.model';

type ModerationState = {
  loading: boolean;
  actingOnId: string | null;
  error: string | null;
  posts: Post[];
};

export const ModerationStore = signalStore(
  withState<ModerationState>({
    loading: false,
    actingOnId: null,
    error: null,
    posts: [],
  }),
  withComputed((store) => ({
    pendingPosts: computed(() => store.posts()),
  })),
  withMethods((store, api = inject(PostsApiService)) => {
    const loadPostsRx = rxMethod<boolean>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((force) =>
          api.getPosts({ force, query: buildListQuery() }).pipe(
            catchError(() => {
              patchState(store, { error: 'errors.posts.moderationLoad' });
              return of({ posts: [], totalItems: 0 });
            }),
            finalize(() => patchState(store, { loading: false })),
          ),
        ),
        tap((result) => patchState(store, { posts: result.posts })),
      ),
    );

    const moderatePostRx = rxMethod<{
      id: string;
      status: typeof POST_STATUS.approved | typeof POST_STATUS.rejected;
      rejectionReason?: string;
    }>(
      pipe(
        tap(({ id }) => patchState(store, { actingOnId: id, error: null })),
        switchMap(({ id, status, rejectionReason }) =>
          api.updatePostStatus(id, status, {
            rejectionReason: status === POST_STATUS.rejected ? rejectionReason : undefined,
          }).pipe(
            catchError(() => {
              patchState(store, { error: 'errors.posts.updateStatus' });
              return of(null);
            }),
            finalize(() => patchState(store, { actingOnId: null })),
          ),
        ),
        tap((post) => {
          if (!post) {
            return;
          }

          patchState(store, { posts: store.posts().filter((item) => item.id !== post.id) });
        }),
      ),
    );

    loadPostsRx(false);

    return {
      loadPosts(force = false): void {
        loadPostsRx(force);
      },
      moderatePost(
        id: string,
        status: typeof POST_STATUS.approved | typeof POST_STATUS.rejected,
        rejectionReason?: string,
      ): void {
        moderatePostRx({ id, status, rejectionReason });
      },
    };
  }),
);

function buildListQuery(): PostsListQuery {
  return { status: POST_STATUS.pending };
}

import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, finalize, of, pipe, switchMap, tap } from 'rxjs';

import { AuthService } from '../../../core/auth/services/auth.service';
import { PostsApiService } from '../services/posts-api.service';
import { Post } from '../models/post.model';
import { PostsListQuery } from '../models/posts-list-query.model';
import {
  isMyPostsTab,
  MY_POSTS_TAB_STATUS,
  MyPostsTab,
} from '../models/post-status.model';

type MyPostsState = {
  loading: boolean;
  error: string | null;
  posts: Post[];
  activeTab: MyPostsTab;
  _loadGeneration: number;
};

export const MyPostsStore = signalStore(
  withState<MyPostsState>({
    loading: false,
    error: null,
    posts: [],
    activeTab: 'under-review',
    _loadGeneration: 0,
  }),
  withComputed((store, auth = inject(AuthService)) => ({
    filteredPosts: computed(() => {
      const user = auth.currentUser();

      if (!user) {
        return [];
      }

      const owned = store.posts().filter((post) => post.submittedBy === user.id);

      if (store.activeTab() !== 'rejected') {
        return owned;
      }

      return [...owned].sort((left, right) => {
        const leftTime = Date.parse(left.rejectedAt ?? left.createdAt);
        const rightTime = Date.parse(right.rejectedAt ?? right.createdAt);
        return rightTime - leftTime;
      });
    }),
  })),
  withMethods((store, api = inject(PostsApiService)) => {
    const loadPostsRx = rxMethod<boolean>(
      pipe(
        tap(() =>
          patchState(store, (state) => ({
            loading: true,
            error: null,
            _loadGeneration: state._loadGeneration + 1,
          })),
        ),
        switchMap((force) => {
          const generation = store._loadGeneration();
          return api.getPosts({ force, query: buildMyPostsListQuery(store.activeTab()) }).pipe(
            catchError(() => {
              if (generation === store._loadGeneration()) {
                patchState(store, { error: 'errors.posts.myPostsLoad' });
              }
              return of({ posts: [], totalItems: 0 });
            }),
            finalize(() => {
              if (generation === store._loadGeneration()) {
                patchState(store, { loading: false });
              }
            }),
            tap((result) => {
              if (generation === store._loadGeneration()) {
                patchState(store, { posts: result.posts });
              }
            }),
          );
        }),
      ),
    );

    return {
      initializeTab(tab: string | null): void {
        patchState(store, { activeTab: isMyPostsTab(tab) ? tab : 'under-review' });
        loadPostsRx(false);
      },
      setTab(tab: MyPostsTab): void {
        if (store.activeTab() === tab) {
          return;
        }

        patchState(store, { activeTab: tab });
        loadPostsRx(false);
      },
      setTabFromQuery(tab: string | null): void {
        if (!isMyPostsTab(tab) || store.activeTab() === tab) {
          return;
        }

        patchState(store, { activeTab: tab });
        loadPostsRx(false);
      },
      loadPosts(force = false): void {
        loadPostsRx(force);
      },
      retry(): void {
        loadPostsRx(true);
      },
    };
  }),
);

function buildMyPostsListQuery(activeTab: MyPostsTab): PostsListQuery {
  const query: PostsListQuery = {
    status: MY_POSTS_TAB_STATUS[activeTab],
  };

  if (activeTab === 'rejected') {
    query.sort = 'rejectedAt';
    query.order = 'desc';
  }

  return query;
}

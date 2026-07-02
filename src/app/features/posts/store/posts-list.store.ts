import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, finalize, of, pipe, switchMap, tap } from 'rxjs';

import { PostsApiService } from '../services/posts-api.service';
import { PostsViewStorageService } from '../services/posts-view-storage.service';
import { Post } from '../models/post.model';
import { PostsListQuery } from '../models/posts-list-query.model';
import { PostsListResult } from '../models/posts-list-result.model';
import { PostsListViewMode } from '../models/posts-list-view-mode.model';
import { POST_STATUS } from '../models/post-status.model';
import { POSTS_PAGE_SIZE, PostDateSort } from './posts-list.types';

const emptyListResult = (): PostsListResult => ({ posts: [], totalItems: 0 });

type PostsListState = {
  loading: boolean;
  filtering: boolean;
  error: string | null;
  posts: Post[];
  totalItems: number;
  searchInput: string;
  searchQuery: string;
  sortOrder: PostDateSort;
  viewMode: PostsListViewMode;
  currentPage: number;
  visibleCount: number;
  initialized: boolean;
};

const initialState = (viewMode: PostsListViewMode): PostsListState => ({
  loading: false,
  filtering: false,
  error: null,
  posts: [],
  totalItems: 0,
  searchInput: '',
  searchQuery: '',
  sortOrder: 'desc',
  viewMode,
  currentPage: 1,
  visibleCount: POSTS_PAGE_SIZE,
  initialized: false,
});

export const PostsListStore = signalStore(
  withState(() => initialState(inject(PostsViewStorageService).read())),
  withProps(() => ({ pageSize: POSTS_PAGE_SIZE })),
  withComputed((store) => ({
    filteredPosts: computed(() => store.posts()),
    isPaginationMode: computed(() => store.viewMode() === 'pagination'),
    isInfiniteScrollMode: computed(() => store.viewMode() === 'infinite-scroll'),
    totalPages: computed(() => Math.max(1, Math.ceil(store.totalItems() / store.pageSize))),
    displayedPosts: computed(() => store.posts()),
    hasMorePosts: computed(
      () => store.viewMode() === 'infinite-scroll' && store.posts().length < store.totalItems(),
    ),
    rangeStart: computed(() => {
      if (store.totalItems() === 0) {
        return 0;
      }

      if (store.viewMode() === 'pagination') {
        return (store.currentPage() - 1) * store.pageSize + 1;
      }

      return 1;
    }),
    rangeEnd: computed(() => {
      if (store.viewMode() === 'pagination') {
        return Math.min(store.currentPage() * store.pageSize, store.totalItems());
      }

      return Math.min(store.posts().length, store.totalItems());
    }),
    isEmpty: computed(
      () =>
        !store.loading() &&
        !store.error() &&
        store.posts().length === 0 &&
        !hasActiveFilters(store.searchQuery()),
    ),
    isEmptySearch: computed(
      () =>
        !store.loading() &&
        !store.filtering() &&
        !store.error() &&
        hasActiveFilters(store.searchQuery()) &&
        store.posts().length === 0,
    ),
  })),
  withMethods((store, api = inject(PostsApiService), viewStorage = inject(PostsViewStorageService)) => {
    const loadPostsRx = rxMethod<boolean>(
      pipe(
        tap(() => {
          patchState(store, {
            loading: !store.initialized(),
            filtering: store.initialized(),
            error: null,
          });
        }),
        switchMap((force) =>
          api.getPosts({ force, query: buildListQuery(store) }).pipe(
            catchError(() => {
              patchState(store, { error: 'errors.posts.load' });
              return of(emptyListResult());
            }),
            finalize(() => {
              patchState(store, {
                loading: false,
                filtering: false,
                initialized: true,
              });
            }),
          ),
        ),
        tap((result) => {
          patchState(store, {
            posts: result.posts,
            totalItems: result.totalItems,
          });
        }),
      ),
    );

    const applySearchRx = rxMethod<string>(
      pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap((query) => {
          if (query === store.searchQuery()) {
            patchState(store, { filtering: false });
            return;
          }

          patchState(store, {
            searchQuery: query,
            currentPage: 1,
            visibleCount: store.pageSize,
          });
          loadPostsRx(false);
        }),
      ),
    );

    return {
      loadPosts(force = false): void {
        loadPostsRx(force);
      },
      setSearchInput(query: string): void {
        patchState(store, { searchInput: query });

        if (query === store.searchQuery()) {
          patchState(store, { filtering: false });
          return;
        }

        patchState(store, { filtering: true });
        applySearchRx(query);
      },
      setSortOrder(order: PostDateSort): void {
        if (store.sortOrder() === order) {
          return;
        }

        patchState(store, {
          filtering: true,
          sortOrder: order,
          currentPage: 1,
          visibleCount: store.pageSize,
        });
        loadPostsRx(false);
      },
      setViewMode(mode: PostsListViewMode): void {
        if (store.viewMode() === mode) {
          return;
        }

        viewStorage.write(mode);
        patchState(store, {
          viewMode: mode,
          currentPage: 1,
          visibleCount: store.pageSize,
        });
        loadPostsRx(false);
      },
      setPage(page: number): void {
        const nextPage = Math.min(Math.max(1, page), store.totalPages());

        if (nextPage === store.currentPage()) {
          return;
        }

        patchState(store, { currentPage: nextPage });
        loadPostsRx(false);
      },
      loadMore(): void {
        if (!store.hasMorePosts()) {
          return;
        }

        patchState(store, {
          visibleCount: Math.min(store.visibleCount() + store.pageSize, store.totalItems()),
        });
        loadPostsRx(false);
      },
      retry(): void {
        loadPostsRx(true);
      },
    };
  }),
);

function buildListQuery(store: {
  currentPage: () => number;
  isInfiniteScrollMode: () => boolean;
  isPaginationMode: () => boolean;
  pageSize: number;
  searchQuery: () => string;
  sortOrder: () => PostDateSort;
  visibleCount: () => number;
}): PostsListQuery {
  const query = store.searchQuery().trim();
  const base: PostsListQuery = {
    status: POST_STATUS.approved,
    titleLike: query || undefined,
    sort: 'createdAt',
    order: store.sortOrder(),
  };

  if (store.isPaginationMode()) {
    return {
      ...base,
      page: store.currentPage(),
      limit: store.pageSize,
    };
  }

  if (store.isInfiniteScrollMode()) {
    return {
      ...base,
      page: 1,
      limit: store.visibleCount(),
    };
  }

  return base;
}

function hasActiveFilters(searchQuery: string): boolean {
  return searchQuery.trim().length > 0;
}

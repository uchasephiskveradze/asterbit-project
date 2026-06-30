import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, debounceTime, distinctUntilChanged, finalize, of, startWith, Subject, switchMap, tap } from 'rxjs';

import { PostsApiService } from '../services/posts-api.service';
import { PostsViewStorageService } from '../services/posts-view-storage.service';
import { Post } from '../models/post.model';
import { PostsListQuery } from '../models/posts-list-query.model';
import { PostsListViewMode } from '../models/posts-list-view-mode.model';
import { POSTS_PAGE_SIZE, PostDateSort } from './posts-list.types';

@Injectable()
export class PostsListStore {
  private readonly api = inject(PostsApiService);
  private readonly viewStorage = inject(PostsViewStorageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchInput$ = new Subject<string>();
  private readonly sortOrder$ = new Subject<PostDateSort>();
  private readonly page$ = new Subject<number>();
  private readonly refresh$ = new Subject<boolean>();

  public readonly pageSize = POSTS_PAGE_SIZE;

  public readonly loading = signal(false);
  public readonly filtering = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly posts = signal<Post[]>([]);
  public readonly searchInput = signal('');
  public readonly searchQuery = signal('');
  public readonly sortOrder = signal<PostDateSort>('desc');
  public readonly viewMode = signal<PostsListViewMode>(this.viewStorage.read());
  public readonly currentPage = signal(1);
  public readonly visibleCount = signal(POSTS_PAGE_SIZE);

  public readonly filteredPosts = computed(() => this.posts());

  public readonly totalItems = computed(() => this.filteredPosts().length);

  public readonly isPaginationMode = computed(() => this.viewMode() === 'pagination');

  public readonly isInfiniteScrollMode = computed(() => this.viewMode() === 'infinite-scroll');

  public readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.pageSize)),
  );

  public readonly displayedPosts = computed(() => {
    if (this.isPaginationMode()) {
      const start = (this.currentPage() - 1) * this.pageSize;
      return this.filteredPosts().slice(start, start + this.pageSize);
    }

    return this.filteredPosts().slice(0, this.visibleCount());
  });

  public readonly hasMorePosts = computed(
    () => this.isInfiniteScrollMode() && this.visibleCount() < this.filteredPosts().length,
  );

  public readonly rangeStart = computed(() => {
    if (this.totalItems() === 0) {
      return 0;
    }

    if (this.isPaginationMode()) {
      return (this.currentPage() - 1) * this.pageSize + 1;
    }

    return 1;
  });

  public readonly rangeEnd = computed(() => {
    if (this.isPaginationMode()) {
      return Math.min(this.currentPage() * this.pageSize, this.totalItems());
    }

    return Math.min(this.visibleCount(), this.totalItems());
  });

  public readonly isEmpty = computed(
    () => !this.loading() && !this.error() && this.posts().length === 0 && !this.hasActiveFilters(),
  );

  public readonly isEmptySearch = computed(
    () =>
      !this.loading() &&
      !this.filtering() &&
      !this.error() &&
      this.hasActiveFilters() &&
      this.filteredPosts().length === 0,
  );

  public constructor() {
    combineLatest([
      this.searchInput$.pipe(
        tap((query) => {
          this.filtering.set(query !== this.searchQuery());
        }),
        debounceTime(300),
        distinctUntilChanged(),
        startWith(this.searchInput()),
      ),
      this.sortOrder$.pipe(startWith(this.sortOrder())),
      this.page$.pipe(startWith(this.currentPage())),
    ])
      .pipe(
        switchMap(([query, sort, page]) =>
          of({ query, sort, page }).pipe(
            tap(({ query, sort, page }) => {
              const queryChanged = query !== this.searchQuery();
              const sortChanged = sort !== this.sortOrder();

              this.searchQuery.set(query);
              this.sortOrder.set(sort);

              if (queryChanged || sortChanged) {
                this.currentPage.set(1);
                this.visibleCount.set(this.pageSize);
                this.refresh$.next(true);
              } else {
                this.currentPage.set(page);
              }

              this.filtering.set(false);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    this.refresh$
      .pipe(
        switchMap((force) => {
          this.loading.set(true);
          this.error.set(null);

          return this.api.getPosts({ force, query: this.buildListQuery() }).pipe(
            catchError(() => {
              this.error.set('Unable to load posts. Please try again.');
              return of([] as Post[]);
            }),
            finalize(() => this.loading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((posts) => {
        this.posts.set(posts);
        this.resetListPosition();
        this.page$.next(1);
      });
  }

  public loadPosts(force = false): void {
    this.refresh$.next(force);
  }

  public setSearchInput(query: string): void {
    this.searchInput.set(query);

    if (query === this.searchQuery()) {
      this.filtering.set(false);
      return;
    }

    this.searchInput$.next(query);
  }

  public setSortOrder(order: PostDateSort): void {
    if (this.sortOrder() === order) {
      return;
    }

    this.sortOrder$.next(order);
  }

  public setViewMode(mode: PostsListViewMode): void {
    if (this.viewMode() === mode) {
      return;
    }

    this.viewMode.set(mode);
    this.viewStorage.write(mode);
    this.resetListPosition();
    this.page$.next(1);
  }

  public setPage(page: number): void {
    const nextPage = Math.min(Math.max(1, page), this.totalPages());

    if (nextPage === this.currentPage()) {
      return;
    }

    this.page$.next(nextPage);
  }

  public loadMore(): void {
    if (!this.hasMorePosts()) {
      return;
    }

    this.visibleCount.update((count) =>
      Math.min(count + this.pageSize, this.filteredPosts().length),
    );
  }

  public retry(): void {
    this.loadPosts(true);
  }

  private buildListQuery(): PostsListQuery {
    const query = this.searchQuery().trim();

    return {
      status: 'approved',
      titleLike: query || undefined,
      sort: 'createdAt',
      order: this.sortOrder(),
    };
  }

  private hasActiveFilters(): boolean {
    return this.searchQuery().trim().length > 0;
  }

  private resetListPosition(): void {
    this.currentPage.set(1);
    this.visibleCount.set(this.pageSize);
  }
}

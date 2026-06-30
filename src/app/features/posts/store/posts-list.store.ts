import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, debounceTime, distinctUntilChanged, finalize, of, startWith, Subject, switchMap, tap } from 'rxjs';

import { PostsApiService } from '../services/posts-api.service';
import { PostsPermissionService } from '../services/posts-permission.service';
import { PostsViewStorageService } from '../services/posts-view-storage.service';
import { Post } from '../models/post.model';
import { PostsListViewMode } from '../models/posts-list-view-mode.model';
import { POSTS_PAGE_SIZE, PostDateSort } from './posts-list.types';

@Injectable()
export class PostsListStore {
  private readonly api = inject(PostsApiService);
  private readonly access = inject(PostsPermissionService);
  private readonly viewStorage = inject(PostsViewStorageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchInput$ = new Subject<string>();
  private readonly sortOrder$ = new Subject<PostDateSort>();
  private readonly page$ = new Subject<number>();

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

  public readonly filteredPosts = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    let result = this.posts().filter((post) => this.access.isPubliclyListed(post));

    if (query) {
      result = result.filter((post) => post.title.toLowerCase().includes(query));
    }

    const order = this.sortOrder();

    return [...result].sort((left, right) => {
      const diff =
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      return order === 'desc' ? diff : -diff;
    });
  });

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
    () => !this.loading() && !this.error() && this.posts().length === 0,
  );

  public readonly isEmptySearch = computed(
    () =>
      !this.loading() &&
      !this.filtering() &&
      !this.error() &&
      this.posts().length > 0 &&
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
  }

  public loadPosts(force = false): void {
    this.loading.set(true);
    this.error.set(null);

    this.api
      .getPosts(force ? { force: true } : undefined)
      .pipe(
        tap(() => this.error.set(null)),
        catchError(() => {
          this.error.set('Unable to load posts. Please try again.');
          return of([] as Post[]);
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((posts) => {
        this.posts.set(posts);
        this.resetListPosition();
        this.page$.next(1);
      });
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

  private resetListPosition(): void {
    this.currentPage.set(1);
    this.visibleCount.set(this.pageSize);
  }
}

import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, finalize, of, Subject, tap } from 'rxjs';

import { PostsApiService } from '../data-access/posts-api.service';
import { Post } from '../models/post.model';
import { POSTS_PAGE_SIZE, PostDateSort } from './posts-list.types';

@Injectable()
export class PostsListStore {
  private readonly api = inject(PostsApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchInput$ = new Subject<string>();

  public readonly pageSize = POSTS_PAGE_SIZE;

  public readonly loading = signal(false);
  public readonly filtering = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly posts = signal<Post[]>([]);
  public readonly searchInput = signal('');
  public readonly searchQuery = signal('');
  public readonly sortOrder = signal<PostDateSort>('desc');
  public readonly currentPage = signal(1);

  public readonly filteredPosts = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    let result = this.posts();

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

  public readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.pageSize)),
  );

  public readonly paginatedPosts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredPosts().slice(start, start + this.pageSize);
  });

  public readonly rangeStart = computed(() =>
    this.totalItems() === 0 ? 0 : (this.currentPage() - 1) * this.pageSize + 1,
  );

  public readonly rangeEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize, this.totalItems()),
  );

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
    this.searchInput$
      .pipe(
        tap((query) => {
          this.filtering.set(query !== this.searchQuery());
        }),
        debounceTime(200),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((query) => {
        this.searchQuery.set(query);
        this.currentPage.set(1);
        this.filtering.set(false);
      });
  }

  public loadPosts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api
      .getPosts()
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
        this.currentPage.set(1);
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
    this.sortOrder.set(order);
    this.currentPage.set(1);
  }

  public setPage(page: number): void {
    const nextPage = Math.min(Math.max(page, 1), this.totalPages());
    this.currentPage.set(nextPage);
  }

  public retry(): void {
    this.loadPosts();
  }
}

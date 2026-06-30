import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, of, tap } from 'rxjs';

import { PostsApiService } from '../data-access/posts-api.service';
import { Post } from '../models/post.model';
import { POSTS_PAGE_SIZE, PostDateSort } from './posts-list.types';

@Injectable()
export class PostsListStore {
  private readonly api = inject(PostsApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly pageSize = POSTS_PAGE_SIZE;

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly posts = signal<Post[]>([]);
  readonly searchQuery = signal('');
  readonly sortOrder = signal<PostDateSort>('desc');
  readonly currentPage = signal(1);

  readonly filteredPosts = computed(() => {
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

  readonly totalItems = computed(() => this.filteredPosts().length);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.pageSize)),
  );

  readonly paginatedPosts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredPosts().slice(start, start + this.pageSize);
  });

  readonly rangeStart = computed(() =>
    this.totalItems() === 0 ? 0 : (this.currentPage() - 1) * this.pageSize + 1,
  );

  readonly rangeEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize, this.totalItems()),
  );

  readonly isEmpty = computed(
    () => !this.loading() && !this.error() && this.posts().length === 0,
  );

  readonly isEmptySearch = computed(
    () =>
      !this.loading() &&
      !this.error() &&
      this.posts().length > 0 &&
      this.filteredPosts().length === 0,
  );

  loadPosts(): void {
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

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  setSortOrder(order: PostDateSort): void {
    this.sortOrder.set(order);
    this.currentPage.set(1);
  }

  setPage(page: number): void {
    const nextPage = Math.min(Math.max(page, 1), this.totalPages());
    this.currentPage.set(nextPage);
  }

  retry(): void {
    this.loadPosts();
  }
}

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { finalize, map, Observable, of, shareReplay, tap } from 'rxjs';

import { LruCache } from '../../../core/utils/lru-cache';
import { API_BASE_URL } from '../../../core/config';
import { CreatePostDto } from '../models/create-post.dto';
import { JsonServerPostsListResponse } from '../models/json-server-paginated-response.model';
import { Post } from '../models/post.model';
import { PostResponse } from '../models/post-response.model';
import { PostsListQuery } from '../models/posts-list-query.model';
import { PostsListResult } from '../models/posts-list-result.model';
import { PostPendingReason, POST_PENDING_REASON } from '../models/post-revision.model';
import { PostsRequestOptions } from '../models/posts-request-options.model';
import { isPostStatus, POST_STATUS, PostStatus } from '../models/post-status.model';
import { UpdatePostDto } from '../models/update-post.dto';
import { buildJsonServerSortParam } from '../utils/json-server-query.utils';

const POST_BY_ID_CACHE_MAX_SIZE = 100;
const ALL_POSTS_CACHE_KEY = '__all__';

@Injectable({
  providedIn: 'root',
})
export class PostsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private readonly listQueryCache = new Map<string, PostsListResult>();
  private readonly listQueryInFlight = new Map<string, Observable<PostsListResult>>();
  private readonly postByIdCache = new LruCache<string, Post>(POST_BY_ID_CACHE_MAX_SIZE);
  private readonly postByIdInFlight = new Map<string, Observable<Post>>();

  public getPosts(options?: PostsRequestOptions): Observable<PostsListResult> {
    const force = options?.force ?? false;
    const cacheKey = this.getListCacheKey(options?.query);

    if (!force) {
      const cached = this.listQueryCache.get(cacheKey);

      if (cached) {
        return of(cached);
      }

      const inFlight = this.listQueryInFlight.get(cacheKey);

      if (inFlight) {
        return inFlight;
      }
    }

    const request$ = this.http
      .get<JsonServerPostsListResponse>(`${this.apiBaseUrl}/posts`, {
        params: this.buildQueryParams(options?.query),
      })
      .pipe(
        map((response) => this.normalizeListResponse(response)),
        tap((result) => {
          this.listQueryCache.set(cacheKey, result);
          result.posts.forEach((post) => this.postByIdCache.set(post.id, post));
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
        finalize(() => {
          this.listQueryInFlight.delete(cacheKey);
        }),
      );

    this.listQueryInFlight.set(cacheKey, request$);

    return request$;
  }

  public getPostById(id: string, options?: PostsRequestOptions): Observable<Post> {
    const force = options?.force ?? false;

    if (!force) {
      const cached = this.postByIdCache.get(id);

      if (cached) {
        return of(cached);
      }

      const fromList = this.findPostInListCaches(id);

      if (fromList) {
        return of(fromList);
      }

      const inFlight = this.postByIdInFlight.get(id);

      if (inFlight) {
        return inFlight;
      }
    }

    const request$ = this.http.get<PostResponse>(`${this.apiBaseUrl}/posts/${id}`).pipe(
      map((post) => this.normalizePost(post)),
      tap((post) => this.postByIdCache.set(id, post)),
      shareReplay({ bufferSize: 1, refCount: true }),
      finalize(() => {
        this.postByIdInFlight.delete(id);
      }),
    );

    this.postByIdInFlight.set(id, request$);
    return request$;
  }

  public createPost(payload: CreatePostDto): Observable<Post> {
    return this.http
      .post<PostResponse>(`${this.apiBaseUrl}/posts`, {
        ...payload,
        createdAt: new Date().toISOString(),
      })
      .pipe(
        map((post) => this.normalizePost(post)),
        tap((post) => {
          this.postByIdCache.set(post.id, post);
          this.invalidateListCaches();
        }),
      );
  }

  public updatePost(id: string, payload: UpdatePostDto): Observable<Post> {
    return this.http.patch<PostResponse>(`${this.apiBaseUrl}/posts/${id}`, payload).pipe(
      map((post) => this.normalizePost(post)),
      tap((post) => {
        this.postByIdCache.set(post.id, post);
        this.invalidateListCaches();
      }),
    );
  }

  public updatePostStatus(
    id: string,
    status: PostStatus,
    options?: { rejectionReason?: string },
  ): Observable<Post> {
    const payload: UpdatePostDto = { status };

    if (status === POST_STATUS.approved || status === POST_STATUS.rejected) {
      payload.previousVersion = null;
      payload.pendingReason = null;
    }

    if (status === POST_STATUS.rejected) {
      payload.rejectionReason = options?.rejectionReason ?? null;
      payload.rejectedAt = new Date().toISOString();
    } else {
      payload.rejectionReason = null;
      payload.rejectedAt = null;
    }

    return this.updatePost(id, payload);
  }

  public deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/posts/${id}`).pipe(
      tap(() => {
        this.postByIdCache.delete(id);
        this.invalidateListCaches();
      }),
    );
  }

  public clearCache(): void {
    this.invalidateListCaches();
    this.postByIdCache.clear();
    this.postByIdInFlight.clear();
  }

  private getListCacheKey(query?: PostsListQuery): string {
    const params = this.buildQueryParams(query).toString();

    return params || ALL_POSTS_CACHE_KEY;
  }

  private findPostInListCaches(id: string): Post | undefined {
    for (const result of this.listQueryCache.values()) {
      const match = result.posts.find((post) => post.id === id);

      if (match) {
        return match;
      }
    }

    return undefined;
  }

  private invalidateListCaches(): void {
    this.listQueryCache.clear();
    this.listQueryInFlight.clear();
  }

  private buildQueryParams(query?: PostsListQuery): HttpParams {
    let params = new HttpParams();

    if (!query) {
      return params;
    }

    if (query.status) {
      params = params.set('status', query.status);
    }

    if (query.titleLike) {
      params = params.set('title:contains', query.titleLike);
    }

    if (query.sort) {
      params = params.set('_sort', buildJsonServerSortParam(query.sort, query.order));
    }

    if (query.page) {
      params = params.set('_page', String(query.page));
    }

    if (query.limit) {
      params = params.set('_per_page', String(query.limit));
    }

    return params;
  }

  private normalizeListResponse(response: JsonServerPostsListResponse): PostsListResult {
    if (Array.isArray(response)) {
      const posts = response.map((post) => this.normalizePost(post));

      return { posts, totalItems: posts.length };
    }

    const posts = response.data.map((post) => this.normalizePost(post));

    return { posts, totalItems: response.items };
  }

  private normalizePost(post: PostResponse): Post {
    const status = post.status && isPostStatus(post.status) ? post.status : POST_STATUS.pending;
    const pendingReason = this.normalizePendingReason(post.pendingReason);

    return {
      ...post,
      id: String(post.id),
      createdAt: post.createdAt ?? new Date().toISOString(),
      status,
      submittedBy: post.submittedBy ? String(post.submittedBy) : undefined,
      pendingReason,
      previousVersion: post.previousVersion,
    };
  }

  private normalizePendingReason(value: string | undefined): PostPendingReason | undefined {
    if (value === POST_PENDING_REASON.new || value === POST_PENDING_REASON.edited) {
      return value;
    }

    return undefined;
  }
}

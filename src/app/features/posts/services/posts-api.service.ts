import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root',
})
export class PostsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  public getPosts(options?: PostsRequestOptions): Observable<PostsListResult> {
    return this.http
      .get<JsonServerPostsListResponse>(`${this.apiBaseUrl}/posts`, {
        params: this.buildQueryParams(options?.query),
      })
      .pipe(map((response) => this.normalizeListResponse(response)));
  }

  public getPostById(id: string, options?: PostsRequestOptions): Observable<Post> {
    void options;
    return this.http.get<PostResponse>(`${this.apiBaseUrl}/posts/${id}`).pipe(
      map((post) => this.normalizePost(post)),
    );
  }

  public createPost(payload: CreatePostDto): Observable<Post> {
    return this.http
      .post<PostResponse>(`${this.apiBaseUrl}/posts`, {
        ...payload,
        createdAt: new Date().toISOString(),
      })
      .pipe(map((post) => this.normalizePost(post)));
  }

  public updatePost(id: string, payload: UpdatePostDto): Observable<Post> {
    return this.http
      .patch<PostResponse>(`${this.apiBaseUrl}/posts/${id}`, payload)
      .pipe(map((post) => this.normalizePost(post)));
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
    return this.http.delete<void>(`${this.apiBaseUrl}/posts/${id}`);
  }

  public clearCache(): void {
    // No-op: caching was intentionally removed to keep the service simple.
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

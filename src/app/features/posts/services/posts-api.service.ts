import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { finalize, map, Observable, of, shareReplay, tap } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';
import { CreatePostDto } from '../models/create-post.dto';
import { Post } from '../models/post.model';
import { PostResponse } from '../models/post-response.model';
import { PostPendingReason } from '../models/post-revision.model';
import { PostsRequestOptions } from '../models/posts-request-options.model';
import { PostStatus, isPostStatus } from '../models/post-status.model';
import { UpdatePostDto } from '../models/update-post.dto';

@Injectable({
  providedIn: 'root',
})
export class PostsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private listCache: Post[] | null = null;
  private listInFlight: Observable<Post[]> | null = null;
  private readonly postByIdCache = new Map<string, Post>();
  private readonly postByIdInFlight = new Map<string, Observable<Post>>();

  public getPosts(options?: PostsRequestOptions): Observable<Post[]> {
    const force = options?.force ?? false;

    if (!force && this.listCache !== null) {
      return of(this.listCache);
    }

    if (!force && this.listInFlight) {
      return this.listInFlight;
    }

    const request$ = this.http
      .get<PostResponse[]>(`${this.apiBaseUrl}/posts`)
      .pipe(
        map((posts) => posts.map((post) => this.normalizePost(post))),
        tap((posts) => this.seedListCache(posts)),
        shareReplay({ bufferSize: 1, refCount: true }),
        finalize(() => {
          this.listInFlight = null;
        }),
      );

    this.listInFlight = request$;
    return request$;
  }

  public getPostById(id: string, options?: PostsRequestOptions): Observable<Post> {
    const force = options?.force ?? false;

    if (!force) {
      const cached = this.postByIdCache.get(id);
      if (cached) {
        return of(cached);
      }

      const fromList = this.listCache?.find((post) => post.id === id);
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
        tap((post) => this.upsertInCache(post)),
      );
  }

  public updatePost(id: string, payload: UpdatePostDto): Observable<Post> {
    return this.http.patch<PostResponse>(`${this.apiBaseUrl}/posts/${id}`, payload).pipe(
      map((post) => this.normalizePost(post)),
      tap((post) => this.upsertInCache(post)),
    );
  }

  public updatePostStatus(id: string, status: PostStatus): Observable<Post> {
    const payload: UpdatePostDto = { status };

    if (status === 'approved' || status === 'rejected') {
      payload.previousVersion = null;
      payload.pendingReason = null;
    }

    return this.updatePost(id, payload);
  }

  public deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/posts/${id}`).pipe(
      tap(() => this.removeFromCache(id)),
    );
  }

  public clearCache(): void {
    this.listCache = null;
    this.listInFlight = null;
    this.postByIdCache.clear();
    this.postByIdInFlight.clear();
  }

  private seedListCache(posts: Post[]): void {
    this.listCache = posts;
    posts.forEach((post) => this.postByIdCache.set(post.id, post));
  }

  private upsertInCache(post: Post): void {
    this.postByIdCache.set(post.id, post);

    if (this.listCache === null) {
      return;
    }

    const index = this.listCache.findIndex((item) => item.id === post.id);
    if (index === -1) {
      this.listCache = [...this.listCache, post];
      return;
    }

    this.listCache = this.listCache.map((item) => (item.id === post.id ? post : item));
  }

  private removeFromCache(id: string): void {
    this.postByIdCache.delete(id);

    if (this.listCache !== null) {
      this.listCache = this.listCache.filter((post) => post.id !== id);
    }
  }

  private normalizePost(post: PostResponse): Post {
    const status = post.status && isPostStatus(post.status) ? post.status : 'approved';
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
    if (value === 'new' || value === 'edited') {
      return value;
    }

    return undefined;
  }
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';
import { CreatePostDto } from '../models/create-post.dto';
import { Post } from '../models/post.model';
import { PostPendingReason } from '../models/post-revision.model';
import { PostStatus, isPostStatus } from '../models/post-status.model';
import { UpdatePostDto } from '../models/update-post.dto';

type PostResponse = Omit<Post, 'id'> & {
  id: string | number;
  status?: string;
  pendingReason?: string;
};

@Injectable({
  providedIn: 'root',
})
export class PostsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  public getPosts(): Observable<Post[]> {
    return this.http
      .get<PostResponse[]>(`${this.apiBaseUrl}/posts`)
      .pipe(map((posts) => posts.map((post) => this.normalizePost(post))));
  }

  public getPostById(id: string): Observable<Post> {
    return this.http
      .get<PostResponse>(`${this.apiBaseUrl}/posts/${id}`)
      .pipe(map((post) => this.normalizePost(post)));
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

  public updatePostStatus(id: string, status: PostStatus): Observable<Post> {
    const payload: UpdatePostDto = { status };

    if (status === 'approved' || status === 'rejected') {
      payload.previousVersion = null;
      payload.pendingReason = null;
    }

    return this.updatePost(id, payload);
  }

  public deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/posts/${id}`);
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

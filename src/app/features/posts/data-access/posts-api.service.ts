import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';
import { CreatePostDto } from '../models/create-post.dto';
import { Post } from '../models/post.model';
import { UpdatePostDto } from '../models/update-post.dto';

type PostResponse = Omit<Post, 'id'> & {
  id: number | string;
};

@Injectable({
  providedIn: 'root',
})
export class PostsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getPosts(): Observable<Post[]> {
    return this.http
      .get<PostResponse[]>(`${this.apiBaseUrl}/posts`)
      .pipe(map((posts) => posts.map((post) => this.normalizePost(post))));
  }

  getPostById(id: number | string): Observable<Post> {
    return this.http
      .get<PostResponse>(`${this.apiBaseUrl}/posts/${id}`)
      .pipe(map((post) => this.normalizePost(post)));
  }

  createPost(payload: CreatePostDto): Observable<Post> {
    return this.http
      .post<PostResponse>(`${this.apiBaseUrl}/posts`, {
        ...payload,
        createdAt: payload.createdAt ?? new Date().toISOString(),
      })
      .pipe(map((post) => this.normalizePost(post)));
  }

  updatePost(id: number | string, payload: UpdatePostDto): Observable<Post> {
    return this.http
      .patch<PostResponse>(`${this.apiBaseUrl}/posts/${id}`, payload)
      .pipe(map((post) => this.normalizePost(post)));
  }

  deletePost(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/posts/${id}`);
  }

  private normalizePost(post: PostResponse): Post {
    return {
      ...post,
      id: Number(post.id),
    };
  }
}

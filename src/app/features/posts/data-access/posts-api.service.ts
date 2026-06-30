import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';
import { CreatePostDto } from '../models/create-post.dto';
import { Post } from '../models/post.model';
import { UpdatePostDto } from '../models/update-post.dto';

type PostResponse = Omit<Post, 'id'> & {
  id: string | number;
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

  public deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/posts/${id}`);
  }

  private normalizePost(post: PostResponse): Post {
    return {
      ...post,
      id: String(post.id),
      createdAt: post.createdAt ?? new Date().toISOString(),
    };
  }
}

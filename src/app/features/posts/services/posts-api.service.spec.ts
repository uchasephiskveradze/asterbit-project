import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../../../core/config';
import { Post } from '../models/post.model';
import { PostsListResult } from '../models/posts-list-result.model';
import { PostsApiService } from './posts-api.service';

describe('PostsApiService', () => {
  let service: PostsApiService;
  let httpMock: HttpTestingController;

  const mockPosts: Post[] = [
    {
      id: '1',
      title: 'First',
      author: 'Author',
      description: 'Description',
      content: 'Content',
      createdAt: '2026-01-01T00:00:00.000Z',
      status: 'approved',
    },
    {
      id: '2',
      title: 'Second',
      author: 'Author',
      description: 'Description',
      content: 'Content',
      createdAt: '2026-01-02T00:00:00.000Z',
      status: 'pending',
    },
  ];

  const mockListResult = (posts: Post[] = mockPosts): PostsListResult => ({
    posts,
    totalItems: posts.length,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });

    service = TestBed.inject(PostsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.clearCache();
  });

  it('should cache the posts list after the first request', async () => {
    const firstPromise = firstValueFrom(service.getPosts());
    httpMock.expectOne('/api/posts').flush(mockPosts);
    await firstPromise;

    const secondPromise = firstValueFrom(service.getPosts());
    httpMock.expectNone('/api/posts');

    await expect(secondPromise).resolves.toEqual(mockListResult());
  });

  it('should bypass the cache when force is true', async () => {
    const firstPromise = firstValueFrom(service.getPosts());
    httpMock.expectOne('/api/posts').flush(mockPosts);
    await firstPromise;

    const secondPromise = firstValueFrom(service.getPosts({ force: true }));
    httpMock.expectOne('/api/posts').flush(mockPosts);

    await expect(secondPromise).resolves.toEqual(mockListResult());
  });

  it('should default unknown post statuses to pending', async () => {
    const promise = firstValueFrom(service.getPosts());
    httpMock.expectOne('/api/posts').flush([
      {
        ...mockPosts[0],
        status: 'draft',
      },
    ]);

    await expect(promise).resolves.toEqual(mockListResult([{ ...mockPosts[0], status: 'pending' }]));
  });

  it('should use json-server v1 sort syntax for descending order', async () => {
    const promise = firstValueFrom(
      service.getPosts({
        force: true,
        query: { sort: 'createdAt', order: 'desc' },
      }),
    );
    const request = httpMock.expectOne(
      (req) => req.url === '/api/posts' && req.params.get('_sort') === '-createdAt',
    );

    expect(request.request.params.has('_order')).toBe(false);
    request.flush(mockPosts);
    await promise;
  });

  it('should use json-server v1 contains filter for title search', async () => {
    const promise = firstValueFrom(
      service.getPosts({
        force: true,
        query: { titleLike: 'angular' },
      }),
    );
    const request = httpMock.expectOne(
      (req) => req.url === '/api/posts' && req.params.get('title:contains') === 'angular',
    );

    request.flush([mockPosts[0]]);
    await promise;
  });

  it('should use json-server v1 pagination params and parse paginated responses', async () => {
    const promise = firstValueFrom(
      service.getPosts({
        force: true,
        query: { page: 2, limit: 5 },
      }),
    );
    const request = httpMock.expectOne(
      (req) =>
        req.url === '/api/posts' &&
        req.params.get('_page') === '2' &&
        req.params.get('_per_page') === '5',
    );

    request.flush({
      data: [mockPosts[0]],
      items: 12,
      pages: 3,
      first: 6,
      last: 12,
      next: null,
      prev: 1,
    });

    await expect(promise).resolves.toEqual({
      posts: [mockPosts[0]],
      totalItems: 12,
    });
  });
});

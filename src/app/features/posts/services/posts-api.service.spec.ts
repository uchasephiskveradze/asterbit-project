import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';
import { Post } from '../models/post.model';
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
    const firstRequest = httpMock.expectOne('/api/posts');
    firstRequest.flush(mockPosts);

    await expect(firstPromise).resolves.toEqual(mockPosts);

    const secondPromise = firstValueFrom(service.getPosts());
    httpMock.expectNone('/api/posts');

    await expect(secondPromise).resolves.toEqual(mockPosts);
  });

  it('should bypass the cache when force is true', async () => {
    const firstPromise = firstValueFrom(service.getPosts());
    httpMock.expectOne('/api/posts').flush(mockPosts);
    await firstPromise;

    const secondPromise = firstValueFrom(service.getPosts({ force: true }));
    httpMock.expectOne('/api/posts').flush(mockPosts);

    await expect(secondPromise).resolves.toEqual(mockPosts);
  });

  it('should deduplicate concurrent list requests', async () => {
    const firstPromise = firstValueFrom(service.getPosts());
    const secondPromise = firstValueFrom(service.getPosts());

    const request = httpMock.expectOne('/api/posts');
    request.flush(mockPosts);

    await expect(Promise.all([firstPromise, secondPromise])).resolves.toEqual([
      mockPosts,
      mockPosts,
    ]);
  });

  it('should serve getPostById from the list cache', async () => {
    const listPromise = firstValueFrom(service.getPosts());
    httpMock.expectOne('/api/posts').flush(mockPosts);
    await listPromise;

    const postPromise = firstValueFrom(service.getPostById('1'));
    httpMock.expectNone('/api/posts/1');

    await expect(postPromise).resolves.toEqual(mockPosts[0]);
  });

  it('should update the list cache after createPost', async () => {
    const createdPost: Post = {
      id: '3',
      title: 'Created',
      author: 'Author',
      description: 'Description',
      content: 'Content',
      createdAt: '2026-01-03T00:00:00.000Z',
      status: 'pending',
    };

    const listPromise = firstValueFrom(service.getPosts());
    httpMock.expectOne('/api/posts').flush(mockPosts);
    await listPromise;

    const createPromise = firstValueFrom(
      service.createPost({
        title: createdPost.title,
        author: createdPost.author,
        description: createdPost.description,
        content: createdPost.content,
        status: 'pending',
      }),
    );
    httpMock.expectOne('/api/posts').flush(createdPost);
    await createPromise;

    const cachedPromise = firstValueFrom(service.getPosts());
    httpMock.expectOne('/api/posts').flush([...mockPosts, createdPost]);

    await expect(cachedPromise).resolves.toEqual([...mockPosts, createdPost]);
  });

  it('should default unknown post statuses to pending', async () => {
    const promise = firstValueFrom(service.getPosts());
    httpMock.expectOne('/api/posts').flush([
      {
        ...mockPosts[0],
        status: 'draft',
      },
    ]);

    await expect(promise).resolves.toEqual([
      {
        ...mockPosts[0],
        status: 'pending',
      },
    ]);
  });

  it('should invalidate the list cache after deletePost', async () => {
    const listPromise = firstValueFrom(service.getPosts());
    httpMock.expectOne('/api/posts').flush(mockPosts);
    await listPromise;

    const deletePromise = firstValueFrom(service.deletePost('1'));
    httpMock.expectOne('/api/posts/1').flush(null);
    await deletePromise;

    const cachedPromise = firstValueFrom(service.getPosts());
    httpMock.expectOne('/api/posts').flush([mockPosts[1]]);

    await expect(cachedPromise).resolves.toEqual([mockPosts[1]]);
  });

  it('should cache queried list requests separately', async () => {
    const pendingQuery = { query: { status: 'pending' as const } };
    const approvedQuery = { query: { status: 'approved' as const } };

    const pendingPromise = firstValueFrom(service.getPosts(pendingQuery));
    httpMock.expectOne((req) => req.params.get('status') === 'pending').flush([mockPosts[1]]);
    await pendingPromise;

    const approvedPromise = firstValueFrom(service.getPosts(approvedQuery));
    httpMock.expectOne((req) => req.params.get('status') === 'approved').flush([mockPosts[0]]);
    await approvedPromise;

    const cachedPendingPromise = firstValueFrom(service.getPosts(pendingQuery));
    const cachedApprovedPromise = firstValueFrom(service.getPosts(approvedQuery));
    httpMock.expectNone('/api/posts');

    await expect(cachedPendingPromise).resolves.toEqual([mockPosts[1]]);
    await expect(cachedApprovedPromise).resolves.toEqual([mockPosts[0]]);
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

  it('should use json-server v1 sort syntax for ascending order', async () => {
    const promise = firstValueFrom(
      service.getPosts({
        force: true,
        query: { sort: 'createdAt', order: 'asc' },
      }),
    );
    const request = httpMock.expectOne(
      (req) => req.url === '/api/posts' && req.params.get('_sort') === 'createdAt',
    );

    expect(request.request.params.has('_order')).toBe(false);
    request.flush(mockPosts);
    await promise;
  });
});

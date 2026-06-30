import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';
import { Post } from '../models/post.model';
import { PostResolverResult } from '../models/post-resolver-result.model';
import { postResolver } from './post.resolver';

describe('postResolver', () => {
  let httpMock: HttpTestingController;

  const mockPost: Post = {
    id: 'abc123',
    title: 'Resolver Post',
    author: 'Jane Doe',
    description: 'A post loaded through the route resolver.',
    content: 'a'.repeat(100),
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  const createRoute = (id: string | null): ActivatedRouteSnapshot =>
    ({
      paramMap: {
        get: (key: string) => (key === 'id' ? id : null),
      },
    }) as ActivatedRouteSnapshot;

  const runResolver = (route: ActivatedRouteSnapshot) =>
    TestBed.runInInjectionContext(() =>
      firstValueFrom(
        postResolver(route, {} as never) as Observable<PostResolverResult>,
      ),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should resolve a post by route id', async () => {
    const resultPromise = runResolver(createRoute('abc123'));

    const request = httpMock.expectOne('/api/posts/abc123');
    request.flush(mockPost);

    await expect(resultPromise).resolves.toEqual({
      post: mockPost,
      notFound: false,
      error: null,
    });
  });

  it('should return notFound when the API responds with 404', async () => {
    const resultPromise = runResolver(createRoute('missing'));

    const request = httpMock.expectOne('/api/posts/missing');
    request.flush('Not found', {
      status: 404,
      statusText: 'Not Found',
    });

    await expect(resultPromise).resolves.toEqual({
      post: null,
      notFound: true,
      error: null,
    });
  });

  it('should return an error result for non-404 failures', async () => {
    const resultPromise = runResolver(createRoute('abc123'));

    const request = httpMock.expectOne('/api/posts/abc123');
    request.flush('Server error', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(resultPromise).resolves.toEqual({
      post: null,
      notFound: false,
      error: 'Unable to load post. Please try again.',
    });
  });

  it('should return notFound when the route id is missing', async () => {
    const result = await runResolver(createRoute(null));

    expect(result).toEqual({
      post: null,
      notFound: true,
      error: null,
    });
  });
});

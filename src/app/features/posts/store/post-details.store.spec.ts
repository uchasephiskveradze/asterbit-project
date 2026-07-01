import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Post } from '../models/post.model';
import { PostResolverResult } from '../models/post-resolver-result.model';
import { PostsApiService } from '../services/posts-api.service';
import { PostDetailsStore } from './post-details.store';

describe('PostDetailsStore', () => {
  const post: Post = {
    id: '1',
    title: 'Details Post',
    author: 'Author',
    description: 'Short description text',
    content: 'a'.repeat(100),
    createdAt: '2026-01-01T00:00:00.000Z',
    status: 'pending',
  };

  let store: PostDetailsStore;
  let api: {
    updatePostStatus: ReturnType<typeof vi.fn>;
    getPostById: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    api = {
      getPostById: vi.fn(() => of(post)),
      updatePostStatus: vi.fn(() => of({ ...post, status: 'approved' })),
    };

    TestBed.configureTestingModule({
      providers: [PostDetailsStore, { provide: PostsApiService, useValue: api }],
    });

    store = TestBed.inject(PostDetailsStore);
  });

  it('should apply resolver results', () => {
    const result: PostResolverResult = {
      post,
      notFound: false,
      error: null,
    };

    store.applyResolverResult('1', result);

    expect(store.post()).toEqual(post);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should update the post after successful moderation', async () => {
    store.applyResolverResult('1', { post, notFound: false, error: null });

    store.moderatePost('approved');

    await vi.waitFor(() => expect(store.moderating()).toBe(false));

    expect(store.post()?.status).toBe('approved');
  });
});

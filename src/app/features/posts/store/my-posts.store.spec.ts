import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../../core/auth/services/auth.service';
import { Post } from '../models/post.model';
import { PostsApiService } from '../services/posts-api.service';
import { MyPostsStore } from './my-posts.store';

describe('MyPostsStore', () => {
  const userPost: Post = {
    id: '1',
    title: 'My Pending Post',
    author: 'Demo User',
    description: 'Short description text',
    content: 'a'.repeat(100),
    createdAt: '2026-01-01T00:00:00.000Z',
    status: 'pending',
    submittedBy: '2',
  };

  const approvedPost: Post = {
    ...userPost,
    id: '2',
    title: 'My Approved Post',
    status: 'approved',
  };

  let store: MyPostsStore;
  let api: { getPosts: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    api = { getPosts: vi.fn(() => of([userPost, approvedPost])) };

    TestBed.configureTestingModule({
      providers: [
        MyPostsStore,
        { provide: PostsApiService, useValue: api },
        {
          provide: AuthService,
          useValue: {
            currentUser: () => ({
              id: '2',
              email: 'user@blog.com',
              role: 'user',
              name: 'Demo User',
            }),
          },
        },
      ],
    });

    store = TestBed.inject(MyPostsStore);
  });

  it('should filter posts for the active tab', async () => {
    await vi.waitFor(() => expect(store.loading()).toBe(false));

    expect(store.filteredPosts()).toEqual([userPost]);

    store.setTab('approved');

    expect(store.filteredPosts()).toEqual([approvedPost]);
  });

  it('should update the tab from a valid query param', () => {
    store.setTabFromQuery('rejected');

    expect(store.activeTab()).toBe('rejected');
  });

  it('should ignore invalid query tabs', () => {
    store.setTab('approved');
    store.setTabFromQuery('invalid');

    expect(store.activeTab()).toBe('approved');
  });

  it('should set an error when loading fails', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        MyPostsStore,
        {
          provide: PostsApiService,
          useValue: { getPosts: () => throwError(() => new Error('network')) },
        },
        {
          provide: AuthService,
          useValue: { currentUser: () => null },
        },
      ],
    });

    const failingStore = TestBed.inject(MyPostsStore);

    await vi.waitFor(() => expect(failingStore.loading()).toBe(false));

    expect(failingStore.error()).toBe('Unable to load your posts. Please try again.');
  });
});

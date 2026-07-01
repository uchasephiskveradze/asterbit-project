import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { Post } from '../models/post.model';
import { POST_STATUS } from '../models/post-status.model';
import { PostsApiService } from '../services/posts-api.service';
import { PostsViewStorageService } from '../services/posts-view-storage.service';
import { PostsListStore } from './posts-list.store';

describe('PostsListStore', () => {
  const approvedPost: Post = {
    id: '1',
    title: 'Approved Post',
    author: 'Author',
    description: 'Short description text',
    content: 'a'.repeat(100),
    createdAt: '2026-01-02T00:00:00.000Z',
    status: POST_STATUS.approved,
  };

  let store: PostsListStore;
  let api: { getPosts: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    api = { getPosts: vi.fn(() => of([approvedPost])) };

    TestBed.configureTestingModule({
      providers: [
        PostsListStore,
        { provide: PostsApiService, useValue: api },
        {
          provide: PostsViewStorageService,
          useValue: { read: () => 'pagination' as const, write: vi.fn() },
        },
      ],
    });

    store = TestBed.inject(PostsListStore);
  });

  it('should request only approved posts from the API', async () => {
    store.loadPosts();

    await vi.waitFor(() => expect(store.loading()).toBe(false));

    expect(api.getPosts).toHaveBeenCalledWith({
      force: false,
      query: {
        status: POST_STATUS.approved,
        titleLike: undefined,
        sort: 'createdAt',
        order: 'desc',
      },
    });
    expect(store.posts()).toEqual([approvedPost]);
  });

  it('should set an error when loading fails', async () => {
    api.getPosts.mockReturnValue(throwError(() => new Error('network')));

    store.loadPosts();

    await vi.waitFor(() => expect(store.loading()).toBe(false));

    expect(store.error()).toBe('errors.posts.load');
    expect(store.posts()).toEqual([]);
  });
});

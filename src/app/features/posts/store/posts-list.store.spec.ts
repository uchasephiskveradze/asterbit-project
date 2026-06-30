import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { Post } from '../models/post.model';
import { PostsApiService } from '../services/posts-api.service';
import { PostsPermissionService } from '../services/posts-permission.service';
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
    status: 'approved',
  };

  const pendingPost: Post = {
    ...approvedPost,
    id: '2',
    title: 'Pending Post',
    status: 'pending',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  let store: PostsListStore;
  let api: { getPosts: ReturnType<typeof vi.fn> };
  let access: { isPubliclyListed: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    api = { getPosts: vi.fn(() => of([approvedPost, pendingPost])) };
    access = {
      isPubliclyListed: vi.fn((post: Post) => post.status === 'approved'),
    };

    TestBed.configureTestingModule({
      providers: [
        PostsListStore,
        { provide: PostsApiService, useValue: api },
        { provide: PostsPermissionService, useValue: access },
        {
          provide: PostsViewStorageService,
          useValue: { read: () => 'pagination' as const, write: vi.fn() },
        },
      ],
    });

    store = TestBed.inject(PostsListStore);
  });

  it('should load posts successfully', async () => {
    store.loadPosts();

    await vi.waitFor(() => expect(store.loading()).toBe(false));

    expect(store.posts()).toEqual([approvedPost, pendingPost]);
    expect(store.error()).toBeNull();
  });

  it('should set an error when loading fails', async () => {
    api.getPosts.mockReturnValue(throwError(() => new Error('network')));

    store.loadPosts();

    await vi.waitFor(() => expect(store.loading()).toBe(false));

    expect(store.error()).toBe('Unable to load posts. Please try again.');
    expect(store.posts()).toEqual([]);
  });

  it('should expose only publicly listed posts in filteredPosts', () => {
    store.posts.set([approvedPost, pendingPost]);

    expect(store.filteredPosts()).toEqual([approvedPost]);
    expect(access.isPubliclyListed).toHaveBeenCalled();
  });

  it('should filter posts by debounced search query', async () => {
    store.posts.set([approvedPost, { ...approvedPost, id: '3', title: 'Other Topic' }]);
    store.setSearchInput('Approved');

    await vi.waitFor(() => expect(store.filtering()).toBe(false));

    expect(store.filteredPosts().map((post) => post.id)).toEqual(['1']);
  });
});

import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../../core/auth/services/auth.service';
import { Post } from '../models/post.model';
import { POST_STATUS } from '../models/post-status.model';
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
    status: POST_STATUS.pending,
    submittedBy: '2',
  };

  const approvedPost: Post = {
    ...userPost,
    id: '2',
    title: 'My Approved Post',
    status: POST_STATUS.approved,
  };

  const otherUsersApprovedPost: Post = {
    ...approvedPost,
    id: '3',
    submittedBy: '9',
  };

  let store: MyPostsStore;
  let api: { getPosts: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    api = { getPosts: vi.fn(() => of([userPost])) };

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

  it('should fetch pending posts for the default tab and filter by owner', async () => {
    await vi.waitFor(() => expect(store.loading()).toBe(false));

    expect(api.getPosts).toHaveBeenCalledWith({
      force: false,
      query: { status: POST_STATUS.pending },
    });
    expect(store.filteredPosts()).toEqual([userPost]);
  });

  it('should fetch approved posts when the approved tab is selected', async () => {
    await vi.waitFor(() => expect(store.loading()).toBe(false));

    api.getPosts.mockReturnValue(of([approvedPost, otherUsersApprovedPost]));
    store.setTab('approved');
    await vi.waitFor(() => expect(store.loading()).toBe(false));

    expect(api.getPosts).toHaveBeenLastCalledWith({
      force: false,
      query: { status: POST_STATUS.approved },
    });
    expect(store.filteredPosts()).toEqual([approvedPost]);
  });

  it('should update the tab from a valid query param and refetch', async () => {
    await vi.waitFor(() => expect(store.loading()).toBe(false));

    api.getPosts.mockReturnValue(of([]));
    store.setTabFromQuery('rejected');

    await vi.waitFor(() => expect(store.loading()).toBe(false));

    expect(store.activeTab()).toBe('rejected');
    expect(api.getPosts).toHaveBeenLastCalledWith({
      force: false,
      query: { status: POST_STATUS.rejected },
    });
  });

  it('should ignore invalid query tabs', async () => {
    await vi.waitFor(() => expect(store.loading()).toBe(false));

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

    expect(failingStore.error()).toBe('errors.posts.myPostsLoad');
  });
});

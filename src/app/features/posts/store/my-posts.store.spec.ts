import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

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
    store.initializeTab(null);
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

    api.getPosts.mockReturnValue(of([approvedPost]));
    store.setTab('approved');
    await vi.waitFor(() => expect(store.loading()).toBe(false));

    expect(api.getPosts).toHaveBeenLastCalledWith({
      force: false,
      query: { status: POST_STATUS.approved },
    });
    expect(store.filteredPosts()).toEqual([approvedPost]);
  });

  it('should initialize from the rejected tab query param', async () => {
    const rejectedPost: Post = {
      ...userPost,
      id: '3',
      title: 'My Rejected Post',
      status: POST_STATUS.rejected,
      rejectionReason: 'Needs more detail',
    };

    api.getPosts.mockReturnValue(of([rejectedPost]));
    store.initializeTab('rejected');
    await vi.waitFor(() => expect(store.loading()).toBe(false));

    expect(store.activeTab()).toBe('rejected');
    expect(api.getPosts).toHaveBeenLastCalledWith({
      force: false,
      query: { status: POST_STATUS.rejected, sort: 'rejectedAt', order: 'desc' },
    });
    expect(store.filteredPosts()).toEqual([rejectedPost]);
  });

  it('should sort rejected posts by rejection time with newest first', async () => {
    const olderRejected: Post = {
      ...userPost,
      id: '3',
      title: 'Older rejection',
      status: POST_STATUS.rejected,
      createdAt: '2026-01-01T00:00:00.000Z',
      rejectedAt: '2026-01-10T00:00:00.000Z',
    };
    const newerRejected: Post = {
      ...userPost,
      id: '4',
      title: 'Newer rejection',
      status: POST_STATUS.rejected,
      createdAt: '2026-01-01T00:00:00.000Z',
      rejectedAt: '2026-01-20T00:00:00.000Z',
    };

    api.getPosts.mockReturnValue(of([olderRejected, newerRejected]));
    store.setTab('rejected');
    await vi.waitFor(() => expect(store.loading()).toBe(false));

    expect(store.filteredPosts().map((post) => post.id)).toEqual(['4', '3']);
  });
});

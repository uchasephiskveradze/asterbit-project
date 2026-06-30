import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { Post } from '../models/post.model';
import { PostsApiService } from '../services/posts-api.service';
import { ModerationStore } from './moderation.store';

describe('ModerationStore', () => {
  const pendingPost: Post = {
    id: '1',
    title: 'Pending',
    author: 'Author',
    description: 'Short description text',
    content: 'a'.repeat(100),
    createdAt: '2026-01-01T00:00:00.000Z',
    status: 'pending',
  };

  const approvedPost: Post = {
    ...pendingPost,
    id: '2',
    title: 'Approved',
    status: 'approved',
  };

  let store: ModerationStore;
  let api: {
    getPosts: ReturnType<typeof vi.fn>;
    updatePostStatus: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    api = {
      getPosts: vi.fn(() => of([pendingPost, approvedPost])),
      updatePostStatus: vi.fn(() => of({ ...pendingPost, status: 'approved' })),
    };

    TestBed.configureTestingModule({
      providers: [ModerationStore, { provide: PostsApiService, useValue: api }],
    });

    store = TestBed.inject(ModerationStore);
  });

  it('should expose only pending posts', async () => {
    await vi.waitFor(() => expect(store.loading()).toBe(false));

    expect(store.pendingPosts()).toEqual([pendingPost]);
  });

  it('should set an error when loading fails', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ModerationStore,
        {
          provide: PostsApiService,
          useValue: { getPosts: () => throwError(() => new Error('network')) },
        },
      ],
    });

    const failingStore = TestBed.inject(ModerationStore);

    await vi.waitFor(() => expect(failingStore.loading()).toBe(false));

    expect(failingStore.error()).toBe('Unable to load moderation queue. Please try again.');
  });

  it('should refresh the queue after moderation succeeds', async () => {
    await vi.waitFor(() => expect(store.loading()).toBe(false));

    store.moderatePost('1', 'approved');

    await vi.waitFor(() => expect(api.updatePostStatus).toHaveBeenCalledWith('1', 'approved'));
    expect(api.getPosts).toHaveBeenCalledWith({ force: true });
  });
});

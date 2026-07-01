import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Post } from '../models/post.model';
import { POST_STATUS } from '../models/post-status.model';
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
    status: POST_STATUS.pending,
  };

  let store: ModerationStore;
  let api: {
    getPosts: ReturnType<typeof vi.fn>;
    updatePostStatus: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    api = {
      getPosts: vi.fn(() => of([pendingPost])),
      updatePostStatus: vi.fn(() => of({ ...pendingPost, status: POST_STATUS.approved })),
    };

    TestBed.configureTestingModule({
      providers: [ModerationStore, { provide: PostsApiService, useValue: api }],
    });

    store = TestBed.inject(ModerationStore);
  });

  it('should request only pending posts from the API', async () => {
    await vi.waitFor(() => expect(store.loading()).toBe(false));

    expect(api.getPosts).toHaveBeenCalledWith({
      force: false,
      query: { status: POST_STATUS.pending },
    });
    expect(store.pendingPosts()).toEqual([pendingPost]);
  });

  it('should remove moderated posts from the local queue', async () => {
    await vi.waitFor(() => expect(store.loading()).toBe(false));

    store.moderatePost('1', POST_STATUS.approved);

    await vi.waitFor(() =>
      expect(api.updatePostStatus).toHaveBeenCalledWith('1', POST_STATUS.approved, {
        rejectionReason: undefined,
      }),
    );

    expect(store.pendingPosts()).toEqual([]);
  });
});

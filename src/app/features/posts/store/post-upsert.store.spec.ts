import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../../../core/auth/services/auth.service';
import { Post } from '../models/post.model';
import { POST_PENDING_REASON } from '../models/post-revision.model';
import { POST_STATUS } from '../models/post-status.model';
import { PostsApiService } from '../services/posts-api.service';
import { PostUpsertStore } from './post-upsert.store';

describe('PostUpsertStore', () => {
  const rejectedPost: Post = {
    id: '10',
    title: 'Rejected Post',
    author: 'Demo User',
    description: 'A'.repeat(20),
    content: 'B'.repeat(100),
    createdAt: '2026-01-01T00:00:00.000Z',
    status: POST_STATUS.rejected,
    submittedBy: '2',
    rejectionReason: 'Needs more detail',
  };

  let store: PostUpsertStore;
  let api: { updatePost: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    api = {
      updatePost: vi.fn(() => of({ ...rejectedPost, status: POST_STATUS.pending })),
    };
    router = { navigate: vi.fn(() => Promise.resolve(true)) };

    TestBed.configureTestingModule({
      providers: [
        PostUpsertStore,
        { provide: PostsApiService, useValue: api },
        { provide: Router, useValue: router },
        {
          provide: AuthService,
          useValue: {
            currentUser: () => ({
              id: '2',
              email: 'user@blog.com',
              role: 'user',
              name: 'Demo User',
            }),
            isAdmin: () => false,
          },
        },
      ],
    });

    store = TestBed.inject(PostUpsertStore);
    store.applyResolverResult({ post: rejectedPost, notFound: false, error: null });
  });

  it('should resubmit a rejected post for review and clear the rejection reason', async () => {
    store.updatePost('10', {
      title: 'Revised title',
      author: 'Demo User',
      description: 'C'.repeat(20),
      content: 'D'.repeat(100),
    });

    await vi.waitFor(() => expect(store.saving()).toBe(false));

    expect(api.updatePost).toHaveBeenCalledWith('10', {
      title: 'Revised title',
      author: 'Demo User',
      description: 'C'.repeat(20),
      content: 'D'.repeat(100),
      status: POST_STATUS.pending,
      pendingReason: POST_PENDING_REASON.new,
      rejectionReason: null,
      previousVersion: null,
    });
    expect(router.navigate).toHaveBeenCalledWith(['/posts/my'], {
      queryParams: { tab: 'under-review' },
    });
  });
});

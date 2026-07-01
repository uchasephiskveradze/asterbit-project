import { describe, expect, it } from 'vitest';

import { Post } from '../models/post.model';
import { EMPTY_REJECTION_NOTICE_STATE } from '../models/rejection-notice.model';
import { POST_STATUS } from '../models/post-status.model';
import {
  filterRejectedWithReasonForUser,
  filterUnseenForBadge,
  filterUnseenForModal,
} from './rejection-notice.utils';

function createPost(overrides: Partial<Post> = {}): Post {
  return {
    id: '1',
    title: 'Title',
    author: 'Author',
    description: 'Description',
    content: 'Content',
    createdAt: '2024-01-01T00:00:00.000Z',
    status: POST_STATUS.rejected,
    submittedBy: 'user-1',
    rejectionReason: 'Needs more detail',
    ...overrides,
  };
}

describe('rejection-notice.utils', () => {
  it('should keep only rejected posts with a reason for the owner', () => {
    const posts = [
      createPost({ id: '1' }),
      createPost({ id: '2', submittedBy: 'other-user' }),
      createPost({ id: '3', rejectionReason: null }),
      createPost({ id: '4', status: POST_STATUS.approved }),
    ];

    expect(filterRejectedWithReasonForUser(posts, 'user-1').map((post) => post.id)).toEqual(['1']);
  });

  it('should filter unseen posts for the nav badge', () => {
    const posts = [createPost({ id: '1' }), createPost({ id: '2' })];
    const state = {
      ...EMPTY_REJECTION_NOTICE_STATE,
      seenPostIds: ['1'],
    };

    expect(filterUnseenForBadge(posts, state).map((post) => post.id)).toEqual(['2']);
  });

  it('should filter unacknowledged posts for the login modal', () => {
    const posts = [createPost({ id: '1' }), createPost({ id: '2' })];
    const state = {
      ...EMPTY_REJECTION_NOTICE_STATE,
      acknowledgedPostIds: ['2'],
    };

    expect(filterUnseenForModal(posts, state).map((post) => post.id)).toEqual(['1']);
  });
});

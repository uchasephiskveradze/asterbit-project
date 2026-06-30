import { Post } from '../models/post.model';
import { getPostRevisionChanges, isEditedPendingReview } from './post-revision.utils';

describe('post-revision.utils', () => {
  const post: Post = {
    id: '1',
    title: 'Updated title',
    author: 'Demo User',
    description: 'Updated description text here',
    content: 'C'.repeat(100),
    createdAt: '2026-01-01T00:00:00.000Z',
    status: 'pending',
    pendingReason: 'edited',
    submittedBy: '2',
    previousVersion: {
      title: 'Original title',
      author: 'Demo User',
      description: 'Original description text here',
      content: 'B'.repeat(100),
      capturedAt: '2026-01-02T00:00:00.000Z',
    },
  };

  it('should detect edited pending review posts', () => {
    expect(isEditedPendingReview(post)).toBe(true);
  });

  it('should return only changed fields', () => {
    const changes = getPostRevisionChanges(post);

    expect(changes.map((change) => change.field)).toEqual(['title', 'description', 'content']);
    expect(changes[0]?.previous).toBe('Original title');
    expect(changes[0]?.current).toBe('Updated title');
  });
});

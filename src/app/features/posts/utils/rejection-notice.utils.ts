import { Post } from '../models/post.model';
import { RejectionNoticeState } from '../models/rejection-notice.model';
import { POST_STATUS } from '../models/post-status.model';

export function filterRejectedWithReasonForUser(posts: Post[], userId: string): Post[] {
  return posts.filter(
    (post) =>
      post.submittedBy === userId &&
      post.status === POST_STATUS.rejected &&
      Boolean(post.rejectionReason?.trim()),
  );
}

export function filterUnseenForBadge(posts: Post[], state: RejectionNoticeState): Post[] {
  const seen = new Set(state.seenPostIds);
  return posts.filter((post) => !seen.has(post.id));
}

export function filterUnseenForModal(posts: Post[], state: RejectionNoticeState): Post[] {
  const acknowledged = new Set(state.acknowledgedPostIds);
  return posts.filter((post) => !acknowledged.has(post.id));
}

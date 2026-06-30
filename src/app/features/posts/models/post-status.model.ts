import { PostPendingReason, POST_PENDING_REASON } from './post-revision.model';

export const POST_STATUS = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
} as const;

export type PostStatus = (typeof POST_STATUS)[keyof typeof POST_STATUS];

export type MyPostsTab = 'under-review' | 'approved' | 'rejected';

export const MY_POSTS_TAB_LABELS: Record<MyPostsTab, string> = {
  'under-review': 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const MY_POSTS_TAB_STATUS: Record<MyPostsTab, PostStatus> = {
  'under-review': POST_STATUS.pending,
  approved: POST_STATUS.approved,
  rejected: POST_STATUS.rejected,
};

export const MY_POSTS_TABS: MyPostsTab[] = ['under-review', 'approved', 'rejected'];

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  [POST_STATUS.pending]: 'Under Review',
  [POST_STATUS.approved]: 'Approved',
  [POST_STATUS.rejected]: 'Rejected',
};

export const PENDING_REASON_LABELS: Record<PostPendingReason, string> = {
  new: 'New submission',
  edited: 'Edited submission',
};

export const PENDING_REASON_DEFAULT_LABEL = 'Pending review';

export function isPostStatus(value: string): value is PostStatus {
  return (Object.values(POST_STATUS) as string[]).includes(value);
}

export function isMyPostsTab(value: string | null): value is MyPostsTab {
  return value === 'under-review' || value === 'approved' || value === 'rejected';
}

export function isPendingReason(value: string): value is PostPendingReason {
  return value === POST_PENDING_REASON.new || value === POST_PENDING_REASON.edited;
}

export function getPendingReasonLabel(reason: string | undefined): string {
  if (reason && isPendingReason(reason)) {
    return PENDING_REASON_LABELS[reason];
  }

  return PENDING_REASON_DEFAULT_LABEL;
}

export type PostStatus = 'pending' | 'approved' | 'rejected';

export type MyPostsTab = 'under-review' | 'approved' | 'rejected';

export const MY_POSTS_TAB_LABELS: Record<MyPostsTab, string> = {
  'under-review': 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const MY_POSTS_TAB_STATUS: Record<MyPostsTab, PostStatus> = {
  'under-review': 'pending',
  approved: 'approved',
  rejected: 'rejected',
};

export const MY_POSTS_TABS: MyPostsTab[] = ['under-review', 'approved', 'rejected'];

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  pending: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export function isPostStatus(value: string): value is PostStatus {
  return value === 'pending' || value === 'approved' || value === 'rejected';
}

export function isMyPostsTab(value: string | null): value is MyPostsTab {
  return value === 'under-review' || value === 'approved' || value === 'rejected';
}

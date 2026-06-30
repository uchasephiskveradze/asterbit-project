export type PostsListViewMode = 'pagination' | 'infinite-scroll';

export const POSTS_LIST_VIEW_MODE_KEY = 'blog-posts-list-view-mode';

export const DEFAULT_POSTS_LIST_VIEW_MODE: PostsListViewMode = 'pagination';

export function isPostsListViewMode(value: string | null): value is PostsListViewMode {
  return value === 'pagination' || value === 'infinite-scroll';
}

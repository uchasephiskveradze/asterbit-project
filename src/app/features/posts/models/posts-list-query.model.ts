import { PostDateSort } from '../store/posts-list.types';
import { PostStatus } from './post-status.model';

export type PostsListQuery = {
  status?: PostStatus;
  titleLike?: string;
  sort?: 'createdAt';
  order?: PostDateSort;
  page?: number;
  limit?: number;
};

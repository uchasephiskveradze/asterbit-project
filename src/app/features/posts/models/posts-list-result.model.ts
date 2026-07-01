import { Post } from './post.model';

export type PostsListResult = {
  posts: Post[];
  totalItems: number;
};

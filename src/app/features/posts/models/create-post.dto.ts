import { Post } from './post.model';

export type CreatePostDto = Omit<Post, 'id' | 'createdAt'> & {
  createdAt?: string;
};

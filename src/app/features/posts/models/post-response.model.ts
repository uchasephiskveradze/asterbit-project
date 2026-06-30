import { Post } from './post.model';

export type PostResponse = Omit<Post, 'id'> & {
  id: string | number;
  status?: string;
  pendingReason?: string;
};

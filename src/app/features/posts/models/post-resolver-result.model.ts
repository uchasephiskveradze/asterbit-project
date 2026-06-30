import { Post } from './post.model';

export interface PostResolverResult {
  post: Post | null;
  notFound: boolean;
  error: string | null;
}

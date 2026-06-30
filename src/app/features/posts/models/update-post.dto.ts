import { Post } from './post.model';
import { PostPendingReason, PostRevisionSnapshot } from './post-revision.model';

export type UpdatePostDto = Partial<Omit<Post, 'id' | 'pendingReason' | 'previousVersion'>> & {
  pendingReason?: PostPendingReason | null;
  previousVersion?: PostRevisionSnapshot | null;
};

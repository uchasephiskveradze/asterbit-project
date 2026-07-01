import { PostStatus } from './post-status.model';
import { PostPendingReason, PostRevisionSnapshot } from './post-revision.model';

export interface Post {
  id: string;
  title: string;
  author: string;
  description: string;
  content: string;
  createdAt: string;
  status: PostStatus;
  submittedBy?: string;
  pendingReason?: PostPendingReason;
  previousVersion?: PostRevisionSnapshot;
  rejectionReason?: string | null;
}

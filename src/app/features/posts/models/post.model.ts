import { PostStatus } from './post-status.model';

export interface Post {
  id: string;
  title: string;
  author: string;
  description: string;
  content: string;
  createdAt: string;
  status: PostStatus;
  submittedBy?: string;
}

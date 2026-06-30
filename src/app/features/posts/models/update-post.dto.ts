import { Post } from './post.model';

export type UpdatePostDto = Partial<Omit<Post, 'id'>>;

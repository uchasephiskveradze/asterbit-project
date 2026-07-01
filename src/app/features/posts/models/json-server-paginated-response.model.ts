import { PostResponse } from './post-response.model';

export type JsonServerPaginatedResponse<T> = {
  data: T[];
  items: number;
};

export type JsonServerPostsListResponse =
  | PostResponse[]
  | JsonServerPaginatedResponse<PostResponse>;

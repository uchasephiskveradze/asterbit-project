import { PostsListQuery } from './posts-list-query.model';

export type PostsRequestOptions = {
  force?: boolean;
  query?: PostsListQuery;
};

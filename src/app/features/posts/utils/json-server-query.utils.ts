import { PostDateSort } from '../store/posts-list.types';

export function buildJsonServerSortParam(field: string, order: PostDateSort = 'asc'): string {
  return order === 'desc' ? `-${field}` : field;
}

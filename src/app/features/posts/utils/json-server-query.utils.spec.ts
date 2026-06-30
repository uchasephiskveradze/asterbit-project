import { buildJsonServerSortParam } from './json-server-query.utils';

describe('buildJsonServerSortParam', () => {
  it('should prefix the field with - for descending order', () => {
    expect(buildJsonServerSortParam('createdAt', 'desc')).toBe('-createdAt');
  });

  it('should leave the field unprefixed for ascending order', () => {
    expect(buildJsonServerSortParam('createdAt', 'asc')).toBe('createdAt');
  });
});

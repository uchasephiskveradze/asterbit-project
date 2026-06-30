import { LruCache } from './lru-cache';

describe('LruCache', () => {
  it('should evict the oldest entry when max size is exceeded', () => {
    const cache = new LruCache<string, string>(2);

    cache.set('a', '1');
    cache.set('b', '2');
    cache.set('c', '3');

    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe('2');
    expect(cache.get('c')).toBe('3');
  });
});

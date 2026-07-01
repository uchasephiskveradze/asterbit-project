import { TruncatePipe } from './truncate.pipe';

describe('TruncatePipe', () => {
  const pipe = new TruncatePipe();

  it('should return empty string for nullish values', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should truncate long text with suffix', () => {
    expect(pipe.transform('abcdefghijklmnopqrstuvwxyz', 10)).toBe('abcdefghij…');
  });
});

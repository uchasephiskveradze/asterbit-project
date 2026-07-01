import { PostStatusLabelPipe } from './post-status-label.pipe';

describe('PostStatusLabelPipe', () => {
  const pipe = new PostStatusLabelPipe();

  it('should return approved label for status string', () => {
    expect(pipe.transform('approved')).toBe('Approved');
  });

  it('should return edited pending label', () => {
    expect(pipe.transform({ status: 'pending', pendingReason: 'edited' })).toBe(
      'Under Review (Edited)',
    );
  });

  it('should return default pending label for new submissions', () => {
    expect(pipe.transform({ status: 'pending', pendingReason: 'new' })).toBe('Under Review');
  });
});

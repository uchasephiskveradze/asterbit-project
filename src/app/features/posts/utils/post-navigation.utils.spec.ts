import { getPostBackNavigation } from './post-navigation.utils';

describe('getPostBackNavigation', () => {
  it('should default to the posts list for undefined, null, list, and unknown values', () => {
    const expected = {
      link: ['/posts'],
      label: 'Back to Posts',
    };

    expect(getPostBackNavigation(undefined)).toEqual(expected);
    expect(getPostBackNavigation(null)).toEqual(expected);
    expect(getPostBackNavigation('list')).toEqual(expected);
    expect(getPostBackNavigation('unknown')).toEqual(expected);
  });

  it('should return my posts with the active tab', () => {
    expect(getPostBackNavigation('my-posts', { tab: 'approved' })).toEqual({
      link: ['/posts/my'],
      queryParams: { tab: 'approved' },
      label: 'Back to My Posts',
    });
  });

  it('should return moderation', () => {
    expect(getPostBackNavigation('moderation')).toEqual({
      link: ['/posts/moderation'],
      label: 'Back to Moderation',
    });
  });
});

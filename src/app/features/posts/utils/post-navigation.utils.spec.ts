import { getPostBackNavigation } from './post-navigation.utils';

describe('getPostBackNavigation', () => {
  it('should default to the posts list', () => {
    expect(getPostBackNavigation(undefined)).toEqual({
      link: ['/posts'],
      label: 'Back to Posts',
    });
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

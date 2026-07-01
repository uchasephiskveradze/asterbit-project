export type PostNavigationSource = 'list' | 'my-posts' | 'moderation';

export type PostBackNavigation = {
  link: string[];
  queryParams?: Record<string, string>;
  labelKey: string;
};

export function isPostNavigationSource(value: string | null | undefined): value is PostNavigationSource {
  return value === 'list' || value === 'my-posts' || value === 'moderation';
}

export function getPostBackNavigation(
  from: string | null | undefined,
  options?: { tab?: string | null },
): PostBackNavigation {
  if (!isPostNavigationSource(from) || from === 'list') {
    return {
      link: ['/posts'],
      labelKey: 'navigation.backToPosts',
    };
  }

  switch (from) {
    case 'my-posts':
      return {
        link: ['/posts/my'],
        queryParams: options?.tab ? { tab: options.tab } : undefined,
        labelKey: 'navigation.backToMyPosts',
      };
    case 'moderation':
      return {
        link: ['/posts/moderation'],
        labelKey: 'navigation.backToModeration',
      };
  }
}

export function getPostDetailsQueryParams(
  from: PostNavigationSource | undefined,
  tab?: string | null,
): Record<string, string> | undefined {
  if (!from) {
    return undefined;
  }

  const params: Record<string, string> = { from };

  if (from === 'my-posts' && tab) {
    params['tab'] = tab;
  }

  return params;
}

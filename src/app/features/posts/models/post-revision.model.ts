export const POST_PENDING_REASON = {
  new: 'new',
  edited: 'edited',
} as const;

export type PostPendingReason = (typeof POST_PENDING_REASON)[keyof typeof POST_PENDING_REASON];

export interface PostRevisionSnapshot {
  title: string;
  author: string;
  description: string;
  content: string;
  capturedAt: string;
}

export type PostRevisionField = keyof Pick<PostRevisionSnapshot, 'title' | 'author' | 'description' | 'content'>;

export interface PostFieldChange {
  field: PostRevisionField;
  labelKey: string;
  previous: string;
  current: string;
}

export const POST_REVISION_FIELD_LABEL_KEYS: Record<PostRevisionField, string> = {
  title: 'form.post.titleLabel',
  author: 'form.post.authorLabel',
  description: 'form.post.descriptionLabel',
  content: 'form.post.contentLabel',
};

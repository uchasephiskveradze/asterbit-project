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
  label: string;
  previous: string;
  current: string;
}

export const POST_REVISION_FIELD_LABELS: Record<PostRevisionField, string> = {
  title: 'Title',
  author: 'Author',
  description: 'Description',
  content: 'Content',
};

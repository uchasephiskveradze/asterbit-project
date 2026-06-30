import {
  POST_REVISION_FIELD_LABELS,
  PostFieldChange,
  PostRevisionField,
} from '../models/post-revision.model';
import { Post } from '../models/post.model';

const REVISION_FIELDS: PostRevisionField[] = ['title', 'author', 'description', 'content'];

export function getPostRevisionChanges(post: Post): PostFieldChange[] {
  const previousVersion = post.previousVersion;
  if (!previousVersion) {
    return [];
  }

  return REVISION_FIELDS.flatMap((field) => {
    const previous = previousVersion[field];
    const current = post[field];

    if (previous === current) {
      return [];
    }

    return [
      {
        field,
        label: POST_REVISION_FIELD_LABELS[field],
        previous,
        current,
      },
    ];
  });
}

export function isEditedPendingReview(post: Post): boolean {
  return post.status === 'pending' && post.pendingReason === 'edited' && !!post.previousVersion;
}

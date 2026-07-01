import {
  POST_REVISION_FIELD_LABEL_KEYS,
  POST_PENDING_REASON,
  PostFieldChange,
  PostRevisionField,
} from '../models/post-revision.model';
import { POST_STATUS } from '../models/post-status.model';
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
        labelKey: POST_REVISION_FIELD_LABEL_KEYS[field],
        previous,
        current,
      },
    ];
  });
}

export function isEditedPendingReview(post: Post): boolean {
  return post.status === POST_STATUS.pending && post.pendingReason === POST_PENDING_REASON.edited && !!post.previousVersion;
}

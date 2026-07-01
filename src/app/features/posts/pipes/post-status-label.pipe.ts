import { Pipe, PipeTransform } from '@angular/core';

import { Post } from '../models/post.model';
import { POST_STATUS_LABELS, POST_STATUS } from '../models/post-status.model';
import { POST_PENDING_REASON } from '../models/post-revision.model';

type PostStatusInput = Pick<Post, 'status' | 'pendingReason'> | Post['status'];

@Pipe({
  name: 'postStatusLabel',
})
export class PostStatusLabelPipe implements PipeTransform {
  public transform(value: PostStatusInput | null | undefined): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      return POST_STATUS_LABELS[value];
    }

    if (value.status === POST_STATUS.pending && value.pendingReason === POST_PENDING_REASON.edited) {
      return 'Under Review (Edited)';
    }

    return POST_STATUS_LABELS[value.status];
  }
}

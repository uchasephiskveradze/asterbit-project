import { Pipe, PipeTransform } from '@angular/core';

import { Post } from '../../features/posts/models/post.model';
import { POST_STATUS_LABELS } from '../../features/posts/models/post-status.model';

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

    if (value.status === 'pending' && value.pendingReason === 'edited') {
      return 'Under Review (Edited)';
    }

    return POST_STATUS_LABELS[value.status];
  }
}

import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { Post } from '../models/post.model';
import { POST_STATUS_LABEL_KEYS, POST_STATUS } from '../models/post-status.model';
import { POST_PENDING_REASON } from '../models/post-revision.model';

type PostStatusInput = Pick<Post, 'status' | 'pendingReason'> | Post['status'];

@Pipe({
  name: 'postStatusLabel',
})
export class PostStatusLabelPipe implements PipeTransform {
  private readonly translate = inject(TranslateService);

  public transform(value: PostStatusInput | null | undefined): string {
    if (!value) {
      return '';
    }

    const key = this.resolveKey(value);
    return key ? this.translate.instant(key) : '';
  }

  private resolveKey(value: PostStatusInput): string | null {
    if (typeof value === 'string') {
      return POST_STATUS_LABEL_KEYS[value];
    }

    if (value.status === POST_STATUS.pending && value.pendingReason === POST_PENDING_REASON.edited) {
      return 'posts.status.underReviewEdited';
    }

    return POST_STATUS_LABEL_KEYS[value.status];
  }
}

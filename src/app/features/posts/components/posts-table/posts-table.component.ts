import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { LocaleService } from '../../../../core/i18n/locale.service';
import { TranslatePipe } from '@ngx-translate/core';
import { Post } from '../../models/post.model';
import { POST_STATUS } from '../../models/post-status.model';
import {
  getPostDetailsQueryParams,
  PostNavigationSource,
} from '../../utils/post-navigation.utils';

@Component({
  selector: 'app-posts-table',
  imports: [DatePipe, NgTemplateOutlet, RouterLink, TranslatePipe],
  templateUrl: './posts-table.component.html',
  styleUrl: './posts-table.component.scss',
})
export class PostsTableComponent {
  protected readonly auth = inject(AuthService);
  protected readonly locale = inject(LocaleService);

  public readonly posts = input.required<Post[]>();
  public readonly showAdminActions = input(true);
  public readonly enableOwnerEdit = input(false);
  public readonly enableOwnerResubmit = input(false);
  public readonly ownerId = input<string | null>(null);
  public readonly detailsFrom = input<PostNavigationSource>();
  public readonly detailsTab = input<string | null>(null);
  public readonly showRejectionCallout = input(false);

  public readonly detailsQueryParams = computed(() =>
    getPostDetailsQueryParams(this.detailsFrom(), this.detailsTab()),
  );

  public readonly ownerEditQueryParams = computed(() => {
    const tab = this.detailsTab();

    return tab ? { from: 'my-posts' as const, tab } : { from: 'my-posts' as const };
  });

  public canOwnerEdit(post: Post): boolean {
    const ownerId = this.ownerId();
    return (
      this.enableOwnerEdit() &&
      ownerId !== null &&
      post.submittedBy === ownerId &&
      post.status === POST_STATUS.approved
    );
  }

  public canOwnerResubmit(post: Post): boolean {
    const ownerId = this.ownerId();
    return (
      this.enableOwnerResubmit() &&
      ownerId !== null &&
      post.submittedBy === ownerId &&
      post.status === POST_STATUS.rejected
    );
  }
}

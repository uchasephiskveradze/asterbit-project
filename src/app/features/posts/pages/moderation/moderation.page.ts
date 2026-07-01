import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { TruncatePipe } from '../../../../shared/truncate.pipe';
import { ModerationActionsComponent } from '../../components/moderation-actions/moderation-actions.component';
import { PostsLoadingStateComponent } from '../../components/posts-loading-state/posts-loading-state.component';
import { POST_PENDING_REASON } from '../../models/post-revision.model';
import { getPendingReasonLabel, POST_STATUS } from '../../models/post-status.model';
import { ModerationStore } from '../../store/moderation.store';

@Component({
  selector: 'app-moderation-page',
  imports: [
    DatePipe,
    RouterLink,
    PostsLoadingStateComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    PageHeaderComponent,
    ModerationActionsComponent,
    TruncatePipe,
  ],
  providers: [ModerationStore],
  templateUrl: './moderation.page.html',
  styleUrl: './moderation.page.scss',
})
export class ModerationPage {
  public readonly store = inject(ModerationStore);
  public readonly pendingReason = POST_PENDING_REASON;
  public readonly getPendingReasonLabel = getPendingReasonLabel;

  public readonly isEmpty = computed(
    () => !this.store.loading() && !this.store.error() && this.store.pendingPosts().length === 0,
  );

  public approve(id: string): void {
    this.store.moderatePost(id, POST_STATUS.approved);
  }

  public reject(id: string): void {
    this.store.moderatePost(id, POST_STATUS.rejected);
  }
}

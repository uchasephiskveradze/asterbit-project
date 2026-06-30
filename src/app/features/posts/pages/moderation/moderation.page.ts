import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PostsEmptyStateComponent } from '../../components/posts-empty-state/posts-empty-state.component';
import { PostsErrorStateComponent } from '../../components/posts-error-state/posts-error-state.component';
import { PostsLoadingStateComponent } from '../../components/posts-loading-state/posts-loading-state.component';
import { ModerationActionsComponent } from '../../components/moderation-actions/moderation-actions.component';
import { getPendingReasonLabel, POST_STATUS } from '../../models/post-status.model';
import { POST_PENDING_REASON } from '../../models/post-revision.model';
import { ModerationStore } from '../../store/moderation.store';
import { TruncatePipe } from '../../../../shared/pipes/truncate.pipe';

@Component({
  selector: 'app-moderation-page',
  imports: [
    DatePipe,
    RouterLink,
    PostsLoadingStateComponent,
    PostsEmptyStateComponent,
    PostsErrorStateComponent,
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

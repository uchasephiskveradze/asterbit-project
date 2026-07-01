import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';

import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LocaleService } from '../../../../core/i18n/locale.service';
import { moderationQueueItemAnimation } from '../../../../core/animations/ui.animations';
import { TruncatePipe } from '../../../../shared/truncate.pipe';
import { getPostFormControlError } from '../../components/post-form/post-form-error.messages';
import { ModerationActionsComponent } from '../../components/moderation-actions/moderation-actions.component';
import { PostsLoadingStateComponent } from '../../components/posts-loading-state/posts-loading-state.component';
import { Post } from '../../models/post.model';
import { REJECTION_REASON_VALIDATION } from '../../models/rejection-reason.validation';
import { POST_PENDING_REASON } from '../../models/post-revision.model';
import { getPendingReasonLabelKey, POST_STATUS } from '../../models/post-status.model';
import { ModerationStore } from '../../store/moderation.store';

type RejectModalTarget = Pick<Post, 'id' | 'title'>;

@Component({
  selector: 'app-moderation-page',
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    TranslatePipe,
    ModalComponent,
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
  animations: [moderationQueueItemAnimation],
})
export class ModerationPage {
  public readonly store = inject(ModerationStore);
  public readonly locale = inject(LocaleService);
  public readonly pendingReason = POST_PENDING_REASON;
  public readonly getPendingReasonLabelKey = getPendingReasonLabelKey;
  public readonly rejectionValidation = REJECTION_REASON_VALIDATION;

  public readonly rejectTarget = signal<RejectModalTarget | null>(null);

  public readonly rejectReasonControl = new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.minLength(REJECTION_REASON_VALIDATION.minLength),
      Validators.maxLength(REJECTION_REASON_VALIDATION.maxLength),
    ],
  });

  public readonly isEmpty = computed(
    () => !this.store.loading() && !this.store.error() && this.store.pendingPosts().length === 0,
  );

  public approve(id: string): void {
    this.store.moderatePost(id, POST_STATUS.approved);
  }

  public openRejectModal(post: Post): void {
    this.rejectReasonControl.reset();
    this.rejectTarget.set({ id: post.id, title: post.title });
  }

  public closeRejectModal(): void {
    this.rejectTarget.set(null);
  }

  public confirmReject(): void {
    const target = this.rejectTarget();
    if (!target) {
      return;
    }

    this.rejectReasonControl.markAsTouched();
    if (this.rejectReasonControl.invalid) {
      return;
    }

    this.store.moderatePost(target.id, POST_STATUS.rejected, this.rejectReasonControl.value.trim());
    this.closeRejectModal();
  }

  public onRejectReasonKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();
    this.confirmReject();
  }

  public isRejectReasonInvalid(): boolean {
    const control = this.rejectReasonControl;
    return control.invalid && control.touched;
  }

  public getRejectReasonError() {
    if (!this.isRejectReasonInvalid()) {
      return null;
    }

    return getPostFormControlError(this.rejectReasonControl.errors);
  }
}

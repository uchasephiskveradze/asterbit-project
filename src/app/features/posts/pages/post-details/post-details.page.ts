import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { LocaleService } from '../../../../core/i18n/locale.service';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { DeletePostDialogComponent } from '../../components/delete-post-dialog/delete-post-dialog.component';
import { getPostFormControlError } from '../../components/post-form/post-form-error.messages';
import { ModerationActionsComponent } from '../../components/moderation-actions/moderation-actions.component';
import { PostRevisionPanelComponent } from '../../components/post-revision-panel/post-revision-panel.component';
import { PostsPermissionService } from '../../services/posts-permission.service';
import { PostResolverResult } from '../../models/post-resolver-result.model';
import { REJECTION_REASON_VALIDATION } from '../../models/rejection-reason.validation';
import { POST_STATUS } from '../../models/post-status.model';
import { PostDetailsStore } from '../../store/post-details.store';
import { PostStatusLabelPipe } from '../../pipes/post-status-label.pipe';
import { getPostRevisionChanges, isEditedPendingReview } from '../../utils/post-revision.utils';
import {
  getPostBackNavigation,
  PostNavigationSource,
} from '../../utils/post-navigation.utils';

@Component({
  selector: 'app-post-details-page',
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    TranslatePipe,
    ModalComponent,
    ErrorStateComponent,
    DeletePostDialogComponent,
    PostRevisionPanelComponent,
    ModerationActionsComponent,
    PostStatusLabelPipe,
  ],
  providers: [PostDetailsStore],
  templateUrl: './post-details.page.html',
  styleUrl: './post-details.page.scss',
})
export class PostDetailsPage {
  public readonly id = input.required<string>();
  public readonly from = input<PostNavigationSource>();
  public readonly tab = input<string>();
  public readonly resolvedPost = input.required<PostResolverResult>();

  public readonly store = inject(PostDetailsStore);
  public readonly locale = inject(LocaleService);
  public readonly postStatus = POST_STATUS;
  public readonly rejectionValidation = REJECTION_REASON_VALIDATION;

  public readonly rejectModalOpen = signal(false);
  public readonly deleteModalOpen = signal(false);

  public readonly rejectReasonControl = new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.minLength(REJECTION_REASON_VALIDATION.minLength),
      Validators.maxLength(REJECTION_REASON_VALIDATION.maxLength),
    ],
  });

  private readonly auth = inject(AuthService);
  private readonly access = inject(PostsPermissionService);

  public readonly backNavigation = computed(() =>
    getPostBackNavigation(this.from(), { tab: this.tab() }),
  );

  public readonly canEdit = computed(() => {
    const post = this.store.post();
    return post ? this.access.canEditPost(post, this.auth.currentUser()) : false;
  });

  public readonly canDelete = computed(() => this.auth.isAdmin());

  public readonly canModerate = computed(() => {
    const post = this.store.post();
    return this.auth.isAdmin() && post?.status === POST_STATUS.pending;
  });

  public readonly revisionChanges = computed(() => {
    const post = this.store.post();
    return post ? getPostRevisionChanges(post) : [];
  });

  public readonly showsRevisionPanel = computed(() => {
    const post = this.store.post();
    if (!post || !isEditedPendingReview(post) || this.revisionChanges().length === 0) {
      return false;
    }

    if (this.auth.isAdmin()) {
      return true;
    }

    return post.submittedBy === this.auth.currentUser()?.id;
  });

  public constructor() {
    effect(() => {
      const id = this.id();
      const resolvedPost = this.resolvedPost();

      if (id && resolvedPost) {
        this.store.applyResolverResult(id, resolvedPost);
      }
    });
  }

  public approvePost(): void {
    this.store.moderatePost(POST_STATUS.approved);
  }

  public openRejectModal(): void {
    this.rejectReasonControl.reset();
    this.rejectModalOpen.set(true);
  }

  public closeRejectModal(): void {
    this.rejectModalOpen.set(false);
  }

  public confirmReject(): void {
    this.rejectReasonControl.markAsTouched();
    if (this.rejectReasonControl.invalid) {
      return;
    }

    this.store.moderatePost(POST_STATUS.rejected, this.rejectReasonControl.value.trim());
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

  public openDeleteDialog(): void {
    const post = this.store.post();
    if (!post || this.store.deleting()) {
      return;
    }

    this.deleteModalOpen.set(true);
  }

  public closeDeleteDialog(): void {
    if (this.store.deleting()) {
      return;
    }

    this.deleteModalOpen.set(false);
  }
}

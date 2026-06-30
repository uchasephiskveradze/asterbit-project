import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, Injector, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { DeletePostDialogComponent } from '../../components/delete-post-dialog/delete-post-dialog.component';
import { ModerationActionsComponent } from '../../components/moderation-actions/moderation-actions.component';
import { PostRevisionPanelComponent } from '../../components/post-revision-panel/post-revision-panel.component';
import { PostsErrorStateComponent } from '../../components/posts-error-state/posts-error-state.component';
import { PostsPermissionService } from '../../services/posts-permission.service';
import { PostResolverResult } from '../../models/post-resolver-result.model';
import { PostDetailsStore } from '../../store/post-details.store';
import { PostStatusLabelPipe } from '../../../../shared/pipes/post-status-label.pipe';
import { getPostRevisionChanges, isEditedPendingReview } from '../../utils/post-revision.utils';
import {
  getPostBackNavigation,
  PostNavigationSource,
} from '../../utils/post-navigation.utils';

@Component({
  selector: 'app-post-details-page',
  imports: [DatePipe, RouterLink, PostsErrorStateComponent, PostRevisionPanelComponent, ModerationActionsComponent, PostStatusLabelPipe],
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

  private readonly auth = inject(AuthService);
  private readonly access = inject(PostsPermissionService);
  private readonly dialog = inject(MatDialog);
  private readonly injector = inject(Injector);

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
    return this.auth.isAdmin() && post?.status === 'pending';
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
    this.store.moderatePost('approved');
  }

  public rejectPost(): void {
    this.store.moderatePost('rejected');
  }

  public openDeleteDialog(): void {
    const post = this.store.post();
    if (!post || this.store.deleting()) {
      return;
    }

    this.dialog.open(DeletePostDialogComponent, {
      data: { postId: post.id, postTitle: post.title },
      panelClass: 'delete-post-dialog-panel',
      autoFocus: 'dialog',
      injector: Injector.create({
        parent: this.injector,
        providers: [{ provide: PostDetailsStore, useValue: this.store }],
      }),
    });
  }
}

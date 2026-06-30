import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, Injector, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';

import { IsAdminDirective } from '../../../../core/auth/directives/is-admin.directive';
import { AuthService } from '../../../../core/auth/auth.service';
import { DeletePostDialogComponent } from '../../components/delete-post-dialog/delete-post-dialog.component';
import { PostsErrorStateComponent } from '../../components/posts-error-state/posts-error-state.component';
import { PostAccessService } from '../../data-access/post-access.service';
import { PostResolverResult } from '../../models/post-resolver-result.model';
import { PostDetailsStore } from '../../store/post-details.store';

@Component({
  selector: 'app-post-details-page',
  imports: [DatePipe, RouterLink, PostsErrorStateComponent],
  providers: [PostDetailsStore],
  templateUrl: './post-details.page.html',
  styleUrl: './post-details.page.scss',
})
export class PostDetailsPage {
  public readonly id = input.required<string>();
  public readonly resolvedPost = input.required<PostResolverResult>();

  public readonly store = inject(PostDetailsStore);

  private readonly auth = inject(AuthService);
  private readonly access = inject(PostAccessService);
  private readonly dialog = inject(MatDialog);
  private readonly injector = inject(Injector);

  public readonly canEdit = computed(() => {
    const post = this.store.post();
    return post ? this.access.canEditPost(post, this.auth.currentUser()) : false;
  });

  public readonly canDelete = computed(() => this.auth.isAdmin());

  public constructor() {
    effect(() => {
      const id = this.id();
      const resolvedPost = this.resolvedPost();

      if (id && resolvedPost) {
        this.store.applyResolverResult(id, resolvedPost);
      }
    });
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

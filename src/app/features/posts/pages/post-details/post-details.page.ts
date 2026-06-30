import { DatePipe } from '@angular/common';
import { Component, effect, inject, Injector, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';

import { DeletePostDialogComponent } from '../../components/delete-post-dialog/delete-post-dialog.component';
import { PostsErrorStateComponent } from '../../components/posts-error-state/posts-error-state.component';
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

  private readonly dialog = inject(MatDialog);
  private readonly injector = inject(Injector);

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

import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IsAdminDirective } from '../../../../core/auth/directives/is-admin.directive';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-posts-table',
  imports: [DatePipe, RouterLink, IsAdminDirective],
  templateUrl: './posts-table.component.html',
  styleUrl: './posts-table.component.scss',
})
export class PostsTableComponent {
  public readonly posts = input.required<Post[]>();
  public readonly showAdminActions = input(true);
  public readonly enableOwnerEdit = input(false);
  public readonly ownerId = input<string | null>(null);

  public canOwnerEdit(post: Post): boolean {
    const ownerId = this.ownerId();
    return (
      this.enableOwnerEdit() &&
      ownerId !== null &&
      post.submittedBy === ownerId &&
      post.status === 'approved'
    );
  }
}

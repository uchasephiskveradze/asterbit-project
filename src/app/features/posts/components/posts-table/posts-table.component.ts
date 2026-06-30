import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { Post } from '../../models/post.model';
import {
  getPostDetailsQueryParams,
  PostNavigationSource,
} from '../../utils/post-navigation.utils';

@Component({
  selector: 'app-posts-table',
  imports: [DatePipe, RouterLink],
  templateUrl: './posts-table.component.html',
  styleUrl: './posts-table.component.scss',
})
export class PostsTableComponent {
  protected readonly auth = inject(AuthService);

  public readonly posts = input.required<Post[]>();
  public readonly showAdminActions = input(true);
  public readonly enableOwnerEdit = input(false);
  public readonly ownerId = input<string | null>(null);
  public readonly detailsFrom = input<PostNavigationSource>();
  public readonly detailsTab = input<string | null>(null);

  public readonly detailsQueryParams = computed(() =>
    getPostDetailsQueryParams(this.detailsFrom(), this.detailsTab()),
  );

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

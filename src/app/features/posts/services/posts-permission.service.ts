import { Injectable } from '@angular/core';

import { User } from '../../../core/auth/models/user.model';
import { Post } from '../models/post.model';
import { POST_STATUS } from '../models/post-status.model';

@Injectable({
  providedIn: 'root',
})
export class PostsPermissionService {
  public canViewPost(post: Post, user: User | null): boolean {
    if (post.status === POST_STATUS.approved) {
      return true;
    }

    if (!user) {
      return false;
    }

    if (user.role === 'admin') {
      return true;
    }

    return post.submittedBy === user.id;
  }

  public isPubliclyListed(post: Post): boolean {
    return post.status === POST_STATUS.approved;
  }

  public canEditPost(post: Post, user: User | null): boolean {
    if (!user) {
      return false;
    }

    if (user.role === 'admin') {
      return true;
    }

    return (
      post.submittedBy === user.id &&
      (post.status === POST_STATUS.approved || post.status === POST_STATUS.rejected)
    );
  }
}

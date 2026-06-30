import { Injectable } from '@angular/core';

import { AuthUser } from '../../../core/auth/models/user.model';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root',
})
export class PostsPermissionService {
  public canViewPost(post: Post, user: AuthUser | null): boolean {
    if (post.status === 'approved') {
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
    return post.status === 'approved';
  }

  public canEditPost(post: Post, user: AuthUser | null): boolean {
    if (!user) {
      return false;
    }

    if (user.role === 'admin') {
      return true;
    }

    return post.submittedBy === user.id && post.status === 'approved';
  }
}

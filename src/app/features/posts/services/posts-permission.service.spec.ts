import { TestBed } from '@angular/core/testing';

import { User } from '../../../core/auth/models/user.model';
import { Post } from '../models/post.model';
import { PostsPermissionService } from './posts-permission.service';

describe('PostsPermissionService', () => {
  let service: PostsPermissionService;

  const approvedPost: Post = {
    id: '1',
    title: 'Approved',
    author: 'Author',
    description: 'A'.repeat(20),
    content: 'B'.repeat(100),
    createdAt: '2026-01-01T00:00:00.000Z',
    status: 'approved',
  };

  const pendingPost: Post = {
    ...approvedPost,
    id: '2',
    status: 'pending',
    submittedBy: '2',
  };

  const user: User = {
    id: '2',
    email: 'user@blog.com',
    role: 'user',
    name: 'Demo User',
  };

  const admin: User = {
    id: '1',
    email: 'admin@blog.com',
    role: 'admin',
    name: 'Admin User',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostsPermissionService);
  });

  it('should control who can view posts', () => {
    expect(service.canViewPost(approvedPost, null)).toBe(true);
    expect(service.canViewPost(pendingPost, user)).toBe(true);
    expect(service.canViewPost(pendingPost, admin)).toBe(true);
    expect(service.canViewPost(pendingPost, null)).toBe(false);
  });

  it('should allow owners to edit only approved posts', () => {
    const ownedApproved = { ...approvedPost, submittedBy: '2' };
    expect(service.canEditPost(ownedApproved, user)).toBe(true);
    expect(service.canEditPost(pendingPost, user)).toBe(false);
    expect(service.canEditPost(ownedApproved, admin)).toBe(true);
  });
});

import { Routes } from '@angular/router';

import { adminGuard } from '../../core/auth/guards/admin.guard';
import { authGuard } from '../../core/auth/guards/auth.guard';
import { guestGuard } from '../../core/auth/guards/guest.guard';

import { postResolver } from './resolvers/post.resolver';

export const POSTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/posts-list/posts-list.page').then((m) => m.PostsListPage),
  },
  {
    path: 'my',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/my-posts/my-posts.page').then((m) => m.MyPostsPage),
  },
  {
    path: 'moderation',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/moderation/moderation.page').then((m) => m.ModerationPage),
  },
  {
    path: 'new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/post-upsert/post-upsert.page').then((m) => m.PostUpsertPage),
  },
  {
    path: ':id/edit',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/post-upsert/post-upsert.page').then((m) => m.PostUpsertPage),
    resolve: {
      resolvedPost: postResolver,
    },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/post-details/post-details.page').then((m) => m.PostDetailsPage),
    resolve: {
      resolvedPost: postResolver,
    },
  },
];

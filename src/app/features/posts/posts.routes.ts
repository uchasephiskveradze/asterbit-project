import { Routes } from '@angular/router';

import { adminGuard } from '../../core/auth/guards/admin.guard';
import { authGuard } from '../../core/auth/guards/auth.guard';
import { postEditGuard } from './guards/post-edit.guard';
import { postUpsertCanDeactivateGuard } from './guards/post-upsert-can-deactivate.guard';
import { postResolver } from './resolvers/post-resolver.service';

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
    canDeactivate: [postUpsertCanDeactivateGuard],
    loadComponent: () =>
      import('./pages/post-upsert/post-upsert.page').then((m) => m.PostUpsertPage),
  },
  {
    path: ':id/edit',
    canActivate: [authGuard, postEditGuard],
    canDeactivate: [postUpsertCanDeactivateGuard],
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

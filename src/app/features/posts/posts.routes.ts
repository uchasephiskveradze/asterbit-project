import { Routes } from '@angular/router';

export const POSTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/posts-list/posts-list.page').then((m) => m.PostsListPage),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/post-upsert/post-upsert.page').then((m) => m.PostUpsertPage),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/post-upsert/post-upsert.page').then((m) => m.PostUpsertPage),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/post-details/post-details.page').then((m) => m.PostDetailsPage),
  },
];

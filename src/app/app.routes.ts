import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'posts',
      },
      {
        path: 'posts',
        loadChildren: () => import('./features/posts/posts.routes').then((m) => m.POSTS_ROUTES),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./core/pages/not-found/not-found.page').then((m) => m.NotFoundPage),
      },
    ],
  },
];

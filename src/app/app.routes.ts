import { Routes } from '@angular/router';

import { guestGuard } from './core/auth/guards/guest.guard';
import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
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

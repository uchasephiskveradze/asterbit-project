import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../../../core/auth/services/auth.service';
import { PostsPermissionService } from '../services/posts-permission.service';
import { PostsApiService } from '../services/posts-api.service';

export const postEditGuard: CanActivateFn = (route, state) => {
  const api = inject(PostsApiService);
  const auth = inject(AuthService);
  const access = inject(PostsPermissionService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  const id = route.paramMap.get('id');
  if (!id) {
    return router.createUrlTree(['/posts']);
  }

  return api.getPostById(id).pipe(
    map((post) =>
      access.canEditPost(post, auth.currentUser())
        ? true
        : router.createUrlTree(['/posts']),
    ),
    catchError(() => of(router.createUrlTree(['/posts']))),
  );
};

import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { PostsApiService } from '../data-access/posts-api.service';
import { PostAccessService } from '../data-access/post-access.service';
import { PostResolverResult } from '../models/post-resolver-result.model';

export const postResolver: ResolveFn<PostResolverResult> = (route) => {
  const api = inject(PostsApiService);
  const auth = inject(AuthService);
  const access = inject(PostAccessService);
  const id = route.paramMap.get('id');

  if (!id) {
    return of({
      post: null,
      notFound: true,
      error: null,
    });
  }

  return api.getPostById(id).pipe(
    map((post) => {
      if (!access.canViewPost(post, auth.currentUser())) {
        return {
          post: null,
          notFound: true,
          error: null,
        };
      }

      return {
        post,
        notFound: false,
        error: null,
      };
    }),
    catchError((err: HttpErrorResponse) => {
      if (err.status === 404) {
        return of({
          post: null,
          notFound: true,
          error: null,
        });
      }

      return of({
        post: null,
        notFound: false,
        error: 'Unable to load post. Please try again.',
      });
    }),
  );
};

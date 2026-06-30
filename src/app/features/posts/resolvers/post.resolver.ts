import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { PostsApiService } from '../data-access/posts-api.service';
import { PostResolverResult } from '../models/post-resolver-result.model';

export const postResolver: ResolveFn<PostResolverResult> = (route) => {
  const api = inject(PostsApiService);
  const id = route.paramMap.get('id');

  if (!id) {
    return of({
      post: null,
      notFound: true,
      error: null,
    });
  }

  return api.getPostById(id).pipe(
    map((post) => ({
      post,
      notFound: false,
      error: null,
    })),
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

import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { PostsApiService } from '../data-access/posts-api.service';
import { PostAccessService } from '../data-access/post-access.service';
import { PostResolverResult } from '../models/post-resolver-result.model';

@Injectable({
  providedIn: 'root',
})
export class PostResolver {
  private readonly api = inject(PostsApiService);
  private readonly auth = inject(AuthService);
  private readonly access = inject(PostAccessService);

  public resolve(route: ActivatedRouteSnapshot): Observable<PostResolverResult> {
    const id = route.paramMap.get('id');

    if (!id) {
      return of({
        post: null,
        notFound: true,
        error: null,
      });
    }

    return this.api.getPostById(id).pipe(
      map((post) => {
        if (!this.access.canViewPost(post, this.auth.currentUser())) {
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
  }
}

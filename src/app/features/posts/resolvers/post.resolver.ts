import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { PostResolverResult } from '../models/post-resolver-result.model';
import { PostResolver } from './post-resolver.service';

export const postResolver: ResolveFn<PostResolverResult> = (route) =>
  inject(PostResolver).resolve(route);

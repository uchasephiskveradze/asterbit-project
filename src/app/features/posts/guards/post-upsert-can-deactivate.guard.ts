import { CanDeactivateFn } from '@angular/router';

import { PostUpsertPage } from '../pages/post-upsert/post-upsert.page';

export const postUpsertCanDeactivateGuard: CanDeactivateFn<PostUpsertPage> = (component) =>
  component.canDeactivate();

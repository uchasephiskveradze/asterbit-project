import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';

import { AuthService } from '../../../core/auth/services/auth.service';
import { Post } from '../models/post.model';
import { POST_STATUS } from '../models/post-status.model';
import {
  filterRejectedWithReasonForUser,
  filterUnseenForBadge,
  filterUnseenForModal,
} from '../utils/rejection-notice.utils';
import { PostsApiService } from './posts-api.service';
import { RejectionNoticeStorageService } from './rejection-notice-storage.service';

@Injectable({
  providedIn: 'root',
})
export class RejectionNoticeService {
  private readonly api = inject(PostsApiService);
  private readonly auth = inject(AuthService);
  private readonly storage = inject(RejectionNoticeStorageService);

  private readonly badgeCount = signal(0);

  public readonly unseenBadgeCount = this.badgeCount.asReadonly();

  public refreshBadge(): void {
    const user = this.auth.currentUser();

    if (!user || user.role === 'admin') {
      this.badgeCount.set(0);
      return;
    }

    this.fetchRejectedWithReasonForUser(user.id)
      .pipe(
        map((posts) => {
          const state = this.storage.read(user.id);
          return filterUnseenForBadge(posts, state).length;
        }),
        catchError(() => of(0)),
      )
      .subscribe((count) => this.badgeCount.set(count));
  }

  public getUnseenForModal(): Observable<Post[]> {
    const user = this.auth.currentUser();

    if (!user || user.role === 'admin') {
      return of([]);
    }

    return this.fetchRejectedWithReasonForUser(user.id).pipe(
      map((posts) => {
        const state = this.storage.read(user.id);
        return filterUnseenForModal(posts, state);
      }),
      catchError(() => of([])),
    );
  }

  public markModalAcknowledged(posts: Post[]): void {
    const user = this.auth.currentUser();

    if (!user) {
      return;
    }

    this.storage.markAcknowledged(
      user.id,
      posts.map((post) => post.id),
    );
  }

  public markRejectedTabVisited(posts: Post[]): void {
    const user = this.auth.currentUser();

    if (!user) {
      return;
    }

    const rejectedWithReason = filterRejectedWithReasonForUser(posts, user.id);

    if (rejectedWithReason.length === 0) {
      return;
    }

    this.storage.markSeen(
      user.id,
      rejectedWithReason.map((post) => post.id),
    );
    this.refreshBadge();
  }

  private fetchRejectedWithReasonForUser(userId: string): Observable<Post[]> {
    return this.api.getPosts({ query: { status: POST_STATUS.rejected } }).pipe(
      map((posts) => filterRejectedWithReasonForUser(posts, userId)),
      tap(() => this.refreshBadge()),
    );
  }
}

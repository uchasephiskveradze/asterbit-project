import { Injectable } from '@angular/core';

import {
  EMPTY_REJECTION_NOTICE_STATE,
  getRejectionNoticeStorageKey,
  RejectionNoticeState,
} from '../models/rejection-notice.model';

@Injectable({
  providedIn: 'root',
})
export class RejectionNoticeStorageService {
  public read(userId: string): RejectionNoticeState {
    const raw = localStorage.getItem(getRejectionNoticeStorageKey(userId));

    if (!raw) {
      return { ...EMPTY_REJECTION_NOTICE_STATE };
    }

    try {
      const parsed = JSON.parse(raw) as Partial<RejectionNoticeState>;

      return {
        seenPostIds: this.normalizeIds(parsed.seenPostIds),
        acknowledgedPostIds: this.normalizeIds(parsed.acknowledgedPostIds),
      };
    } catch {
      return { ...EMPTY_REJECTION_NOTICE_STATE };
    }
  }

  public markSeen(userId: string, postIds: string[]): void {
    if (postIds.length === 0) {
      return;
    }

    const state = this.read(userId);
    const seenPostIds = [...new Set([...state.seenPostIds, ...postIds])];

    this.write(userId, { ...state, seenPostIds });
  }

  public markAcknowledged(userId: string, postIds: string[]): void {
    if (postIds.length === 0) {
      return;
    }

    const state = this.read(userId);
    const acknowledgedPostIds = [...new Set([...state.acknowledgedPostIds, ...postIds])];

    this.write(userId, { ...state, acknowledgedPostIds });
  }

  private write(userId: string, state: RejectionNoticeState): void {
    localStorage.setItem(getRejectionNoticeStorageKey(userId), JSON.stringify(state));
  }

  private normalizeIds(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((id): id is string => typeof id === 'string');
  }
}

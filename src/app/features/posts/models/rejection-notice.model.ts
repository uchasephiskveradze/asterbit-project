export const REJECTION_NOTICE_STORAGE_KEY_PREFIX = 'asterbit-rejection-notices';

export interface RejectionNoticeState {
  seenPostIds: string[];
  acknowledgedPostIds: string[];
}

export const EMPTY_REJECTION_NOTICE_STATE: RejectionNoticeState = {
  seenPostIds: [],
  acknowledgedPostIds: [],
};

export function getRejectionNoticeStorageKey(userId: string): string {
  return `${REJECTION_NOTICE_STORAGE_KEY_PREFIX}:${userId}`;
}

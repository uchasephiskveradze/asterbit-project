import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { getRejectionNoticeStorageKey } from '../models/rejection-notice.model';
import { RejectionNoticeStorageService } from './rejection-notice-storage.service';

describe('RejectionNoticeStorageService', () => {
  let service: RejectionNoticeStorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(RejectionNoticeStorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return empty state when nothing is stored', () => {
    expect(service.read('user-1')).toEqual({
      seenPostIds: [],
      acknowledgedPostIds: [],
    });
  });

  it('should persist seen and acknowledged post ids per user', () => {
    service.markSeen('user-1', ['post-1']);
    service.markAcknowledged('user-1', ['post-2']);

    expect(service.read('user-1')).toEqual({
      seenPostIds: ['post-1'],
      acknowledgedPostIds: ['post-2'],
    });
    expect(localStorage.getItem(getRejectionNoticeStorageKey('user-1'))).toContain('post-1');
  });
});

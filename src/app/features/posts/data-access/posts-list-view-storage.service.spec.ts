import { TestBed } from '@angular/core/testing';

import { POSTS_LIST_VIEW_MODE_KEY } from '../models/posts-list-view-mode.model';
import { PostsListViewStorageService } from './posts-list-view-storage.service';

describe('PostsListViewStorageService', () => {
  let service: PostsListViewStorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostsListViewStorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should default to pagination when nothing is stored', () => {
    expect(service.read()).toBe('pagination');
  });

  it('should persist the selected view mode', () => {
    service.write('infinite-scroll');

    expect(localStorage.getItem(POSTS_LIST_VIEW_MODE_KEY)).toBe('infinite-scroll');
    expect(service.read()).toBe('infinite-scroll');
  });

  it('should fall back to pagination for invalid stored values', () => {
    localStorage.setItem(POSTS_LIST_VIEW_MODE_KEY, 'invalid');

    expect(service.read()).toBe('pagination');
  });
});

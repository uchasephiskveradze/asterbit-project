import { Injectable } from '@angular/core';

import {
  DEFAULT_POSTS_LIST_VIEW_MODE,
  isPostsListViewMode,
  POSTS_LIST_VIEW_MODE_KEY,
  PostsListViewMode,
} from '../models/posts-list-view-mode.model';

@Injectable({
  providedIn: 'root',
})
export class PostsViewStorageService {
  public read(): PostsListViewMode {
    const value = localStorage.getItem(POSTS_LIST_VIEW_MODE_KEY);
    return isPostsListViewMode(value) ? value : DEFAULT_POSTS_LIST_VIEW_MODE;
  }

  public write(mode: PostsListViewMode): void {
    localStorage.setItem(POSTS_LIST_VIEW_MODE_KEY, mode);
  }
}

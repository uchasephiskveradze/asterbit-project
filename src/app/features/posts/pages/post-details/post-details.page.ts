import { DatePipe } from '@angular/common';
import { Component, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PostsErrorStateComponent } from '../../components/posts-error-state/posts-error-state.component';
import { PostDetailsStore } from '../../store/post-details.store';

@Component({
  selector: 'app-post-details-page',
  imports: [DatePipe, RouterLink, PostsErrorStateComponent],
  providers: [PostDetailsStore],
  templateUrl: './post-details.page.html',
  styleUrl: './post-details.page.scss',
})
export class PostDetailsPage {
  public readonly id = input.required<string>();
  public readonly store = inject(PostDetailsStore);

  public constructor() {
    effect(() => {
      const id = this.id();
      if (id) {
        this.store.loadPost(id);
      }
    });
  }
}

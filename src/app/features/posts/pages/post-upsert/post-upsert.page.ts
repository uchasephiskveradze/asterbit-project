import { Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PostFormComponent } from '../../components/post-form/post-form.component';
import { PostFormValue } from '../../components/post-form/types/post-form.types';
import { PostUpsertStore } from '../../store/post-upsert.store';

@Component({
  selector: 'app-post-upsert-page',
  imports: [RouterLink, PostFormComponent],
  providers: [PostUpsertStore],
  templateUrl: './post-upsert.page.html',
  styleUrl: './post-upsert.page.scss',
})
export class PostUpsertPage {
  public readonly id = input<string>();

  public readonly store = inject(PostUpsertStore);

  public readonly isEditMode = computed(() => this.id() !== undefined);

  public readonly pageTitle = computed(() =>
    this.isEditMode() ? 'Edit Post' : 'Create New Post',
  );

  public readonly pageSubtitle = computed(() =>
    this.isEditMode()
      ? 'Update your post and save changes.'
      : 'Draft your next insight and share it with your audience.',
  );

  public readonly submitLabel = computed(() =>
    this.isEditMode() ? 'Update Post' : 'Create Post',
  );

  public readonly cancelLink = computed(() =>
    this.isEditMode() ? `/posts/${this.id()}` : '/posts',
  );

  public constructor() {
    effect(() => {
      const id = this.id();
      if (id) {
        this.store.loadPost(id);
      }
    });
  }

  public onSubmit(value: PostFormValue): void {
    const id = this.id();

    if (id) {
      this.store.updatePost(id, value);
      return;
    }

    this.store.createPost(value);
  }
}

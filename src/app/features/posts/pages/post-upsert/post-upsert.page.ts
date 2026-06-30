import { Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PostFormComponent } from '../../components/post-form/post-form.component';
import { PostFormValue } from '../../components/post-form/types/post-form.types';
import { PostsErrorStateComponent } from '../../components/posts-error-state/posts-error-state.component';
import { PostResolverResult } from '../../models/post-resolver-result.model';
import { PostUpsertStore } from '../../store/post-upsert.store';

@Component({
  selector: 'app-post-upsert-page',
  imports: [RouterLink, PostFormComponent, PostsErrorStateComponent],
  providers: [PostUpsertStore],
  templateUrl: './post-upsert.page.html',
  styleUrl: './post-upsert.page.scss',
})
export class PostUpsertPage {
  public readonly id = input<string>();
  public readonly from = input<'list' | 'details'>();
  public readonly resolvedPost = input<PostResolverResult>();

  public readonly store = inject(PostUpsertStore);

  public readonly isEditMode = computed(() => this.id() !== undefined);

  public readonly showForm = computed(
    () => !this.isEditMode() || this.store.post() !== null,
  );

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

  public readonly cancelLink = computed(() => {
    if (!this.isEditMode()) {
      return '/posts';
    }

    return this.from() === 'list' ? '/posts' : `/posts/${this.id()}`;
  });

  public constructor() {
    effect(() => {
      const resolvedPost = this.resolvedPost();
      if (resolvedPost) {
        this.store.applyResolverResult(resolvedPost);
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

  public reloadPage(): void {
    globalThis.location.reload();
  }
}

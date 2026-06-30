import { Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';
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
  public readonly from = input<'list' | 'details' | 'my-posts'>();
  public readonly resolvedPost = input<PostResolverResult>();

  public readonly auth = inject(AuthService);
  public readonly store = inject(PostUpsertStore);

  public readonly isEditMode = computed(() => this.id() !== undefined);
  public readonly hideAuthorField = computed(() => !this.isEditMode());
  public readonly isOwnerResubmit = computed(
    () =>
      this.isEditMode() &&
      !this.auth.isAdmin() &&
      this.store.post()?.status === 'approved' &&
      this.store.post()?.submittedBy === this.auth.currentUser()?.id,
  );

  public readonly pageTitle = computed(() => {
    if (this.isEditMode()) {
      return 'Edit Post';
    }

    return this.auth.isAdmin() ? 'Create New Post' : 'Submit Post';
  });

  public readonly pageSubtitle = computed(() => {
    if (this.isOwnerResubmit()) {
      return 'Your changes will be reviewed by an admin before the post is published again.';
    }

    if (this.isEditMode()) {
      return 'Update your post and save changes.';
    }

    return this.auth.isAdmin()
      ? 'Publish a new post immediately.'
      : 'Your post will be reviewed by an admin before publication.';
  });

  public readonly submitLabel = computed(() => {
    if (this.isOwnerResubmit()) {
      return 'Submit for Review';
    }

    if (this.isEditMode()) {
      return 'Update Post';
    }

    return this.auth.isAdmin() ? 'Create Post' : 'Submit for Review';
  });
  public readonly cancelLink = computed(() => {
    if (!this.isEditMode()) {
      return '/posts';
    }

    if (this.from() === 'my-posts') {
      return '/posts/my';
    }

    return this.from() === 'list' ? '/posts' : `/posts/${this.id()}`;
  });

  public readonly showForm = computed(
    () => !this.isEditMode() || this.store.post() !== null,
  );
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
    const id = this.id();

    if (id) {
      this.store.reloadPost(id);
    }
  }
}

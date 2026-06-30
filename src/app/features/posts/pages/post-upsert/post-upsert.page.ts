import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-post-upsert-page',
  imports: [RouterLink],
  template: `
    <section class="page">
      <header class="page__header">
        <div>
          <h1 class="page__title">{{ pageTitle() }}</h1>
          <p class="page__subtitle">{{ pageSubtitle() }}</p>
        </div>
        <a class="page__cancel" [routerLink]="cancelLink()">Cancel</a>
      </header>

      <div class="page__card">
        <p class="page__placeholder">Shared post form will be implemented here.</p>
      </div>
    </section>
  `,
  styles: `
    .page__header {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .page__title {
      margin: 0;
      font-family: Manrope, sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: #0f172a;
    }

    .page__subtitle {
      margin: 0.5rem 0 0;
      color: #505f76;
    }

    .page__cancel {
      color: #505f76;
      font-weight: 600;
      text-decoration: none;
    }

    .page__card {
      padding: 2rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      background: #fff;
    }

    .page__placeholder {
      margin: 0;
      color: #505f76;
    }
  `,
})
export class PostUpsertPage {
  readonly id = input<string>();

  readonly isEditMode = computed(() => this.id() !== undefined);

  readonly pageTitle = computed(() => (this.isEditMode() ? 'Edit Post' : 'Create Post'));

  readonly pageSubtitle = computed(() =>
    this.isEditMode()
      ? `Update post #${this.id()}`
      : 'Add a new blog post to the collection.',
  );

  readonly cancelLink = computed(() => (this.isEditMode() ? `/posts/${this.id()}` : '/posts'));
}

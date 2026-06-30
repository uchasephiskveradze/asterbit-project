import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-post-details-page',
  imports: [RouterLink],
  template: `
    <section class="page">
      <div class="page__toolbar">
        <a class="page__back" routerLink="/posts">Back to Posts</a>

        <div class="page__actions">
          <a class="page__action page__action--secondary" [routerLink]="['/posts', id(), 'edit']">
            Edit
          </a>
          <button class="page__action page__action--danger" type="button">Delete</button>
        </div>
      </div>

      <article class="page__card">
        <h1 class="page__title">Post Details</h1>
        <p class="page__meta">Post ID: {{ id() }}</p>
        <p class="page__placeholder">Post details content will be implemented here.</p>
      </article>
    </section>
  `,
  styles: `
    @use 'palette' as *;

    .page__toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .page__back {
      color: $color-secondary;
      font-weight: 600;
      text-decoration: none;
    }

    .page__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .page__action {
      display: inline-flex;
      align-items: center;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: $radius-md;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
    }

    .page__action--secondary {
      border: 1px solid $color-border-subtle;
      background: $color-surface-lowest;
      color: $color-secondary;
    }

    .page__action--danger {
      background: $color-error-red;
      color: $color-on-primary;
    }

    .page__card {
      padding: 2rem;
      border: 1px solid $color-border-subtle;
      border-radius: $radius-lg;
      background: $color-surface-lowest;
    }

    .page__title {
      margin: 0;
      font-family: $font-family-headline;
      font-size: 2rem;
      color: $color-slate-900;
    }

    .page__meta {
      margin: 0.75rem 0 1.5rem;
      color: $color-secondary;
      font-size: 0.875rem;
    }

    .page__placeholder {
      margin: 0;
      color: $color-secondary;
    }
  `,
})
export class PostDetailsPage {
  readonly id = input.required<string>();
}

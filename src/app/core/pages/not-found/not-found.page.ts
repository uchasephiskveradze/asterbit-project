import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <section class="page">
      <div class="page__content">
        <p class="page__badge">Not Found</p>
        <h1 class="page__title">Page not found</h1>
        <p class="page__description">
          The page you are looking for does not exist or may have been removed.
        </p>
        <a class="page__action" routerLink="/posts">Return to Posts</a>
      </div>
    </section>
  `,
  styles: `
    @use 'palette' as *;

    .page {
      display: flex;
      justify-content: center;
      padding: 3rem 0;
    }

    .page__content {
      max-width: 32rem;
      text-align: center;
    }

    .page__badge {
      display: inline-flex;
      margin: 0 0 1rem;
      padding: 0.25rem 0.75rem;
      border-radius: $radius-full;
      background: $color-error-container;
      color: $color-on-error-container;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .page__title {
      margin: 0;
      font-family: $font-family-headline;
      font-size: 2rem;
      color: $color-slate-900;
    }

    .page__description {
      margin: 1rem 0 1.5rem;
      color: $color-secondary;
    }

    .page__action {
      display: inline-flex;
      padding: 0.75rem 1.5rem;
      border-radius: $radius-md;
      background: $color-primary-container;
      color: $color-on-primary;
      font-weight: 600;
      text-decoration: none;
    }
  `,
})
export class NotFoundPage {}

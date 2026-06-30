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
      border-radius: 999px;
      background: #ffdad6;
      color: #93000a;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .page__title {
      margin: 0;
      font-family: Manrope, sans-serif;
      font-size: 2rem;
      color: #0f172a;
    }

    .page__description {
      margin: 1rem 0 1.5rem;
      color: #505f76;
    }

    .page__action {
      display: inline-flex;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      background: #1e40af;
      color: #fff;
      font-weight: 600;
      text-decoration: none;
    }
  `,
})
export class NotFoundPage {}

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-posts-list-page',
  imports: [RouterLink],
  template: `
    <section class="page">
      <header class="page__header">
        <div>
          <h1 class="page__title">Posts</h1>
          <p class="page__subtitle">Browse and manage blog posts.</p>
        </div>
        <a class="page__action" routerLink="/posts/new">Create Post</a>
      </header>

      <p class="page__placeholder">Posts list will be implemented here.</p>
    </section>
  `,
  styles: `
    .page__header {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
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

    .page__action {
      display: inline-flex;
      padding: 0.625rem 1.25rem;
      border-radius: 0.5rem;
      background: #1e40af;
      color: #fff;
      font-weight: 600;
      text-decoration: none;
    }

    .page__placeholder {
      margin: 0;
      padding: 2rem;
      border: 1px dashed #e2e8f0;
      border-radius: 0.75rem;
      background: #fff;
      color: #505f76;
      text-align: center;
    }
  `,
})
export class PostsListPage {}

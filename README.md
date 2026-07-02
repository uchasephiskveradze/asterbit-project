# Blog Management System

SPA built with Angular 22 for managing blog posts with CRUD, search, sorting, pagination, moderation, and role-based access.

## Run the project

Requirements:

- Node.js 20+
- npm 11+

Install dependencies:

```bash
npm install
```

Start the mock backend:

```bash
npm run api
```

Start the Angular app:

```bash
npm start
```

Open `http://localhost:4200`.

Useful commands:

```bash
npm run build
npm test
```

For Lighthouse, test the production build instead of `ng serve`:

```bash
npm run build
npx serve dist/asterbit-task/browser -l 4200
```

## Versions

- Angular: `22`
- TypeScript: `6`
- RxJS: `7.8`
- NgRx Signals: `21.1.1`
- Angular Material: `22`
- ngx-translate: `18`
- json-server: `1.0.0-beta.15`
- Vitest: `4`

## Main libraries

| Library | Why it is used |
|---------|----------------|
| `@angular/router` | Standalone routing, lazy routes, route params, resolver integration |
| `@angular/forms` | Reactive forms and validation |
| `@angular/material` | Buttons and loading UI where Material made sense |
| `@ngrx/signals` | Feature-level signal stores for posts flows |
| `@ngx-translate/core` | English / Georgian UI translations |
| `rxjs` | Async flows with `switchMap`, `debounceTime`, `distinctUntilChanged`, `catchError`, `tap`, `finalize` |
| `json-server` | Mock backend over `db.json` |
| `vitest` | Unit tests |

## Architecture

The project uses a **feature-based structure**:

- `core/` for cross-app concerns such as auth, routing, interceptors, i18n, theme, and layout
- `features/auth/` for login
- `features/posts/` for posts pages, components, models, resolver, guards, services, and stores
- `shared/` for reusable UI pieces, styles, directives, utilities, and pipes

The code follows **SRP** by separating responsibilities:

- pages compose UI and connect flows
- components stay focused and reusable
- API access lives in services
- routing access checks live in guards/resolver
- posts page state is managed in dedicated **NgRx Signal Stores**
- app-wide concerns like auth, locale, and theme remain plain services

Routing is **standalone** and **lazy-loaded**:

- root routes: `src/app/app.routes.ts`
- posts feature routes: `src/app/features/posts/posts.routes.ts`

The app uses:

- standalone components
- standalone routing
- lazy loading
- `inject()`
- signals / `computed()` / `effect()`
- `input()` / `output()`
- new control flow (`@if`, `@for`)
- resolver-based post loading
- responsive layout
- loading, empty, and error states

## State management

Posts domain uses **NgRx Signal Store**:

- `PostsListStore`
- `MyPostsStore`
- `ModerationStore`
- `PostDetailsStore`
- `PostUpsertStore`

App-level state stays in focused services:

- `AuthService`
- `ThemeService`
- `LocaleService`
- `RejectionNoticeService`

This keeps shared app concerns simple, while the feature flows with async data and derived state use stores.

## Why some “ideal” requirements were not used

### Firebase
Not used because the assignment explicitly allows a mock backend, and `json-server` is enough to demonstrate HTTP CRUD, routing, validation, state handling, and UI flows without introducing unnecessary infrastructure.

### Backend framework
Not used for the same reason: the task is frontend-focused, and a mock API is sufficient for the required functionality.

### Full authentication backend
Not used because the assignment only benefits from demonstrating route protection and role-based UI behavior. A mock auth flow was enough for that scope.

### Global NgRx store
Not used as a single app-wide store because the app does not have enough cross-feature shared state to justify it. Feature-level `@ngrx/signals` stores for posts are enough, and auth/theme/locale are simpler as services.

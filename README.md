# Blog Management System

Angular SPA for managing blog posts with role-based access, moderation workflow, and full CRUD (list, view, create, edit, delete) plus search, sorting, and infinite scroll.

## Requirements

- Node.js 20+
- npm 11+

## Getting Started

Install dependencies:

```bash
npm install
```

Start the mock API (json-server on port 3000):

```bash
npm run api
```

In a second terminal, start the Angular dev server (proxies `/api` to the mock backend):

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200). You will be redirected to **Login** — the app requires authentication.

### Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| `admin@blog.com` | `admin123` | Admin — moderate, edit/delete any post, auto-approved creates |
| `user@blog.com` | `user123` | User — submit posts for review, edit own approved posts (re-review) |

### Other Scripts

```bash
npm run build   # production build
npm test        # unit tests (Vitest)
```

## Angular Version

**Angular 22** (standalone components, signals, new control flow)

## Libraries

| Library | Purpose |
|---------|---------|
| Angular Material | `MatDialog`, `MatButton`, `MatProgressSpinner` for dialogs and moderation actions |
| RxJS | HTTP streams, operators in signal stores |
| json-server | Mock REST API (`db.json`) for posts and users |
| Vitest | Unit testing |

Custom Stitch-styled UI is used for lists, filters, forms, and layout. Material is applied selectively where it improves feedback (dialogs, spinners, moderation buttons).

## Features

### Posts (all logged-in users)

- Browse **approved** posts with debounced search, date sort, and pagination
- View post details
- **Users** submit new posts → `pending` until admin approval
- **Admins** create posts → immediately `approved`

### My Posts (`/posts/my`)

Tabs for the current user's submissions:

- **Under Review** — `pending`
- **Approved**
- **Rejected**

Users can edit their own **approved** posts; changes return to `pending` for admin re-review with a before/after diff on post details.

### Moderation (`/posts/moderation`, admin only)

- Review pending submissions from all users
- Approve or reject from the queue or directly on post details
- **New submission** vs **Edited submission** badges on the queue

### Auth

- Mock login via `AuthService` (signals + `localStorage`)
- Route guards: `authGuard`, `adminGuard`, `guestGuard`, `postEditGuard`
- HTTP interceptor attaches a demo bearer token

See [docs/AUTH-MODERATION.md](docs/AUTH-MODERATION.md) for the full role and workflow spec.

## Architecture

Feature-based structure with lazy-loaded routes and signal stores.

```
src/app/
├── core/
│   ├── auth/           # AuthService, guards, interceptor, session storage
│   ├── layout/         # Main shell with role-aware navigation
│   ├── config/         # API base URL
│   └── pages/          # 404
├── features/
│   ├── auth/pages/     # Login
│   └── posts/
│       ├── components/ # Table, filters, form, states, revision panel, moderation actions
│       ├── data-access/  # PostsApiService, PostAccessService
│       ├── models/       # Post, status, revision, DTOs
│       ├── pages/        # List, details, upsert, my-posts, moderation
│       ├── resolvers/    # postResolver — preload + access check
│       ├── store/        # Signal stores per page/flow
│       └── utils/        # Revision diff helpers
```

### State Management

Signal stores per feature area (not NgRx):

| Store | Responsibility |
|-------|----------------|
| **PostsListStore** | Fetch, debounced search, sort, infinite scroll batching (approved only) |
| **PostDetailsStore** | Resolved post, delete, moderation actions, retry |
| **PostUpsertStore** | Create/update, resolver seed for edit, re-review snapshot |
| **MyPostsStore** | User's posts filtered by tab |
| **ModerationStore** | Admin pending queue, approve/reject |

RxJS integrates via `switchMap`, `debounceTime`, `distinctUntilChanged`, `catchError`, `tap`, and `finalize`.

### Routing

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Guest only | Sign in |
| `/posts` | Authenticated | Approved posts list |
| `/posts/my` | Authenticated | Own posts by status tab |
| `/posts/moderation` | Admin | Pending review queue |
| `/posts/new` | Authenticated | Create / submit post |
| `/posts/:id` | Authenticated | Post details (+ admin moderation on pending) |
| `/posts/:id/edit` | Admin or post owner (approved) | Edit form |

- Lazy-loaded standalone routes
- Route resolver preloads post data and enforces view access
- Component input binding for route params, query params, and resolved data

### Mock API

- `npm run api` serves `db.json` at `http://localhost:3000`
- Angular proxy (`proxy.conf.json`) maps `/api/*` → `http://localhost:3000/*`
- Collections: `posts`, `users`
- Post fields include `status`, `submittedBy`, `pendingReason`, `previousVersion` (for edited resubmissions)
- Post IDs are server-generated strings (json-server v1)

## Technical Highlights

| Area | Implementation |
|------|----------------|
| **Route Guards** | `authGuard`, `adminGuard`, `guestGuard`, `postEditGuard` |
| **HTTP Interceptor** | `authInterceptor` — attaches demo bearer token |
| **Custom Pipes** | `postStatusLabel`, `truncate` |
| **Custom Directives** | `*appIsAdmin`, `*appIsAuthenticated`, `appInfiniteScroll` |
| **Unit Tests** | Guards, access rules, pipes, theme, revision utils, components |
| **Dark / Light Theme** | `ThemeService` + header toggle, `localStorage` persistence |
| **Local Storage** | Auth session + theme preference |
| **Infinite Scroll** | Posts list loads more via `IntersectionObserver` |
| **Authentication** | Mock login with roles (`user` / `admin`) |

### Intentionally not used

| Area | Choice |
|------|--------|
| **NgRx** | Signal stores per feature — simpler for this scope |
| **Firebase** | json-server mock API for local/demo workflow |
| **Backend framework** | json-server stands in for a REST backend |

## Quick Test Flow

1. Login as **user** → Create Post → check **My Posts → Under Review**
2. Login as **admin** → **Moderation** → Approve
3. Login as **user** → edit approved post → Submit for Review
4. Login as **admin** → open post details → review diff → Approve or Reject

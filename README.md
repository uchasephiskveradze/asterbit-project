# Blog Management System

Angular SPA for managing blog posts with role-based access, moderation workflow, and full CRUD (list, view, create, edit, delete) plus search, sorting, and pagination.

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

Demo passwords are validated in `AuthApiService` (not stored in `db.json`).

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
| **ngx-translate** | UI strings in English and Georgian (`public/i18n/en.json`, `ka.json`) |
| Angular Material | `MatButton`, `MatProgressSpinner` for moderation and delete actions |
| RxJS | HTTP streams, operators in signal stores |
| json-server | Mock REST API (`db.json`) for posts and users |
| Vitest | Unit testing |

Custom Stitch-styled UI is used for lists, filters, forms, and layout. Shared **`app-modal`** handles logout confirmation, rejection notices, admin reject-with-reason, and delete confirmation flows. Material is used selectively for buttons and spinners.

## Features

### Posts (all logged-in users)

- Browse **all posts** (every status) with debounced search, server-side date sort, and client-side pagination or infinite scroll (user preference)
- View post details
- **Users** submit new posts → `pending` until admin approval
- **Admins** create posts → immediately `approved`
- Header **locale toggle** (EN / KA) and **dark / light theme**

### My Posts (`/posts/my`)

Tabs for the current user's submissions. Each tab fetches posts filtered by `status` on the server, then filters by `submittedBy` on the client:

- **Under Review** — `pending`
- **Approved**
- **Rejected** — inline callout shows `rejectionReason` when admin provided one

Users can edit their own **approved** posts; changes return to `pending` for admin re-review with a before/after diff on post details. **Rejected** posts can be revised and resubmitted for review (`pending`); the rejection reason is cleared on submit.

**Rejection notifications** (regular users only):

1. After login, if unseen rejected posts exist → modal on the main layout (page loads first, then overlay)
2. Nav badge on **My Posts** until the user opens the **Rejected** tab
3. Badge on the **Rejected** tab itself while unseen rejections remain
4. Seen / acknowledged state persisted per user in `localStorage`

### Moderation (`/posts/moderation`, admin only)

- Fetches only `pending` posts from the API (`GET /posts?status=pending`)
- Approve or reject from the queue or directly on post details
- **Reject** opens `app-modal` with a required reason (10–500 chars); reason is stored as `rejectionReason` on the post
- **New submission** vs **Edited submission** badges on the queue (posts without a reason show **Pending review**)

### Auth

- Mock login via `AuthService` (signals + `localStorage`)
- **Logout** asks for confirmation via `app-modal` before clearing the session
- Route guards: `authGuard`, `adminGuard`, `guestGuard`, `postEditGuard`
- HTTP interceptor attaches a demo bearer token

See [docs/AUTH-MODERATION.md](docs/AUTH-MODERATION.md) for the full role and workflow spec.

## Architecture

Feature-based structure with lazy-loaded routes and signal stores.

```
src/app/
├── core/
│   ├── auth/
│   │   ├── services/      # AuthService, AuthApiService, AuthStorageService
│   │   ├── guards/        # auth, admin, guest
│   │   └── models/        # User, session, roles
│   ├── i18n/              # LocaleService, translate testing helpers
│   ├── interceptors/      # authInterceptor, httpErrorInterceptor
│   ├── layout/            # Main shell, rejection notice modal, logout modal
│   ├── config.ts          # API base URL
│   ├── error-handler.ts   # GlobalErrorHandler
│   └── theme/             # ThemeService, ThemeStorageService, app-theme model
├── features/
│   ├── auth/pages/        # Login
│   └── posts/
│       ├── components/    # Table, filters, form, states, revision panel, moderation actions
│       ├── guards/        # postEditGuard
│       ├── models/        # Post, status, revision, rejection notice, DTOs
│       ├── pipes/         # postStatusLabel
│       ├── services/      # PostsApiService, PostsPermissionService, RejectionNoticeService, …
│       ├── pages/         # List, details, upsert, my-posts, moderation
│       ├── resolvers/     # PostResolver service + route resolver fn
│       ├── store/         # Signal stores per page/flow
│       └── utils/         # Revision diff, rejection notice filters, json-server helpers
└── shared/
    ├── components/        # modal, error-state, empty-state, page-header
    ├── infinite-scroll.directive.ts
    └── truncate.pipe.ts
```

### State Management

Signal stores per feature area (not NgRx):

| Store | Responsibility |
|-------|----------------|
| **PostsListStore** | Fetch all posts, debounced search, server-side sort, pagination or infinite scroll |
| **PostDetailsStore** | Resolved post, delete, moderation actions, retry |
| **PostUpsertStore** | Create/update, resolver seed for edit, re-review snapshot |
| **MyPostsStore** | User's posts per tab (`status` filter on API, owner filter on client) |
| **ModerationStore** | Pending queue (`status=pending` on API), approve/reject with reason |

RxJS integrates via `switchMap`, `debounceTime`, `distinctUntilChanged`, `catchError`, `tap`, and `finalize`.

### Routing

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Guest only | Sign in |
| `/posts` | Authenticated | All posts (any status) |
| `/posts/my` | Authenticated | Own posts by status tab (`?tab=under-review\|approved\|rejected`) |
| `/posts/moderation` | Admin | Pending review queue |
| `/posts/new` | Authenticated | Create / submit post |
| `/posts/:id` | Authenticated | Post details (+ admin moderation on pending) |
| `/posts/:id/edit` | Admin or post owner (approved or rejected) | Edit form |

- Lazy-loaded standalone routes
- Route resolver preloads post data and enforces view access
- Component input binding for route params, query params, and resolved data

### Mock API

- `npm run api` serves `db.json` at `http://localhost:3000`
- Angular proxy (`proxy.conf.json`) maps `/api/*` → `http://localhost:3000/*`
- Collections: `posts`, `users`
- Post fields include `status`, `submittedBy`, `pendingReason`, `previousVersion` (for edited resubmissions), `rejectionReason` (set when admin rejects)
- Post IDs are server-generated strings (json-server v1)
- List queries use json-server v1 sort syntax (`_sort=-createdAt` for descending)
- `PostsApiService` caches list responses per query key and individual posts in an LRU cache (max 100)

## Technical Highlights

| Area | Implementation |
|------|----------------|
| **i18n** | `ngx-translate` + `LocaleService`; templates use translation keys, stores emit error keys |
| **Shared modal** | `app-modal` — backdrop/Escape close, projected actions, body scroll lock |
| **Rejection notices** | `RejectionNoticeService` + `localStorage` per user (`seen` vs `acknowledged`) |
| **Route Guards** | `authGuard`, `adminGuard`, `guestGuard`, `postEditGuard` |
| **HTTP Interceptor** | `authInterceptor` (bearer token), `httpErrorInterceptor` (401 logout, error logging) |
| **Error handling** | `GlobalErrorHandler` for uncaught client errors |
| **Custom Pipes** | `postStatusLabel`, `truncate` |
| **Custom Directives** | `appInfiniteScroll` (intersection observer) |
| **Unit Tests** | ~49 focused tests — guards, stores, services, pipes, theme, revision utils |
| **Dark / Light Theme** | `ThemeService` + header toggle, `localStorage` persistence |
| **Local Storage** | Auth session, theme, list view mode, rejection notice state per user |
| **List display** | Pagination (default) or infinite scroll — persisted in `localStorage` |
| **Authentication** | Mock login with roles (`user` / `admin`) |

### Intentionally not used

| Area | Choice |
|------|--------|
| **NgRx** | Signal stores per feature — simpler for this scope |
| **Firebase** | json-server mock API for local/demo workflow |
| **Backend framework** | json-server stands in for a REST backend |

## Quick Test Flow

### Happy path (approve + re-review)

1. Login as **user** → **Create Post** → **My Posts → Under Review**
2. Login as **admin** → **Moderation** → **Approve**
3. Login as **user** → edit approved post → **Submit for Review**
4. Login as **admin** → open post details → review diff → **Approve**

### Rejection + owner notification

1. Login as **user** → create a post (or use one already under review)
2. Login as **admin** → **Moderation** → **Reject** → enter a reason → confirm
3. Login as **user** → main page loads → rejection modal appears → **View reasons** → **My Posts → Rejected** with inline reason callout
4. Nav / tab badges clear after visiting the **Rejected** tab
5. Click **Edit & Resubmit** → save → post moves to **Under Review** (rejection reason cleared)

### Logout

1. While logged in, click **Logout** → confirm in modal (or cancel to stay)

# Blog Management System

Angular SPA for managing blog posts: list, view, create, edit, and delete publications with search, sorting, and pagination.

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

Open [http://localhost:4200](http://localhost:4200).

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
| Angular Material | `MatDialog`, `MatButton`, `MatProgressSpinner` (custom-styled filters/table keep Stitch UI) |
| RxJS | HTTP streams, operators in signal stores |
| json-server | Mock REST API (`db.json`) |
| Vitest | Unit testing |

## Architecture

Feature-based structure with lazy-loaded routes and signal stores.

```
src/app/
├── core/           # Layout, 404 page, API config
└── features/posts/
    ├── components/ # Reusable UI (table, filters, form, states)
    ├── data-access/# PostsApiService (HttpClient CRUD)
    ├── models/     # Post, DTOs, resolver types
    ├── pages/      # Route-level pages (list, details, upsert)
    ├── resolvers/  # postResolver — preload post before details/edit
    └── store/      # Signal stores (list, details, upsert)
```

### State Management

Signal stores per feature area, not NgRx:

- **PostsListStore** — fetch, debounced search, sort, pagination
- **PostDetailsStore** — resolved post data, delete flow, retry
- **PostUpsertStore** — create/update, resolver seed for edit mode

RxJS integrates via `switchMap`, `debounceTime`, `distinctUntilChanged`, `catchError`, `tap`, and `finalize`.

### Routing

- Lazy-loaded standalone routes under `/posts`
- Route resolver preloads post data for details and edit pages
- Component input binding for route params, query params, and resolved data

### Mock API

- `npm run api` serves `db.json` at `http://localhost:3000`
- Angular proxy (`proxy.conf.json`) maps `/api/*` → `http://localhost:3000/*`
- Post IDs are server-generated strings (json-server v1)

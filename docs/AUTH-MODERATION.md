# Auth & Post Moderation Spec

## Roles

| Role | Permissions |
|------|-------------|
| **Guest** | Login only — must sign in before accessing the app |
| **User** | View approved posts, submit posts (pending), edit own approved posts (re-review), My Posts tabs |
| **Admin** | User + auto-approved creates, edit/delete any post, Moderation queue |

## Navigation

| Link | Who | Route |
|------|-----|-------|
| Posts | Logged-in | `/posts` — approved posts only |
| My Posts | Logged-in | `/posts/my` — own posts by tab |
| Moderation | Admin only | `/posts/moderation` — all users' pending posts |
| Login / Logout | Guest / logged-in | `/login` |

## My Posts tabs

| Tab | `status` | Filter |
|-----|----------|--------|
| Under Review | `pending` | `submittedBy === currentUser.id` |
| Approved | `approved` | same |
| Rejected | `rejected` | same |

## Post fields

- `status`: `pending` | `approved` | `rejected`
- `submittedBy`: user id (string)

## Create rules

- **User** create → `status: pending`
- **Admin** create → `status: approved` (auto)

## Edit rules

- **Admin** can edit any post; changes stay approved
- **User** can edit only their own `approved` posts; save sets `status: pending` for admin re-review

## Moderation (admin)

- Approve → `status: approved` → visible on public Posts
- Reject → `status: rejected` → visible in submitter's My Posts → Rejected

## Demo users (`db.json`)

- `admin@blog.com` / `admin123` — role `admin`
- `user@blog.com` / `user123` — role `user`

## Technical

- Mock auth: `AuthService` (signals) + `localStorage`
- Guards: `authGuard`, `adminGuard`, `postEditGuard`
- HTTP interceptor: session header (demo)
- json-server — no real JWT backend

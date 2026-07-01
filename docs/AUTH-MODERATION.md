# Auth & Post Moderation Spec

## Roles

| Role | Permissions |
|------|-------------|
| **Guest** | Login only — must sign in before accessing the app |
| **User** | View approved posts, submit posts (pending), edit own approved/rejected posts, delete own posts (with confirmation), My Posts tabs |
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
- `pendingReason`: `new` | `edited` (why a pending post is under review)
- `previousVersion`: snapshot of content before an edited resubmission
- `rejectionReason`: admin-provided text when a post is rejected
- `rejectedAt`: ISO timestamp set when admin rejects; used to sort the Rejected tab (newest first)

## Create rules

- **User** create → `status: pending`
- **Admin** create → `status: approved` (auto)

## Edit rules

- **Admin** can edit any post; changes stay approved
- **User** can edit only their own `approved` or `rejected` posts; approved edits set `status: pending` for admin re-review
- Edited resubmissions store `previousVersion` and show a before/after diff on post details

## Delete rules

- **Admin** can delete any post from post details (`app-modal` confirmation)
- **User** can delete only their own posts (any status) from post details — same confirmation dialog

## Moderation (admin)

- Approve → `status: approved` → visible on public Posts
- Reject → `status: rejected`, `rejectionReason`, `rejectedAt` → visible in submitter's My Posts → Rejected (sorted by `rejectedAt` desc)
- Available on Moderation queue and on post details when `status: pending`

## Demo users (`db.json`)

- `admin@blog.com` / `admin123` — role `admin`
- `user@blog.com` / `user123` — role `user`

## Technical

- Mock auth: `AuthService` (signals) + `localStorage`
- Guards: `authGuard`, `adminGuard`, `postEditGuard`
- HTTP interceptor: session header (demo)
- json-server — no real JWT backend

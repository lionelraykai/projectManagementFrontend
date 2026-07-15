# Functional Requirement Document (FRD)
## Internal Project Management System — Real-Time Collaboration

### 1. Purpose
An internal tool for tracking projects and tasks, where task updates (e.g. Todo → In Progress) are reflected instantly for every user currently viewing that project, and correctly loaded for anyone opening it later.

### 2. Core Features
1. **Authentication** — email/password signup & login, JWT access token + refresh token, logout (token revocation).
2. **Projects** — create, view, edit, archive a project.
3. **Project membership** — owner adds/removes members and assigns a role per project.
4. **Tasks** — CRUD with title, description, status (`Todo` / `In Progress` / `Done`), assignee, priority, due date.
5. **Real-time sync** — any task create/update/delete is pushed instantly to every user currently viewing that project (User A moves a task → User B sees it live).
6. **Consistent state on load** — a user opening a project (User C) always fetches the current persisted state first, then starts receiving live updates; no reliance on socket message history.
7. **Recent activity feed (lightweight)** — last N changes per project (who changed what, when), for visibility only — not a full audit/version history.
8. **Dashboard** — list of projects the current user belongs to, with task counts by status.

### 3. User Roles & Permissions
| Role | Scope | Permissions |
|---|---|---|
| **Admin** | Org-wide | Manage all users and all projects; full CRUD everywhere |
| **Project Owner** | Per-project | Create/edit/archive the project, manage members & roles, full task CRUD |
| **Member** | Per-project | Create/edit/move tasks; cannot delete the project or manage members |
| **Viewer** | Per-project | Read-only access to the project and its tasks |

Role is stored per `(user, project)` membership; `admin` is a separate global flag on the user record.

### 4. Assumptions
- Single organization (single tenant) per deployment — this is an internal tool, not a multi-tenant SaaS product.
- Auth is email/password only for v1; SSO/OAuth is not included.
- Task lists per project are moderate in size (tens to low hundreds); pagination is assumed for anything larger, not infinite-scale virtualization.
- All clients are modern browsers with an active network connection — real-time delivery depends on a live WebSocket connection; there is no offline-first mode.
- "Real-time" means sub-second delivery to already-connected clients, with last-write-wins semantics on concurrent edits to the same field — not a CRDT/operational-transform conflict-free guarantee.
- MongoDB and Redis run as a single primary instance (or managed single-node service) for this phase; replica sets / clustering are a scalability follow-up, not a v1 requirement.

### 5. Out of Scope
- File/image attachments on tasks
- Multi-organization / multi-tenant support
- Advanced visualizations: Gantt charts, timelines (a basic kanban board is in scope; drag animations/advanced views are not)
- Native mobile apps
- Third-party integrations (Slack, GitHub, email digests, calendar sync)
- Offline editing and conflict resolution (CRDT/OT)
- Granular field-level or custom/configurable permission rules
- Full audit-log / version-history system (only the lightweight recent-activity feed described above)

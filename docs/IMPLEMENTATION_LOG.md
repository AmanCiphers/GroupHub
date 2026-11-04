# GroupHub — Implementation Log

This document records the engineering work performed on the project, in order.
It is intentionally detailed so a future contributor can understand what changed,
why it changed, and how it was verified without replaying the conversation.

**Last updated:** 2026-11-04

> Historical context: `docs/PROJECT_ARCHITECTURE.md` is a snapshot from
> 15 October 2026. It predates the project-domain backend and the work described
> here. Where the two disagree, the source code and this log are authoritative.

---

## 1. Repository assessment (starting point)

The repository was inspected before changes were made. Findings:

- Monorepo with `frontend/` (Next.js 16 App Router, React 19, `.jsx`, Tailwind 4)
  and `backend/` (Express 5, Mongoose, MongoDB).
- Authentication was complete: register, login, logout, `getMe`, encrypted JWT
  cookie, CSRF verification.
- Project discovery rendered fixture data and filtered only the first page of
  results in the browser.
- The dashboard rendered fully hardcoded data from
  `frontend/lib/data/dashboard.data.js` and had no auth guard.
- `Project`, `Membership`, `Application`, `ProjectRole`, and `Task` models existed,
  but only `Project` and `Membership` were used by controllers.
- No tests existed (`backend` `test` script exited with an error), and the
  frontend `lint` script could not run because ESLint was not a declared dependency.
- Pre-existing non-seed test documents remained in the database (for example
  duplicate `GroupHub` and `Dupe Test` records). They were intentionally not deleted.

### Correctness issues found during assessment

1. Project list/detail routes were not wrapped in `authenticateToken`, so
   `req.user` was always undefined and private visibility could never be evaluated.
2. `listProjects` passed raw `req.query` into `new RegExp(...)`, creating a
   regex-injection/ReDoS risk.
3. Dashboard statistics, progress, applications, and activity had no backing data.

---

## 2. Seeded project data

### Files

- `backend/scripts/seedData.js` — 6 demo owners and 12 realistic projects.
- `backend/scripts/seedProjects.js` — idempotent seeding script.
- `backend/package.json` — added `"seed": "node scripts/seedProjects.js"`.

### Behaviour

- Loads `.env` through `dotenv/config` and connects with the existing
  `config/db.js` helper.
- Refuses to run when `NODE_ENV=production` unless `--force` is passed.
- Upserts 6 demo users with bcrypt-hashed passwords.
- Deletes and recreates **only** data owned by the seed users, so real user data
  and pre-existing test projects are untouched.
- Creates, per project:
  - one `ProjectRole` (for example, `React contributor`) with open slots;
  - an owner `Membership`;
  - zero or more member `Membership`s to satisfy the project's `teamSize`;
  - one `Application` per remaining seed owner, cycling through
    `Pending` / `Accepted` / `Rejected`;
  - denormalised `memberCount`, `spotsOpen`, and `applicantCount` values that
    match the created records.
- Writes a realistic `createdAt`/`updatedAt` (spread over the previous days) so
  "posted N days ago" and activity timestamps look natural.

### Demo credentials

All seed owners share the password `demo-password-123`:

| Name | Email |
| --- | --- |
| Maya Chen | `seed.maya@grouphub.local` |
| Aarav Patel | `seed.aarav@grouphub.local` |
| Sofia Reyes | `seed.sofia@grouphub.local` |
| Noah Williams | `seed.noah@grouphub.local` |
| Priya Nair | `seed.priya@grouphub.local` |
| Liam O'Connor | `seed.liam@grouphub.local` |

### Verification

- Ran `npm run seed` twice; the second run left the same 12 seed projects,
  confirming idempotency.
- Confirmed `GET /api/projects` returns the seeded projects with populated owner
  names.
- Final seed output: `12 projects, 12 roles, and 48 applications across 6 owners`.

---

## 3. Find Projects — server-side filtering

### Backend changes

File: `backend/controllers/project.controller.js`

- Added `parseMulti(value)`: accepts repeated query params or comma-separated
  values, trims, de-duplicates, and caps the list at 20 entries.
- Added `buildProjectFilter(params, { exclude })`: centralises filter
  construction and can omit one facet (needed for facet counts).
- `listProjects` now supports:
  - `query` — escaped and capped at 100 characters before building a regex;
  - `category`, `skill`, `tag`, `stage`, `commitment`, `status` — multi-value
    through `$in`;
  - `page` / `limit` pagination (limit capped at 50);
  - `facets=1` for counts.
- Semantics: **OR within a facet, AND across facets**.
- Search now escapes regex metacharacters (fixes the injection/ReDoS risk).

### Frontend changes

File: `frontend/app/find-projects/page.jsx`

- Filtering moved from the browser to the API. Previously only the first loaded
  page could be filtered; now the entire collection is searchable.
- Search is debounced by 300 ms.
- Requests are aborted through RTK's thunk signal when filters change, so stale
  responses cannot overwrite newer ones (`lib/api.js`, `projectsSlice.js`).
- Pagination uses the API's `page` / `pages` / `total`.
- Loading, error, and empty states were added.

---

## 4. Find Projects — multi-select, facets, URL state

### Reusable component

File: `frontend/components/multi-select.jsx`

- Searchable dropdown with checkboxes, optional counts, per-field clear,
  click-outside close, Escape close, and `aria-expanded` / `aria-pressed`.
- Used for category, skills, stage, and commitment.

### URL as the source of truth

File: `frontend/app/find-projects/page.jsx`

- Filter state lives in the URL using repeated params, for example:
  `?q=react&category=Technology&category=Design&skill=Node.js&page=2`.
- The page is wrapped in a `Suspense` boundary because it uses
  `useSearchParams` inside a statically rendered route.
- Toggling a filter calls `router.replace(..., { scroll: false })`; the fetch
  effect keys off the serialized query string.
- This makes filters shareable, bookmarkable, and compatible with browser
  back/forward navigation.

### Other UX additions

- Active filter chips above the result list, with individual `×` removal and
  "Clear all".
- Mobile filter drawer with an active-filter count badge.
- Result count and an "updating…" indicator during refetches.

### Facet counts

- The API returns:
  ```json
  {
    "facets": {
      "categories": { "Technology": 5, "Design": 2 },
      "skills": { "React": 8 },
      "stages": { "MVP": 4 },
      "commitments": { "4 hrs/week": 3 }
    }
  }
  ```
- Each facet is computed with the other active filters applied but **excluding
  its own filter**, so all options remain visible while narrowing the results.
- Facets are computed with a single MongoDB `$facet` aggregation.

### Verification

- Multi-category, multi-skill, and combined stage/commitment queries returned
  the expected projects.
- Facet totals matched the seeded data.
- `npm run build` passed all routes after fixing a render-time handler bug
  (filter handlers were invoked during render, causing an infinite render loop).

---

## 5. User dashboard

### Backend

New files:

- `backend/controllers/dashboard.controller.js`
- `backend/routes/dashboard.routes.js`

`backend/server.js` mounts `/api/dashboard`.

`GET /api/dashboard` requires authentication and returns the current user's
workspace in a single request:

- `stats`: `myProjects`, `joinedProjects`, `applicationsSent`,
  `applicationsReceived`, `pendingReview`.
- `ownedProjects`: up to 10 owned projects with computed milestone progress and
  the next incomplete milestone.
- `joinedProjects`: active memberships excluding owned projects, including the
  member's role.
- `applications`: applications the user sent, with project, role, status, and date.
- `receivedApplications`: applications to the user's projects, with applicant
  name/email, project, role, status, and date.
- `recommended`: up to 3 public, recruiting projects matched on skills from the
  user's owned projects; falls back to the latest recruiting projects.
- `activity`: a derived recent-events feed built from project, application, and
  membership timestamps (no separate activity model).

Progress is computed as `Done milestones / total milestones`, rounded. Projects
without milestones show `0%` and "All milestones complete" only when milestones
exist.

Importing `ProjectRole.model.js` is required for `populate("projectRoleId")` to
resolve; the controller uses a side-effect import for this.

### Frontend

New files:

- `frontend/lib/features/dashboard/dashboardSlice.js`
- Registered in `frontend/lib/store.js`
- `api.getDashboard(signal)` added to `frontend/lib/api.js`

Rewritten file: `frontend/app/dashboard/page.jsx`

- Auth guard: waits for `auth.initialized`; redirects to `/account` when signed
  out; renders nothing while redirecting.
- Fetches the dashboard only after auth initialization.
- Loading skeleton, error + retry state.
- Sections:
  - Stats: **My projects, Joined projects, Applications sent, Applications
    received**.
  - **My projects** with status, category, stage, members, open spots, milestone
    progress bar, next milestone, and last-updated time.
  - **Joined projects** with membership role, category/stage, member count, and
    join date.
  - **My applications** with project, role, status, and applied date.
  - **Applications received** with applicant avatar/name/email, project and role,
    status, and applied date.
  - **Recommended** projects and **Recent activity** in the right column.
- Removed the fixture import (`lib/data/dashboard.data.js` was deleted after
  confirming it had no remaining references).
- Kept the Bell and Settings icon buttons as placeholders for future wiring, as
  requested.
- Removed the "Active projects" and "Open roles" stat cards per the product
  decision.

### Seed enrichment for the dashboard

- The seed script now also creates roles, memberships, and applications so that
  logging in as a seed account produces a populated dashboard.
- Applications are read-only in the UI for now; accept/reject actions are future
  work.

### Verification

- `GET /api/dashboard` without a cookie returns `401`.
- Logged in as `seed.maya@grouphub.local`:
  - stats: 2 owned, 7 joined, 3 sent, 7 received (3 pending);
  - owned projects and milestone progress resolved correctly;
  - received applications and activity populated.
- Logged in as `seed.aarav@grouphub.local`: independent populated workspace.
- `npm run build` passed all routes.

---

## 6. Verification summary

| Check | Result |
| --- | --- |
| Backend syntax (`node --check`) | Passed for changed backend files |
| Seed idempotency | Passed (ran twice) |
| Project search/filter/pagination API | Passed |
| Facet counts | Passed |
| Dashboard auth (401) | Passed |
| Dashboard payload for two seed users | Passed |
| Frontend production build | Passed (13 routes) |
| Frontend lint | Not runnable — ESLint is not installed/declared |

---

## 7. Known limitations and next steps

- **Applications are read-only.** There is no apply-to-project flow and no
  accept/reject endpoint yet. `Application` records currently come only from
  seeding.
- **Project detail page is absent.** "View project" is not wired.
- **Bookmarks on Find Projects are local-only.**
- **Recommendations are skill-overlap based**, using skills from the user's owned
  projects. The `User` model has no skills/interests fields yet.
- **Activity is derived**, not an append-only event log. If accurate history is
  required, add an `ActivityEvent` model.
- **Task board and notifications are not implemented**; the Bell and Settings
  buttons are intentional placeholders.
- **Private project visibility is still not reachable** because read routes do not
  use an optional-auth middleware. This existed before the dashboard work.
- **Lint tooling is missing** from `frontend/package.json`. Add ESLint as a
  devDependency and a config before relying on `npm run lint`.
- **Multiple lockfiles** remain (`bun.lock`, `package-lock.json`,
  `pnpm-lock.yaml`). Standardise on one package manager.
- **Pre-existing test projects** in the database are left untouched. They appear
  in project discovery and count toward stats for their owners.

---

## 8. Changed-file index

### Backend

- `backend/controllers/project.controller.js` — multi-value filters, regex
  escaping, facet aggregation.
- `backend/controllers/dashboard.controller.js` — new dashboard aggregate.
- `backend/routes/dashboard.routes.js` — new authenticated route.
- `backend/server.js` — mounts `/api/dashboard`.
- `backend/scripts/seedData.js` — seed content.
- `backend/scripts/seedProjects.js` — idempotent seeding; roles, memberships,
  applications, timestamps.
- `backend/package.json` — `seed` script.

### Frontend

- `frontend/app/find-projects/page.jsx` — server-side filtering, URL state,
  multi-select, chips, mobile drawer, facets.
- `frontend/app/dashboard/page.jsx` — live authenticated workspace.
- `frontend/components/multi-select.jsx` — reusable searchable multi-select.
- `frontend/lib/api.js` — `getDashboard`, abort signal support.
- `frontend/lib/features/projects/projectsSlice.js` — abort handling, facets.
- `frontend/lib/features/dashboard/dashboardSlice.js` — new slice.
- `frontend/lib/store.js` — registers the dashboard slice.
- `frontend/lib/data/dashboard.data.js` — removed (unused fixture).

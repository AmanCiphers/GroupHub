# GroupHub — Implementation Log

This document records the engineering work performed on the project, in order.
It is intentionally detailed so a future contributor can understand what changed,
why it changed, and how it was verified without replaying the conversation.

**Last updated:** 2026-11-06

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

## 6. Account settings and resumes

### Files
- `frontend/app/profile/page.jsx` — rewritten from a UI-only stub.
- `frontend/components/chip-picker.jsx` — extracted from the new-project page
  and reused for profile skills.
- `frontend/app/projects/new/page.jsx` — now imports the shared `ChipPicker`.
- `backend/models/User.model.js` — profile, links, availability, experience, and
  resume metadata.
- `backend/controllers/auth.controller.js` — public user serializer, profile and
  password updates, resume upload/download/delete.
- `backend/routes/auth.routes.js` — new authenticated routes.
- `backend/middleware/upload.middleware.js` — multer disk storage and validation.
- `.gitignore` — ignores `backend/uploads/`.
- `backend/package.json` — adds `multer`.

### Behaviour
- `PATCH /api/auth/profile` updates only the allowed profile fields. Names are
  1–80 characters, headline ≤120, bio ≤1000, location ≤80, skills ≤30 entries,
  links ≤200 characters and http(s), availability/experience must use the
  existing enums.
- Links without a protocol are normalized to `https://`.
- `PATCH /api/auth/password` verifies the current password, requires at least 8
  characters, and hashes the new password with bcrypt cost 12.
- Resume upload accepts PDF/DOC/DOCX up to 5 MB, stores it under
  `backend/uploads/resumes/` with a generated filename, and never exposes that
  filename to the client.
- Resume download is authenticated and limited to the current user.
- Deleting or replacing a resume removes the old file from disk.
- `GET /api/auth/getMe` and login/register responses now return the full public
  profile through `toPublicUser()`.

### UI
- Guarded `/profile` page with loading skeleton.
- Profile form, skills chip picker, availability/experience selects, and links.
- Resume card with upload, download, replace, and remove actions.
- Password form with current/new/confirm fields.
- Sticky preview card with initials, headline, location, skills, links, and a
  9-field profile-strength meter.
- Navbar profile link and dashboard gear now point to `/profile`.
- Logged-in mobile menu includes Dashboard and Profile.

### Verification
- Profile changes persisted through `getMe`.
- Password change and restore succeeded.
- Resume upload, download (69-byte test file), and delete succeeded.
- `npm run build` passed.

---

## 7. Project page and applications

### Files
- `frontend/app/projects/[projectId]/page.jsx` — new project detail page.
- `frontend/app/find-projects/page.jsx` — “View project” wired.
- `frontend/app/dashboard/page.jsx` — project titles and application project
  names link to detail pages; gear links to settings.
- `frontend/app/account/page.jsx` — safe `next` redirect after login.
- `backend/middleware/auth.middleware.js` — extracted token decoding and added
  `optionalAuth`.
- `backend/controllers/project.controller.js` — richer detail payload and
  `applyToRole`.
- `backend/routes/project.routes.js` — optional auth on detail and the nested
  application route.
- `backend/controllers/dashboard.controller.js` — includes `projectId` in sent
  and received application entries.

### Detail payload
`GET /api/projects/:projectId` now returns:
- `project` with the owner profile populated;
- `roles` with applicant/accepted/pending counts, remaining spots, and the
  viewer's application status;
- `members` with active memberships, user summaries, and role titles;
- `viewer` with owner/member flags and a role→status application map.

Private and unlisted projects are visible only to their owner. Anonymous and
non-owner requests receive `404`.

### Apply endpoint
`POST /api/projects/:projectId/roles/:roleId/applications` requires auth and
CSRF. It rejects closed projects/roles, owners, existing members, filled roles,
and duplicate applications (`409`). A valid request creates a `Pending`
application and increments `applicantCount`.

### UI
- Hero with category/stage, status, commitment, members, and an “Apply to a
  role” anchor.
- About (why, audience, current status), milestones with progress, skills/tags,
  team, and open roles.
- Sidebar with project facts, owner profile/links/contact, and posted time.
- Apply modal with an optional 1000-character message, inline errors, refresh on
  success, and disabled states for owner/member/applied/closed/filled.
- Signed-out apply actions route to `/account?next=/projects/:projectId`.

### Verification
- Unauthenticated apply returned `401`.
- A fresh user applied successfully (`201`, `Pending`); viewer state and role
  counts updated.
- Duplicate application returned `409`.
- Owner applying to their own project returned `400`.
- Private project: anonymous `404`, owner `200`, non-owner `404`.
- Dashboard sent/received applications now include `projectId`.
- `npm run build` passed, including the dynamic `/projects/[projectId]` route.

---

## 8. Verification summary

| Check | Result |
| --- | --- |
| Backend syntax (`node --check`) | Passed for changed backend files |
| Seed idempotency | Passed (ran twice) |
| Project search/filter/pagination API | Passed |
| Facet counts | Passed |
| Dashboard auth (401) | Passed |
| Dashboard payload for two seed users | Passed |
| Profile update + `getMe` round-trip | Passed |
| Password change + restore | Passed |
| Resume upload/download/delete | Passed |
| Project detail (owner, roles, members, viewer) | Passed |
| Application create / duplicate / owner / anonymous | Passed |
| Private project visibility | Passed |
| Frontend production build | Passed (13 routes + dynamic project page) |
| Frontend lint | Not runnable — ESLint is not installed/declared |

---

## 9. Known limitations and next steps

- **Received applications are still read-only.** Applying now works (with a
  three-step wizard and resume attachment), but owners cannot accept or reject
  applications yet. Accepting should create a membership, update role slots, and
  adjust project counts atomically.
- **Resumes are stored on local disk.** Use durable object storage before
  deploying to an ephemeral host. Project owners **can now download applicant
  resumes** from the dashboard "Applications received" section.
- **Bookmarks on Find Projects are local-only.**
- **Recommendations are skill-overlap based**, using skills from the user's owned
  projects. The `User` model now has skills, but recommendations do not use
  profile skills yet.
- **Activity is derived**, not an append-only event log. If accurate history is
  required, add an `ActivityEvent` model.
- **Task board and notifications are not implemented**; the Bell button is an
  intentional placeholder.
- **Lint tooling is missing** from `frontend/package.json`. Add ESLint as a
  devDependency and a config before relying on `npm run lint`.
- **Multiple lockfiles** remain (`bun.lock`, `package-lock.json`,
  `pnpm-lock.yaml`). Standardise on one package manager.
- **Pre-existing test projects** in the database are left untouched. They appear
  in project discovery and count toward stats for their owners.

---

## 10. Owner project workspace

### Behaviour
- Opening `/projects/:projectId` as the owner now shows a dedicated workspace
  instead of the public detail view. "View public page" previews the public
  layout; "Manage project" returns to the workspace.
- Tabs: Overview, Team, Roles, Settings, and Shared library.
- **Team**: add a registered user by email, change a member's team role
  (`Admin`/`Mentor`/`Member`), or remove them. The owner membership is protected.
- **Roles**: add, edit, and delete roles. Slots cannot be reduced below the
  number of accepted contributors. Deleting a role also removes its
  non-accepted applications and is blocked when contributors are assigned.
- **Settings**: edit project copy, category/stage/status/visibility/join
  policy/commitment/compensation/experience, location, dates, team size,
  contact information, skills, and tags.
- **Shared library**: disabled placeholder for documents, assets, and file
  sharing, marked "Coming soon".
- Mutations reuse cookie auth and CSRF headers and refresh the project after
  success.

### Backend
- New owner-only endpoints: `PATCH /api/projects/:projectId`,
  `POST /api/projects/:projectId/members`,
  `PATCH /api/projects/:projectId/members/:membershipId`,
  `DELETE /api/projects/:projectId/members/:membershipId`,
  `PATCH /api/projects/:projectId/roles/:roleId`, and
  `DELETE /api/projects/:projectId/roles/:roleId`.
- Member changes recalculate `memberCount` and `spotsOpen`.
- Project detail member payload now includes member email and username.

### Frontend
- New `frontend/components/project-manager.jsx`.
- `frontend/app/projects/[projectId]/page.jsx` renders the manager for owners
  and adds public-preview/return actions.
- `frontend/lib/api.js` adds project, role, and member management calls.

### Verification
- Backend `node --check` passed for changed files.
- Frontend `next build` passed all routes, including the dynamic project page.

## 11. Changed-file index

### Backend

- `backend/models/User.model.js` — profile fields, links, availability,
  experience level, resume metadata.
- `backend/models/Application.model.js` — added experience, portfolioUrl,
  availability, timezone, startDate, resume subdocument.
- `backend/controllers/auth.controller.js` — public serializer, profile/password
  updates, resume upload/download/delete.
- `backend/routes/auth.routes.js` — profile, password, and resume routes.
- `backend/middleware/upload.middleware.js` — validated resume upload; added
  `applicationResumeDirectory`, `uploadApplicationResume`,
  `copyProfileResumeToApplication`.
- `backend/middleware/auth.middleware.js` — shared token decoding + `optionalAuth`.
- `backend/controllers/project.controller.js` — multi-value filters, regex
  escaping, facets, rich detail payload, `applyToRole` (multi-field wizard,
  resume handling), `downloadApplicationResume`.
- `backend/routes/project.routes.js` — optional auth on detail, apply route with
  upload middleware, owner resume download route.
- `backend/controllers/dashboard.controller.js` — dashboard aggregate; application
  `projectId` added; resume metadata in received applications.
- `backend/routes/dashboard.routes.js` — dashboard route.
- `backend/server.js` — mounts `/api/dashboard`.
- `backend/scripts/seedData.js` — projects and enriched owner profiles.
- `backend/scripts/seedProjects.js` — idempotent seed; roles, memberships,
  applications, timestamps, owner profiles.
- `backend/package.json` — `seed` script and `multer`.
- `backend/controllers/project.controller.js` — owner project/role/member
  management endpoints and team-count synchronisation.
- `backend/routes/project.routes.js` — routes for project, role, and member
  management.

### Frontend

- `frontend/app/profile/page.jsx` — account settings, resume, password.
- `frontend/app/projects/[projectId]/page.jsx` — project detail, applications,
  and owner workspace switch.
- `frontend/components/project-manager.jsx` — owner workspace tabs for overview,
  team, roles, settings, and the shared-library placeholder.
- `frontend/components/apply-wizard.jsx` — three-step application wizard with
  pitch, availability/resume, and review steps.
- `frontend/app/account/page.jsx` — safe post-login `next` redirect.
- `frontend/app/find-projects/page.jsx` — server-side filtering, URL state,
  multi-select, chips, mobile drawer, facets, project links.
- `frontend/app/dashboard/page.jsx` — live workspace with project links; resume
  download button for received applications.
- `frontend/components/chip-picker.jsx` — shared skill/tag picker.
- `frontend/components/multi-select.jsx` — reusable searchable multi-select.
- `frontend/lib/api.js` — profile/password/resume/apply (FormData), resume
  download, abort support.
- `frontend/lib/features/auth/authSlice.js` — `setUser`.
- `frontend/lib/features/projects/projectsSlice.js` — abort handling, facets.
- `frontend/lib/features/dashboard/dashboardSlice.js` — dashboard slice.
- `frontend/lib/store.js` — registers the dashboard slice.
- `frontend/lib/data/dashboard.data.js` — removed (unused fixture).

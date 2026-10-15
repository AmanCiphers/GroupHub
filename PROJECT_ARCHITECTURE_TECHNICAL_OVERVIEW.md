# GroupHub — Project Architecture & Technical Overview

**Repository snapshot:** 15 October 2026  
**Audience:** new developers, reviewers, and mentors  
**Evidence used:** current source tree, `frontend/DOCUMENTATION-grouphub.md`, both frontend design-system documents, package manifests, and Git history. The current source is the authority where documentation and code disagree.

## 1. Purpose and scope

GroupHub is a project-first collaboration product for students and early-career creators. Its intended experience is to let people discover projects with open roles, identify a fit by skill or role, and form teams around ideas.

The current repository is **not yet the full product**. It consists of a complete, responsive frontend experience built on fixture data and a newly introduced Express/MongoDB authentication service. The project, team, contribution, and learning surfaces shown in the UI do not yet persist or retrieve product data from the backend.

| Problem | Intended product response | Current evidence |
| --- | --- | --- |
| People with ideas struggle to find complementary collaborators. | Make opportunities discoverable by open role, skills, commitment, and stage. | Reflected in the product copy and static data for Find Projects and Contribute. |
| Portfolios show people but do not make open team needs easy to find. | Use project and role discovery as the primary entry point. | Reflected in `frontend/DOCUMENTATION-grouphub.md`; no project API exists in the current backend. |
| New collaborators need a consistent workspace and identity. | Provide accounts, profiles, dashboards, and contribution/reputation views. | Account/session flow works; profile and dashboard are frontend-only. |

## 2. Current status at a glance

**Status legend:** Implemented = available in current source; UI-only = rendered or interactive in-browser but not persisted; Stub = a file/route exists without the intended feature; Planned = absent from current source. “Previously implemented” means Git history shows it was removed in the refactor; it does not mean it is live now.

| Area | Status | What is actually present |
| --- | --- | --- |
| Responsive product shell | Implemented | App Router layout, global navbar/footer, product pages, custom UI helpers, and responsive styling. |
| Email/password registration | Implemented | `POST /api/auth/register` validates input, hashes password, and creates a MongoDB user. It does **not** create a session. |
| Login, session restore, logout | Implemented | Cookie-based encrypted token session, Redux auth state, CSRF-protected logout, and navbar session restoration. |
| Find Projects | UI-only | Search, category/skill filters, and saved state operate on imported fixture data in the browser. |
| Dashboard | UI-only | Stats, projects, applications, activity, and new-project modal use fixture data/local state. |
| Profile editing | UI-only / stub | Form changes never call an API. `/api/auth/profile` only confirms authentication and returns a user ID. |
| Contact form | UI-only | Submitting switches to a local success state; no message is sent. |
| Leaderboard, tutorials, contribution listings | UI-only | Static fixture-driven views; visible filter/action controls do not have server-backed behavior. |
| Project CRUD, applications, memberships, tasks | Planned | No current models, controllers, or API routes. |
| Chat, files, notifications, email recovery, AI matching | Planned | Absent from current code. Git history shows earlier versions of these features were removed during the refactor. |

## 3. System architecture

The repository has two independently runnable applications:

- `frontend/`: Next.js 16 App Router frontend on port `3000` by default.
- `backend/`: Express 5 REST API on port `8762` by default, connected through Mongoose to a MongoDB database configured by `MONGODB_URI`.

```mermaid
flowchart LR
    Browser[Browser]

    subgraph FE[frontend — Next.js App Router]
      Pages[Pages and shared shell]
      Fixtures[lib/data/*.js\nfixture data]
      Redux[Redux auth slice]
      Client[lib/api.js\nfetch client]
      Pages --> Fixtures
      Pages --> Redux
      Redux --> Client
    end

    subgraph BE[backend — Express REST API]
      Routes[/api/auth routes]
      Auth[auth controller]
      Middleware[authenticateToken\nverifyCsrfToken]
      User[User Mongoose model]
      Routes --> Middleware
      Routes --> Auth
      Auth --> User
    end

    DB[(MongoDB\nMONGODB_URI)]
    Browser --> FE
    Client -->|HTTP; credentials: include| Routes
    User --> DB
```

### Architecture boundaries

| Boundary | Contract | Notes |
| --- | --- | --- |
| Frontend to backend | `NEXT_PUBLIC_API_URL` or `http://localhost:8762` | Only `/api/auth/*` is called by current frontend code. Requests include cookies. |
| Backend to database | Mongoose via `MONGODB_URI` | Only the `User` schema is present. |
| Global shared state | Redux Toolkit `auth` slice | Holds `user`, `csrfToken`, auth `status`, initialization state, and errors. |
| Page data | `frontend/lib/data/*.js` | Demo/fixture data. It is not an API cache or persistent store. |
| Design implementation | Tailwind utility classes + `app/globals.css` | Current product pages use a warm-neutral hex palette and custom helpers. |

## 4. Major components and responsibilities

### Backend

| Location | Responsibility | Status |
| --- | --- | --- |
| `backend/server.js` | Boots Express, parses JSON/cookies, configures credentialed CORS, logs requests, connects to MongoDB, and mounts auth routes. | Implemented |
| `backend/config/db.js` | Connects Mongoose using `MONGODB_URI`; exits when connection fails. | Implemented |
| `backend/models/User.model.js` | Defines user name, unique normalized email, excluded-by-default password, role (`user`/`admin`), and timestamps. | Implemented |
| `backend/controllers/auth.controller.js` | Registers users; validates credentials; performs login; creates/clears session cookie; returns current user. | Implemented |
| `backend/middleware/auth.middleware.js` | Decrypts the access-token JWE and places its payload on `req.user`. | Implemented |
| `backend/middleware/csrf.middleware.js` | Compares `X-CSRF-Token` with the value in the authenticated token for state-changing protected requests. | Implemented, used by logout |
| `backend/routes/auth.routes.js` | Defines register, login, logout, get-current-user, and a minimal authenticated profile route. | Implemented |
| `backend/controllers/profile.controller.js` | Empty file. | Stub |
| `backend/utils/endpoints.util.js` | Empty file. | Stub |

### Frontend

| Location | Responsibility | Status |
| --- | --- | --- |
| `app/layout.jsx` | Root HTML metadata, Geist fonts, active global stylesheet, Redux provider, navbar, footer, production-only Vercel Analytics. | Implemented |
| `app/providers.jsx`, `lib/store.js` | Configures and exposes the Redux store. | Implemented |
| `lib/api.js` | JSON fetch wrapper with credential inclusion and optional CSRF header. | Implemented |
| `lib/features/auth/authSlice.js` | Implements register/login/logout/session thunks and auth state transitions. | Implemented |
| `components/navbar.jsx` | Navigation, mobile drawer, initial `fetchMe()` session restore, and auth-aware account actions. | Implemented |
| `app/account/page.jsx` | Login/registration UI. GitHub option and password-recovery link are deliberately non-functional. | Implemented for email/password auth |
| `app/profile/page.jsx` | Shows session user and editable name/email controls. Save has no submit/API behavior. | UI-only |
| `app/find-projects/page.jsx` | Fixture-driven discovery, filters, search, and in-memory save toggle. | UI-only |
| `app/dashboard/page.jsx` | Fixture-driven workspace view and client-only new-project modal. | UI-only |
| `app/{about,contact,contribute,leaderboard,tutorials,page}.jsx` | Marketing, community, and informational surfaces. Contact has client-only success feedback. | UI-only/static |
| `components/{field,page-header,section,eyebrow,stat-tile,avatar}.jsx` | Small product-specific display/form primitives. | Implemented |
| `lib/data/*.js` | Page fixture content and demo metrics. | Implemented fixtures |

## 5. End-to-end execution flows

### A. Registration then sign-in

```mermaid
sequenceDiagram
    participant U as User
    participant F as Account page + Redux
    participant A as Express API
    participant D as MongoDB

    U->>F: Complete registration form
    F->>A: POST /api/auth/register
    A->>D: Check email and create bcrypt hash (12 rounds)
    D-->>A: Created User
    A-->>F: 201 user data (no session cookie)
    F-->>U: Switches to sign-in form
    U->>F: Submit email/password
    F->>A: POST /api/auth/login
    A->>D: Fetch user and compare password
    A-->>F: User + CSRF token; httpOnly accessToken cookie
    F->>F: Store authenticated user and CSRF token
    F-->>U: Navigate to /dashboard
```

### B. Session restore and logout

1. The navbar mounts under the Redux provider and dispatches `fetchMe()` while `auth.initialized` is false.
2. `GET /api/auth/getMe` includes the `accessToken` cookie through `credentials: 'include'`.
3. The authentication middleware decrypts the token and the controller reads the current user from MongoDB.
4. The response repopulates Redux with the user and CSRF token; otherwise Redux becomes an initialized, signed-out state.
5. Logout sends `POST /api/auth/logout` with the Redux-held `X-CSRF-Token` header. The server authenticates, validates the CSRF token, clears the cookie, and the frontend clears Redux state.

### C. Fixture-driven product interaction

For Find Projects and Dashboard, the route imports arrays from `lib/data`. Searches, filters, saved toggles, and modal visibility change React local state only. Reloading the page resets those interactions, and no request is made to create a project, bookmark a project, or apply to one.

## 6. Technology stack and dependencies

| Layer | Technology | Current role |
| --- | --- | --- |
| UI framework | Next.js 16.2.4, React 19 | App Router pages and component rendering. |
| Styling | Tailwind CSS 4.2, PostCSS, `tw-animate-css` | Utility-first layout and tokenized CSS. |
| Client state | Redux Toolkit, React Redux | Shared authentication state only. |
| UI utilities | Lucide, `clsx`, `tailwind-merge`, class-variance-authority | Icons and class composition. |
| API | Node.js, Express 5 | Authentication REST endpoints. |
| Persistence | MongoDB + Mongoose 9 | User persistence. |
| Security | `bcryptjs`, `jose`, `cookie-parser`, `cors` | Password hashes, encrypted session tokens, cookies, and CORS. |
| Observability | Vercel Analytics | Loaded only when frontend `NODE_ENV` is `production`. |
| Development tooling | npm/Bun lockfiles, nodemon | Package management and backend reload. |

### Required configuration

| Variable | Used by | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Backend | MongoDB connection string. |
| `PORT` | Backend | API port; defaults to `8762`. |
| `FRONTEND_URL` or `CLIENT_URL` | Backend | Allowed credentialed CORS origin; defaults to `http://localhost:3000`. |
| `JWT_ENCRYPTION_KEY` | Backend | Base64 key used by `jose` to encrypt/decrypt the session token. |
| `JWT_EXPIRES_IN` | Backend | Token expiry; defaults to 15 minutes. |
| `NEXT_PUBLIC_API_URL` | Frontend | Browser-visible API base URL; defaults to `http://localhost:8762`. |
| `NODE_ENV` | Backend/frontend | Controls cookie production attributes and production analytics rendering. |

## 7. Design system notes

The current source and the two design-system documents are not fully aligned. The current implementation should guide new work.

| Subject | Current implementation | Documentation discrepancy / implication |
| --- | --- | --- |
| Visible product palette | Warm-neutral layout tokens/classes such as `canvas`, `ink`, `surface`, `line`, and `charcoal`. | `DESIGN_SYSTEM.md` describes an older dark-only/shadcn presentation. |
| Token layer | `app/globals.css` defines dark-first OKLCH semantic tokens in addition to page-level warm-neutral aliases. | Both systems currently coexist, so new components should follow the product page classes unless intentionally building a tokenized primitive. |
| Components | Small custom product components are active. | The prior `components/ui/*` set is deleted from the working tree and kept only in `components-ui-backup.zip`. |
| Typography | Geist and Geist Mono via `next/font/google`; product headings are predominantly `font-black`. | External font download is part of the frontend build path. |
| Layout rhythm | Common shell padding: `px-6 sm:px-10 lg:px-20 xl:px-28`; borders do most visual separation. | Preserve these conventions for visual consistency. |

## 8. Key design decisions

1. **Authentication is cookie-based.** Login creates an httpOnly `accessToken` cookie. The token is an encrypted JWT (JWE using direct key management with `A256GCM`), so its payload is not readable by the browser.
2. **CSRF protection is explicit for protected mutations.** A random token embedded in the encrypted session is returned to the frontend and must be submitted in `X-CSRF-Token`. In the current API, logout is the only protected mutating endpoint.
3. **Use Redux only for cross-page auth state.** Filters, modals, and saved controls remain page-local React state. This reduces global state until server-backed features need it.
4. **Separate prototype content from persistence.** The frontend can demonstrate the intended UX while the API is rebuilt, but fixture data must not be mistaken for live platform data.
5. **Backend rebuild is auth-first.** Commit `3713614` removed an earlier larger implementation and introduced the current frontend restructuring; the present backend is an uncommitted, minimal replacement focused on auth.
6. **Responsiveness and the global shell are centralized.** The root layout supplies shared navigation/footer; the navbar handles desktop/mobile composition and session awareness.

## 9. Team and ownership

Repository evidence identifies **Amandeep Singh / Aman** as the author: the backend package declares `Aman`, the frontend documentation says “Built by Aman,” and Git history contains only Amandeep Singh identities. The About page’s listed members are fixture content, so they are not treated as confirmed team members.

| Confirmed member | Evidenced role | Current ownership inferred from repository |
| --- | --- | --- |
| Amandeep Singh (Aman) | Sole author in available repository evidence | Frontend implementation and design system; Express/MongoDB authentication backend; project configuration and repository evolution. |
| Other team members | Not documented | Unassigned. Confirm before attributing ownership. |

## 10. Delivery plan and milestones

The following are recommendations based on the observed gaps, not promises already made by the project.

| Priority | Milestone | Outcome / completion signal |
| --- | --- | --- |
| 1 | Stabilize the current backend | Commit and document `backend/`; add an `.env.example`; implement central error handling, request validation, tests, and basic rate limits. |
| 2 | Complete identity | Replace the profile stub with authenticated read/update endpoints and wire Profile save; define authorization and session-expiry behavior. |
| 3 | Establish project domain persistence | Add models/routes for projects, roles, applications, membership, and tasks; replace discovery/dashboard fixture reads with API requests. |
| 4 | Implement collaboration views | Persist bookmarks, applications, activity, notifications, and leaderboard data, then attach the existing UI. |
| 5 | Add optional advanced capabilities | Reintroduce chat, uploads, email flows, matching, AI assistance, and content features only with explicit product and operational requirements. |

### Known blockers and risks

| Type | Finding | Effect |
| --- | --- | --- |
| Blocker | No source-level blocker is explicitly marked. | Product-domain work can proceed once the data/API design is chosen. |
| Repository hygiene | `backend/` and several refactor additions are untracked; the worktree is already dirty. | Commit/review boundaries are unclear until changes are curated. |
| Documentation drift | Existing frontend docs describe an older frontend-only/dark-only/shadcn state. | New contributors could implement against obsolete assumptions. |
| Test coverage | Backend `test` script intentionally exits with an error; no current automated test suite is runnable. | Auth behavior and future APIs need regression tests. |
| Build verification | `npm run build` reached Next.js compilation but could not fetch Geist fonts from Google in the restricted environment. | Re-run with network access or a local font strategy before treating production build as validated. |
| Package hygiene | The frontend contains multiple package-manager lockfiles and dependencies that are not imported by current source. | Standardize the package manager and remove/reassess unused packages before release. |

## 11. Quick-start reference

```bash
# Terminal 1 — API
cd backend
npm install
npm run dev

# Terminal 2 — web app
cd frontend
npm install
npm run dev
```

Provide the backend configuration above and set `NEXT_PUBLIC_API_URL` only when the API is not served at `http://localhost:8762`.

## 12. Questions to resolve with the project owner

These cannot be established from the repository and should be answered before presenting this as a final team roadmap:

1. Is Aman the sole owner, or should additional people and explicit frontend/backend/product ownership be recorded?
2. Which data-bearing feature should be the first release slice after profile editing: project creation, discovery, applications, or team membership?
3. Is the removed pre-refactor feature set a committed roadmap, or only historical reference to evaluate anew?


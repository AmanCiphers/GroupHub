# GroupHub — Technical Documentation

> **Version:** 0.1.0  
> **Last Updated:** July 18, 2026  
> **Stack:** Next.js 16 (App Router) + Express.js + MongoDB (Mongoose)  
> **Repository:** Private

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Development Environment Setup](#3-development-environment-setup)
4. [Backend Architecture](#4-backend-architecture)
   - 4.1 [Project Structure](#41-backend-project-structure)
   - 4.2 [Environment Configuration](#42-environment-configuration)
   - 4.3 [Database Connection](#43-database-connection)
   - 4.4 [Express Application Setup](#44-express-application-setup)
   - 4.5 [Server Bootstrap & Graceful Shutdown](#45-server-bootstrap--graceful-shutdown)
   - 4.6 [Models (Mongoose Schemas)](#46-models-mongoose-schemas)
   - 4.7 [Repositories (Data Access Layer)](#47-repositories-data-access-layer)
   - 4.8 [Services (Business Logic)](#48-services-business-logic)
   - 4.9 [Controllers (Request Handlers)](#49-controllers-request-handlers)
   - 4.10 [Routes (API Endpoints)](#410-routes-api-endpoints)
   - 4.11 [Middlewares](#411-middlewares)
   - 4.12 [Validators (Zod Schemas)](#412-validators-zod-schemas)
   - 4.13 [Utilities](#413-utilities)
5. [Authentication & Authorization](#5-authentication--authorization)
   - 5.1 [JWT Access Tokens](#51-jwt-access-tokens)
   - 5.2 [Refresh Token Rotation](#52-refresh-token-rotation)
   - 5.3 [Auth Middleware](#53-auth-middleware)
   - 5.4 [Optional Auth Middleware](#54-optional-auth-middleware)
6. [Frontend Architecture](#6-frontend-architecture)
   - 6.1 [Project Structure](#61-frontend-project-structure)
   - 6.2 [Next.js Configuration](#62-nextjs-configuration)
   - 6.3 [Root Layout & Global Styles](#63-root-layout--global-styles)
   - 6.4 [API Client (lib/api.js)](#64-api-client)
   - 6.5 [Design System & Design Tokens](#65-design-system--design-tokens)
7. [Feature Implementation (Chronological)](#7-feature-implementation-chronological)
   - 7.1 [Database Connection & Server Bootstrap](#71-database-connection--server-bootstrap)
   - 7.2 [Authentication (Register/Login/Refresh/Logout)](#72-authentication)
   - 7.3 [User Profiles & Account Page](#73-user-profiles--account-page)
   - 7.4 [Predefined Categories & Roles (Metadata)](#74-predefined-categories--roles-metadata)
   - 7.5 [Projects CRUD](#75-projects-crud)
   - 7.6 [Project Roles & Applications](#76-project-roles--applications)
   - 7.7 [Project Detail Page (Public View)](#77-project-detail-page-public-view)
   - 7.8 [Save/Unsave Projects](#78-saveunsave-projects)
   - 7.9 [Dashboard (Owned & Joined Projects)](#79-dashboard)
   - 7.10 [Home Page with Project Teasers](#710-home-page-with-project-teasers)
   - 7.11 [Contribute & Find Projects Pages](#711-contribute--find-projects-pages)
   - 7.12 [Leaderboard Page](#712-leaderboard-page)
   - 7.13 [Project Members & Activity Endpoints](#713-project-members--activity-endpoints)
   - 7.14 [Owner Management Dashboard](#714-owner-management-dashboard)
   - 7.15 [Member Dashboard](#715-member-dashboard)
   - 7.16 [Task Model & CRUD](#716-task-model--crud)
   - 7.17 [Task Status Workflow & Review System](#717-task-status-workflow--review-system)
   - 7.18 [Task Subtrees (Parent/Child Task Tree)](#718-task-subtrees-parentchild-task-tree)
   - 7.19 [Seed Script](#719-seed-script)
8. [API Reference](#8-api-reference)
   - 8.1 [Authentication Endpoints](#81-authentication-endpoints)
   - 8.2 [User Endpoints](#82-user-endpoints)
   - 8.3 [Project Endpoints](#83-project-endpoints)
   - 8.4 [Task Endpoints](#84-task-endpoints)
   - 8.5 [Role & Application Endpoints](#85-role--application-endpoints)
   - 8.6 [Dashboard & Activity Endpoints](#86-dashboard--activity-endpoints)
   - 8.7 [Other Endpoints](#87-other-endpoints)
9. [Database Schema Reference](#9-database-schema-reference)
10. [Testing](#10-testing)
11. [Common Errors & Troubleshooting](#11-common-errors--troubleshooting)
12. [Best Practices & Conventions](#12-best-practices--conventions)
13. [Future Improvements](#13-future-improvements)

---

## 1. Project Overview

GroupHub is a project collaboration platform that enables students, developers, and creators to discover meaningful projects, build talented teams, and collaborate efficiently. The platform allows users to:

- **Create projects** with detailed descriptions, categories, stages, and skill requirements
- **Define roles** with required/preferred skills, slot counts, and workload expectations
- **Apply to roles** on projects, with accept/reject workflows for project owners
- **Manage teams** through a dedicated owner dashboard (8 tabs: Overview, Applications, Team, Roles, Tasks, Chat, AI Companion, Settings)
- **Collaborate as members** through a member dashboard (6 tabs: Overview, My Work, Team, Tasks, Chat, AI Companion)
- **Track tasks** with a full lifecycle: To Do → In Progress → Needs Review → Done/Cancelled
- **Review work** with feedback loops: owners can approve tasks or request changes, creating subtask trees
- **Save projects** for later reference
- **Track contributions** through a leaderboard with reputation points
- **Receive notifications** for project activity

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Frontend (Next.js 16)                      │
│                                                                     │
│  app/                                                               │
│  ├── page.jsx         (Home)                                        │
│  ├── projects/[id]/   (Project detail, manage, member)              │
│  ├── dashboard/       (User dashboard)                              │
│  ├── account/         (Profile editor)                              │
│  ├── leaderboard/     (Rankings)                                    │
│  ├── find-projects/   (Project discovery)                           │
│  ├── contribute/      (Categories + featured)                       │
│  ├── contact/         (Contact form)                                │
│  ├── tutorials/       (Static tutorials)                            │
│  └── about/           (Static about page)                           │
│                                                                     │
│  lib/                                                               │
│  ├── api.js           (API client with JWT auto-refresh)            │
│  └── utils.jsx        (cn() helper)                                 │
│                                                                     │
│  components/          (Reusable React components)                   │
│  ├── navbar.jsx                                                     │
│  └── footer.jsx                                                     │
└──────────────┬──────────────────────────────────────────────────────┘
               │  HTTP (fetch) — localhost:5050/api/v1
               │  Auth: Bearer JWT + httpOnly refresh cookie
               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Backend (Express.js)                           │
│                                                                     │
│  src/                                                               │
│  ├── config/         (env, db, cors, metadata)                      │
│  ├── models/         (Mongoose schemas — 11 models)                 │
│  ├── repositories/   (Data access layer — 11 repos)                 │
│  ├── services/       (Business logic — 13 services)                 │
│  ├── controllers/    (HTTP request handlers — 14 controllers)       │
│  ├── routes/         (Route definitions — 13 route files)           │
│  ├── middlewares/    (Auth, validation, error, rate-limit, etc.)    │
│  ├── validators/     (Zod schemas — 6 validator files)              │
│  └── utils/          (Helpers — ApiError, logger, crypto, etc.)     │
│                                                                     │
│  server.js           (Entry point, bootstrap + shutdown)            │
│  app.js              (Express app configuration)                    │
└──────────────┬──────────────────────────────────────────────────────┘
               │  Mongoose — MongoDB Atlas (cloud)
               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     MongoDB Atlas (grouphub DB)                     │
│                                                                     │
│  Collections: users, projects, projectroles, applications,          │
│  projectmemberships, tasks, savedprojects, notifications,           │
│  activityevents, contactsubmissions, refreshtokens                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Monorepo** (frontend + backend in one repo) | Simplifies development for a small team; both services share the same `.env` at root |
| **Repository Pattern** | Decouples data access from business logic; makes testing easier and allows future ORM changes |
| **Zod Validation** | Runtime type validation for all API inputs; co-located with route definitions |
| **JWT + Refresh Token Rotation** | Short-lived access tokens (15 min) with rotating refresh tokens (7 days) for security |
| **No ORM abstraction layer** | Mongoose provides schema validation, population, indexing directly |
| **Layered Architecture** | Routes → Validation → Controllers → Services → Repositories → Models |
| **Pino for logging** | Structured JSON logging suitable for production; pino-pretty for dev |

---

## 3. Development Environment Setup

### Prerequisites

- **Node.js** >= 20.x
- **npm** or **bun**
- **MongoDB Atlas** account (or local MongoDB instance)
- **Git**

### Clone & Install

```bash
git clone <repository-url>
cd grouphub

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### Environment Configuration

The project uses a **single `.env` file at the repository root** shared by both frontend and backend. The backend's `env.js` loads `.env` from the root, then overrides with `backend/.env` if present.

```bash
# Required environment variables (values from .env.example or your own):

NODE_ENV=development
PORT=5050                         # Backend port
API_BASE_URL=http://localhost:5050
CLIENT_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:5050  # Frontend reads this

APP_SECRET=<random 32+ char string>             # Cookie signing

MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net
MONGODB_DB_NAME=grouphub

JWT_ACCESS_SECRET=<random 32+ char string>
JWT_REFRESH_SECRET=<random 32+ char string>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

BCRYPT_SALT_ROUNDS=12
```

### Running the Development Servers

```bash
# Terminal 1: Backend (with auto-reload via nodemon)
cd backend && npm run dev
# → http://localhost:5050

# Terminal 2: Frontend (with HMR via Next.js webpack)
npm run dev
# → http://localhost:3000
```

### Seeding the Database

```bash
cd backend

# Seed with sample data (safe to run multiple times — skips existing)
npm run seed

# Force reseed (drops all collections first)
npm run seed:force
```

The seed creates:
- **6 users** (alice, bob, carol, david, elena, admin) — all use password `password123`, admin uses `admin123`
- **8 projects** with 2–3 roles each (22 roles total)
- **10 sample applications** (some accepted → create memberships)
- **6 saved projects**
- **6 welcome notifications**
- **2 contact submissions**
- **Activity events** for project creation and applications

### Test Accounts

| Email | Password | Role |
|-------|----------|------|
| alice@example.com | password123 | User |
| bob@example.com | password123 | User |
| carol@example.com | password123 | User |
| david@example.com | password123 | User |
| elena@example.com | password123 | User |
| admin@grouphub.com | admin123 | Admin |

---

## 4. Backend Architecture

### 4.1 Backend Project Structure

```
backend/
├── scripts/
│   └── seed.js                    # Database seeder
├── src/
│   ├── config/
│   │   ├── cors.js                # CORS middleware configuration
│   │   ├── db.js                  # MongoDB connection/disconnection
│   │   ├── env.js                 # Environment variable validation (Zod)
│   │   └── metadata.js           # Predefined categories (8) and roles (20)
│   ├── controllers/
│   │   ├── activity.controller.js
│   │   ├── application.controller.js
│   │   ├── auth.controller.js
│   │   ├── contact.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── leaderboard.controller.js
│   │   ├── metadata.controller.js
│   │   ├── notification.controller.js
│   │   ├── project.controller.js
│   │   ├── role.controller.js
│   │   ├── savedProject.controller.js
│   │   ├── task.controller.js
│   │   └── user.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT verify (required + optional)
│   │   ├── error.middleware.js     # Global error handler
│   │   ├── rateLimit.middleware.js # Auth rate limiting
│   │   ├── requestId.middleware.js # UUID per request
│   │   └── validate.middleware.js  # Zod schema validation
│   ├── models/
│   │   ├── ActivityEvent.js
│   │   ├── Application.js
│   │   ├── ContactSubmission.js
│   │   ├── Notification.js
│   │   ├── Project.js
│   │   ├── ProjectMembership.js
│   │   ├── ProjectRole.js
│   │   ├── RefreshToken.js
│   │   ├── SavedProject.js
│   │   ├── Task.js
│   │   └── User.js
│   ├── repositories/
│   │   ├── activity.repository.js
│   │   ├── application.repository.js
│   │   ├── contact.repository.js
│   │   ├── membership.repository.js
│   │   ├── notification.repository.js
│   │   ├── project.repository.js
│   │   ├── refreshToken.repository.js
│   │   ├── role.repository.js
│   │   ├── savedProject.repository.js
│   │   ├── task.repository.js
│   │   └── user.repository.js
│   ├── routes/
│   │   ├── index.js               # Route aggregator (/api/v1/...)
│   │   ├── activity.routes.js
│   │   ├── application.routes.js
│   │   ├── auth.routes.js
│   │   ├── contact.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── leaderboard.routes.js
│   │   ├── metadata.routes.js
│   │   ├── notification.routes.js
│   │   ├── project.routes.js
│   │   ├── role.routes.js
│   │   ├── savedProject.routes.js
│   │   ├── task.routes.js
│   │   └── user.routes.js
│   ├── services/
│   │   ├── activity.service.js
│   │   ├── application.service.js
│   │   ├── auth.service.js
│   │   ├── contact.service.js
│   │   ├── dashboard.service.js
│   │   ├── membership.service.js
│   │   ├── notification.service.js
│   │   ├── project.service.js
│   │   ├── role.service.js
│   │   ├── savedProject.service.js
│   │   ├── task.service.js
│   │   ├── token.service.js
│   │   └── user.service.js
│   ├── utils/
│   │   ├── ApiError.js           # Custom error class with statusCode
│   │   ├── ApiResponse.js        # Standardized success response
│   │   ├── asyncHandler.js       # Async error wrapper
│   │   ├── crypto.js             # SHA-256, opaque token generation
│   │   ├── logger.js             # Pino logger
│   │   ├── normalize.js          # Email/string list normalization
│   │   ├── pagination.js         # Pagination calculator
│   │   └── slugify.js            # URL slug generation
│   ├── validators/
│   │   ├── application.validator.js
│   │   ├── auth.validator.js
│   │   ├── contact.validator.js
│   │   ├── notification.validator.js
│   │   ├── project.validator.js
│   │   ├── task.validator.js
│   │   └── user.validator.js
│   ├── app.js                    # Express app configuration
│   └── server.js                 # Bootstrap + graceful shutdown
├── tests/
│   ├── health.test.js
│   └── routes.test.js
├── package.json
└── package-lock.json
```

### 4.2 Environment Configuration

**File:** `backend/src/config/env.js`

Uses **Zod** to validate all environment variables at startup. If any variable is missing or malformed, the server throws a detailed error with the specific field name and message — preventing runtime surprises.

```js
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  APP_SECRET: z.string().min(16),         // Cookie signing secret
  MONGODB_URI: z.string().min(1),         // MongoDB connection string
  MONGODB_DB_NAME: z.string().min(1).default("grouphub"),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  // ... optional fields with defaults for AI, Redis, Sentry, etc.
})
```

**Loading order:**
1. Loads `.env` from the repository root (`../../.env` relative to `env.js`)
2. Overrides with `backend/.env` if it exists

This means the root `.env` can contain shared variables, while `backend/.env` can override backend-specific values.

### 4.3 Database Connection

**File:** `backend/src/config/db.js`

```js
async function connectDatabase() {
  mongoose.set("strictQuery", true)
  await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB_NAME })
  logger.info(`Connected to MongoDB database "${env.MONGODB_DB_NAME}"`)
}

async function disconnectDatabase() {
  await mongoose.disconnect()
  logger.info("Disconnected from MongoDB")
}
```

- Uses `strictQuery: true` (Mongoose 8 default, explicit for clarity)
- Specifies `dbName` separately from connection URI for flexibility
- Both functions are called in `server.js` during bootstrap and shutdown

### 4.4 Express Application Setup

**File:** `backend/src/app.js`

The Express app applies middleware in this order:

```js
1. requestIdMiddleware    → Attaches UUID `req.id` to every request
2. helmet()              → Security headers (XSS, clickjacking, etc.)
3. corsMiddleware         → CORS with origin whitelist
4. compression()         → gzip/brotli response compression
5. express.json()        → JSON body parser (1mb limit)
6. express.urlencoded()  → URL-encoded body parser (1mb limit)
7. cookieParser(secret)  → Signed cookie parsing
8. mongoSanitize()       → Prevents NoSQL injection ($ and . removal)
9. morgan (dev only)     → HTTP request logging via pino
```

**Route structure:**

```
GET  /health              → Health check (no auth)
GET  /                    → API root with endpoint listing
GET  /api/v1              → Same as root
      /api/v1/auth/*      → Auth routes
      /api/v1/users/*     → User routes
      /api/v1/projects/*  → Project routes
      /api/v1/tasks/*     → Task routes
      /api/v1/roles/*     → Role routes
      /api/v1/applications/* → Application routes
      /api/v1/dashboard/* → Dashboard routes
      /api/v1/activity/*  → Activity routes
      /api/v1/leaderboard/* → Leaderboard routes
      /api/v1/metadata/*  → Metadata routes
      /api/v1/notifications/* → Notification routes
      /api/v1/contact/*   → Contact submission routes
      /api/v1/saved-projects/* → Saved project routes
  *                       → 404 catch-all
```

**Error handling:** The `errorMiddleware` catches all errors:
- Mongoose duplicate key errors (`code 11000`) → 409 Conflict
- `ApiError` instances → Use their `statusCode` (4xx)
- Unhandled errors → 500 Internal Server Error (hides details in production)
- Validation details included in non-production environments

### 4.5 Server Bootstrap & Graceful Shutdown

**File:** `backend/src/server.js`

```js
async function bootstrap() {
  await connectDatabase()
  server = app.listen(env.PORT, () => {
    logger.info(`GroupHub API listening on port ${env.PORT}`)
  })
}

async function shutdown(signal) {
  logger.info(`${signal} received, shutting down`)
  if (server) {
    server.close(async () => {
      await disconnectDatabase()
      process.exit(0)
    })
    return
  }
  await disconnectDatabase()
  process.exit(0)
}

process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT", () => shutdown("SIGINT"))
```

- **Graceful shutdown:** Closes HTTP server first (stops accepting new connections), then disconnects MongoDB
- **Signal handling:** Handles both SIGTERM (deployment orchestration) and SIGINT (Ctrl+C)

### 4.6 Models (Mongoose Schemas)

All models are defined as Mongoose schemas and exported as `{ ModelName }`. The complete schema reference is in [Section 9](#9-database-schema-reference).

**Key model design decisions:**

| Model | Key Fields | Indexes | Notes |
|-------|-----------|---------|-------|
| **User** | `email`, `passwordHash` (select:false), `fullName`, `username` (sparse unique), `skills`, `interests`, `socialLinks`, `reputationPoints` | Text index on `fullName`, `username`, `skills` | `passwordHash` excluded from queries by default |
| **Project** | `ownerId`, `title`, `slug` (unique), `category`, `stage`, `status`, `progressPercent`, `visibility` | Compound: status+visibility+category+createdAt; Text: title+description+skills+tags+category | `visibility` supports public/private/unlisted |
| **ProjectRole** | `projectId`, `title`, `slotsTotal`, `slotsFilled`, `status` (open/filled/closed) | Compound: projectId+status | Skills split into `requiredSkills` and `preferredSkills` |
| **Application** | `projectId`, `roleId`, `applicantId`, `status` (pending/accepted/rejected/withdrawn) | Unique compound: roleId+applicantId; Compound: projectId+status | Prevents duplicate applications to same role |
| **ProjectMembership** | `projectId`, `userId`, `roleTitle`, `permissions` array | Unique compound: projectId+userId | Permissions: view, comment, manage_roles, manage_applications, manage_project |
| **Task** | `projectId`, `title`, `assigneeId`, `status`, `parentId` | Compound: projectId+status; Single: assigneeId | Statuses: todo, in_progress, needs_review, done, cancelled |
| **ActivityEvent** | `actorId`, `projectId`, `type` (enum), `metadata` (Mixed) | Compound: projectId+createdAt; Single: targetUserId+createdAt | Polymorphic `metadata` field for flexible event data |
| **Notification** | `userId`, `type`, `title`, `readAt` | Compound: userId+readAt+createdAt | `readAt` is null until read — allows counting unread |
| **RefreshToken** | `userId`, `tokenHash` (unique), `expiresAt` (TTL index), `revokedAt` | TTL index on `expiresAt` auto-deletes expired docs | Rotation: old token revoked, new token issued |
| **ContactSubmission** | `firstName`, `lastName`, `email`, `subject`, `message`, `status` | Compound: status+createdAt | `userId` is optional (unauthenticated submissions) |
| **SavedProject** | `userId`, `projectId` | Unique compound: userId+projectId | Simple bookmark/favorite |

### 4.7 Repositories (Data Access Layer)

Each model has a corresponding repository that wraps Mongoose operations. The repository pattern provides:

- **Encapsulation:** Business logic never touches Mongoose directly
- **Consistent population:** All queries include `.populate()` for related data
- **Testability:** Repos can be mocked in service tests

**Example — Task Repository** (`backend/src/repositories/task.repository.js`):

```js
async function findById(id) {
  return Task.findById(id)
    .populate("assigneeId", "fullName email username")
    .populate("createdBy", "fullName")
}

async function findByProject(projectId) {
  return Task.find({ projectId })
    .populate("assigneeId", "fullName email username")
    .populate("createdBy", "fullName")
    .sort({ createdAt: -1 })
}

async function findByParent(parentId) {
  return Task.find({ parentId })
    .populate("assigneeId", "fullName email username")
    .populate("createdBy", "fullName")
    .sort({ createdAt: -1 })
}
```

Every repository exports `{ repositoryName }` and follows a consistent naming:
- `create(data)` — Insert
- `findById(id)` — Single document by ID
- `updateById(id, data)` — Atomic update with `{ new: true, runValidators: true }`
- `removeById(id)` — Delete
- Additional domain-specific query methods

### 4.8 Services (Business Logic)

Services contain all business logic and orchestration. Each service:

1. **Calls repositories** for data access
2. **Throws `ApiError`** for error conditions (caught by `errorMiddleware`)
3. **Serializes** data before returning (removes Mongoose meta, transforms fields)
4. **Cross-calls** other services when needed (e.g., `task.service.js` calls `membership.service.js`)

**Example — Task Service** (`backend/src/services/task.service.js`):

Key service methods:

| Method | Auth | Description |
|--------|------|-------------|
| `createTask` | Owner only | Creates a task with assignment type (assigned/open) |
| `listTasks` | Member/Owner | Lists all tasks for a project |
| `getTask` | Member/Owner | Single task detail |
| `updateTask` | Owner (all fields) / Member (status only) | Task update with role-based permissions |
| `deleteTask` | Owner only | Removes task and recalculates progress |
| `claimTask` | Member only | Claims an open (unassigned) task |
| `sendFeedback` | Owner only | Approves or creates subtask with feedback |
| `getSubtasks` | Member/Owner | Lists child tasks of a parent task |
| `getTaskStats` | Member/Owner | Counts by status for a project |

**Progress Calculation:**

```js
async function recalcProgress(projectId) {
  const project = await projectRepository.findById(projectId)
  if (project.status === "completed") {
    await projectRepository.updateById(projectId, { progressPercent: 100 })
    return
  }
  const [total, done] = await Promise.all([
    taskRepository.countByProject(projectId),
    taskRepository.countByProject(projectId, "done"),
  ])
  if (total === 0) return
  const pct = Math.min(Math.round((done / total) * 100), 90)
  await projectRepository.updateById(projectId, { progressPercent: pct })
}
```

**Design decisions:**
- Progress is **auto-calculated** from task completion ratio
- **Capped at 90%** unless project status is manually set to "completed" (then 100%)
- This prevents projects from showing "100%" before the owner explicitly marks them complete

**Cross-service dependency handling:**

Services use lazy `require()` (`require("./membership.service")`) for cross-service dependencies to avoid circular dependency issues at module load time.

### 4.9 Controllers (Request Handlers)

Controllers are thin wrappers that:
1. Extract validated data from `req.validated.body` / `req.params` / `req.query`
2. Extract user from `req.user` (set by auth middleware)
3. Call service methods
4. Return standardized responses via `apiResponse()`

All controllers use the `asyncHandler` wrapper to catch promise rejections:

```js
const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(
    req.params.projectId,
    req.user.id,
    req.validated.body
  )
  apiResponse(res, 201, { task }, "Task created")
})
```

**`apiResponse` signature:**

```js
apiResponse(res, statusCode, data, message = "Success")
// → { success: true, message, data }
```

### 4.10 Routes (API Endpoints)

Routes define URL patterns and apply middleware chains:

```js
taskRoutes.get("/:projectId", listTasks)                    // GET /api/v1/tasks/:projectId
taskRoutes.post("/:projectId", validate(createTaskSchema), createTask)  // POST with validation
taskRoutes.patch("/:taskId", validate(updateTaskSchema), updateTask)
taskRoutes.post("/:taskId/claim", claimTask)
taskRoutes.post("/:taskId/feedback", validate(feedbackSchema), sendFeedback)
taskRoutes.get("/:taskId/subtasks", getSubtasks)
taskRoutes.delete("/:taskId", validate(taskIdParamSchema), deleteTask)
```

All task routes (and most others) are protected by `authMiddleware` applied at the router level:

```js
taskRoutes.use(authMiddleware)
```

Public routes (like project listing and leaderboard) either have no auth or use `optionalAuthMiddleware`:

```js
projectRoutes.get("/", optionalAuthMiddleware, validate(listProjectsSchema), listProjects)
```

### 4.11 Middlewares

| Middleware | File | Purpose |
|-----------|------|---------|
| **authMiddleware** | `auth.middleware.js` | Verifies Bearer JWT, attaches `req.user` |
| **optionalAuthMiddleware** | `auth.middleware.js` | Same but doesn't fail if no token; `req.user` is undefined |
| **validate** | `validate.middleware.js` | Runs Zod schema against `{ body, params, query }`, sets `req.validated` |
| **errorMiddleware** | `error.middleware.js` | Global error handler, formats ApiError and unexpected errors |
| **authRateLimiter** | `rateLimit.middleware.js` | Rate-limits auth endpoints (register/login) |
| **requestIdMiddleware** | `requestId.middleware.js` | Attaches UUID to each request for tracing |

**Validate Middleware:**

```js
function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    })
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }))
      next(new ApiError(400, "Validation failed", details))
      return
    }
    req.validated = result.data
    next()
  }
}
```

**Auth Middleware:**

```js
const authMiddleware = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || ""
  const [, token] = header.split(" ")
  if (!token) throw new ApiError(401, "Authentication required")

  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET)
  const user = await userRepository.findById(payload.sub)
  if (!user || user.status !== "active") throw new ApiError(401, "User account is not active")

  req.user = user
  next()
})
```

### 4.12 Validators (Zod Schemas)

Each validator file exports Zod schemas that validate `{ body, params, query }` together. The `validate` middleware applies `.safeParse()` and attaches the result to `req.validated`.

**Example — Task Validator** (`backend/src/validators/task.validator.js`):

```js
const createTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(200),
    description: z.string().trim().max(5000).optional(),
    assigneeId: z.string().optional(),
    assignmentType: z.enum(["assigned", "open"]).optional(),
    status: z.enum(["todo", "in_progress", "needs_review", "done", "cancelled"]).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    dueDate: z.string().optional(),
  }),
  params: z.object({ projectId: z.string().min(1) }),
  query: z.object({}).optional(),
})
```

### 4.13 Utilities

| Utility | Purpose |
|---------|---------|
| **ApiError** | Custom error class with `statusCode`, `details`, and `isOperational` flag |
| **apiResponse** | Standardized `{ success, message, data }` response format |
| **asyncHandler** | Wraps async handlers to forward rejections to `next()` |
| **crypto** | SHA-256 hashing and cryptographically secure opaque token generation |
| **logger** | Pino instance; pretty-printed in development, JSON in production |
| **normalize** | `normalizeEmail()` (lowercase+trim), `normalizeStringList()` (deduplicate+trim) |
| **pagination** | Calculates `{ page, limit, skip }` from query params with sane defaults |
| **slugify** | Converts text to URL-safe slugs |

---

## 5. Authentication & Authorization

### 5.1 JWT Access Tokens

Access tokens are short-lived JWTs signed with `JWT_ACCESS_SECRET`:

```js
function signAccessToken(user) {
  return jwt.sign(
    { role: user.role, email: user.email },  // Payload
    env.JWT_ACCESS_SECRET,                    // Secret
    {
      subject: user.id,                       // Standard JWT subject = user ID
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,   // Default: "15m"
    }
  )
}
```

**Frontend storage:** Access tokens are stored in `localStorage` under `grouphub_access_token`. The API client automatically attaches them as `Bearer` headers.

### 5.2 Refresh Token Rotation

Refresh tokens follow a **rotation** pattern — each use issues a new token and revokes the old one:

1. **Creation:** On register/login, an opaque random token is generated, hashed (SHA-256), and stored in the `RefreshToken` collection with an expiry.
2. **Storage:** The raw token is sent to the client as an **httpOnly signed cookie** (`refreshToken`), scoped to `Path=/api/v1/auth`.
3. **Rotation:** When the access token expires, the frontend's API client calls `POST /api/v1/auth/refresh` with the cookie. The server:
   - Validates the signed cookie
   - Looks up the hash in the database
   - Revokes the old token (sets `revokedAt`)
   - Issues a new access token AND a new refresh token
4. **Logout:** Revokes all refresh tokens by hash.

**Security properties:**
- Refresh tokens are opaque (random 48-byte base64url) — no JWT exposure risk
- Stored as SHA-256 hash — database breach doesn't leak usable tokens
- HttpOnly + Signed cookie — not accessible to JavaScript
- Rotation — a compromised old token cannot be reused after refresh

### 5.3 Auth Middleware

Applied to all protected routes via `router.use(authMiddleware)`:

1. Extract `Bearer <token>` from `Authorization` header
2. Verify JWT with `JWT_ACCESS_SECRET`
3. Look up user by `payload.sub` (user ID)
4. Check user status is `active`
5. Attach full user document to `req.user`

### 5.4 Optional Auth Middleware

Used on public endpoints where authentication is optional (e.g., project listing/detail):

1. Tries to extract and verify JWT (same as authMiddleware)
2. If no token or invalid token, silently continues with `req.user` undefined
3. Services check `req.user?.id` to determine `isOwner` / `isMember` flags

---

## 6. Frontend Architecture

### 6.1 Frontend Project Structure

```
app/
├── layout.jsx                            # Root layout (Navbar + Footer)
├── globals.css                           # Tailwind CSS v4 + design tokens
├── page.jsx                              # Home page
├── about/page.jsx                        # About (static)
├── account/page.jsx                      # Profile editor (auth required)
├── contact/page.jsx                      # Contact form
├── contribute/page.jsx                   # Categories + featured projects
├── dashboard/page.jsx                    # User dashboard (auth required)
├── find-projects/page.jsx               # Project discovery
├── leaderboard/page.jsx                  # Rankings
├── tutorials/page.jsx                    # Tutorials (static)
├── projects/[id]/
│   ├── page.jsx                          # Public project detail
│   ├── manage/page.jsx                   # Owner management dashboard
│   └── member/page.jsx                   # Member dashboard

lib/
├── api.js                                # API client with auth management
└── utils.jsx                             # cn() classname utility

components/
├── navbar.jsx                            # Site navigation
└── footer.jsx                            # Site footer

public/                                    # Static assets (images, etc.)
```

### 6.2 Next.js Configuration

```js
// next.config.mjs
const nextConfig = {
  typescript: { ignoreBuildErrors: true },  // Skip TS errors in JS-only codebase
  images: { unoptimized: true },            // No image optimization (static export)
}
```

**Path aliases** (`jsconfig.json`):
```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./*"] }
  }
}
```

### 6.3 Root Layout & Global Styles

**Layout** (`app/layout.jsx`):
- Wraps all pages with `Navbar` and `Footer`
- Uses Geist and Geist Mono fonts
- Conditionally includes Vercel Analytics in production
- Body has `min-h-screen flex flex-col` for sticky footer

**Global styles** (`app/globals.css`):
- Uses **Tailwind CSS v4** with `@import 'tailwindcss'` and `tw-animate-css`
- Custom CSS variables for design tokens (background, foreground, card, border, etc.)
- Font family config: `--font-sans: 'Geist', 'Geist Fallback'`
- All components use `@layer base` reset

### 6.4 API Client

**File:** `lib/api.js`

The API client is the central networking layer with these features:

**Token Management:**
```js
const ACCESS_TOKEN_KEY = "grouphub_access_token"
const USER_KEY = "grouphub_user"

export function getAccessToken() { /* reads from localStorage */ }
export function setAuthSession({ accessToken, user }) { /* writes to localStorage */ }
export function getStoredUser() { /* reads cached user JSON */ }
export function clearAuthSession() { /* clears both */ }
```

**Auto-Refresh on 401:**
```js
export async function apiFetch(path, options = {}) {
  // 1. Attach Bearer token
  // 2. Send request
  // 3. If 401 AND we had a token (not a login request):
  //    a. Call POST /api/v1/auth/refresh (which reads httpOnly cookie)
  //    b. Update stored access token
  //    c. Retry original request with new token
  //    d. If refresh also fails, clear auth and redirect
  // 4. Parse JSON response
  // 5. If not ok, throw Error with server message + details array
}
```

**Error Handling:**
- Non-2xx responses throw an `Error` with the server's `message` and `error.status`
- Validation errors include a `details` array with field-level messages
- The frontend displays these in error banners

**Query String Builder:**
```js
export function toQueryString(params) {
  // Filters out undefined, null, empty, and "All" values
  // Returns "?key=value&key2=value2" or ""
}
```

### 6.5 Design System & Design Tokens

The application uses a custom dark-neutral design system with these core tokens:

| Token | Value | Usage |
|-------|-------|-------|
| `bg-[#f7f7f3]` | Light cream | Page backgrounds |
| `text-[#171717]` | Near-black | Primary text |
| `bg-[#fbfbfa]` | Off-white | Card backgrounds |
| `border-[#d9d8d2]` | Light gray | Borders |
| `bg-[#2f2f2d]` | Dark gray | Inverted elements, dark sections |
| `text-[#55544f]` | Medium gray | Secondary text |
| `text-[#77766f]` | Muted gray | Labels, metadata |
| `bg-[#cc8833]` | Amber | "Needs Review" status |
| `bg-[#cc3333]` | Red | Delete/urgent actions |

These are **not** defined as Tailwind theme variables — they are used inline with arbitrary value syntax (`bg-[#f7f7f3]`). This was a deliberate choice for speed during development but should be centralized in a future refactor.

**Common component patterns:**
- **Buttons:** `h-11 px-5 border border-[#171717] bg-[#171717] font-black text-sm text-white`
- **Cards:** `border border-[#d9d8d2] bg-[#fbfbfa] p-5`
- **Inputs:** `h-11 w-full border border-[#d9d8d2] bg-white px-3 font-semibold outline-none focus:border-[#171717]`
- **Status badges:** `px-2.5 py-1 text-xs font-black` with color class mapping
- **Section headers:** `text-sm font-black text-[#77766f] uppercase tracking-[0.12em]`

**Typography:**
- Headings: `font-black` (Heavy weight, 900)
- Body: `font-semibold` (600)
- Labels: `font-black uppercase tracking-[0.12em]` (All caps, wide tracking)
- Monospace: `font-mono` (Geist Mono)

---

## 7. Feature Implementation (Chronological)

### 7.1 Database Connection & Server Bootstrap

**Objective:** Create a reliable, production-ready Express server with MongoDB connectivity and graceful shutdown.

**Files created:**
- `backend/src/server.js` — Entry point, bootstrap, shutdown handling
- `backend/src/app.js` — Express application assembly
- `backend/src/config/db.js` — MongoDB connection management
- `backend/src/config/env.js` — Environment validation with Zod
- `backend/src/config/cors.js` — CORS middleware
- `backend/src/middlewares/requestId.middleware.js`
- `backend/src/middlewares/error.middleware.js`
- `backend/src/utils/logger.js`, `ApiError.js`, `ApiResponse.js`, `asyncHandler.js`

**Implementation decisions:**
- Zod for env validation ensures the server fails fast on misconfiguration
- Pino logger chosen for structured JSON logging (production-friendly)
- Request IDs enable tracing across logs
- CORS configured with explicit origin whitelist from env

**Commands:**
```bash
cd backend && npm init -y
npm install express mongoose cors helmet compression cookie-parser morgan dotenv zod pino
npm install -D nodemon pino-pretty jest supertest
```

### 7.2 Authentication

**Objective:** Email/password authentication with JWT access tokens and httpOnly refresh token rotation.

**Files created/updated:**
- `backend/src/models/RefreshToken.js` — Token storage with TTL index
- `backend/src/models/User.js` — User schema with `passwordHash select: false`
- `backend/src/repositories/user.repository.js`
- `backend/src/repositories/refreshToken.repository.js`
- `backend/src/services/auth.service.js` — Register, login, refresh, logout
- `backend/src/services/token.service.js` — JWT signing, token creation, cookie management
- `backend/src/controllers/auth.controller.js`
- `backend/src/routes/auth.routes.js`
- `backend/src/validators/auth.validator.js`
- `backend/src/middlewares/auth.middleware.js`
- `backend/src/middlewares/rateLimit.middleware.js`

**Implementation details:**

**Registration flow:**
1. Validate payload (email, password min 8 chars, fullName)
2. Normalize email (lowercase + trim)
3. Check for existing user (409 if exists)
4. Hash password with bcrypt (12 rounds)
5. Create user document
6. Sign access JWT
7. Create refresh token (opaque random token, SHA-256 hash stored)
8. Set refresh token as httpOnly signed cookie
9. Return `{ accessToken, user }` in response body

**Login flow:** Same as register but verifies password hash with bcrypt.compare.

**Refresh flow:**
1. Read signed refresh cookie
2. SHA-256 hash it
3. Find active (unrevoked, not expired) refresh token by hash
4. Revoke current token
5. Get user, verify active status
6. Issue new access token + new refresh token

**Rate limiting:** Auth endpoints (`/register`, `/login`) are rate-limited to prevent brute force attacks.

### 7.3 User Profiles & Account Page

**Objective:** Allow users to view and edit their profile information.

**Files created/updated:**
- `backend/src/services/user.service.js`
- `backend/src/controllers/user.controller.js`
- `backend/src/routes/user.routes.js`
- `backend/src/validators/user.validator.js`
- `app/account/page.jsx` — Full profile editor

**Profile fields supported:**
- `fullName`, `username` (unique, sparse index)
- `bio` (max 500 chars)
- `skills`, `interests` (string arrays)
- `location`
- `availabilityHoursPerWeek` (0–80)
- `experienceLevel` (beginner, intermediate, advanced, expert)
- `socialLinks`: GitHub, Twitter, LinkedIn, Website

**API:**

```
GET  /api/v1/users/me   → Returns current user profile
PATCH /api/v1/users/me  → Updates profile fields
```

**Validation:**
- Zod trims strings, enforces min/max lengths
- `socialLinks` validated as object with optional URL fields
- Skills/interests limited to 20 items each, max 80 chars per item

### 7.4 Predefined Categories & Roles (Metadata)

**Objective:** Provide a fixed set of categories (8) and roles (20) for project creation, enforced by backend validation.

**Files created:**
- `backend/src/config/metadata.js`
- `backend/src/controllers/metadata.controller.js`
- `backend/src/routes/metadata.routes.js`

**Categories:**
```
Technology, Design, Business, Marketing, Gaming,
Social Impact, Education, Health & Wellness
```

**Roles:**
```
Frontend Developer, Backend Developer, Full Stack Developer,
Mobile Developer, DevOps Engineer, UI/UX Designer,
Product Designer, Graphic Designer, Product Manager,
Project Manager, Data Scientist, Data Analyst,
Machine Learning Engineer, QA Engineer, Technical Writer,
Content Writer, Marketing Specialist, Social Media Manager,
Community Manager, Business Developer
```

**API:**

```
GET /api/v1/metadata → { categories: [...], roles: [...] }
```

**Backend enforcement:** Both category and role values are validated against these predefined arrays in the project/role validators. Invalid values are rejected at the validation layer.

### 7.5 Projects CRUD

**Objective:** Full CRUD for projects with slug generation, skill/tag management, and paginated listing with filtering.

**Files created/updated:**
- `backend/src/models/Project.js`
- `backend/src/repositories/project.repository.js`
- `backend/src/services/project.service.js`
- `backend/src/controllers/project.controller.js`
- `backend/src/routes/project.routes.js`
- `backend/src/validators/project.validator.js`
- `backend/src/utils/slugify.js`
- `backend/src/utils/pagination.js`
- `app/dashboard/page.jsx` (create dialog)

**API:**

```
GET    /api/v1/projects              → List (paginated, filterable)
POST   /api/v1/projects              → Create (with optional roles)
GET    /api/v1/projects/:id          → Detail (by ID or slug)
PATCH  /api/v1/projects/:id          → Update (owner only)
DELETE /api/v1/projects/:id          → Archive (owner only)
```

**List query parameters:**
- `page`, `limit` — Pagination
- `status` — Filter by status (draft, recruiting, active, completed, archived)
- `category` — Filter by category
- `search` — Text search across title, description, skills, tags
- `sort` — Sort field (default: `createdAt`)
- `limit` — Results per page (default: 20, max: 100)

**Slug generation:**
- Auto-generated from title on creation
- Slugified: lowercase, hyphens for spaces, remove special chars
- Ensured unique by appending `-2`, `-3`, etc. on collision

### 7.6 Project Roles & Applications

**Objective:** Allow project owners to define roles with skill requirements, and users to apply to open roles.

**Files created/updated:**
- `backend/src/models/ProjectRole.js`
- `backend/src/models/Application.js`
- `backend/src/models/ProjectMembership.js`
- `backend/src/repositories/role.repository.js`
- `backend/src/repositories/application.repository.js`
- `backend/src/repositories/membership.repository.js`
- `backend/src/services/role.service.js`
- `backend/src/services/application.service.js`
- `backend/src/services/membership.service.js`
- `backend/src/controllers/role.controller.js`
- `backend/src/controllers/application.controller.js`
- `backend/src/routes/role.routes.js`
- `backend/src/routes/application.routes.js`
- `backend/src/validators/application.validator.js`

**Application flow:**
1. User browses roles on a project detail page
2. Clicks "Apply" on an open role
3. Fills in message (10–2000 chars) and optional availability hours
4. Backend creates Application with status `pending`
5. Owner sees application in dashboard, can accept/reject
6. On accept: membership is created, role `slotsFilled` is incremented
7. On reject: status changes to `rejected`
8. Applicant can withdraw application

**Role management:**
- `slotsTotal` (1–50) and `slotsFilled` (auto-incremented on accept)
- Status auto-transitions to `filled` when `slotsFilled >= slotsTotal`
- Owner can manually close a role
- Role title is validated against the predefined 20 roles list

### 7.7 Project Detail Page (Public View)

**Objective:** A comprehensive public project page showing details, roles, team composition, and progress.

**File:** `app/projects/[id]/page.jsx`

**Sections:**
1. **Header:** Category badge, stage, commitment, status, title, description
2. **Action buttons:**
   - Owner → "Manage" link to dashboard
   - Member → "Team Dashboard" link
   - Non-member → Save/Apply buttons
3. **Open Roles:** Role cards with description, slots, skills, Apply button
4. **Filled Roles:** Grayed-out role cards
5. **Skills & Tags:** Pill displays
6. **Progress bar:** With next milestone
7. **Sidebar:** Location, commitment, team spots, posted date, owner info

**Apply Modal:** Inline modal on the same page — no navigation away from context.

### 7.8 Save/Unsave Projects

**Objective:** Allow users to bookmark projects for later reference.

**Files created:**
- `backend/src/models/SavedProject.js`
- `backend/src/repositories/savedProject.repository.js`
- `backend/src/services/savedProject.service.js`
- `backend/src/controllers/savedProject.controller.js`
- `backend/src/routes/savedProject.routes.js`

**API:**

```
POST   /api/v1/projects/:id/save     → Save project
DELETE /api/v1/projects/:id/save     → Unsave project
GET    /api/v1/saved-projects         → List saved projects (for dashboard)
```

**Implementation:**
- Unique compound index on `(userId, projectId)` prevents duplicates
- Toggle UX: clicking Save when already saved → unsaves
- Optimistic UI update: flips `isSaved` immediately, reverts on error

### 7.9 Dashboard

**Objective:** Central hub for users showing owned projects, joined projects, stats, and incoming applications.

**File:** `app/dashboard/page.jsx`

**Data loaded from `GET /api/v1/dashboard`:**
- **Stats:** Active projects, open roles, applications sent, incoming applications, memberships, unread notifications
- **Owned projects:** List with status, progress, links to manage dashboard
- **Joined projects:** List with role title, project details, links to member dashboard
- **Incoming applications:** For owners — applicant info, message, project/role context, accept/reject buttons
- **Activity feed:** Recent events across owned/joined projects

**Create Project dialog:** Inline modal with:
- Title, description, category (dropdown from metadata), stage, status, location
- Skills and tags as pill inputs (type + Enter to add, click to remove)
- Roles section: dynamic role cards with title (dropdown from 20 predefined), description, skills, slots
- `PillInput` component reused across dashboard, settings, and create forms

**Desktop layout:** Two-column — owned projects on left, joined on right.

### 7.10 Home Page with Project Teasers

**Objective:** A compelling landing page that showcases recruiting projects to drive engagement.

**File:** `app/page.jsx`

**Sections:**
1. **Hero:** Dark section with headline "Build What You Couldn't Alone", description, CTA buttons
2. **Featured projects:** Light section fetching `GET /api/v1/projects?limit=3&status=recruiting` — shows 3 project cards with open role tags
3. **How it works:** Three-step process section

**Data fetching:** Client-side `useEffect` on mount with error suppression (silent fail if API is down).

### 7.11 Contribute & Find Projects Pages

**Objective:** Project discovery pages.

**Files:**
- `app/contribute/page.jsx` — Categories grid + featured projects
- `app/find-projects/page.jsx` — Full searchable/filterable project list

**Contribute page:**
- 8 category cards from metadata API
- Featured projects section (reuses home page project card pattern)

**Find Projects page:**
- Search bar with text input
- Filters: category, status, stage, commitment level
- Paginated results with project cards
- Uses `toQueryString()` to build filter parameters

### 7.12 Leaderboard Page

**Objective:** Gamified leaderboard showing top contributors with period filtering.

**Files:**
- `backend/src/controllers/leaderboard.controller.js`
- `backend/src/routes/leaderboard.routes.js`
- `app/leaderboard/page.jsx`

**API:**

```
GET /api/v1/leaderboard?period=all|month|week
```

**Scoring logic:**
1. Fetches active users sorted by `reputationPoints` descending
2. Aggregates owned project counts from Project collection
3. Aggregates membership counts from ProjectMembership
4. For period filtering: counts distinct actors in ActivityEvent within the time window
5. Returns top 3 with badges ("Elite Contributor", "Top Mentor", "Project Leader", "Rising Star"), ranked 4–10, and platform stats

**Frontend:**
- Period filter buttons (All / This Month / This Week)
- Top 3 podium display with badges
- Ranked table (4–10) with points, projects, contributions
- Stats cards: active contributors, projects completed, team memberships, streak leaders
- Server-side computation via direct aggregation pipelines

### 7.13 Project Members & Activity Endpoints

**Objective:** Provide endpoints for viewing project team members and activity history.

**Files created/updated:**
- `backend/src/routes/activity.routes.js`
- `backend/src/controllers/activity.controller.js`
- `backend/src/services/activity.service.js`
- `backend/src/repositories/activity.repository.js`
- `backend/src/models/ActivityEvent.js`

**Endpoints added:**

```
GET /api/v1/activity/project/:projectId  → Project activity (members only)
GET /api/v1/projects/:id/members         → Team members (members only)
```

**Activity Event types:**
```
project_created, role_created, application_submitted,
application_accepted, application_rejected, application_withdrawn,
project_updated, member_joined, progress_updated
```

**Activity tracking:** The `activityService.record()` function is called from various service methods to log events automatically. Events are displayed in dashboard and project activity feeds.

**Membership listing:** Returns serialized members with user details (fullName, email, username, bio, skills) and role title. Accessible only by project members and owner.

### 7.14 Owner Management Dashboard

**Objective:** A comprehensive 8-tab management interface for project owners.

**File:** `app/projects/[id]/manage/page.jsx` (1914 lines)

This is the largest frontend file, containing all dashboard functionality.

**Tabs:**

| Tab | Features |
|-----|----------|
| **Overview** | 4 stat cards (team size, tasks, completed, team spots), progress bar, about section, recent activity, details sidebar |
| **Applications** | Pending/accepted/rejected lists with applicant info, accept/reject buttons, role context |
| **Team** | Grid of member cards with name, role, skills |
| **Roles** | Open/filled roles list with close-role action |
| **Tasks** | Filtered task list (All/To Do/In Progress/Needs Review/Done), QuickStatusDropdown, inline task creation, task detail modal with subtask tree |
| **Chat** | Placeholder |
| **AI Companion** | Placeholder |
| **Settings** | Full project editor: title, description, category, stage, status, location, commitment, skills (pill input), tags (pill input), progress, milestone |

**Components defined within the file:**

| Component | Purpose |
|-----------|---------|
| `PillInput` | Reusable tag/skill input — type text, press Enter to add, click to remove |
| `QuickStatusDropdown` | Inline `<select>` for changing task status from view mode without entering edit mode |
| `ReviewActions` | Approve/Request Changes buttons for tasks in Needs Review status |
| `TaskDetailModal` | Full task view/edit with status dropdown, subtask tree, review note display |
| `CreateTaskModal` | Create new tasks with assignment type toggle (assigned/open), assignee, priority, due date |
| `CreateRoleModal` | Create roles with title dropdown, description, skills, slots, workload |
| `OverviewTab` | Stats, progress, about, activity |
| `ApplicationsTab` | Applications list with accept/reject |
| `TeamTab` | Member grid |
| `RolesTab` | Role list with close action |
| `TasksTab` | Filtered task list |
| `SettingsForm` | Project settings editor |
| `PlaceholderTab` | Placeholder for Chat/AI tabs |

### 7.15 Member Dashboard

**Objective:** A 6-tab interface for team members to view their work and collaborate.

**File:** `app/projects/[id]/member/page.jsx` (624 lines)

**Tabs:**

| Tab | Features |
|-----|----------|
| **Overview** | Stats (team size, tasks, completed, team spots), progress bar, about section, activity |
| **My Work** | Tasks assigned to current user filtered from all project tasks, click to open detail modal |
| **Team** | Team member grid |
| **Tasks** | All project tasks with claim/open distinction |
| **Chat** | Placeholder |
| **AI Companion** | Placeholder |

**Task Detail Modal (member view):**
- Shows full task details (title, status, priority, description, assignee, due date, created by)
- "Mark as Done" button (sets status to `needs_review`) — only visible for assigned tasks
- "Need Help" button (placeholder — shows alert)
- Submitted confirmation message: "Task submitted for review. The project owner will review your work and mark it as complete."
- Shows review note if owner has sent feedback

**Task claiming:**
- Open tasks (assignmentType: "open") show a "Claim" button
- Claiming sets `assigneeId` to the current user
- Claimed tasks show the assignee name in the task list

### 7.16 Task Model & CRUD

**Objective:** Full task management system with assignment types, priorities, due dates, and progress recalculation.

**Files created/updated:**
- `backend/src/models/Task.js` — Task schema
- `backend/src/repositories/task.repository.js` — Data access layer
- `backend/src/services/task.service.js` — Business logic
- `backend/src/controllers/task.controller.js` — Request handlers
- `backend/src/routes/task.routes.js` — Route definitions
- `backend/src/validators/task.validator.js` — Input validation

**API:**

```
GET    /api/v1/tasks/:projectId           → List project tasks
POST   /api/v1/tasks/:projectId           → Create task (owner only)
GET    /api/v1/tasks/detail/:taskId       → Get single task
PATCH  /api/v1/tasks/:taskId              → Update task (owner: full, member: status only)
DELETE /api/v1/tasks/:taskId              → Delete task (owner only)
POST   /api/v1/tasks/:taskId/claim       → Claim open task (member)
GET    /api/v1/tasks/stats/:projectId     → Task statistics by status
```

**Task Schema:**

| Field | Type | Notes |
|-------|------|-------|
| `projectId` | ObjectId (ref: Project) | Required |
| `title` | String (2–200 chars) | Required |
| `description` | String (max 5000) | Optional |
| `assigneeId` | ObjectId (ref: User) | Nullable |
| `assignmentType` | "assigned" \| "open" | Default: "assigned" |
| `parentId` | ObjectId (ref: Task) | For subtask tree, nullable |
| `createdBy` | ObjectId (ref: User) | Required |
| `status` | enum (see below) | Default: "todo" |
| `reviewNote` | String (max 2000) | Owner feedback |
| `priority` | "low" \| "medium" \| "high" \| "urgent" | Default: "medium" |
| `dueDate` | Date | Optional |

**Status lifecycle:**
```
                  ┌──────────┐
                  │   todo   │
                  └────┬─────┘
                       │ (member claims open task)
                       ▼
              ┌────────────────┐
              │  in_progress   │
              └───────┬────────┘
                      │ (member clicks "Mark as Done")
                      ▼
             ┌─────────────────┐
             │  needs_review    │
             └──┬──────────┬───┘
                │          │
      (Approve) │          │ (Request Changes → creates subtask)
                ▼          │
         ┌────────┐        │
         │  done  │        │
         └────────┘        │
                     ┌─────┴──────┐
                     │  todo      │
                     │  (subtask) │
                     └────────────┘

  cancelled ←────────── (any status)
```

**Permission model for task updates:**
- **Owner:** Can update all fields (title, description, status, priority, assignee, assignmentType, dueDate, reviewNote)
- **Assigned Member:** Can only update `status` field (e.g., to `needs_review`)
- **Other members:** Access denied (403)
- **Non-members:** Access denied (403)

### 7.17 Task Status Workflow & Review System

**Objective:** Enable a review workflow where members submit work for review, and owners approve or send feedback.

**Status added:** `needs_review` to the task model's status enum.

**Member flow:**
1. Member works on a task (status: `todo` or `in_progress`)
2. Clicks "Mark as Done" in their task detail modal
3. API call: `PATCH /tasks/:taskId { status: "needs_review" }`
4. Task shows amber "Needs Review" badge

**Owner flow:**
1. Sees "Needs Review" filter tab in Tasks tab — shows all tasks awaiting review
2. Opens task detail modal — sees `ReviewActions` component with:
   - **Approve button:** `PATCH /tasks/:taskId { status: "done" }` — marks task complete
   - **Request Changes button:** Opens textarea for feedback
3. After writing feedback → **Send Feedback & Set Back to To Do** button
4. This creates a new subtask (see 7.18)

**Frontend status display:**
- `task.status === "in_progress" ? "In Progress" : task.status === "needs_review" ? "Needs Review" : titleCase(task.status)`
- Status colors: todo=gray, in_progress=dark, needs_review=amber, done=black, cancelled=light

### 7.18 Task Subtrees (Parent/Child Task Tree)

**Objective:** When an owner sends a task back with feedback, instead of just reverting the status, create a subtask that preserves context and enables iterative work cycles.

**Backend changes:**

**Task Model** — added `parentId`:
```js
parentId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Task",
  default: null,
}
```

**Task Repository** — added `findByParent`:
```js
async function findByParent(parentId) {
  return Task.find({ parentId })
    .populate("assigneeId", "fullName email username")
    .populate("createdBy", "fullName")
    .sort({ createdAt: -1 })
}
```

**Task Service** — `sendFeedback` function:
```js
async function sendFeedback(taskId, userId, feedback) {
  const task = await taskRepository.findById(taskId)
  // ... ownership check, status check (must be "needs_review")

  const child = await taskRepository.create({
    projectId: task.projectId,
    parentId: task._id,           // Link to parent
    createdBy: userId,
    title: task.title,            // Inherits title
    description: `**Feedback from review:**\n${feedback}\n\n---\n**Original description:**\n${task.description}`,
    assigneeId: task.assigneeId,  // Same assignee
    assignmentType: "assigned",
    status: "todo",
    priority: task.priority,
    dueDate: task.dueDate,
    reviewNote: feedback,
  })

  await taskRepository.updateById(taskId, { status: "done" })  // Close parent
  await recalcProgress(task.projectId)

  return { parent: serializeTask(updatedParent), child: serializeTask(child) }
}
```

**API:**

```
POST  /tasks/:taskId/feedback  { feedback: "..." }  → { parent, child }
GET   /tasks/:taskId/subtasks                        → [subtask, ...]
```

**Frontend changes:**

**ReviewActions** updated to call the feedback endpoint:
```js
const payload = await apiFetch(`/api/v1/tasks/${taskId}/feedback`, {
  method: "POST",
  body: JSON.stringify({ feedback: feedback.trim() }),
})
const { parent, child } = payload.data
onUpdate(parent)            // Updates parent task in state
onChildCreated(child)       // Adds child to task list
```

**TaskDetailModal** updated to fetch and display subtasks:
```js
// On mount (when task.id changes):
apiFetch(`/api/v1/tasks/${task.id}/subtasks`)
  .then((res) => setSubtasks(res.data.subtasks || []))

// Rendered at bottom of modal:
{subtasks.map((sub) => (
  <div key={sub.id} className="border border-[#d9d8d2] bg-white p-3">
    <div className="flex items-center gap-2">
      <span className="size-2 shrink-0 rounded-full ..." />
      <span className="font-black text-sm">{sub.title}</span>
      <span className="px-2 py-0.5 text-xs font-black ...">{sub.status}</span>
    </div>
    <p className="mt-1 text-xs font-semibold text-[#77766f]">
      Assigned to {sub.assignee?.fullName}
    </p>
  </div>
))}
```

**Data flow:**

```
Owner feedback on task ABC-123
  │
  ├── Task ABC-123 → status: "done" (parent)
  │     └── reviewNote: "Please fix the validation logic"
  │
  └── Task ABC-123-2 → status: "todo" (child, parentId: ABC-123)
        ├── title: "Fix validation logic" (inherited from parent)
        ├── description: "**Feedback from review:**\nPlease fix...\n\n---\n**Original:**\nImplement input..."
        ├── assignee: same member
        └── reviewNote: "Please fix the validation logic"
```

This creates a tree structure visible in the task detail modal's "Subtasks" section. The member sees the new task in their "My Work" tab with the feedback in the description.

**Validator** — `feedbackSchema`:
```js
const feedbackSchema = z.object({
  body: z.object({
    feedback: z.string().trim().min(1).max(2000),
  }),
  params: z.object({ taskId: z.string().min(1) }),
  query: z.object({}).optional(),
})
```

### 7.19 Seed Script

**Objective:** Populate the database with realistic sample data for development and testing.

**File:** `backend/scripts/seed.js`

**Commands:**
```bash
npm run seed          # Adds data without clearing (safe to run multiple times)
npm run seed:force    # Drops all collections first, then seeds
```

**Data created:**
1. **6 users** with varying skills, locations, experience levels
2. **8 projects** across different categories and stages
3. **22 roles** distributed across projects (2–3 per project)
4. **10 sample applications** with mixed statuses (pending/accepted/rejected)
5. **6 saved projects** for various users
6. **6 welcome notifications** (one per user)
7. **2 contact submissions**
8. **Activity events** for project creation and applications

**Notable:**
- Uses `bcrypt.hash()` with salt rounds 10 (faster than production 12 for seeding)
- Clears ALL collections when `--force` flag is used
- Skips creating applications where applicant would be the project owner
- Passwords consistent: all users `password123`, admin `admin123`

---

## 8. API Reference

### 8.1 Authentication Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | No | Create account |
| POST | `/api/v1/auth/login` | No | Sign in |
| POST | `/api/v1/auth/refresh` | Cookie | Refresh access token |
| POST | `/api/v1/auth/logout` | Cookie | Sign out (revoke refresh token) |
| GET | `/api/v1/auth/me` | JWT | Get current user |

**Register request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

**Register response (201):**
```json
{
  "success": true,
  "message": "Account created",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": "...", "email": "...", "fullName": "...", ... }
  }
}
```

### 8.2 User Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/users/me` | JWT | Get profile |
| PATCH | `/api/v1/users/me` | JWT | Update profile |

**Update profile request:**
```json
{
  "fullName": "John Updated",
  "bio": "Full-stack developer",
  "skills": ["React", "Node.js"],
  "location": "San Francisco, CA",
  "socialLinks": {
    "github": "https://github.com/john",
    "linkedin": "https://linkedin.com/in/john"
  }
}
```

### 8.3 Project Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/projects` | Optional | List projects (paginated, filterable) |
| POST | `/api/v1/projects` | JWT | Create project |
| GET | `/api/v1/projects/:id` | Optional | Get project detail (by ID or slug) |
| PATCH | `/api/v1/projects/:id` | JWT | Update project (owner) |
| DELETE | `/api/v1/projects/:id` | JWT | Archive project (owner) |
| GET | `/api/v1/projects/:id/members` | JWT | List members |
| POST | `/api/v1/projects/:id/save` | JWT | Save project |
| DELETE | `/api/v1/projects/:id/save` | JWT | Unsave project |
| POST | `/api/v1/projects/:projectId/roles` | JWT | Create role |
| GET | `/api/v1/projects/:projectId/applications` | JWT | List applications (owner) |

**List query params:** `page`, `limit`, `status`, `category`, `search`, `sort`

**Create project request:**
```json
{
  "title": "My Awesome Project",
  "description": "A project that does amazing things...",
  "category": "Technology",
  "stage": "idea",
  "status": "recruiting",
  "skills": ["React", "Python"],
  "tags": ["open-source"],
  "roles": [
    {
      "title": "Frontend Developer",
      "description": "Build the React UI",
      "requiredSkills": ["React"],
      "slotsTotal": 2
    }
  ]
}
```

### 8.4 Task Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/tasks/:projectId` | JWT | List project tasks |
| POST | `/api/v1/tasks/:projectId` | JWT | Create task (owner) |
| GET | `/api/v1/tasks/detail/:taskId` | JWT | Get task detail |
| PATCH | `/api/v1/tasks/:taskId` | JWT | Update task |
| DELETE | `/api/v1/tasks/:taskId` | JWT | Delete task (owner) |
| POST | `/api/v1/tasks/:taskId/claim` | JWT | Claim open task |
| POST | `/api/v1/tasks/:taskId/feedback` | JWT | Send feedback (owner) |
| GET | `/api/v1/tasks/:taskId/subtasks` | JWT | List subtasks |
| GET | `/api/v1/tasks/stats/:projectId` | JWT | Task statistics |

**Create task:**
```json
{
  "title": "Implement login page",
  "description": "Create the login UI with email/password fields",
  "assigneeId": "user_id_here",
  "assignmentType": "assigned",
  "priority": "high",
  "dueDate": "2026-08-01"
}
```

**Send feedback:**
```json
{
  "feedback": "Please fix the validation logic on the email field"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback sent",
  "data": {
    "parent": { "id": "...", "status": "done", ... },
    "child": { "id": "...", "status": "todo", "parentId": "...", ... }
  }
}
```

### 8.5 Role & Application Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PATCH | `/api/v1/roles/:roleId` | JWT | Update role (owner) |
| DELETE | `/api/v1/roles/:roleId` | JWT | Close role (owner) |
| POST | `/api/v1/roles/:roleId/applications` | JWT | Apply to role |
| GET | `/api/v1/applications/me` | JWT | List my applications |
| PATCH | `/api/v1/applications/:id` | JWT | Update application (withdraw/accept/reject) |

### 8.6 Dashboard & Activity Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/dashboard` | JWT | Full dashboard data |
| GET | `/api/v1/activity` | JWT | My activity feed |
| GET | `/api/v1/activity/project/:projectId` | JWT | Project activity |

### 8.7 Other Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/metadata` | No | Categories & roles |
| GET | `/api/v1/leaderboard` | No | Leaderboard (`?period=all\|month\|week`) |
| GET | `/api/v1/notifications` | JWT | List notifications |
| PATCH | `/api/v1/notifications/:id/read` | JWT | Mark notification read |
| PATCH | `/api/v1/notifications/read-all` | JWT | Mark all read |
| POST | `/api/v1/contact` | No | Submit contact form |
| GET | `/api/v1/saved-projects` | JWT | List saved projects |

---

## 9. Database Schema Reference

### Users Collection

```
{
  _id: ObjectId,
  email: String (unique, lowercase, trimmed),
  passwordHash: String (select: false),
  fullName: String (2-80 chars),
  username: String (sparse unique, lowercase, 3-30 chars),
  bio: String (max 500, default: ""),
  skills: [String] (default: []),
  interests: [String] (default: []),
  location: String (max 120, default: ""),
  availabilityHoursPerWeek: Number (0-80, default: 0),
  experienceLevel: String (enum: beginner|intermediate|advanced|expert, default: "beginner"),
  role: String (enum: user|moderator|admin, default: "user"),
  emailVerified: Boolean (default: false),
  status: String (enum: active|pending|suspended|deleted, default: "active"),
  reputationPoints: Number (min: 0, default: 0),
  socialLinks: {
    github: String (default: ""),
    twitter: String (default: ""),
    linkedin: String (default: ""),
    website: String (default: "")
  },
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Projects Collection

```
{
  _id: ObjectId,
  ownerId: ObjectId (ref: User, indexed),
  title: String (3-120 chars, required),
  slug: String (unique, lowercase),
  description: String (20-2000 chars, required),
  category: String (required, from CATEGORIES),
  stage: String (enum: idea|research|prototype|mvp|active|completed|paused),
  commitmentHoursPerWeek: Number (0-80, default: 0),
  commitmentLabel: String (max 80, default: ""),
  locationType: String (enum: remote|hybrid|onsite, default: "remote"),
  location: String (max 120, default: "Remote"),
  status: String (enum: draft|recruiting|active|completed|archived),
  visibility: String (enum: public|private|unlisted, default: "public"),
  skills: [String] (indexed),
  tags: [String],
  teamSizeTarget: Number (1-100, default: 1),
  progressPercent: Number (0-100, default: 0),
  nextMilestone: String (max 200, default: ""),
  publishedAt: Date (default: now),
  createdAt: Date,
  updatedAt: Date
}
```

### Tasks Collection

```
{
  _id: ObjectId,
  projectId: ObjectId (ref: Project, required),
  title: String (2-200 chars, required),
  description: String (max 5000, default: ""),
  assigneeId: ObjectId (ref: User, nullable),
  assignmentType: String (enum: assigned|open, default: "assigned"),
  parentId: ObjectId (ref: Task, nullable),
  createdBy: ObjectId (ref: User, required),
  status: String (enum: todo|in_progress|needs_review|done|cancelled, default: "todo"),
  reviewNote: String (max 2000, default: ""),
  priority: String (enum: low|medium|high|urgent, default: "medium"),
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### ProjectRoles Collection

```
{
  _id: ObjectId,
  projectId: ObjectId (ref: Project, required, indexed),
  title: String (2-80 chars, from ROLES list),
  description: String (max 1000, default: ""),
  requiredSkills: [String] (indexed),
  preferredSkills: [String],
  slotsTotal: Number (1-50, default: 1),
  slotsFilled: Number (min: 0, default: 0),
  status: String (enum: open|filled|closed, default: "open"),
  workloadHoursPerWeek: Number (0-80, default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Applications Collection

```
{
  _id: ObjectId,
  projectId: ObjectId (ref: Project, required),
  roleId: ObjectId (ref: ProjectRole, required),
  applicantId: ObjectId (ref: User, required),
  message: String (10-2000 chars, required),
  availabilityHoursPerWeek: Number (0-80, default: 0),
  status: String (enum: pending|accepted|rejected|withdrawn, default: "pending"),
  reviewedBy: ObjectId (ref: User),
  reviewedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### ProjectMemberships Collection

```
{
  _id: ObjectId,
  projectId: ObjectId (ref: Project, required),
  userId: ObjectId (ref: User, required),
  roleId: ObjectId (ref: ProjectRole),
  roleTitle: String (max 80, default: ""),
  permissions: [String] (enum: view|comment|manage_roles|manage_applications|manage_project),
  status: String (enum: active|left|removed, default: "active"),
  joinedAt: Date (default: now),
  createdAt: Date,
  updatedAt: Date
}
```

### ActivityEvents Collection

```
{
  _id: ObjectId,
  actorId: ObjectId (ref: User),
  projectId: ObjectId (ref: Project, indexed),
  targetUserId: ObjectId (ref: User),
  type: String (enum: 9 activity types),
  metadata: Mixed (default: {}),
  createdAt: Date,
  updatedAt: Date
}
```

### Notifications Collection

```
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  type: String (max 80, required),
  title: String (max 160, required),
  body: String (max 500, default: ""),
  entityType: String (max 80, default: ""),
  entityId: ObjectId,
  readAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### RefreshTokens Collection

```
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  tokenHash: String (unique, required),
  expiresAt: Date (required, TTL index),
  revokedAt: Date,
  userAgent: String (default: ""),
  ipAddress: String (default: ""),
  createdAt: Date,
  updatedAt: Date
}
```

### SavedProjects Collection

```
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  projectId: ObjectId (ref: Project, required),
  createdAt: Date,
  updatedAt: Date
}
```

### ContactSubmissions Collection

```
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  firstName: String (max 80, required),
  lastName: String (max 80, required),
  email: String (lowercase, max 254, required),
  subject: String (max 150, required),
  message: String (10-5000 chars, required),
  status: String (enum: new|reviewed|closed|spam, default: "new"),
  ipAddress: String (default: ""),
  userAgent: String (default: ""),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 10. Testing

### Backend Tests

Test files are in `backend/tests/`:

- `health.test.js` — Basic health endpoint test
- `routes.test.js` — API route tests (using supertest)

**Run tests:**
```bash
cd backend && npm test
```

**Test setup:**
- Uses Jest with `--runInBand` for sequential execution
- Tests use the Express app without starting the server (supertest)
- Currently tests are minimal — expansion planned

### Frontend Build

```bash
npm run build
```

Builds with Next.js — compiles all pages, generates static pages where possible. The build output lists all routes and their rendering strategy (static vs dynamic).

---

## 11. Common Errors & Troubleshooting

### Backend

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid environment configuration` | Missing or invalid env vars | Check `.env` file has all required fields per `env.js` schema |
| `MongooseError: The `uri` parameter to `openUri()` must be a string` | `MONGODB_URI` not set | Check `.env` file |
| `MongoServerError: E11000 duplicate key error` | Unique index violation | Collection has existing data; run `npm run seed:force` to reset |
| `Validation failed: status: Invalid enum value` | Zod validation rejects value | Check allowed enum values in the validator file; update if new values were added |
| `TypeError: Cannot read properties of undefined (reading '_id')` | Mongoose document not populated | Ensure `.populate()` is called on the query; check field name matches schema |
| `jwt malformed` | Invalid Authorization header | Ensure format is `Bearer <token>` with no extra spaces |
| `TokenExpiredError` | Access token expired | Auto-refresh should handle this; check refresh token cookie is present |

### Frontend

| Error | Cause | Solution |
|-------|-------|----------|
| `TypeError: Cannot read properties of null (reading 'map')` | Component renders before data loads | Add null/undefined checks or conditional rendering |
| `Request failed with status 401` | Missing or expired token | Check `apiFetch` auto-refresh logic; verify localStorage has token |
| `Access denied` (403) | User lacks permissions | Verify user is project owner/member for the resource |
| `CORS error` in console | Backend not running or wrong origin | Ensure backend is on port 5050 and `CORS_ORIGIN` includes `http://localhost:3000` |
| White screen / nothing renders | JavaScript error in component | Check browser console; try `npm run build` to catch compilation errors |

### Common Gotchas

1. **Assigning tasks fails with "Only the assigned member can update this task"**  
   *Fix:* The `assigneeId` is a populated Mongoose object, not a plain string. Always use `String(task.assigneeId._id || task.assigneeId)` when comparing.

2. **New status values not accepted**  
   *Fix:* Update both the Mongoose schema enum AND the Zod validator enum (two separate validation layers).

3. **Progress not updating**  
   *Fix:* The `recalcProgress` function is called after task create/update/delete. It caps at 90% unless project status is "completed". Check project status.

4. **Database connection fails on seed**  
   *Fix:* MongoDB Atlas free tier may have IP whitelist restrictions. Add your current IP in Atlas Network Access.

---

## 12. Best Practices & Conventions

### Code Style
- **No comments** in code (as per project convention)
- **Semicolons** required
- **Single quotes** for strings
- **2-space indentation**
- **Arrow functions** for async handlers and callbacks
- **PascalCase** for component names and model names
- **camelCase** for variables, functions, methods
- **kebab-case** for filenames (e.g., `task.service.js`, `auth.middleware.js`)

### Backend Conventions
- Every layer (controller → service → repository) has a single responsibility
- Services throw `ApiError` — never pass error objects to controllers
- Serialization functions transform Mongoose documents to plain objects
- `asyncHandler` wraps all Express handlers to catch async errors
- `findByIdAndUpdate` with `{ new: true, runValidators: true }` for safe updates
- Cross-service dependencies use `require()` at call site (not top-level)
- Environment variables validated at startup with Zod, never at runtime

### Frontend Conventions
- All pages use `"use client"` directive (no server components)
- Data fetching via `apiFetch()` with error handling
- `useEffect` for initial data loading, `useCallback` for stable function references
- Optimistic UI updates for save/unsave toggles
- Conditional rendering for loading/error/empty states
- CSS via Tailwind utility classes only (no CSS modules or styled-components)
- Hardcoded design tokens (hex colors) — not yet centralized in Tailwind config

### Security Practices
- Passwords hashed with bcrypt (12 salt rounds)
- JWT access tokens short-lived (15 min)
- Refresh tokens rotated on each use
- Refresh tokens stored as SHA-256 hash
- Tokens never exposed in URLs or logs
- httpOnly + signed cookies for refresh tokens
- Mongoose `select: false` for `passwordHash`
- `express-mongo-sanitize` prevents NoSQL injection
- Helmet sets security headers
- CORS whitelist restricts origins
- Rate limiting on auth endpoints
- Input validation at API boundary (Zod)
- Mongoose schema validation as second layer

---

## 13. Future Improvements

### Technical Debt
- [ ] **Centralize design tokens** into Tailwind CSS `theme.extend` or CSS custom properties — currently hardcoded as arbitrary values (`bg-[#f7f7f3]`)
- [ ] **Extract inline components** from manage page (1914 lines) into separate files per tab
- [ ] **Add TypeScript** — currently all JSX files use `jsconfig.json` with type checking disabled
- [ ] **Write comprehensive tests** for services and API endpoints
- [ ] **Add API documentation** with OpenAPI/Swagger

### Feature Pipeline
- [ ] **Real-time collaboration** via WebSockets (Socket.io or WebRTC)
- [ ] **AI companion** (Groq-powered) for project suggestions and code review
- [ ] **In-app messaging** between team members
- [ ] **File uploads** for task attachments and project assets
- [ ] **Email notifications** via Resend (API key already in env config)
- [ ] **Admin dashboard** for user management and moderation
- [ ] **OAuth authentication** (Google, GitHub)
- [ ] **Tutorial/CMS system** with rich content
- [ ] **Leaderboard automation** (reputation points calculation)
- [ ] **Redis caching** for frequently accessed data
- [ ] **Sentry error tracking** (DSN already in env config)
- [ ] **Docker setup** for reproducible development environments

### Architecture Improvements
- [ ] Separate monorepo into `frontend/` and `backend/` directories with independent configs
- [ ] Add CI/CD pipeline (GitHub Actions for lint + test + build)
- [ ] Implement database migrations (MongoDB-migrate or custom)
- [ ] Add request validation error formatting (field-level error messages for the frontend)
- [ ] Implement soft deletes across all models
- [ ] Add pagination metadata to all list endpoints consistently
- [ ] Create API versioning strategy (v1 → v2 upgrade path)

---

*This document is maintained as the authoritative source of truth for the GroupHub platform architecture. All developers should update it when making significant changes to the system.*

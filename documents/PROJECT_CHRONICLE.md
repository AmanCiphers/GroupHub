# GroupHub — Project Chronicle

> **Complete development log from day one**  
> **Period:** Project inception → July 18, 2026  
> **Stack:** Next.js 16 + Express.js + MongoDB (Mongoose)

---

## Table of Contents

1. [Project Initialization & Monorepo Setup](#chapter-1)
2. [Express Server + MongoDB Connection](#chapter-2)
3. [User Model & Authentication System](#chapter-3)
4. [JWT Middleware & Refresh Token Rotation](#chapter-4)
5. [User Profiles & Account Page](#chapter-5)
6. [Predefined Metadata (Categories & Roles)](#chapter-6)
7. [Project CRUD & Slug Generation](#chapter-7)
8. [Project Roles & Applications](#chapter-8)
9. [Public Project Detail Page](#chapter-9)
10. [Save/Unsave Projects](#chapter-10)
11. [Dashboard (Owned & Joined Projects)](#chapter-11)
12. [Home Page Teasers & Contribute Page](#chapter-12)
13. [Leaderboard with Period Filtering](#chapter-13)
14. [Activity Events & Project Members Endpoints](#chapter-14)
15. [Owner Management Dashboard (8 Tabs)](#chapter-15)
16. [Member Dashboard (6 Tabs)](#chapter-16)
17. [Task Model, CRUD & Claiming](#chapter-17)
18. [Seed Script](#chapter-18)
19. [Needs Review Status & Review Workflow](#chapter-19)
20. [Subtask Tree (Parent/Child)](#chapter-20)

---

## Chapter 1 — Project Initialization & Monorepo Setup

### Objective

Set up a monorepo containing a Next.js 16 frontend (App Router) and an Express.js backend, sharing a single Git repository. Establish the foundational configuration for both services.

### Technologies Used

- **Runtime:** Node.js >= 20
- **Frontend:** Next.js 16, React 19, Tailwind CSS v4, Lucide React icons
- **Backend:** Express.js 4, Mongoose 8, Zod 3, bcryptjs, jsonwebtoken
- **Tooling:** npm, nodemon, git

### Project Structure Created

```
grouphub/
├── .env                          # Shared env vars (both services read this)
├── .gitignore
├── package.json                  # Frontend dependencies
├── next.config.mjs               # Next.js config (TS errors ignored, images unoptimized)
├── postcss.config.mjs            # Tailwind v4 PostCSS config
├── jsconfig.json                 # Path alias: @/ → ./
├── app/                          # Next.js App Router pages
│   ├── layout.jsx
│   ├── globals.css
│   └── page.jsx
├── lib/
│   ├── api.js                    # API client (initially empty, built up later)
│   └── utils.jsx
├── components/
│   ├── navbar.jsx
│   └── footer.jsx
├── public/                       # Static assets
├── backend/
│   ├── package.json              # Backend dependencies
│   ├── src/
│   │   ├── server.js
│   │   ├── app.js
│   │   ├── config/
│   │   │   ├── env.js
│   │   │   ├── db.js
│   │   │   ├── cors.js
│   │   │   └── metadata.js
│   │   ├── models/               # 11 Mongoose models
│   │   ├── repositories/         # 11 data access layers
│   │   ├── services/             # 13 business logic services
│   │   ├── controllers/          # 14 request handlers
│   │   ├── routes/               # 13 route files
│   │   ├── middlewares/          # Auth, validation, error, etc.
│   │   ├── validators/           # 7 Zod schema files
│   │   └── utils/                # ApiError, logger, crypto, etc.
│   ├── scripts/
│   │   └── seed.js
│   └── tests/
```

### Configuration Files

**Root `package.json` scripts:**
```json
{
  "scripts": {
    "dev": "next dev --webpack",
    "build": "next build",
    "start": "next start"
  }
}
```

**`next.config.mjs`:**
```js
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
}
```

**`jsconfig.json`:**
```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./*"] }
  }
}
```

**`postcss.config.mjs`** — Tailwind v4:
```js
const config = {
  plugins: { '@tailwindcss/postcss': {} },
}
```

**Backend `package.json` dependencies:**
```json
{
  "dependencies": {
    "express": "^4.21.2",
    "mongoose": "^8.9.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.24.1",
    "cors": "^2.8.5",
    "helmet": "^8.0.0",
    "compression": "^1.7.4",
    "cookie-parser": "^1.4.6",
    "dotenv": "^16.4.7",
    "morgan": "^1.10.0",
    "pino": "^9.6.0",
    "express-mongo-sanitize": "^2.2.0",
    "express-rate-limit": "^7.5.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.9",
    "pino-pretty": "^13.0.0",
    "jest": "^29.7.0",
    "supertest": "^7.0.0"
  }
}
```

### Commands Executed

```bash
# Create project directory
mkdir grouphub && cd grouphub

# Initialize frontend (Next.js)
npx create-next-app@latest . --app --js --tailwind --eslint
# Selected: No TypeScript, No src/ directory, App Router, Tailwind CSS

# Install frontend dependencies
npm install lucide-react @vercel/analytics

# Set up backend directory
mkdir -p backend/src/{config,models,repositories,services,controllers,routes,middlewares,validators,utils}
mkdir -p backend/scripts backend/tests
cd backend && npm init -y
npm install express mongoose bcryptjs jsonwebtoken zod cors helmet compression cookie-parser dotenv morgan pino express-mongo-sanitize express-rate-limit
npm install -D nodemon pino-pretty jest supertest
cd ..

# Initialize Git
git init
echo ".env\nnode_modules/\n.next/\n.DS_Store" > .gitignore
git add . && git commit -m "Initial commit: Next.js 16 + Express monorepo setup"
```

### Key Decisions

- **Monorepo approach:** Both services in one repo for simplicity during early development. The backend has its own `package.json` and `node_modules`.
- **No TypeScript:** The project uses `.js` and `.jsx` files with `jsconfig.json` for path aliases. TypeScript checking is explicitly disabled.
- **Tailwind v4:** Uses the new `@tailwindcss/postcss` plugin instead of the traditional `tailwind.config.js`.
- **Root `.env`:** Both services read from the same `.env` file at the repository root. The backend's `env.js` loads it with `dotenv` and additionally checks `backend/.env` for overrides.

---

## Chapter 2 — Express Server & MongoDB Connection

### Objective

Create a production-ready Express server with MongoDB connectivity, graceful shutdown, security headers, CORS, request logging, and request ID tracing.

### Files Created

| File | Purpose |
|------|---------|
| `backend/src/server.js` | Entry point: bootstrap + graceful shutdown |
| `backend/src/app.js` | Express app assembly with middleware stack |
| `backend/src/config/env.js` | Environment variable validation (Zod) |
| `backend/src/config/db.js` | MongoDB connection/disconnection |
| `backend/src/config/cors.js` | CORS with origin whitelist |
| `backend/src/middlewares/error.middleware.js` | Global error handler |
| `backend/src/middlewares/requestId.middleware.js` | UUID per request |
| `backend/src/utils/ApiError.js` | Custom error class |
| `backend/src/utils/ApiResponse.js` | Standardized response format |
| `backend/src/utils/asyncHandler.js` | Async error wrapper |
| `backend/src/utils/logger.js` | Pino logger |

### Implementation Details

**Environment Validation** (`env.js`):

Uses Zod to validate ALL environment variables at startup. If any required variable is missing, the server prints a detailed error message and exits — preventing runtime surprises.

```js
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  APP_SECRET: z.string().min(16),
  MONGODB_URI: z.string().min(1),
  MONGODB_DB_NAME: z.string().min(1).default("grouphub"),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  // ... optional: EMAIL_FROM, RESEND_API_SECRET, GROQ_API_KEY, etc.
})
```

**Database Connection** (`db.js`):

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

**Express Middleware Stack** (`app.js`):

Applied in this order for maximum safety and performance:

```js
1. requestIdMiddleware      → req.id = UUID
2. helmet()                → Security headers
3. corsMiddleware          → CORS whitelist
4. compression()           → gzip response
5. express.json(1mb)       → Body parser
6. express.urlencoded(1mb)
7. cookieParser(secret)    → Signed cookies
8. mongoSanitize()         → NoSQL injection prevention
9. morgan (dev)            → HTTP logging via pino
```

**Graceful Shutdown** (`server.js`):

```js
async function shutdown(signal) {
  logger.info(`${signal} received, shutting down`)
  server.close(async () => {
    await disconnectDatabase()
    process.exit(0)
  })
}

process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT", () => shutdown("SIGINT"))
```

**Error Handler** (`error.middleware.js`):

```js
function errorMiddleware(error, req, res, _next) {
  // Handle MongoDB duplicate key (code 11000) → 409
  if (error.code === 11000) { ... }

  const statusCode = error.statusCode || 500
  res.status(statusCode).json({
    success: false,
    message: isServerError ? "Internal server error" : error.message,
    requestId: req.id,
    details: (dev mode) ? error.details : undefined,
  })
}
```

- Mongoose duplicate key errors (E11000) are caught and converted to 409 with a readable field name
- 500 errors hide details in production mode
- Every error response includes the `requestId` for tracing

### Environment Variables Required

```
PORT=5050
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net
MONGODB_DB_NAME=grouphub
APP_SECRET=<random 32+ chars>
CORS_ORIGIN=http://localhost:3000
```

### Errors Encountered & Resolved

| Error | Cause | Fix |
|-------|-------|-----|
| `MongooseError: The uri parameter to openUri() must be a string` | `MONGODB_URI` not set in `.env` | Added the Atlas connection string |
| `MongoServerSelectionError: Could not connect to any servers` | Atlas IP whitelist | Added current IP in Atlas Network Access |
| Pino transport import failed | Missing `pino-pretty` | Install as dev dependency |

---

## Chapter 3 — User Model & Authentication System

### Objective

Implement email/password authentication with register, login, logout, and token refresh flows.

### Files Created

| File | Purpose |
|------|---------|
| `backend/src/models/User.js` | User schema with password hashing |
| `backend/src/models/RefreshToken.js` | Refresh token storage with TTL index |
| `backend/src/repositories/user.repository.js` | User data access layer |
| `backend/src/repositories/refreshToken.repository.js` | Refresh token data access |
| `backend/src/services/auth.service.js` | Register, login, refresh, logout logic |
| `backend/src/services/token.service.js` | JWT signing, cookie management |
| `backend/src/controllers/auth.controller.js` | Auth request handlers |
| `backend/src/routes/auth.routes.js` | Auth route definitions |
| `backend/src/validators/auth.validator.js` | Auth input validation |
| `backend/src/middlewares/auth.middleware.js` | JWT verification middleware |
| `backend/src/middlewares/rateLimit.middleware.js` | Brute force protection |
| `backend/src/utils/crypto.js` | SHA-256, opaque token generation |

### User Model

```js
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  username: { type: String, unique: true, sparse: true, lowercase: true, minlength: 3, maxlength: 30 },
  bio: { type: String, trim: true, maxlength: 500, default: "" },
  skills: { type: [String], default: [] },
  interests: { type: [String], default: [] },
  location: { type: String, trim: true, maxlength: 120, default: "" },
  availabilityHoursPerWeek: { type: Number, min: 0, max: 80, default: 0 },
  experienceLevel: { type: String, enum: ["beginner", "intermediate", "advanced", "expert"], default: "beginner" },
  role: { type: String, enum: ["user", "moderator", "admin"], default: "user" },
  emailVerified: { type: Boolean, default: false },
  status: { type: String, enum: ["active", "pending", "suspended", "deleted"], default: "active" },
  reputationPoints: { type: Number, min: 0, default: 0 },
  socialLinks: {
    type: { github: String, twitter: String, linkedin: String, website: String },
    default: {},
  },
  lastLoginAt: Date,
}, { timestamps: true })

userSchema.index({ fullName: "text", username: "text", skills: "text" })
```

**Key design decisions:**
- `passwordHash` has `select: false` — excluded from all queries by default. Must explicitly use `.select("+passwordHash")` to include it.
- `username` has `sparse: true` — allows multiple null values (optional field) while enforcing uniqueness for non-null values.
- Text index on name, username, and skills enables full-text search for user discovery.
- `socialLinks` uses Mongoose `type: {}` syntax (inherits the nested schema shape).

### Registration Flow

```
Client → POST /api/v1/auth/register { email, password, fullName }
  │
  ├── 1. Zod validates input (email format, password >= 8 chars, fullName 2-80 chars)
  ├── 2. Normalize email (lowercase + trim)
  ├── 3. Check existing user by email → 409 if exists
  ├── 4. Hash password with bcrypt (12 rounds)
  ├── 5. Create User document
  ├── 6. Sign access JWT (sub: user.id, exp: 15m)
  ├── 7. Generate opaque refresh token (48 random bytes, base64url)
  ├── 8. SHA-256 hash the refresh token, store in RefreshToken collection
  ├── 9. Set refresh token as httpOnly signed cookie (Path: /api/v1/auth)
  └── 10. Return { accessToken, user } in response body
```

### Login Flow

Same as register but:
- Finds user by email WITH password hash: `userRepository.findByEmail(email, { includePassword: true })`
- Verifies password: `bcrypt.compare(password, user.passwordHash)`
- Updates `lastLoginAt` timestamp
- Returns 401 for wrong credentials (doesn't reveal whether email exists)
- Returns 403 for inactive accounts

### Refresh Token Rotation

```
Client → POST /api/v1/auth/refresh (cookie: refreshToken)
  │
  ├── 1. Read signed cookie `refreshToken`
  ├── 2. SHA-256 hash the raw token
  ├── 3. Find active token by hash (not revoked, not expired)
  ├── 4. Revoke current token (set revokedAt)
  ├── 5. Verify user exists and is active
  ├── 6. Issue new access token
  ├── 7. Issue new refresh token (stores hash, sets cookie)
  └── 8. Return { accessToken, user }
```

### Refresh Token Schema

```js
const refreshTokenSchema = new mongoose.Schema({
  userId: { type: ObjectId, ref: "User", required: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },  // TTL index
  revokedAt: Date,
  userAgent: { type: String, default: "" },
  ipAddress: { type: String, default: "" },
}, { timestamps: true })
```

**TTL index:** MongoDB automatically deletes documents when `expiresAt` passes. The `{ expires: 0 }` option tells MongoDB to use the field itself as the expiry time (0 seconds after the date).

### Rate Limiting

Auth endpoints use `express-rate-limit`:
- Window: 15 minutes
- Max: 20 requests per window
- Prevents brute force attacks on login/register

### API Endpoints Created

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | No | Create account |
| POST | `/api/v1/auth/login` | No | Sign in |
| POST | `/api/v1/auth/refresh` | Cookie | Refresh tokens |
| POST | `/api/v1/auth/logout` | Cookie | Revoke refresh token |
| GET | `/api/v1/auth/me` | JWT | Get current user (via authService.toPublicUser) |

### toPublicUser

A helper that strips sensitive fields before sending user data to the client:

```js
function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    username: user.username || null,
    bio: user.bio,
    skills: user.skills,
    interests: user.interests,
    location: user.location,
    availabilityHoursPerWeek: user.availabilityHoursPerWeek,
    experienceLevel: user.experienceLevel,
    socialLinks: user.socialLinks || {},
    role: user.role,
    emailVerified: user.emailVerified,
    status: user.status,
    reputationPoints: user.reputationPoints,
    createdAt: user.createdAt,
  }
}
```

No sensitive data (passwordHash, tokenHash, etc.) is ever exposed.

### Errors Encountered

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot set headers after they are sent to the client` | Async handler wasn't catching promise rejections | Created `asyncHandler` wrapper |
| `passwordHash is not selectable` at login | Forgot to add `.select("+passwordHash")` in the repository | Added `includePassword` option to `findByEmail` |
| Refresh cookie not sent | Cookie path was `/` instead of `/api/v1/auth` | Scoped cookie to refresh endpoint path |

---

## Chapter 4 — JWT Middleware & Refresh Token Rotation

### Objective

Create reusable middleware for protecting routes with JWT verification, supporting both required and optional authentication.

### Auth Middleware

**Required auth** — applied to all routes that need a logged-in user:

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

**Flow:**
1. Extract `Bearer <token>` from `Authorization` header
2. If no token → 401
3. Verify JWT with secret → catches expired/invalid tokens with 401
4. Look up full user document by `payload.sub` (JWT subject = user ID)
5. Check user account is active
6. Attach user document to `req.user` for downstream handlers

**Optional auth** — for public endpoints that benefit from knowing the user:

```js
const optionalAuthMiddleware = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || ""
  const [, token] = header.split(" ")
  if (!token) { next(); return }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET)
    const user = await userRepository.findById(payload.sub)
    if (user && user.status === "active") req.user = user
  } catch { /* ignore invalid tokens */ }

  next()
})
```

**Flow:**
1. Try to extract and verify JWT (same as authMiddleware)
2. If no token → silently continue with `req.user = undefined`
3. If token is invalid/expired → silently continue (no error thrown)
4. If valid → attach user

Used by: `GET /api/v1/projects`, `GET /api/v1/projects/:id` — so the service can add `isOwner`/`isMember` flags when the visitor is authenticated.

### Refresh Token Rotation — In Detail

The rotation scheme is designed to minimize the window of vulnerability if a refresh token is stolen:

1. **Each refresh token can be used exactly once.** After use, it's revoked (marked with `revokedAt`).
2. **A new refresh token is issued with every refresh.** This means even if an old token is stolen, using it authorizes only one refresh, after which the attacker's new token and the legitimate user's next token are both valid.
3. **SHA-256 hashing** means the database never stores raw tokens. A breach doesn't expose usable tokens.
4. **TTL index** (`expiresAt`) auto-deletes expired tokens, preventing database bloat.

```js
// Token generation
const token = crypto.randomBytes(48).toString("base64url")  // 64 chars
const tokenHash = sha256(token)

// Token verification
const tokenHash = sha256(signedCookie)
const record = await RefreshToken.findOne({
  tokenHash,
  revokedAt: null,
  expiresAt: { $gt: new Date() },
})
```

### Cookie Configuration

```js
res.cookie("refreshToken", token, {
  httpOnly: true,           // Not accessible via JavaScript
  signed: true,             // Tamper-proof (signed with APP_SECRET)
  secure: production,       // HTTPS only in production
  sameSite: production ? "strict" : "lax",
  expires: expiresAt,
  path: "/api/v1/auth",     // Only sent on auth API calls
})
```

### How Frontend Uses This

The API client (`lib/api.js`) handles the entire refresh cycle transparently:

```js
export async function apiFetch(path, options = {}) {
  // 1. Attach Bearer token from localStorage
  // 2. Make request
  // 3. If 401 AND we had a token:
  //    a. POST /auth/refresh (cookie is sent automatically with credentials: "include")
  //    b. Store new access token in localStorage
  //    c. Retry original request with new token
  // 4. Return parsed response
}
```

The user never sees a login prompt during normal token rotation.

---

## Chapter 5 — User Profiles & Account Page

### Objective

Allow authenticated users to view and edit their full profile, including social links.

### Files Created

| File | Purpose |
|------|---------|
| `backend/src/services/user.service.js` | Profile update logic |
| `backend/src/controllers/user.controller.js` | Request handlers |
| `backend/src/routes/user.routes.js` | Route definitions |
| `backend/src/validators/user.validator.js` | Input validation |
| `app/account/page.jsx` | Frontend profile editor |

### API

```
GET  /api/v1/users/me   → Current user profile
PATCH /api/v1/users/me  → Update profile fields
```

### Profile Fields

| Field | Type | Validation |
|-------|------|------------|
| `fullName` | String | 2-80 chars, trimmed |
| `username` | String | 3-30 chars, lowercase alphanumeric + hyphens/underscores, unique |
| `bio` | String | Max 500 chars |
| `skills` | String[] | Max 20 items, max 80 chars each |
| `interests` | String[] | Max 20 items, max 80 chars each |
| `location` | String | Max 120 chars |
| `availabilityHoursPerWeek` | Number | 0-80 |
| `experienceLevel` | String | beginner, intermediate, advanced, expert |
| `socialLinks` | Object | `{ github?, twitter?, linkedin?, website? }` |

### Social Links Implementation

**Validator:**
```js
socialLinks: z.object({
  github: z.string().max(200).optional(),
  twitter: z.string().max(200).optional(),
  linkedin: z.string().max(200).optional(),
  website: z.string().max(200).optional(),
}).optional(),
```

**Model:**
```js
socialLinks: {
  type: {
    github: { type: String, trim: true, default: "" },
    twitter: { type: String, trim: true, default: "" },
    linkedin: { type: String, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },
  },
  default: {},
}
```

**`toPublicUser` includes `socialLinks`** — exposed to frontend for display.

### Frontend Account Page

The account page at `app/account/page.jsx` is a full profile editor with:
- Text inputs for name, username, location
- Textarea for bio
- Skill and interest pill inputs (same `PillInput` component reused in dashboard)
- Number input for availability hours
- Select dropdown for experience level
- Social link fields (GitHub, Twitter, LinkedIn, Website)
- Save button with loading state
- Error/success messages

### Implementation Details

The `user.service.js` builds an update object dynamically, only including fields that are present in the payload:

```js
async function updateUser(userId, payload) {
  const updates = {}
  if (payload.fullName !== undefined) updates.fullName = payload.fullName.trim()
  if (payload.username !== undefined) updates.username = payload.username?.trim().toLowerCase() || null
  if (payload.bio !== undefined) updates.bio = payload.bio.trim()
  if (payload.skills !== undefined) updates.skills = payload.skills
  if (payload.socialLinks !== undefined) updates.socialLinks = payload.socialLinks
  // ... etc for all fields

  const user = await userRepository.updateById(userId, updates)
  return authService.toPublicUser(user)
}
```

This pattern prevents clearing fields that weren't intentionally set.

### Errors Encountered

| Error | Cause | Fix |
|-------|-------|-----|
| Username `E11000` when multiple users have null | `unique: true` without `sparse: true` | Added `sparse: true` to username index |
| Social links showing `[object Object]` | Mongoose schema syntax was `type: Map` instead of nested object | Used `type: { github: ..., twitter: ..., ... }` with explicit field types |

---

## Chapter 6 — Predefined Metadata (Categories & Roles)

### Objective

Define a fixed set of 8 project categories and 20 team roles, exposed via an API endpoint and enforced in backend validation.

### Files Created

| File | Purpose |
|------|---------|
| `backend/src/config/metadata.js` | Category and role constants |
| `backend/src/controllers/metadata.controller.js` | Metadata endpoint handler |
| `backend/src/routes/metadata.routes.js` | Route definition |

### Categories

```js
const CATEGORIES = [
  { value: "Technology", label: "Technology" },
  { value: "Design", label: "Design" },
  { value: "Business", label: "Business" },
  { value: "Marketing", label: "Marketing" },
  { value: "Gaming", label: "Gaming" },
  { value: "Social Impact", label: "Social Impact" },
  { value: "Education", label: "Education" },
  { value: "Health & Wellness", label: "Health & Wellness" },
]
```

### Roles (20 predefined)

```js
const ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Mobile Developer", "DevOps Engineer", "UI/UX Designer",
  "Product Designer", "Graphic Designer", "Product Manager",
  "Project Manager", "Data Scientist", "Data Analyst",
  "Machine Learning Engineer", "QA Engineer", "Technical Writer",
  "Content Writer", "Marketing Specialist", "Social Media Manager",
  "Community Manager", "Business Developer",
]
```

### API

```
GET /api/v1/metadata → { categories: [...], roles: [...] }
```

### Validation Enforcement

Both `project.validator.js` and `application.validator.js` validate against these arrays:

```js
// Project validator — category must be in CATEGORY_VALUES
category: z.enum(CATEGORY_VALUES)

// Role validator — title must be in ROLES
title: z.enum(ROLES)
```

This ensures data consistency — no project can have a misspelled or ad-hoc category, and no role can be created outside the predefined list.

### Why Predefined?

- **Consistency:** Search and filter work reliably when values are controlled
- **UX:** Dropdown selects instead of free-text inputs — faster, no typos
- **Reporting:** Aggregation by category is deterministic
- **Future-proofing:** The list can be extended (e.g., via admin panel) without breaking existing data

---

## Chapter 7 — Project CRUD & Slug Generation

### Objective

Full project CRUD with slug-based URLs, text search, paginated listing, and filters.

### Files Created

| File | Purpose |
|------|---------|
| `backend/src/models/Project.js` | Project schema |
| `backend/src/repositories/project.repository.js` | Project data access |
| `backend/src/services/project.service.js` | Project business logic |
| `backend/src/controllers/project.controller.js` | Request handlers |
| `backend/src/routes/project.routes.js` | Route definitions |
| `backend/src/validators/project.validator.js` | Input validation |
| `backend/src/utils/slugify.js` | Slug generation |
| `backend/src/utils/pagination.js` | Pagination helpers |
| `backend/src/utils/normalize.js` | String normalization |

### Project Schema

```js
const projectSchema = new mongoose.Schema({
  ownerId: { type: ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true, minlength: 20, maxlength: 2000 },
  category: { type: String, required: true, from: CATEGORIES },
  stage: { enum: ["idea", "research", "prototype", "mvp", "active", "completed", "paused"] },
  status: { enum: ["draft", "recruiting", "active", "completed", "archived"] },
  visibility: { enum: ["public", "private", "unlisted"], default: "public" },
  skills: [String],
  tags: [String],
  progressPercent: { type: Number, min: 0, max: 100, default: 0 },
  nextMilestone: { type: String, maxlength: 200 },
  // ... commitment, location, teamSizeTarget, etc.
}, { timestamps: true })
```

### Indexes

```js
// Full-text search index
projectSchema.index({ title: "text", description: "text", skills: "text", tags: "text", category: "text" })

// Common query pattern: list public projects by status/category
projectSchema.index({ status: 1, visibility: 1, category: 1, createdAt: -1 })
```

### Slug Generation

```js
async function uniqueSlug(title) {
  const base = slugify(title)  // "My Cool Project" → "my-cool-project"
  let slug = base
  let suffix = 2

  while (await projectRepository.findByIdOrSlug(slug)) {
    slug = `${base}-${suffix}`  // "my-cool-project-2", "my-cool-project-3", ...
    suffix += 1
  }

  return slug
}
```

The `slugify` utility:
```js
function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")  // Replace special chars with hyphens
    .replace(/^-+|-+$/g, "")       // Remove leading/trailing hyphens
}
```

Projects can be fetched by either ID (`/projects/abc123`) or slug (`/projects/my-cool-project`).

### API Endpoints

```
GET    /api/v1/projects                → List (paginated, filterable)
POST   /api/v1/projects                → Create (with optional roles array)
GET    /api/v1/projects/:id            → Detail (by ID or slug)
PATCH  /api/v1/projects/:id            → Update (owner only)
DELETE /api/v1/projects/:id            → Archive (owner only)
```

### List Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 20, max: 100) |
| `status` | string | Filter: recruiting, active, completed, etc. |
| `category` | string | Filter: Technology, Design, etc. |
| `search` | string | Full-text search across title, description, skills, tags |
| `sort` | string | Sort field (default: createdAt) |

### Create Project with Roles

The `createProject` service accepts an optional `roles` array and creates roles atomically:

```js
async function createProject(ownerId, payload) {
  // 1. Create project document
  const project = await projectRepository.create({
    ...normalizedPayload,
    ownerId,
    slug: await uniqueSlug(normalizedPayload.title),
  })

  // 2. Create roles (if provided)
  if (payload.roles?.length) {
    const roles = await roleRepository.createMany(
      payload.roles.map(r => ({ projectId: project._id, ...normalizeRole(r) }))
    )
  }

  // 3. Create owner membership
  await membershipRepository.create({
    projectId: project._id,
    userId: ownerId,
    roleTitle: "Owner",
    permissions: ["view", "comment", "manage_roles", "manage_applications", "manage_project"],
  })

  // 4. Record activity
  await activityService.record({ ... })

  return serializeProject(project, roles)
}
```

### Serialization

Projects are serialized with `roles` array and `isSaved` flag:

```js
function serializeProject(project, roles = [], savedIds = []) {
  return {
    id: String(project._id),
    title: project.title,
    slug: project.slug,
    // ... all fields
    roles: roles.map(serializeRole),  // Each role has slotsOpen, status, etc.
    isSaved: savedIds.includes(projectId),
    isOwner: ...,
    isMember: ...,
  }
}
```

### Errors Encountered

| Error | Cause | Fix |
|-------|-------|-----|
| Slug collision on "Untitled Project" | Multiple projects with same title | Added suffix counter loop |
| `CastToObjectId failed for value "my-project"` | `findById` was called with a slug | Changed to `findByIdOrSlug` that checks both |
| Category validation error | Category wasn't in CATEGORIES array | Frontend was sending free-text; switched to dropdown |
| Role title not in ROLES | Same issue — free text input | Added Zod enum validation + dropdown on frontend |

---

## Chapter 8 — Project Roles & Applications

### Objective

Allow project owners to define roles with skill requirements and slot counts. Allow users to apply for roles. Owners can accept/reject applications, which auto-creates memberships.

### Files Created

| File | Purpose |
|------|---------|
| `backend/src/models/ProjectRole.js` | Role schema with slots, skills |
| `backend/src/models/Application.js` | Application schema with status |
| `backend/src/models/ProjectMembership.js` | Membership schema with permissions |
| `backend/src/repositories/role.repository.js` | Role data access |
| `backend/src/repositories/application.repository.js` | Application data access |
| `backend/src/repositories/membership.repository.js` | Membership data access |
| `backend/src/services/role.service.js` | Role CRUD logic |
| `backend/src/services/application.service.js` | Application workflow logic |
| `backend/src/services/membership.service.js` | Membership queries |
| `backend/src/controllers/role.controller.js` | Role request handlers |
| `backend/src/controllers/application.controller.js` | Application request handlers |
| `backend/src/routes/role.routes.js` | Role route definitions |
| `backend/src/routes/application.routes.js` | Application route definitions |
| `backend/src/validators/application.validator.js` | Application validation |

### ProjectRole Schema

```js
const projectRoleSchema = new mongoose.Schema({
  projectId: { type: ObjectId, ref: "Project", required: true, index: true },
  title: { type: String, required: true, from: ROLES },
  description: { type: String, maxlength: 1000, default: "" },
  requiredSkills: { type: [String], default: [], index: true },
  preferredSkills: { type: [String], default: [] },
  slotsTotal: { type: Number, min: 1, max: 50, default: 1 },
  slotsFilled: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ["open", "filled", "closed"], default: "open" },
  workloadHoursPerWeek: { type: Number, min: 0, max: 80, default: 0 },
}, { timestamps: true })

projectRoleSchema.index({ projectId: 1, status: 1 })
```

### Application Schema

```js
const applicationSchema = new mongoose.Schema({
  projectId: { type: ObjectId, ref: "Project", required: true },
  roleId: { type: ObjectId, ref: "ProjectRole", required: true },
  applicantId: { type: ObjectId, ref: "User", required: true },
  message: { type: String, required: true, minlength: 10, maxlength: 2000 },
  availabilityHoursPerWeek: { type: Number, min: 0, max: 80 },
  status: { type: String, enum: ["pending", "accepted", "rejected", "withdrawn"], default: "pending" },
  reviewedBy: { type: ObjectId, ref: "User" },
  reviewedAt: Date,
}, { timestamps: true })

applicationSchema.index({ roleId: 1, applicantId: 1 }, { unique: true })  // One application per role per user
applicationSchema.index({ projectId: 1, status: 1 })
```

### ProjectMembership Schema

```js
const permissionValues = ["view", "comment", "manage_roles", "manage_applications", "manage_project"]

const projectMembershipSchema = new mongoose.Schema({
  projectId: { type: ObjectId, ref: "Project", required: true },
  userId: { type: ObjectId, ref: "User", required: true },
  roleId: { type: ObjectId, ref: "ProjectRole" },
  roleTitle: { type: String, maxlength: 80 },
  permissions: { type: [String], enum: permissionValues, default: ["view", "comment"] },
  status: { type: String, enum: ["active", "left", "removed"], default: "active" },
  joinedAt: { type: Date, default: Date.now },
}, { timestamps: true })

projectMembershipSchema.index({ projectId: 1, userId: 1 }, { unique: true })
```

### Application Workflow

```
User applies → Application created (status: "pending")
  │
  ├── Owner accepts → status: "accepted"
  │     ├── role.slotsFilled += 1
  │     ├── if slotsFilled >= slotsTotal → role.status = "filled"
  │     └── membership created with role title + permissions
  │
  ├── Owner rejects → status: "rejected"
  │     └── no other side effects
  │
  └── Applicant withdraws → status: "withdrawn"
```

### API Endpoints

```
POST   /api/v1/roles/:roleId/applications     → Apply to role
GET    /api/v1/applications/me                 → My applications
PATCH  /api/v1/applications/:id               → Update status (withdraw/accept/reject)
POST   /api/v1/projects/:projectId/roles       → Create role (owner)
PATCH  /api/v1/roles/:roleId                   → Update role (owner)
DELETE /api/v1/roles/:roleId                   → Close role (owner)
GET    /api/v1/projects/:projectId/applications → List project applications (owner)
```

### Validation Rules

```js
// Apply to role
const applyToRoleSchema = z.object({
  body: z.object({
    message: z.string().trim().min(10).max(2000),
    availabilityHoursPerWeek: z.coerce.number().min(0).max(80).optional(),
  }),
  params: z.object({ roleId: z.string().min(1) }),
})

// Update application status
const updateApplicationSchema = z.object({
  body: z.object({
    status: z.enum(["accepted", "rejected", "withdrawn"]),
  }),
  params: z.object({ id: z.string().min(1) }),
})
```

### Duplicate Protection

The unique compound index on `(roleId, applicantId)` prevents a user from applying to the same role twice. The service catches the E11000 error and returns a 409.

### Role Serialization

Roles include a computed `slotsOpen` field:
```js
slotsOpen: Math.max(role.slotsTotal - role.slotsFilled, 0)
```

This is derived, not stored — always up to date via the arithmetic.

---

## Chapter 9 — Public Project Detail Page

### Objective

Create a comprehensive public project page that shows all project information, roles, and enables apply/save actions.

### Files Created

`app/projects/[id]/page.jsx` — Public project detail page

### Page Sections

**Header:**
- Category badge, stage badge, commitment badge, status badge
- Project title (large, black weight)
- Description
- Owner → "Manage" button / Member → "Team Dashboard" / Visitor → Save + Apply buttons

**Main Content:**
- Open Roles section — role cards with title, description, slots, skills, Apply button
- Filled Roles section — grayed-out role cards
- Skills & Expertise — pill display
- Tags — #tag display
- Progress bar with next milestone

**Sidebar:**
- Location + type
- Commitment
- Team spots (filled/total)
- Posted date
- Owner info
- "Interested?" callout card

**Apply Modal (inline):**
- Opens when user clicks "Apply" on a role
- Textarea for cover message (10-2000 chars)
- Optional availability hours input
- Submit + Cancel buttons
- Validation error display

### Data Loading

```js
const loadProject = useCallback(async () => {
  const payload = await apiFetch(`/api/v1/projects/${id}`)
  setProject(payload.data.project)
}, [id])
```

The endpoint (`GET /api/v1/projects/:id`) returns:
- Full project details with serialized roles
- `isOwner` / `isMember` flags (based on authenticated user via optionalAuthMiddleware)
- `isSaved` flag (if user is authenticated)

### State Handling

All states are covered:
- **Loading:** Shows "Loading project..." text
- **Error:** Shows error message + "Back to projects" link
- **404:** "Project not found"
- **Empty roles:** "No roles listed yet" placeholder
- **Success:** Full page render

### Optimistic Save

The save toggle updates UI immediately, reverting on API error:

```js
const toggleSave = async () => {
  const wasSaved = project.isSaved
  setProject(prev => ({ ...prev, isSaved: !wasSaved }))  // Optimistic
  try {
    await apiFetch(`/api/v1/projects/${project.id}/save`, {
      method: wasSaved ? "DELETE" : "POST",
    })
  } catch {
    setProject(prev => ({ ...prev, isSaved: wasSaved }))  // Revert on error
  }
}
```

---

## Chapter 10 — Save/Unsave Projects

### Objective

Allow users to bookmark projects for later reference on their dashboard.

### Files Created

| File | Purpose |
|------|---------|
| `backend/src/models/SavedProject.js` | Simple bookmark schema |
| `backend/src/repositories/savedProject.repository.js` | Data access |
| `backend/src/services/savedProject.service.js` | Business logic |
| `backend/src/controllers/savedProject.controller.js` | Request handlers |
| `backend/src/routes/savedProject.routes.js` | Route definitions |

### Schema

```js
const savedProjectSchema = new mongoose.Schema({
  userId: { type: ObjectId, ref: "User", required: true },
  projectId: { type: ObjectId, ref: "Project", required: true },
}, { timestamps: true })

savedProjectSchema.index({ userId: 1, projectId: 1 }, { unique: true })
```

### API

```
POST   /api/v1/projects/:id/save    → Save project
DELETE /api/v1/projects/:id/save    → Unsave project
GET    /api/v1/saved-projects        → List saved projects
```

### Implementation

The `savedProject.service.js` handles the toggle:

```js
async function saveProject(userId, projectId) {
  await SavedProject.create({ userId, projectId })
  return { saved: true }
}

async function unsaveProject(userId, projectId) {
  await SavedProject.deleteOne({ userId, projectId })
  return { saved: false }
}
```

The `findIdsByUser` function returns an array of project IDs for quick `isSaved` checks:

```js
async function findIdsByUser(userId) {
  const saved = await SavedProject.find({ userId }).select("projectId").lean()
  return saved.map(s => String(s.projectId))
}
```

This is used in `project.service.js` when serializing project lists — avoiding N+1 queries.

---

## Chapter 11 — Dashboard (Owned & Joined Projects)

### Objective

Central hub showing the user's stats, owned projects, joined projects, incoming applications, and recent activity.

### Files Created

| File | Purpose |
|------|---------|
| `backend/src/services/dashboard.service.js` | Aggregates all dashboard data |
| `backend/src/controllers/dashboard.controller.js` | Request handler |
| `backend/src/routes/dashboard.routes.js` | Route definition |
| `app/dashboard/page.jsx` | Frontend dashboard page |

### API

```
GET /api/v1/dashboard → Full dashboard payload
```

### Dashboard Data Payload

```js
{
  stats: {
    activeProjects,        // Owned projects with status != archived
    openRoles,             // Open roles across owned projects
    applications,          // Applications sent by user
    incomingApplications,  // Applications received on owned projects
    memberships,           // Joined teams (non-owner memberships)
    unreadNotifications,   // Count of unread notifications
  },
  ownedProjects: [        // User's created projects
    { id, title, slug, status, progressPercent, nextMilestone, updatedAt }
  ],
  memberships: [          // Teams the user joined
    { id, roleTitle, joinedAt, project: { id, title, slug, category, status, progressPercent, nextMilestone } }
  ],
  incomingApplications: [ // Applications on owned projects (for owners)
    { id, message, status, createdAt, applicant: { name, email, skills }, role: { title }, project: { title } }
  ],
  activity: [             // Recent activity feed
    { id, type, projectId, metadata, createdAt }
  ],
}
```

### Create Project Dialog

The dashboard includes an inline "Create Project" modal with:

- **Title, Description, Category** (dropdown from 8 categories)
- **Stage, Status, Location, Location Type**
- **Skills** (pill input — type + Enter to add, click X to remove)
- **Tags** (pill input)
- **Roles section:** Dynamic role cards — each has:
  - Title (dropdown from 20 predefined roles)
  - Description
  - Required/Preferred skills (pill inputs)
  - Slot count
  - Workload hours
  - Add/Remove role buttons

The `PillInput` component is defined locally:

```jsx
function PillInput({ values, onChange, placeholder }) {
  const [input, setInput] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)

  const addValue = (value) => {
    const trimmed = value.trim()
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed])
    }
    setInput("")
  }

  return (
    <div className="...">
      <div className="flex flex-wrap gap-2">
        {values.map(v => (
          <span key={v} className="...">
            {v}
            <button onClick={() => onChange(values.filter(x => x !== v))}>
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addValue(input) } }}
        placeholder={placeholder} />
    </div>
  )
}
```

### Desktop Layout

Two-column layout:
- **Left:** Owned projects list + create button
- **Right:** Joined projects list

Both columns show stat cards at the top.

---

## Chapter 12 — Home Page Teasers & Contribute Page

### Objective

A compelling landing page and a category-based project discovery page.

### Files

| File | Purpose |
|------|---------|
| `app/page.jsx` | Home page with hero + featured projects |
| `app/contribute/page.jsx` | Categories grid + featured projects |
| `app/find-projects/page.jsx` | Searchable project list |

### Home Page

Sections:
1. **Hero:** Dark section (`bg-[#2f2f2d]`) with headline "Build What You Couldn't Alone", two CTAs: "Get Started" → `/dashboard`, "Browse projects" → `/find-projects`
2. **Featured projects:** Light section fetching `GET /api/v1/projects?limit=3&status=recruiting` — shows 3 project cards with open role tags
3. **How it works:** Three-step process with icons

Data fetching pattern:
```js
useEffect(() => {
  apiFetch("/api/v1/projects?limit=3&status=recruiting")
    .then(payload => setProjects(payload.data.projects || []))
    .catch(() => {})  // Silently fail — home page works even if API is down
}, [])
```

### Contribute Page

- **8 category cards** fetched from `GET /api/v1/metadata` — each card links to `/find-projects?category=X`
- **Featured projects** section (reuses the same 3-project layout)

### Find Projects Page

Full search/filter experience:
- **Search bar:** Text input for keyword search
- **Category filter** (dropdown)
- **Status filter** (dropdown)
- **Stage filter** (dropdown)
- **Commitment filter** (dropdown)
- **Results grid:** Project cards with title, description, category, role count
- **Pagination:** Page navigation

Uses `toQueryString()` from `lib/api.js`:
```js
export function toQueryString(params) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "All") {
      query.set(key, value)
    }
  })
  const value = query.toString()
  return value ? `?${value}` : ""
}
```

---

## Chapter 13 — Leaderboard with Period Filtering

### Objective

Gamified leaderboard showing top contributors, with filtering by time period (all time / this month / this week).

### Files Created

| File | Purpose |
|------|---------|
| `backend/src/controllers/leaderboard.controller.js` | Full leaderboard logic (no service layer — direct queries) |
| `backend/src/routes/leaderboard.routes.js` | Route definition |
| `app/leaderboard/page.jsx` | Frontend leaderboard page |

### API

```
GET /api/v1/leaderboard?period=all|month|week
```

### Scoring Logic

The leaderboard controller does its work directly (no service layer) using MongoDB aggregation:

```js
async function getLeaderboardData(period) {
  let dateFilter = {}
  if (period === "month") {
    const start = new Date()
    start.setDate(1); start.setHours(0, 0, 0, 0)
    dateFilter = { createdAt: { $gte: start } }
  } else if (period === "week") {
    const start = new Date()
    start.setDate(start.getDate() - start.getDay())
    start.setHours(0, 0, 0, 0)
    dateFilter = { createdAt: { $gte: start } }
  }

  // 1. Fetch active users sorted by reputationPoints
  const users = await User.find({ status: "active" })
    .select("fullName username reputationPoints skills")
    .sort({ reputationPoints: -1 })
    .limit(50).lean()

  // 2. Aggregate owned project counts
  const ownedProjectCounts = await Project.aggregate([
    { $group: { _id: "$ownerId", count: { $sum: 1 } } },
  ])

  // 3. Aggregate membership counts
  const membershipCounts = await ProjectMembership.aggregate([
    { $group: { _id: "$userId", count: { $sum: 1 } } },
  ])

  // 4. Count distinct actors in ActivityEvent within period
  const recentActivityUsers = await ActivityEvent.aggregate([
    { $match: dateFilter },
    { $group: { _id: "$actorId" } },
  ])

  // 5. Combine into ranked list
  return users.map(user => ({
    id: user._id,
    fullName: user.fullName,
    points: user.reputationPoints || 0,
    projects: ownerMap[String(user._id)] || 0,
    contributions: membershipMap[String(user._id)] || 0,
    skills: user.skills || [],
    active: activeUserIds.has(String(user._id)),
  }))
}
```

### Response Format

```json
{
  "topThree": [
    { "fullName": "Alice Chen", "points": 150, "badge": "Elite Contributor", ... },
    { "fullName": "Bob Martinez", "points": 120, "badge": "Top Mentor", ... },
    { "fullName": "Carol Singh", "points": 100, "badge": "Project Leader", ... }
  ],
  "leaderboard": [
    { "rank": 4, "fullName": "David Kim", "points": 80, ... },
    // ... ranks 4-10
  ],
  "stats": [
    { "label": "Active contributors", "value": 6 },
    { "label": "Projects completed", "value": 0 },
    { "label": "Team memberships", "value": 10 },
    { "label": "Streak leaders", "value": 6 }
  ]
}
```

### Badges

The top 3 get badges (not stored — computed on the fly):
```js
const badges = ["Elite Contributor", "Top Mentor", "Project Leader", "Rising Star"]
return index < badges.length ? badges[index] : "Community Builder"
```

### Frontend

- **Period filter buttons:** All / This Month / This Week
- **Podium display:** Top 3 with badge labels
- **Ranked table:** Rows 4-10 with rank, name, points, projects, contributions, active indicator
- **Stats cards:** 4 platform statistics

---

## Chapter 14 — Activity Events & Project Members Endpoints

### Objective

Track project activity and expose team member lists.

### Files Created

| File | Purpose |
|------|---------|
| `backend/src/models/ActivityEvent.js` | Activity event schema |
| `backend/src/repositories/activity.repository.js` | Activity data access |
| `backend/src/services/activity.service.js` | Activity recording |
| `backend/src/controllers/activity.controller.js` | Activity request handlers |
| `backend/src/routes/activity.routes.js` | Activity route definitions |

### ActivityEvent Schema

```js
const activityEventSchema = new mongoose.Schema({
  actorId: { type: ObjectId, ref: "User" },
  projectId: { type: ObjectId, ref: "Project", index: true },
  targetUserId: { type: ObjectId, ref: "User", index: true },
  type: {
    type: String,
    required: true,
    enum: [
      "project_created", "role_created", "application_submitted",
      "application_accepted", "application_rejected", "application_withdrawn",
      "project_updated", "member_joined", "progress_updated",
    ],
  },
  metadata: { type: Mixed, default: {} },  // Flexible payload
}, { timestamps: true })

activityEventSchema.index({ projectId: 1, createdAt: -1 })
activityEventSchema.index({ targetUserId: 1, createdAt: -1 })
```

The `metadata` field uses Mongoose `Mixed` type — it accepts any JSON structure. This provides flexibility for different event types to carry different data (e.g., `{ title: "Project X" }` for creation, `{ roleTitle: "Frontend Developer" }` for applications).

### Activity Recording

```js
const activityService = {
  async record({ actorId, projectId, type, metadata }) {
    await ActivityEvent.create({ actorId, projectId, type, metadata: metadata || {} })
  },

  async listForUser(userId, limit = 20) {
    // Activity for user's owned projects + memberships
    const ownedProjects = await Project.find({ ownerId: userId }).select("_id")
    const memberships = await ProjectMembership.find({ userId, status: "active" }).select("projectId")

    const projectIds = [
      ...ownedProjects.map(p => p._id),
      ...memberships.filter(m => m.projectId).map(m => m.projectId),
    ]

    return ActivityEvent.find({ projectId: { $in: projectIds } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("actorId", "fullName")
      .lean()
  }
}
```

### API

```
GET /api/v1/activity                    → My activity feed (owned + joined projects)
GET /api/v1/activity/project/:projectId → Project activity (members only)
GET /api/v1/projects/:id/members        → Team members (members only)
```

### Members Endpoint

The `listProjectMembers` endpoint:
- Verifies the requester is the project owner OR a member
- Returns serialized members with user details
- Used by manage and member dashboards to populate team views

```js
async function listProjectMembers(projectId, userId) {
  const project = await projectRepository.findById(projectId)
  if (!project) throw new ApiError(404, "Project not found")

  const isOwner = String(project.ownerId) === String(userId)
  if (!isOwner && !(await isProjectMember(projectId, userId))) {
    throw new ApiError(403, "Only project members can view the team")
  }

  const members = await membershipRepository.findByProject(projectId)
  return members.map(serializeMembership)
}
```

---

## Chapter 15 — Owner Management Dashboard (8 Tabs)

### Objective

A comprehensive management interface for project owners with all project controls in one place.

### Files Created

`app/projects/[id]/manage/page.jsx` — 1,914 lines (largest file in the project)

### Tabs

| Tab | Component | Features |
|-----|-----------|----------|
| **Overview** | `OverviewTab` | 4 stat cards (team size, tasks, completed tasks, team spots), progress bar, about section, recent activity feed, details sidebar |
| **Applications** | `ApplicationsTab` | Filtered lists (pending/accepted/rejected), applicant cards with name, email, skills, message, accept/reject buttons |
| **Team** | `TeamTab` | Grid of member cards with avatar initials, name, role title, skills |
| **Roles** | `RolesTab` | Open/filled/closed roles with slot counts, close-role button per role |
| **Tasks** | `TasksTab` | Filtered task list (All/ToDo/InProgress/NeedsReview/Done), inline QuickStatusDropdown, create task button, task detail modal |
| **Chat** | `PlaceholderTab` | "Coming soon" placeholder |
| **AI Companion** | `PlaceholderTab` | "Coming soon" placeholder |
| **Settings** | `SettingsForm` | Full project editor (title, description, category, stage, status, location, commitment, skills, tags, progress, milestone) |

### Components Defined Inline

**PillInput:**
```jsx
function PillInput({ values, onChange, placeholder }) {
  const [input, setInput] = useState("")
  const addValue = (value) => {
    const trimmed = value.trim()
    if (trimmed && !values.includes(trimmed)) onChange([...values, trimmed])
    setInput("")
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {values.map(v => (
          <span key={v} className="bg-white border border-[#171717] px-3 py-1 text-sm font-black flex items-center gap-2">
            {v}
            <button onClick={() => onChange(values.filter(x => x !== v))}>
              <X className="size-3 cursor-pointer" />
            </button>
          </span>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addValue(input) } }}
        placeholder={placeholder} className="..." />
    </div>
  )
}
```

**CreateTaskModal:**
- Title input, description textarea, priority select, due date picker
- Assignment type toggle: "Assign to Member" / "Open to Anyone"
- Assignee dropdown (populated when Members tab has been loaded)
- Includes `needs_review` in status options

**CreateRoleModal:**
- Title dropdown (filtered from predefined 20 roles — excludes already-used titles)
- Description textarea
- Required skills (pill input)
- Preferred skills (pill input)
- Slots total, workload hours

### Data Loading Strategy

The dashboard loads data lazily — only when a tab is activated:

```js
useEffect(() => {
  if (activeTab === "tasks") loadTasks()
  if (activeTab === "team" || activeTab === "tasks") loadMembers()
  if (activeTab === "overview") loadActivity()
  // etc.
}, [activeTab])
```

This keeps initial page load fast and avoids fetching data for unused tabs.

### Task Tab Details

The Tasks tab includes:
- **Filter buttons:** All (X), To Do (X), In Progress (X), Needs Review (X), Done (X)
- **Task cards:** Status dot (color-coded), title, assignee name, priority badge, status badge, relative due date
- **Click to select:** Opens TaskDetailModal
- **QuickStatusDropdown:** Change status directly from the task card without entering the modal

---

## Chapter 16 — Member Dashboard (6 Tabs)

### Objective

A dashboard for team members to view their work, team, and tasks.

### Files Created

`app/projects/[id]/member/page.jsx` — 624 lines

### Tabs

| Tab | Component | Features |
|-----|-----------|----------|
| **Overview** | Inline | 4 stat cards (team size, tasks, completed tasks, team spots), progress bar, about section, recent activity, sidebar |
| **My Work** | Inline | Tasks filtered to current user's assigned tasks only, click to open detail modal |
| **Team** | Inline | Grid of member cards |
| **Tasks** | Inline | All project tasks with claim button for open/unassigned tasks |
| **Chat** | `PlaceholderTab` | "Coming soon" |
| **AI Companion** | `PlaceholderTab` | "Coming soon" |

### My Work Tab

Filters all project tasks by `assignee.id === myUserId`:

```jsx
{(() => {
  const myTasks = tasks.filter(t => t.assignee?.id === myUserId)
  return myTasks.length === 0 ? (
    <EmptyState icon={CheckCircle2} title="No tasks assigned to you" />
  ) : (
    <div className="grid gap-3">
      {myTasks.map(task => <TaskCard key={task.id} task={task} onClick={...} />)}
    </div>
  )
})()}
```

### Task Detail Modal (Member View)

- Title, status badge, priority badge, assignment type badge
- Description section
- Details grid: assigned to, due date, created date, created by
- **"Mark as Done" button** — sets status to `needs_review`
  - Only visible when task is assigned to the current user and not already done
  - On success: shows green confirmation message "Task submitted for review"
- **"Need Help" button** — currently shows alert placeholder
- Review note display — shows owner's feedback if present

### Open Task Claiming

Tasks with `assignmentType: "open"` and no assignee show a "Claim" button:

```jsx
{task.assignmentType === "open" && !task.assignee && (
  <button onClick={() => handleClaim(task.id)}
    className="h-10 px-4 border border-[#171717] font-black text-sm">
    Claim
  </button>
)}
```

Claiming calls `POST /api/v1/tasks/:taskId/claim` which sets `assigneeId` to the current user.

---

## Chapter 17 — Task Model, CRUD & Claiming

### Objective

Full task management system with assignment types, priorities, due dates, and progress recalculation.

### Files Created

| File | Purpose |
|------|---------|
| `backend/src/models/Task.js` | Task schema |
| `backend/src/repositories/task.repository.js` | Task data access |
| `backend/src/services/task.service.js` | Task business logic |
| `backend/src/controllers/task.controller.js` | Request handlers |
| `backend/src/routes/task.routes.js` | Route definitions |
| `backend/src/validators/task.validator.js` | Input validation |

### Task Schema (initial version)

```js
const taskSchema = new mongoose.Schema({
  projectId: { type: ObjectId, ref: "Project", required: true },
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 5000, default: "" },
  assigneeId: { type: ObjectId, ref: "User", default: null },
  assignmentType: { type: String, enum: ["assigned", "open"], default: "assigned" },
  createdBy: { type: ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["todo", "in_progress", "done", "cancelled"], default: "todo" },
  priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
  dueDate: Date,
}, { timestamps: true })

taskSchema.index({ projectId: 1, status: 1 })
taskSchema.index({ assigneeId: 1 })
```

### API Endpoints

```
GET    /api/v1/tasks/:projectId         → List tasks (members+)
POST   /api/v1/tasks/:projectId         → Create task (owner)
GET    /api/v1/tasks/detail/:taskId     → Get task detail
PATCH  /api/v1/tasks/:taskId            → Update task
DELETE /api/v1/tasks/:taskId            → Delete task (owner)
POST   /api/v1/tasks/:taskId/claim     → Claim open task (member)
GET    /api/v1/tasks/stats/:projectId   → Task statistics
```

### Progress Recalculation

Every task create/update/delete triggers progress recalculation:

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

**Key decisions:**
- Progress = `(completed tasks / total tasks) * 100`
- **Capped at 90%** — prevents showing 100% before the owner confirms completion
- 100% only when project status is manually set to "completed"
- If there are zero tasks, progress doesn't change

### Assignment Types

**"assigned":** An assignee is chosen during task creation. Only the assignee and owner can interact with it.

**"open":** No initial assignee. Any project member can claim it:

```js
async function claimTask(taskId, userId) {
  const task = await taskRepository.findById(taskId)
  if (task.assignmentType !== "open") throw new ApiError(400, "Only open tasks can be claimed")
  if (task.assigneeId) throw new ApiError(400, "Task is already claimed")

  const isMember = await membershipService.isProjectMember(task.projectId, userId)
  if (!isMember) throw new ApiError(403, "Only project members can claim tasks")

  const updated = await taskRepository.updateById(taskId, { assigneeId: userId })
  return serializeTask(updated)
}
```

### Task Update Permissions

- **Owner:** Can update ALL fields (title, description, status, priority, assignmentType, assigneeId, dueDate)
- **Assigned member:** Can ONLY update `status` field
- **Other members:** 403 Access denied

```js
if (isOwner) {
  // Full update — all fields
  const updates = {}
  if (payload.title !== undefined) updates.title = payload.title.trim()
  if (payload.status !== undefined) updates.status = payload.status
  if (payload.assigneeId !== undefined) updates.assigneeId = payload.assigneeId || null
  // ... etc
  const updated = await taskRepository.updateById(taskId, updates)
  await recalcProgress(updated.projectId)
  return serializeTask(updated)
}

// Member: status only
const allowedKeys = ["status"]
const keys = Object.keys(payload || {})
if (!keys.every(k => allowedKeys.includes(k)))
  throw new ApiError(403, "Members can only update task status")

const updated = await taskRepository.updateById(taskId, { status: payload.status })
```

### Task Stats

```js
async function getTaskStats(projectId, userId) {
  const [todo, inProgress, done, cancelled] = await Promise.all([
    taskRepository.countByProject(projectId, "todo"),
    taskRepository.countByProject(projectId, "in_progress"),
    taskRepository.countByProject(projectId, "done"),
    taskRepository.countByProject(projectId, "cancelled"),
  ])
  return { todo, inProgress, done, cancelled, total: todo + inProgress + done + cancelled }
}
```

### Errors Encountered

| Error | Cause | Fix |
|-------|-------|-----|
| `Only the assigned member can update this task` on valid member | `String(task.assigneeId)` returns `[object Object]` when populated | Fixed to `String(task.assigneeId._id \|\| task.assigneeId)` |
| `status: Invalid enum value` for `needs_review` | Zod validator didn't include `needs_review` | Added to both Mongoose and Zod enums |

---

## Chapter 18 — Seed Script

### Objective

Populate the database with realistic sample data for development and testing.

### Files Created

`backend/scripts/seed.js` — 280 lines

### Commands

```bash
cd backend
npm run seed          # Adds data without clearing (safe to repeat)
npm run seed:force    # Drops ALL collections first, then seeds
```

### Seeded Data

**6 Users:**

| Name | Email | Password | Skills |
|------|-------|----------|--------|
| Alice Chen | alice@example.com | password123 | React, Node.js, TypeScript, PostgreSQL |
| Bob Martinez | bob@example.com | password123 | Figma, UI/UX, Prototyping, Design Systems |
| Carol Singh | carol@example.com | password123 | Python, TensorFlow, Data Analysis, SQL |
| David Kim | david@example.com | password123 | SEO, Content Strategy, Analytics, Growth |
| Elena Garcia | elena@example.com | password123 | React Native, Swift, Flutter, Firebase |
| GroupHub Admin | admin@grouphub.com | admin123 | Management, Community, Strategy |

**8 Projects** with titles like "AI Study Companion", "Campus Event Map", "GreenTrack App", etc. Each project has:
- 2-3 roles with required skills and slot counts
- Realistic descriptions, categories, stages, and statuses
- Varying progress percentages (5%-55%)
- Commitment hours, location types

**22 ProjectRoles** across all projects.

**10 Sample Applications** — mixed statuses (pending/accepted/rejected). Accepted applications create memberships and increment role slots.

**6 Saved Projects** — bookmarks for various users.

**8 Activity Events** — project creation events.

**6 Notifications** — welcome messages for each user.

**2 Contact Submissions** — sample inquiries.

### Implementation Details

```js
async function seed() {
  await connectDatabase()

  if (FORCE) {
    // Drop ALL collections
    await Promise.all([
      User.deleteMany({}), Project.deleteMany({}), ProjectRole.deleteMany({}),
      Application.deleteMany({}), ProjectMembership.deleteMany({}),
      SavedProject.deleteMany({}), ActivityEvent.deleteMany({}),
      Notification.deleteMany({}), ContactSubmission.deleteMany({}),
      RefreshToken.deleteMany({}),
    ])
  }

  // Create users with bcrypt-hashed passwords
  const passwordHash = await bcrypt.hash("password123", 10)
  const adminHash = await bcrypt.hash("admin123", 10)

  // Create projects with roles (iterates the projects array)
  // Create applications (skips owner-self-applications)
  // Create memberships for accepted applications
  // Create saved projects, notifications, contact submissions
}
```

**Design decisions:**
- Uses `bcrypt.hash` with salt rounds 10 (lower than production 12 for faster seeding)
- `--force` flag clears everything — useful for resetting during development
- Password consistent across users for easy testing

---

## Chapter 19 — Needs Review Status & Review Workflow

### Objective

Add a review step to the task lifecycle where members submit work for review and owners approve or send feedback.

### What Changed

**Status enum expanded:**
```
Before: todo | in_progress | done | cancelled
After:  todo | in_progress | needs_review | done | cancelled
```

**New field added to Task:**
```js
reviewNote: { type: String, trim: true, maxlength: 2000, default: "" }
```

### Files Modified

| File | Change |
|------|--------|
| `backend/src/models/Task.js` | Added `"needs_review"` to status enum; added `reviewNote` field |
| `backend/src/validators/task.validator.js` | Added `"needs_review"` to both create and update Zod enums; added `reviewNote` to update schema |
| `backend/src/services/task.service.js` | `serializeTask` includes `reviewNote`; owner `updateTask` handles `reviewNote`; stats includes `needsReview` count |
| `app/projects/[id]/member/page.jsx` | "Mark as Done" sends `needs_review`; all status displays handle `needs_review` |
| `app/projects/[id]/manage/page.jsx` | Added `QuickStatusDropdown`, `ReviewActions`, Needs Review filter tab |

### Status Display Helper

Used across both dashboards wherever task status is displayed:

```jsx
{task.status === "in_progress" ? "In Progress" 
 : task.status === "needs_review" ? "Needs Review" 
 : titleCase(task.status)}
```

### Color Mapping

```js
const statusClass = {
  todo: "bg-[#efeee8] text-[#55544f]",      // Gray
  in_progress: "bg-[#2f2f2d] text-white",    // Dark gray
  needs_review: "bg-[#cc8833] text-white",    // Amber
  done: "bg-[#171717] text-white",            // Black
  cancelled: "bg-white text-[#77766f] border border-[#d9d8d2]",  // Light
}
```

### QuickStatusDropdown (Owner)

Replaces the static status badge in the owner's task detail modal with an inline `<select>`:

```jsx
<select value={task.status} onChange={handleChange}
  className={statusClass[task.status]}>
  <option value="todo">To Do</option>
  <option value="in_progress">In Progress</option>
  <option value="needs_review">Needs Review</option>
  <option value="done">Done</option>
  <option value="cancelled">Cancelled</option>
</select>
```

Changing the dropdown immediately PATCHes the task status without entering edit mode.

### Error Caught

After implementing, the validator rejected `needs_review` because only the Mongoose enum was updated — the Zod validator was forgotten. The error:

```
Validation failed: status: Invalid enum value. Expected 'todo' | 'in_progress' | 'done' | 'cancelled', received 'needs_review'
```

**Fix:** Updated both `createTaskSchema` and `updateTaskSchema` in `backend/src/validators/task.validator.js`.

**Lesson:** Always update validation at BOTH layers (Zod + Mongoose) when adding enum values.

---

## Chapter 20 — Subtask Tree (Parent/Child)

### Objective

When an owner sends a task back with feedback, create a child task rather than simply reverting status. This preserves the original context and enables iterative work cycles.

### Why Subtasks?

Before this change, "Request Changes" simply set the task back to "todo" with a `reviewNote`. This lost the iteration history — the member couldn't see what changed between versions.

With subtasks:
- The original task is closed (status: "done")
- A new child task is created with the feedback embedded in the description
- The child inherits the assignee, priority, and due date
- The parent's "Subtasks" section shows all iterations
- The member sees the new task in their "My Work" tab

### Data Model Change

```js
// Added to Task schema
parentId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Task",
  default: null,
}
```

### New API Endpoints

```
POST /api/v1/tasks/:taskId/feedback  → Send feedback, create subtask
GET  /api/v1/tasks/:taskId/subtasks  → List child tasks
```

### Feedback Schema (Validator)

```js
const feedbackSchema = z.object({
  body: z.object({
    feedback: z.string().trim().min(1).max(2000),
  }),
  params: z.object({ taskId: z.string().min(1) }),
  query: z.object({}).optional(),
})
```

### Send Feedback Service

```js
async function sendFeedback(taskId, userId, feedback) {
  const task = await taskRepository.findById(taskId)
  if (!task) throw new ApiError(404, "Task not found")

  const project = await projectRepository.findById(task.projectId)
  if (!project) throw new ApiError(404, "Project not found")
  if (String(project.ownerId) !== String(userId))
    throw new ApiError(403, "Only the project owner can send feedback")
  if (task.status !== "needs_review")
    throw new ApiError(400, "Feedback can only be sent on tasks awaiting review")

  const assigneeId = task.assigneeId ? String(task.assigneeId._id || task.assigneeId) : null
  if (!assigneeId) throw new ApiError(400, "Cannot send feedback on unassigned tasks")

  // Create child task
  const child = await taskRepository.create({
    projectId: task.projectId,
    parentId: task._id,
    createdBy: userId,
    title: task.title,
    description: `**Feedback from review:**\n${feedback}\n\n---\n**Original description:**\n${task.description}`,
    assigneeId,
    assignmentType: "assigned",
    status: "todo",
    priority: task.priority,
    dueDate: task.dueDate,
    reviewNote: feedback,
  })

  // Close parent task
  await taskRepository.updateById(taskId, { status: "done" })
  await recalcProgress(task.projectId)

  return { parent: serializeTask(updatedParent), child: serializeTask(child) }
}
```

### Subtask Display in Frontend

The owner's TaskDetailModal fetches subtasks on mount and renders them at the bottom:

```jsx
useEffect(() => {
  if (task?.id) {
    apiFetch(`/api/v1/tasks/${task.id}/subtasks`)
      .then(res => setSubtasks(res.data.subtasks || []))
      .catch(() => setSubtasks([]))
  }
}, [task?.id])

// Render:
{subtasks.length > 0 && (
  <div className="pt-4 border-t border-[#d9d8d2]">
    <p className="text-sm font-black uppercase tracking-[0.12em] text-[#77766f]">
      Subtasks ({subtasks.length})
    </p>
    <div className="mt-3 space-y-2">
      {subtasks.map(sub => (
        <div key={sub.id} className="border border-[#d9d8d2] bg-white p-3">
          <div className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-[#55544f]" />
            <span className="font-black text-sm truncate">{sub.title}</span>
            <span className="px-2 py-0.5 text-xs font-black {statusClass[sub.status]}">
              {sub.status}
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold text-[#77766f]">
            Assigned to {sub.assignee?.fullName}
          </p>
        </div>
      ))}
    </div>
  </div>
)}
```

### Data Flow

```
Member: "Mark as Done" → PATCH /tasks/:id { status: "needs_review" }
  │
  ├── Task status: needs_review (amber badge)
  │
Owner opens task → sees ReviewActions
  │
  ├── Click "Approve" → PATCH /tasks/:id { status: "done" }
  │     Task closed, progress recalculated
  │
  └── Click "Request Changes" → types feedback → POST /tasks/:id/feedback
        │
        ├── Original task → status: "done", reviewNote: feedback
        └── New subtask → status: "todo", assignee: same member
              └── description includes original + feedback
              └── parentId links to original task
```

### What the Member Sees

The new subtask appears in:
1. **"My Work" tab** — filtered by `assignee.id === myUserId`
2. **Tasks tab** — in the "To Do" filter
3. **Task detail modal** — the description shows the owner's feedback followed by the original description

---

## Appendix — Complete File Index

### Backend (76 files)

```
backend/
├── package.json
├── scripts/seed.js
├── src/
│   ├── server.js
│   ├── app.js
│   ├── config/
│   │   ├── cors.js
│   │   ├── db.js
│   │   ├── env.js
│   │   └── metadata.js
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
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   ├── requestId.middleware.js
│   │   └── validate.middleware.js
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
│   │   ├── index.js
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
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   ├── crypto.js
│   │   ├── logger.js
│   │   ├── normalize.js
│   │   ├── pagination.js
│   │   └── slugify.js
│   └── validators/
│       ├── application.validator.js
│       ├── auth.validator.js
│       ├── contact.validator.js
│       ├── notification.validator.js
│       ├── project.validator.js
│       ├── task.validator.js
│       └── user.validator.js
└── tests/
    ├── health.test.js
    └── routes.test.js
```

### Frontend (14 page files)

```
app/
├── layout.jsx
├── globals.css
├── page.jsx                          (Home)
├── about/page.jsx                    (About)
├── account/page.jsx                  (Profile editor)
├── contact/page.jsx                  (Contact form)
├── contribute/page.jsx               (Categories + featured)
├── dashboard/page.jsx                (User dashboard)
├── find-projects/page.jsx            (Project discovery)
├── leaderboard/page.jsx              (Rankings)
├── tutorials/page.jsx                (Tutorials)
├── projects/[id]/
│   ├── page.jsx                      (Public project detail)
│   ├── manage/page.jsx               (Owner dashboard, 1914 lines)
│   └── member/page.jsx              (Member dashboard, 624 lines)
lib/
├── api.js                            (API client)
└── utils.jsx                         (cn() helper)
components/
├── navbar.jsx
└── footer.jsx
```

### Documentation

```
TECHNICAL_DOCUMENTATION.md             (2,177 lines — full project reference)
SESSION_2026-07-18.md                 (Session log — today's work)
PROJECT_CHRONICLE.md                  (This file — 20 chapter chronicle)
```

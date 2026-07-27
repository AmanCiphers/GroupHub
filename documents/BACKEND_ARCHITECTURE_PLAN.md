# GroupHub Backend Architecture Plan

## Scope Decisions

This backend is planned as a separate Node.js/Express service backed by MongoDB Atlas and consumed by the current Next.js frontend.

V1 includes email/password authentication, user profiles, projects, project roles, applications, saved projects, dashboard data, contact submissions, activity events, and notification metadata.

V2 extension points are reserved for Groq-powered AI, file uploads, admin tools, tutorial CMS, leaderboard automation, OAuth, messaging, and richer collaboration features.

## Phase 1 - Project Analysis

### Global Navigation and Layout

Displayed data:
- Navigation links: Home, About, Contact, Tutorials, Leaderboard, Find Projects, Account, Dashboard.
- Logo images: `/Logo.svg`, `/white_clover.svg`.
- Footer link groups: Platform, Company, Legal.
- Social links: GitHub, Twitter, LinkedIn.

Backend needs:
- Static in v1.
- Later can be backed by CMS/admin config.
- Mobile menu open/close state is client-only and should not persist.

### Home Page

Displayed data:
- Hero headline, description, CTA links.
- Project teaser cards with title, roles, and status.
- Process steps.
- Hero image: `/home-team-illustration.png`.

Backend needs:
- Static marketing copy in v1.
- Project teaser cards can later come from featured projects.
- CTA "Get Started" should route authenticated users to dashboard and guests to account/login.

Persisted states:
- None in v1.

Relationships:
- Featured project teasers relate to `projects` and `projectRoles` later.

### Account Page

Forms:
- Login form.
- Signup form.

Inputs:
- Signup: full name, email, password, confirm password.
- Login: email, password.

Buttons:
- Continue with GitHub: deferred OAuth.
- Continue with Google: deferred OAuth.
- Sign In: creates auth session.
- Create Account: creates user and profile.
- Forgot password: opens reset flow later.
- Toggle sign in/sign up: client-only UI state.

Backend needs:
- Register user.
- Login user.
- Logout user.
- Refresh auth token.
- Get current user.
- Verify email if enabled.
- Password reset if enabled.

Validation:
- Name required for signup, 2-80 chars.
- Email required, normalized lowercase, unique.
- Password required, minimum 8-12 chars, recommended mixed strength.
- Confirm password must match.
- Reject duplicate email.
- Rate limit login and signup.

Auth requirements:
- Login/signup public.
- Current user/logout protected.

Edge cases:
- Duplicate email.
- Wrong password.
- Unverified email attempting login if verification is enforced.
- Expired refresh token.
- Locked account after abuse.

### Find Projects Page

Displayed data:
- Project cards with title, description, category, stage, commitment, owner, owner initials, posted time, skills, open roles, team size, spots open, location, applicant count, and match percentage.
- Category counts.
- Skill filter options.
- Empty results state.

Inputs and filters:
- Search field by project, role, skill, or keyword.
- Category filter.
- Skill filter.
- Reset filters button.

Buttons:
- Save/unsave project.
- Post a project.
- View project.
- Category filter buttons.
- Skill filter buttons.

Persisted states:
- Saved projects per user.
- Search/filter state should be represented in query parameters, not stored.
- Project views can be tracked as analytics/activity later.

Backend needs:
- List projects with filtering, search, pagination, sorting.
- Return category counts and skill facets.
- Save/unsave project.
- Return user-specific saved flag.
- Return match score later based on profile and role fit.
- View project details endpoint.

Validation:
- Search max length.
- Category must be allowed or dynamic from DB.
- Skills must be normalized.
- Pagination limits.

Auth requirements:
- Project listing can be public.
- Save/unsave requires auth.
- Match percentage requires auth/profile; public users can receive null or generic "profile required".
- Post project requires auth.

Authorization:
- Only project owner or admins can edit project.
- Only authenticated users can save.

Edge cases:
- No results.
- Project closed while user is viewing it.
- Role full before application.
- Owner cannot apply to own role.
- Deleted/suspended owner.

### Dashboard Page

Displayed data:
- Stats: active projects, open roles, applications, reputation.
- User projects with status, team count, progress, next task, unread count.
- User applications with status and dates.
- Activity feed.
- Recommended project match card.

Modal:
- Create New Project modal.

Form inputs:
- Project title.
- Project description.
- Open roles comma-style text.

Buttons:
- Bell: notifications later.
- Settings: account/profile settings later.
- New project: opens modal.
- Cancel: closes modal.
- Create Project: persists project.
- Browse roles: navigation.
- Review matches: AI/recommendation later.

Persisted states:
- Projects owned by user.
- Project roles.
- Applications.
- Activity events.
- Unread notification count.
- Reputation/points.
- Project progress.

Backend needs:
- Dashboard aggregate endpoint.
- Create project endpoint.
- User project list.
- User application list.
- Activity feed endpoint.
- Notification summary endpoint later.
- Recommendations endpoint later.

Validation:
- Title required, 3-120 chars.
- Description required, 20-2000 chars.
- Open roles required, each 2-80 chars.
- At least one role.
- Owner must be authenticated.

Auth requirements:
- Entire dashboard protected.

Authorization:
- User can only see their dashboard.
- User can only manage projects they own or have project permissions for.

Edge cases:
- User has no projects.
- User has no applications.
- Project creation with duplicate title by same owner.
- Malformed roles input.
- Progress cannot exceed 100 or fall below 0.

### Contact Page

Displayed data:
- Contact methods.
- FAQ cards.
- Success confirmation after submit.

Form inputs:
- First name.
- Last name.
- Email.
- Subject.
- Message.

Buttons:
- Send message.
- Send another.

Persisted states:
- Contact submissions should be stored.
- Submitted UI state is client-only.

Backend needs:
- Create contact submission.
- Optional email notification to admin.
- Optional auto-reply to submitter.
- Admin review later.

Validation:
- First and last name required.
- Email required and valid.
- Subject required, max 150 chars.
- Message required, 10-5000 chars.
- Anti-spam rate limiting.

Auth requirements:
- Public.
- If logged in, attach `userId`.

Edge cases:
- Spam submissions.
- Disposable/invalid email.
- Email provider failure after DB save.

### Contribute Page

Displayed data:
- Contribution types with category, description, skills, and opening counts.
- Featured projects needing help.

Backend needs:
- Static in v1.
- Later derive contribution categories and counts from open project roles.
- Featured projects can come from projects with urgent/high-priority roles.

Persisted states:
- None in v1.

### Leaderboard Page

Displayed data:
- Contributor cards: name, username, points, projects, contributions, badge, skills.
- Stats: active contributors, completed projects, badges earned, streak leaders.
- Ranking rows.
- "How to climb" point rules.

Buttons:
- Period filters: All Time, This Month, This Week.

Backend needs:
- Static/seeded in v1 or deferred.
- Later compute from reputation events.

Persisted states:
- Period filter should be query state.
- Reputation events should be persisted later.

Edge cases:
- Ties.
- Fraudulent points.
- Deleted users.
- Period-based recalculation.

### Tutorials Page

Displayed data:
- Tutorial category filters.
- Tutorial cards: title, description, category, duration, difficulty, icon.

Buttons:
- Category filters.
- Start tutorial.

Backend needs:
- Static in v1.
- Later CMS/admin-managed tutorials.
- Tutorial progress can be user-specific later.

Persisted states:
- Category filter is client/query state.
- Tutorial progress deferred.

### About Page

Displayed data:
- Mission, origin, principles, team cards.

Backend needs:
- Static in v1.
- Later CMS/admin-managed content.

### Shared UI Components

Persistable controls currently available but mostly unused:
- Dropdowns, checkboxes, radio groups, sliders, dialogs, popovers, sheets, tabs, tables, toasts.

Backend interpretation:
- These components do not imply persistence until used by a page.
- Toast state, modal state, mobile menu state, and sidebar state are client-only.

## Phase 2 - Required Services and Credentials

Mandatory for v1:
- `MONGODB_URI`: MongoDB Atlas connection string.
- `MONGODB_DB_NAME`: database name.
- `APP_SECRET`: private app-level cryptographic secret.
- `JWT_ACCESS_SECRET`: signs short-lived access tokens.
- `JWT_REFRESH_SECRET`: signs refresh tokens.
- `JWT_ACCESS_EXPIRES_IN`: recommended `15m`.
- `JWT_REFRESH_EXPIRES_IN`: recommended `7d`.
- `BCRYPT_SALT_ROUNDS`: recommended `12`.
- `CLIENT_URL`: frontend URL for CORS and email links.
- `CORS_ORIGIN`: allowed frontend origin.
- `PORT`: backend server port.

Recommended for v1:
- `RESEND_API_SECRET` or SMTP credentials: email verification, password reset, contact notifications.
- `EMAIL_FROM`: verified sender address.
- `REDIS_URL` and `REDIS_TOKEN`: rate limiting and token/session controls in production.
- `SENTRY_DSN`: production error monitoring.

Deferred for v2:
- `AI_PROVIDER=groq`: selected AI provider.
- `GROQ_API_KEY`: Groq API key.
- `GROQ_MODEL`: selected Groq model.
- Cloudinary/S3 keys for uploads later.
- Google/GitHub OAuth credentials later.

Security note:
- Any secret that has been pasted into chat, committed, or shared should be rotated before production.

## Phase 3 - Backend Architecture

### Recommended Repository Strategy

Use a separate backend repo.

Reasons:
- Independent deployment and scaling.
- Cleaner backend dependency tree.
- Clear API boundary between Next.js frontend and Express backend.
- Easier to replace or expand frontend later.

Suggested backend name:
- `grouphub-api`

### Stack

- Runtime: Node.js.
- Framework: Express.js.
- Database: MongoDB Atlas.
- ODM: Mongoose.
- Auth: JWT access token plus refresh token.
- Password hashing: bcrypt.
- Validation: Zod or Joi.
- Logging: Pino or Winston.
- Security: Helmet, CORS, rate limiting, input sanitization.
- Testing: Jest or Vitest plus Supertest.

### Architectural Pattern

Use MVC with repository and service layers:
- Routes map HTTP paths to controllers.
- Controllers handle request/response only.
- Validators validate inputs before controllers.
- Services contain business rules.
- Repositories isolate Mongoose queries.
- Models define database shape.
- Middlewares handle auth, errors, rate limits, request IDs, and security concerns.

### Main Domains

- Auth.
- Users and profiles.
- Projects.
- Project roles.
- Applications.
- Saved projects.
- Dashboard aggregates.
- Activity events.
- Notifications.
- Contact submissions.
- Reputation events later.
- Tutorials later.
- AI artifacts later.

## Phase 4 - Database Design

### `users`

Purpose:
- Stores identity, credentials, account status, and top-level profile fields.

Key fields:
- `email`: String, required, unique, lowercase.
- `passwordHash`: String, required for email/password users.
- `fullName`: String, required.
- `username`: String, unique, optional initially.
- `bio`: String, optional.
- `avatarUrl`: String, optional later.
- `skills`: Array of strings.
- `interests`: Array of strings.
- `location`: String.
- `availabilityHoursPerWeek`: Number.
- `experienceLevel`: Enum `beginner`, `intermediate`, `advanced`, `expert`.
- `role`: Enum `user`, `moderator`, `admin`, default `user`.
- `emailVerified`: Boolean, default `false`.
- `status`: Enum `active`, `pending`, `suspended`, `deleted`.
- `reputationPoints`: Number, default `0`.
- `lastLoginAt`: Date.
- `createdAt`, `updatedAt`: Date.

Indexes:
- Unique `email`.
- Unique sparse `username`.
- Text index on `fullName`, `username`, `skills`.

Example:
```json
{
  "email": "aman@example.com",
  "fullName": "Aman",
  "skills": ["React", "Product"],
  "availabilityHoursPerWeek": 6,
  "experienceLevel": "intermediate",
  "role": "user",
  "emailVerified": true,
  "status": "active",
  "reputationPoints": 1250
}
```

### `refreshTokens`

Purpose:
- Stores hashed refresh tokens for revocation and session tracking.

Key fields:
- `userId`: ObjectId ref `users`, required.
- `tokenHash`: String, required, unique.
- `expiresAt`: Date, required.
- `revokedAt`: Date.
- `userAgent`: String.
- `ipAddress`: String.
- `createdAt`: Date.

Indexes:
- TTL index on `expiresAt`.
- Index `userId`.

### `projects`

Purpose:
- Stores project listing, ownership, status, and metadata.

Key fields:
- `ownerId`: ObjectId ref `users`, required.
- `title`: String, required.
- `slug`: String, unique.
- `description`: String, required.
- `category`: String, required.
- `stage`: Enum `idea`, `research`, `prototype`, `mvp`, `active`, `completed`, `paused`.
- `commitmentHoursPerWeek`: Number.
- `commitmentLabel`: String.
- `locationType`: Enum `remote`, `hybrid`, `onsite`.
- `location`: String.
- `status`: Enum `draft`, `recruiting`, `active`, `completed`, `archived`.
- `visibility`: Enum `public`, `private`, `unlisted`.
- `skills`: Array of strings.
- `tags`: Array of strings.
- `teamSizeTarget`: Number.
- `progressPercent`: Number, 0-100.
- `nextMilestone`: String.
- `createdAt`, `updatedAt`, `publishedAt`: Date.

Indexes:
- Text index on `title`, `description`, `skills`, `tags`, `category`.
- Compound index `status`, `category`, `createdAt`.
- Index `ownerId`.

### `projectRoles`

Purpose:
- Stores open roles inside projects.

Key fields:
- `projectId`: ObjectId ref `projects`, required.
- `title`: String, required.
- `description`: String.
- `requiredSkills`: Array of strings.
- `preferredSkills`: Array of strings.
- `slotsTotal`: Number, default `1`.
- `slotsFilled`: Number, default `0`.
- `status`: Enum `open`, `filled`, `closed`.
- `workloadHoursPerWeek`: Number.
- `createdAt`, `updatedAt`: Date.

Indexes:
- Compound index `projectId`, `status`.
- Index on `requiredSkills`.

### `applications`

Purpose:
- Stores user applications to project roles.

Key fields:
- `projectId`: ObjectId ref `projects`, required.
- `roleId`: ObjectId ref `projectRoles`, required.
- `applicantId`: ObjectId ref `users`, required.
- `message`: String, required.
- `availabilityHoursPerWeek`: Number.
- `status`: Enum `pending`, `accepted`, `rejected`, `withdrawn`.
- `reviewedBy`: ObjectId ref `users`.
- `reviewedAt`: Date.
- `createdAt`, `updatedAt`: Date.

Indexes:
- Unique compound `roleId`, `applicantId`.
- Compound `projectId`, `status`.
- Index `applicantId`.

### `projectMemberships`

Purpose:
- Stores active team membership.

Key fields:
- `projectId`: ObjectId ref `projects`, required.
- `userId`: ObjectId ref `users`, required.
- `roleId`: ObjectId ref `projectRoles`.
- `roleTitle`: String.
- `permissions`: Array enum `view`, `comment`, `manage_roles`, `manage_applications`, `manage_project`.
- `status`: Enum `active`, `left`, `removed`.
- `joinedAt`: Date.

Indexes:
- Unique compound `projectId`, `userId`.
- Index `userId`.

### `savedProjects`

Purpose:
- Stores project bookmarks per user.

Key fields:
- `userId`: ObjectId ref `users`, required.
- `projectId`: ObjectId ref `projects`, required.
- `createdAt`: Date.

Indexes:
- Unique compound `userId`, `projectId`.
- Index `projectId`.

### `activityEvents`

Purpose:
- Stores audit/activity feed entries.

Key fields:
- `actorId`: ObjectId ref `users`.
- `projectId`: ObjectId ref `projects`.
- `targetUserId`: ObjectId ref `users`.
- `type`: Enum `project_created`, `role_created`, `application_submitted`, `application_accepted`, `application_rejected`, `project_updated`, `member_joined`, `progress_updated`.
- `metadata`: Mixed object.
- `createdAt`: Date.

Indexes:
- Compound `projectId`, `createdAt`.
- Compound `targetUserId`, `createdAt`.

### `notifications`

Purpose:
- Stores user notification state.

Key fields:
- `userId`: ObjectId ref `users`, required.
- `type`: String, required.
- `title`: String, required.
- `body`: String.
- `entityType`: String.
- `entityId`: ObjectId.
- `readAt`: Date.
- `createdAt`: Date.

Indexes:
- Compound `userId`, `readAt`, `createdAt`.

### `contactSubmissions`

Purpose:
- Stores public contact form submissions.

Key fields:
- `userId`: ObjectId ref `users`, optional.
- `firstName`: String, required.
- `lastName`: String, required.
- `email`: String, required.
- `subject`: String, required.
- `message`: String, required.
- `status`: Enum `new`, `reviewed`, `closed`, `spam`.
- `ipAddress`: String.
- `userAgent`: String.
- `createdAt`: Date.

Indexes:
- Compound `status`, `createdAt`.
- Index `email`.

### Deferred Collections

- `aiArtifacts`: stores Groq outputs and prompt versions.
- `tutorials`: stores tutorial CMS content.
- `tutorialProgress`: stores user tutorial state.
- `reputationEvents`: stores point-awarding audit trail.
- `adminActions`: stores moderation audit history.
- `mediaAssets`: stores upload metadata later.

## Phase 5 - API Planning

### Auth

`POST /api/v1/auth/register`
- Public.
- Body: `fullName`, `email`, `password`, `confirmPassword`.
- Creates user, sends verification email if enabled.
- Returns user summary and tokens or pending-verification response.

`POST /api/v1/auth/login`
- Public, rate limited.
- Body: `email`, `password`.
- Returns access token and sets refresh token cookie.

`POST /api/v1/auth/refresh`
- Uses refresh cookie.
- Rotates refresh token and returns new access token.

`POST /api/v1/auth/logout`
- Protected or refresh-cookie based.
- Revokes current refresh token.

`GET /api/v1/auth/me`
- Protected.
- Returns current user and profile summary.

`POST /api/v1/auth/forgot-password`
- Public, rate limited.
- Body: `email`.
- Sends reset email without revealing account existence.

`POST /api/v1/auth/reset-password`
- Public.
- Body: `token`, `password`, `confirmPassword`.
- Resets password and revokes refresh tokens.

### Users

`GET /api/v1/users/me`
- Protected.
- Returns current profile.

`PATCH /api/v1/users/me`
- Protected.
- Updates profile fields.

`GET /api/v1/users/:username`
- Public or protected depending on privacy.
- Returns public profile.

### Projects

`GET /api/v1/projects`
- Public.
- Query: `q`, `category`, `skill`, `stage`, `status`, `page`, `limit`, `sort`.
- Returns paginated projects plus facets.

`POST /api/v1/projects`
- Protected.
- Body: project fields plus roles.
- Creates project, roles, owner membership, activity event.

`GET /api/v1/projects/:idOrSlug`
- Public.
- Returns project details, roles, owner summary, saved flag if authenticated.

`PATCH /api/v1/projects/:id`
- Protected.
- Owner/member with permission only.

`DELETE /api/v1/projects/:id`
- Protected.
- Owner/admin only. Prefer soft archive.

### Project Roles

`POST /api/v1/projects/:projectId/roles`
- Protected.
- Owner/member with role permission.

`PATCH /api/v1/roles/:roleId`
- Protected.
- Owner/member with role permission.

`DELETE /api/v1/roles/:roleId`
- Protected.
- Closes role if applications exist.

### Applications

`POST /api/v1/roles/:roleId/applications`
- Protected.
- Body: `message`, `availabilityHoursPerWeek`.
- Creates application.

`GET /api/v1/projects/:projectId/applications`
- Protected.
- Project owner/member with permission.

`GET /api/v1/users/me/applications`
- Protected.
- Returns current user's applications.

`PATCH /api/v1/applications/:id`
- Protected.
- Owner/member can accept/reject. Applicant can withdraw.

### Saved Projects

`GET /api/v1/users/me/saved-projects`
- Protected.

`POST /api/v1/projects/:projectId/save`
- Protected.

`DELETE /api/v1/projects/:projectId/save`
- Protected.

### Dashboard

`GET /api/v1/dashboard`
- Protected.
- Returns stats, owned projects, memberships, applications, activity, notification counts.

### Activity and Notifications

`GET /api/v1/activity`
- Protected.
- Query: `projectId`, `page`, `limit`.

`GET /api/v1/notifications`
- Protected.

`PATCH /api/v1/notifications/:id/read`
- Protected, owner only.

`PATCH /api/v1/notifications/read-all`
- Protected.

### Contact

`POST /api/v1/contact`
- Public, rate limited.
- Body: `firstName`, `lastName`, `email`, `subject`, `message`.

### Deferred AI

`POST /api/v2/ai/scope-project`
- Protected.
- Uses Groq to suggest roles, milestones, skills, and risks.

`POST /api/v2/ai/match-projects`
- Protected.
- Uses profile and project roles to explain matches.

## Phase 6 - Authentication and Security

Authentication:
- Email/password in v1.
- Store only bcrypt password hashes.
- Access token expires quickly.
- Refresh token stored as hashed record in DB and sent via `httpOnly`, `secure`, `sameSite` cookie.
- Refresh token rotation on every refresh.
- Revoke all refresh tokens on password reset.

Authorization:
- RBAC roles: `user`, `moderator`, `admin`.
- Project permissions handled by `projectMemberships`.
- Users can edit only their own profile.
- Project owners manage projects, roles, and applications.
- Applicants can withdraw their own applications.

Rate limiting:
- Strict limits on login, register, forgot password, reset password, and contact.
- General API limit per IP/user.
- Redis-backed in production.

Input security:
- Validate all request bodies with Zod/Joi.
- Sanitize strings for NoSQL injection and HTML/script content.
- Limit payload size.
- Use Mongo ObjectId validation.

HTTP security:
- Helmet enabled.
- CORS restricted to `CLIENT_URL`.
- Disable `x-powered-by`.
- Request ID middleware.
- Centralized error handler with safe public messages.

CSRF:
- If refresh token is cookie-based, use `sameSite=lax` or `strict`.
- Mutating auth endpoints should validate origin and use CORS allowlist.
- Add CSRF token later if cross-site cookie flows become more complex.

Email security:
- Reset and verification tokens should be random, hashed in DB, and time-limited.
- Responses should not reveal account existence.

File upload security:
- Deferred.
- When added, validate MIME, extension, size, scan if needed, and store outside the app server.

## Phase 7 - Development Roadmap

### Milestone 1 - Backend Foundation

Goal:
- Create Express service foundation.

Tasks:
- Initialize backend repo.
- Add Express server.
- Add environment config.
- Add MongoDB connection.
- Add logger.
- Add global error handling.
- Add health endpoint.

Files:
- `src/server.js`
- `src/app.js`
- `src/config/env.js`
- `src/config/db.js`
- `src/middlewares/error.middleware.js`
- `src/utils/logger.js`

Testing:
- Health endpoint.
- Environment validation.

Complexity:
- Low.

### Milestone 2 - Auth

Goal:
- Email/password authentication.

Tasks:
- User model.
- Refresh token model.
- Register/login/logout/refresh/me.
- Password hashing.
- JWT utilities.
- Auth middleware.

Testing:
- Register success/duplicate.
- Login success/failure.
- Refresh token rotation.
- Protected route access.

Complexity:
- Medium.

### Milestone 3 - Profiles

Goal:
- Current user profile and public profile.

Tasks:
- Profile update validation.
- Skill normalization.
- Public profile endpoint.

Testing:
- Self update.
- Unauthorized update blocked.

Complexity:
- Low-medium.

### Milestone 4 - Projects and Roles

Goal:
- Persist project listings and roles.

Tasks:
- Project model.
- Project role model.
- Create/list/detail/update/archive endpoints.
- Search, filters, facets.

Testing:
- Project CRUD.
- Owner-only mutation.
- Search/filter behavior.

Complexity:
- Medium-high.

### Milestone 5 - Applications and Memberships

Goal:
- Users can apply and owners can manage applicants.

Tasks:
- Application model.
- Membership model.
- Apply endpoint.
- Accept/reject/withdraw logic.
- Slot-filling logic.

Testing:
- Duplicate application prevented.
- Owner cannot apply.
- Accept creates membership.
- Full role blocks extra acceptance.

Complexity:
- High.

### Milestone 6 - Saved Projects and Dashboard

Goal:
- Match current discovery/dashboard UI.

Tasks:
- Saved project model.
- Dashboard aggregate service.
- Activity events.
- Basic notification records.

Testing:
- Save/unsave idempotency.
- Dashboard returns correct counts.

Complexity:
- Medium.

### Milestone 7 - Contact and Email

Goal:
- Contact form persistence and email integration.

Tasks:
- Contact model.
- Contact endpoint.
- Email service.
- Optional verification/reset emails.

Testing:
- Validation.
- Rate limits.
- Email failure handling.

Complexity:
- Medium.

### Milestone 8 - Production Hardening

Goal:
- Make deployment-ready.

Tasks:
- Redis rate limiting.
- Sentry.
- API docs.
- Seed scripts.
- Security headers.
- CI test command.

Testing:
- Security middleware.
- Smoke tests.

Complexity:
- Medium.

## Phase 8 - File Structure

```text
grouphub-api/
  src/
    app.js
    server.js
    config/
      db.js
      env.js
      cors.js
      security.js
    controllers/
      auth.controller.js
      user.controller.js
      project.controller.js
      role.controller.js
      application.controller.js
      savedProject.controller.js
      dashboard.controller.js
      contact.controller.js
    models/
      User.js
      RefreshToken.js
      Project.js
      ProjectRole.js
      Application.js
      ProjectMembership.js
      SavedProject.js
      ActivityEvent.js
      Notification.js
      ContactSubmission.js
    routes/
      index.js
      auth.routes.js
      user.routes.js
      project.routes.js
      role.routes.js
      application.routes.js
      dashboard.routes.js
      contact.routes.js
    middlewares/
      auth.middleware.js
      authorize.middleware.js
      validate.middleware.js
      error.middleware.js
      rateLimit.middleware.js
      requestId.middleware.js
    services/
      auth.service.js
      token.service.js
      user.service.js
      project.service.js
      application.service.js
      dashboard.service.js
      activity.service.js
      notification.service.js
      email.service.js
    repositories/
      user.repository.js
      project.repository.js
      role.repository.js
      application.repository.js
      membership.repository.js
      savedProject.repository.js
      activity.repository.js
    validators/
      auth.validator.js
      user.validator.js
      project.validator.js
      application.validator.js
      contact.validator.js
    utils/
      asyncHandler.js
      ApiError.js
      ApiResponse.js
      normalize.js
      slugify.js
      crypto.js
      pagination.js
      logger.js
    docs/
      openapi.yaml
      architecture.md
    tests/
      integration/
      unit/
    uploads/
      .gitkeep
```

Folder responsibilities:
- `config`: environment, database, CORS, security setup.
- `controllers`: HTTP request/response orchestration.
- `models`: Mongoose schemas.
- `routes`: route registration.
- `middlewares`: reusable request pipeline logic.
- `services`: business rules and multi-model workflows.
- `repositories`: database query abstraction.
- `validators`: request schema validation.
- `utils`: small shared helpers.
- `docs`: API and architecture documentation.
- `tests`: unit and integration tests.
- `uploads`: placeholder only; not used until uploads are added.

## Phase 9 - Final Review

Missing features to consider later:
- Project detail page in frontend.
- Application modal/form in frontend.
- Profile completion page.
- Settings page.
- Notification panel.
- Admin moderation UI.
- Tutorial detail/progress.
- Real leaderboard generation.

Duplicate logic risks:
- Project stats should be calculated in dashboard service, not repeated across controllers.
- Role slot logic should live in application service.
- Activity and notification creation should be reusable service calls.

Database optimization:
- Use pagination for all lists.
- Use text indexes or Atlas Search for discovery as data grows.
- Keep `applications` separate from `projects` to avoid large embedded arrays.
- Keep `projectRoles` separate to support role-first discovery.
- Add compound indexes for common filters.

Security risks:
- Rotate any credentials exposed outside `.env`.
- Never return password hashes or refresh token hashes.
- Do not log request bodies for auth routes.
- Use strict CORS.
- Rate limit contact and auth endpoints.
- Validate ObjectIds before queries.

Performance bottlenecks:
- Dashboard aggregation may become expensive; cache summary data later.
- Leaderboard should use reputation events plus precomputed summaries later.
- Match scoring should be cached per user/profile version when AI is added.

Maintainability:
- Keep Groq behind generic `ai.service.js` in v2.
- Keep admin functionality in separate route/controller namespace.
- Prefer soft deletes for user/project data.
- Use consistent error response shape.

Recommended next implementation path:
- Build the separate `grouphub-api` repo.
- Implement milestones 1-3 first.
- Connect the current Account page to real auth.
- Then implement projects, roles, applications, and dashboard.

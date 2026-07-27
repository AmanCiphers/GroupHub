# GroupHub Full Audit

---

## 🔴 Critical Issues

### C-01: Registration returns 201 even when user already exists

**Location:** `backend/src/services/auth.service.js:62-68`, `backend/src/controllers/auth.controller.js:22-24`

**Problem:** When a user registers with an existing email, `register()` returns `{ user: null }`. The controller checks `if (result.user)` and falls through to `apiResponse(res, 201, null, "Registration successful")`. The client receives a 201 "success" but no user is created — the user thinks registration worked but gets a silent fail.

**Impact:** User submits form, sees success message, gets redirected to dashboard, but they're not actually logged in. Extremely confusing.

**Fix:** Return 409 Conflict with a clear "Account already exists" message when the email is taken.

---

### C-02: Email service fetch() calls not wrapped in try/catch

**Location:** `backend/src/services/email.service.js:12-36`, `:48-72`

**Problem:** Both `sendVerificationEmail` and `sendPasswordResetEmail` call `fetch()` to the Resend API. If the network request fails (timeout, DNS failure, connection refused), the promise rejection is unhandled — no try/catch. This creates an unhandled promise rejection that crashes the Node process (in Node 16+ it terminates the process).

**Impact:** Any network hiccup with Resend takes down the entire API server.

**Fix:** Wrap both fetch calls in try/catch, log the error, and let the function return silently.

---

### C-03: Navbar `top-` incomplete Tailwind class

**Location:** `components/navbar.jsx:27`

**Problem:** `className="absolute inset-x-0 top- z-[70]"` — the `top-` utility has no value. Tailwind CSS ignores incomplete utilities. The absolutely positioned header on the homepage has no `top` positioning. It may not appear at the top of the viewport or may overlap content incorrectly.

**Impact:** The hero section header on the landing page is broken — transparent navbar may not sit at the top of the page, causing overlap or incorrect scroll behavior.

**Fix:** Change `top-` to `top-0`.

---

### C-04: Frontend crashes on null/undefined project roles or skills

**Location:** `app/projects/[id]/page.jsx:153-154`, `:261`, `:275`

**Problem:** Three places access properties without null guards:
- `project.roles.reduce(...)` — if API returns no `roles` field, this throws `TypeError`
- `role.requiredSkills.length` — if `requiredSkills` is undefined, throws
- `role.preferredSkills.length` — same

**Impact:** Any project with malformed or partial role data crashes the entire detail page. User sees a blank screen.

**Fix:** Use `(project.roles || []).reduce(...)`, `(role.requiredSkills || []).length`, `(role.preferredSkills || []).length`.

---

### C-05: setRecommendedLoading never called on API error

**Location:** `app/dashboard/page.jsx:199`

**Problem:** `setRecommendedLoading(false)` is inside the `try` block after the matchmaking API call. If that call throws, execution jumps to `catch` and `setRecommendedLoading` never fires. `recommendedLoading` stays `true` forever — skeleton cards never go away.

**Impact:** The recommended projects sidebar shows animated skeletons permanently after any matchmaking API error. User sees a broken-looking page forever.

**Fix:** Move `setRecommendedLoading(false)` into a `finally` block, or use the same pattern as `setLoading(false)` which is already in `finally` at line 209.

---

### C-06: Stray `x` character in footer `<h1>`

**Location:** `components/footer.jsx:35`

**Problem:** `<h1> x </h1>` renders a literal "x" character between two logo images. This is semantically wrong (multiple `<h1>` per page, logo shouldn't be h1) and visually confusing — users see a random "x" in the footer.

**Impact:** Looks unprofessional. Multiple `<h1>` elements violates HTML semantics. Screen readers announce "x" between logos.

**Fix:** Remove the `<h1>` wrapper and `x` text. Use a styled `<span>` as visual separator if needed, or just place the logos side by side.

---

### C-07: optionalAuthMiddleware doesn't specify JWT algorithm

**Location:** `backend/src/middlewares/auth.middleware.js:50`

**Problem:** `authMiddleware` specifies `{ algorithms: ["HS256"] }` but `optionalAuthMiddleware` uses `jwt.verify(token, env.JWT_ACCESS_SECRET)` with no algorithm option. In older `jsonwebtoken` versions, this could accept `alg: "none"` tokens.

**Impact:** Potential JWT algorithm confusion attack on optional auth endpoints (project listing, project detail).

**Fix:** Add `{ algorithms: ["HS256"] }` to the `jwt.verify` call in `optionalAuthMiddleware`.

---

## 🟠 High Severity

### H-01: Leaderboard crashes on missing user fullName

**Location:** `app/leaderboard/page.jsx:113`

**Problem:** `user.fullName.split(" ")` throws if `fullName` is null/undefined.

**Impact:** A user with no fullName in the DB crashes the leaderboard page entirely.

**Fix:** `(user.fullName || "").split(" ")` or use optional chaining.

---

### H-02: `/notifications/read-all` has no validation middleware

**Location:** `backend/src/routes/notification.routes.js:16`

**Problem:** The route has `authMiddleware` at the router level but no `validate()` schema for the request. While the controller doesn't use request body, the absence is inconsistent and could mask future issues.

**Impact:** Low functional risk, but violates the pattern. If someone adds body handling later, it won't be validated.

**Fix:** At minimum don't need to change if truly no body needed. But should add a no-op validation for consistency.

---

### H-03: Tutorials page has non-functional interactive elements

**Location:** `app/tutorials/page.jsx`

**Problem:** Category filter buttons have no `onClick` handler (decorative). "Start" buttons on tutorial cards have no `onClick` or `Link` wrapping. Yet the page is a Server Component (`"use client"` is absent). Interactive elements that do nothing.

**Impact:** Users click buttons expecting action — nothing happens. Undermines trust.

**Fix:** Either wire up the filters and "Start" buttons with real functionality, or remove the interactive elements and render as static text.

---

### H-04: Project detail page `totalSlots`/`filledSlots` from roles with no fallback

**Location:** `app/projects/[id]/page.jsx:153-154`

**Problem:** Same as C-04 but separate impact: the sidebar "Team spots" display shows "X of X filled". Without roles, this reads "0 of 0 filled" which is meaningless.

**Impact:** Misleading stats on the project page.

**Fix:** Hide the team spots section when totalSlots is 0, or show "No roles yet" instead.

---

### H-05: No sitemap.xml or robots.txt

**Location:** `public/` (missing files)

**Problem:** No `sitemap.xml` or `robots.txt` exist. Search engines cannot discover pages efficiently.

**Impact:** Poor SEO. Pages may not be indexed at all.

**Fix:** Add `robots.txt` allowing all crawlers, and generate a `sitemap.xml` listing all public routes.

---

### H-06: Email/password reset tokens reuse JWT_ACCESS_SECRET

**Location:** `backend/src/services/token.service.js:137-173`

**Problem:** `signEmailVerificationToken` and `signPasswordResetToken` both sign with `env.JWT_ACCESS_SECRET`. If the access secret is compromised, all token types are compromised.

**Impact:** Reduces security isolation between token types.

**Fix:** Add separate `JWT_EMAIL_SECRET` and `JWT_RESET_SECRET` env vars.

---

### H-07: verifyEmail bypasses validation middleware

**Location:** `backend/src/controllers/auth.controller.js:74-76`

**Problem:** Returns `res.status(400).json(...)` directly instead of throwing an `ApiError`. This bypasses the centralized error handler, producing inconsistent error format.

**Impact:** Inconsistent API error responses.

**Fix:** Throw `new ApiError(400, "Verification token required")`.

---

### H-08: Missing og:image and Twitter card metadata

**Location:** `app/layout.jsx`

**Problem:** No `openGraph` or `twitter` metadata in the root layout. Links shared on social platforms show no preview image, no description, no title customization per page.

**Impact:** Poor social sharing appearance. Reduces click-through from social media.

**Fix:** Add `openGraph` and `twitter` metadata with a default social image.

---

## 🟡 Medium Severity

### M-01: 20+ unused imports across frontend

**Locations:**
- `app/account/page.jsx:10` — `Link as LinkIcon` icon unused
- `app/dashboard/page.jsx:10` — `CheckCircle2` unused; `:11` — `ExternalLink` unused; `:16` — `Users` unused
- `app/find-projects/page.jsx:9` — `CheckCircle2` unused
- `app/projects/[id]/page.jsx:9` — `Briefcase` unused; `:16` — `MessageSquare` unused
- `app/projects/[id]/manage/page.jsx` — 11 unused imports: `ArrowUpRight`, `Bell`, `BookOpen`, `ChevronDown`, `CircleDot`, `Flag`, `LogOut`, `MoreHorizontal`, `Search`, `Trophy`, `UserPlus`

**Impact:** Bloated bundle. Increases initial load time. Harder to maintain.

**Fix:** Remove all unused imports.

---

### M-02: Hardcoded colors everywhere — no design tokens

**Location:** Every page and component

**Problem:** Colors like `#171717`, `#f7f7f3`, `#d9d8d2`, `#2f2f2d` are hardcoded as arbitrary Tailwind values (e.g., `bg-[#171717]`) across all files, ~200+ occurrences. No CSS variables or Tailwind theme configuration is used.

**Impact:** Theming is impossible without find-and-replace across the entire codebase. Design changes require touching every file.

**Fix:** Define colors in `globals.css` `@theme` block and use named classes (`bg-brand`, `text-muted`, etc.).

---

### M-03: Filter/skill hardcoded on find-projects page

**Location:** `app/find-projects/page.jsx:26-37`

**Problem:** `skillFilters` array is hardcoded with 10 skills: React, Python, UI/UX, Node.js, TypeScript, Figma, Machine Learning, Mobile, Marketing, Data Science. These will become stale as projects with different skills are created.

**Impact:** Users cannot filter by skills not in this hardcoded list. Reduces discoverability.

**Fix:** Fetch available skills from metadata API (like categories already are).

---

### M-04: Leaderboard icon mapping fragile

**Location:** `app/leaderboard/page.jsx:59`

**Problem:** `[Users, Rocket, Award, Flame][stats.indexOf(stat)]` — relies on array index matching. If backend reorders stats, icons break silently.

**Impact:** Wrong icons shown for leaderboard statistics.

**Fix:** Use a map keyed by stat label: `{ "Active Users": Users, "Projects Launched": Rocket, ... }`.

---

### M-05: Geist font variables unused in layout

**Location:** `app/layout.jsx:8-9`

**Problem:** `_geist` and `_geistMono` variables are assigned but never applied to any element.

**Impact:** Dead code. Confusing to maintainers.

**Fix:** Remove the unused variables or apply them to the `<html>` className.

---

### M-06: `WarningDev` dead component in layout

**Location:** `app/layout.jsx:44-48`

**Problem:** A component is defined but never exported or rendered anywhere.

**Impact:** Dead code.

**Fix:** Remove it.

---

### M-07: Matchmaking and leaderboard bypass repository layer

**Location:** `backend/src/services/matchmaking.service.js`, `backend/src/controllers/leaderboard.controller.js`

**Problem:** Both use Mongoose models directly instead of going through repositories. Bypasses any repository-level logic, sanitization, or caching.

**Impact:** Inconsistent data access patterns. Future changes to queries need to be duplicated.

**Fix:** Move queries into repository files.

---

### M-08: `styles/globals.css` orphaned duplicate

**Location:** `/Users/aman/codes/grouphub/styles/globals.css` (outside app/)

**Problem:** A `styles/globals.css` exists but `app/layout.jsx` imports `./globals.css` which resolves to `app/globals.css`. The file in `styles/` is never used.

**Impact:** Confusing. Orphaned file.

**Fix:** Delete the orphaned file.

---

### M-09: Social links have no URL validation

**Location:** `app/account/page.jsx:342-364`

**Problem:** Social link inputs accept any text. Users can enter `@handle` instead of a full URL. No client-side or URL format validation.

**Impact:** Invalid data stored. Displayed links may be broken.

**Fix:** Add URL validation with helpful placeholder text like `https://github.com/username`.

---

### M-10: Settings button in dashboard does nothing

**Location:** `app/dashboard/page.jsx:283`

**Problem:** The `<Settings>` icon button has no `onClick` handler. It renders but is non-functional.

**Impact:** User clicks expecting settings — nothing happens.

**Fix:** Either wire it to a settings page/modal, or remove it.

---

### M-11: Footer has 8 dead placeholder links

**Location:** `components/footer.jsx:14-20`, `:44-55`

**Problem:** Careers, Blog, Privacy Policy, Terms of Service, Cookie Policy, GitHub, Twitter, LinkedIn — all `href="#"`, no actual destinations.

**Impact:** Reduces trust. Users clicking these links feel frustrated.

**Fix:** Either remove the links (if not ready) or point them to real destinations.

---

### M-12: Contribute page team member data is hardcoded placeholder

**Location:** `app/about/page.jsx:12-16`

**Problem:** "Alex Chen", "Sarah Mitchell", "Marcus Johnson" — these appear to be placeholder names. If this is a solo or small team project, listing fake names reduces authenticity.

**Impact:** Misrepresents the team. Could erode trust if discovered.

**Fix:** Either list real team members or remove the section.

---

### M-13: No robots, openGraph, or twitter metadata

**Location:** `app/layout.jsx`

**Problem:** See H-08 — only title and description are set. Missing `robots`, `openGraph`, `twitter` meta.

**Impact:** SEO and social sharing both impacted.

**Fix:** Add all three metadata blocks in the root layout.

---

### M-14: Project detail page loading state is basic text

**Location:** `app/projects/[id]/page.jsx:126`

**Problem:** Shows "Loading project..." as plain text. No skeleton or shimmer.

**Impact:** Poor perceived performance.

**Fix:** Use skeleton components matching the page layout.

---

## 🟢 Low Severity

### L-01: Account page email field is readOnly but still focusable

**Location:** `app/account/page.jsx:282`

**Fix:** Add `tabIndex={-1}` to the readOnly email input.

---

### L-02: Dashboard project creation modal has no ARIA dialog role

**Location:** `app/dashboard/page.jsx:649`

**Fix:** Add `role="dialog"` and `aria-modal="true"`.

---

### L-03: Native `confirm()` in project manage page

**Location:** `app/projects/[id]/manage/page.jsx:953`

**Fix:** Replace with a custom modal.

---

### L-04: Native `alert()` in project member page

**Location:** `app/projects/[id]/member/page.jsx:590`

**Fix:** Replace with an inline banner or toast.

---

### L-05: PillInput uses array index as key

**Location:** `components/PillInput.jsx:71`

**Fix:** Use a unique id per pill rather than array index.

---

### L-06: Home page silently swallows API errors

**Location:** `app/page.jsx:24-26`

**Fix:** Show a fallback message when projects fail to load.

---

### L-07: Home page has no empty state for projects section

**Location:** `app/page.jsx:99-132`

**Fix:** Show "No projects yet — be the first to create one" when list is empty.

---

### L-08: Regex-generated username in leaderboard may collide

**Location:** `backend/src/controllers/leaderboard.controller.js:58`

**Fix:** Use the actual `username` field instead of deriving from fullName.

---

### L-09: No input length indicators on forms

**Locations:** Contact form, project create form

**Fix:** Add `maxLength` awareness with character counters.

---

### L-10: Several backend routes lack Zod validation

**Locations:** Activity routes, dashboard routes, matchmaking routes, leaderboard routes, saved-projects routes, task claim route

**Fix:** Add Zod schemas for consistency.

---

### L-11: `LOG_LEVEL` env var used but not declared in schema

**Location:** `backend/src/utils/logger.js:5`

**Fix:** Add `LOG_LEVEL` to env validation schema.

---

### L-12: 7 dead env config vars never used

**Variables:** `API_BASE_URL`, `AI_PROVIDER`, `GROQ_API_KEY`, `GROQ_MODEL`, `REDIS_URL`, `REDIS_TOKEN`, `SENTRY_DSN`

**Fix:** Remove unused vars from schema.

---

### L-13: Contribute page makes unsubstantiated claims

**Location:** `app/contribute/page.jsx:86-88`

**Fix:** "Every contribution becomes part of your project history" — if this isn't implemented, rephrase.

---

### L-14: Manage page tab loading triggers unnecessary re-fetches

**Location:** `app/projects/[id]/manage/page.jsx:877-884`

**Fix:** Add a loaded flag to prevent re-fetching already-loaded data.

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 7 |
| 🟠 High | 8 |
| 🟡 Medium | 14 |
| 🟢 Low | 14 |
| **Total** | **43** |

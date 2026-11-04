# GroupHub — Account Settings

**Status:** Implemented
**Route:** `/profile`
**Last updated:** 2026-11-04

## 1. Purpose

`/profile` is the authenticated account settings page. It lets a user:

- update their name, headline, location, and bio;
- add skills, availability, and experience level;
- link GitHub, a personal website, and LinkedIn;
- upload, download, replace, and remove a resume;
- change their password.

The page doubles as a profile preview so users can see how their information
will appear to project owners before saving.

## 2. Access

- Client page guarded by the Redux auth state.
- Waits for `auth.initialized`.
- Signed-out visitors are redirected to `/account?next=/profile`.
- After login, `/account` returns the user to a safe internal `next` path.
- All mutating API calls require the `accessToken` cookie and the
  `X-CSRF-Token` header.

## 3. User model additions

`backend/models/User.model.js` now stores:

| Field | Rules |
| --- | --- |
| `headline` | String, ≤120 characters |
| `bio` | String, ≤1000 characters |
| `location` | String, ≤80 characters |
| `skills` | Array of up to 30 strings, each ≤50 characters |
| `links.github` | String, ≤200 characters, http(s) |
| `links.website` | String, ≤200 characters, http(s) |
| `links.linkedin` | String, ≤200 characters, http(s) |
| `availability` | One of the `COMMITMENT` enum values |
| `experienceLevel` | One of the `EXPERIENCE_LEVEL` enum values |
| `resume` | `{ filename, originalName, mimeType, size, uploadedAt }` |

`password` remains `select: false`. The public serializer (`toPublicUser`) never
exposes the stored resume filename or password.

## 4. API

### `PATCH /api/auth/profile`

Auth + CSRF. Accepts any subset of:

```json
{
  "name": "Maya Chen",
  "headline": "Product designer building calmer student tools",
  "bio": "Short bio",
  "location": "Vancouver, Canada",
  "skills": ["Figma", "React"],
  "links": {
    "github": "github.com/mayachen",
    "website": "https://mayachen.design",
    "linkedin": ""
  },
  "availability": "6 hrs/week",
  "experienceLevel": "intermediate"
}
```

Behaviour:

- Trims strings and validates lengths.
- De-duplicates skills case-insensitively while preserving the first casing.
- Adds `https://` to links without a protocol, then validates that the result is
  an `http` or `https` URL.
- Empty `availability` / `experienceLevel` clears the field.
- Returns `{ message, user }` with the public user shape.

### `PATCH /api/auth/password`

Auth + CSRF. Body:

```json
{ "currentPassword": "...", "newPassword": "..." }
```

- New password must be at least 8 characters and differ from the current one.
- Current password is verified with bcrypt.
- New password is hashed with bcrypt (cost 12).
- The current session remains valid; the JWT is not rotated.

### `POST /api/auth/resume`

Auth + CSRF + multipart form field `resume`.

- Accepts `.pdf`, `.doc`, `.docx`.
- Maximum size: 5 MB.
- Stores the file under `backend/uploads/resumes/` with a generated name.
- Replaces and deletes the previous file after a successful save.
- Returns `{ message, user }`.

### `GET /api/auth/resume`

Auth only. Streams the current user's resume as an attachment. Returns `404`
when no resume is stored or the file is missing.

### `DELETE /api/auth/resume`

Auth + CSRF. Removes the metadata and deletes the stored file.

### `GET /api/auth/getMe`

Now returns the full public profile, including `resume` metadata.

## 5. UI

Layout:

- Page header with a back-to-dashboard action.
- Main column:
  - **Profile**: full name, location, headline, bio.
  - **Skills & availability**: searchable chip picker plus availability and
    experience selects.
  - **Links**: GitHub, website, LinkedIn.
  - **Save profile** action with success/error notice.
  - **Resume**: upload/replace/download/remove, with file name, size, and upload
    date.
  - **Password**: current, new, confirm, with a separate notice.
- Sticky sidebar:
  - avatar initials, name, headline, location, top skills, links;
  - profile strength meter (9 possible fields);
  - account email and role.

### Client-side validation before upload

- Extension must be `.pdf`, `.doc`, or `.docx`.
- File must be ≤5 MB.
- The file input is reset after each selection so the same file can be retried.

## 6. Resume storage notes

Resumes are stored on local disk, outside Git (`backend/uploads/` is ignored).

Production considerations:

- Local disk is ephemeral on many hosts; move to S3/GCS or another durable
  object store before deploying.
- Downloads are limited to the authenticated owner. Project owners cannot yet
  download applicant resumes; that should be added with explicit authorization
  when the application-review flow is built.
- The generated filename is never exposed to the client.

## 7. Seed data

`npm run seed` enriches seed owners with headline, bio, location, skills, links,
availability, and experience level. Passwords remain `demo-password-123`.

## 8. Verification performed

- Profile update returned the new values and persisted through `getMe`.
- Links without a protocol were normalized to `https://…`.
- Password was changed and restored.
- Resume upload, download (byte-for-byte), replace, and delete all worked.
- Unauthenticated resume access is rejected.
- Frontend production build passed.

## 9. Future work

- Email change with password confirmation.
- Avatar image upload.
- Resume access for project owners reviewing applications.
- Durable object storage for resumes.
- Account deletion and session revocation after password change.

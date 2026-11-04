# GroupHub — Project Page & Applications

**Status:** Implemented (applications are created as `Pending`; multi-step wizard)
**Route:** `/projects/[projectId]`
**Last updated:** 2026-11-04

## 1. Purpose

The project page is the public detail view for a project. It presents the full
brief, team, milestones, skills, and open roles. Each open role has an apply
action beside it, so a signed-in user can apply without leaving the page.

## 2. Access

- `GET /api/projects/:projectId` is public, with optional authentication.
- Public projects are visible to everyone.
- Private and unlisted projects are visible only to their owner.
- Applying requires authentication.
- Signed-out visitors who click an apply action are sent to
  `/account?next=/projects/:projectId`; after login they return to the project.
- Mutating requests require the `accessToken` cookie and `X-CSRF-Token`.

## 3. API

### `GET /api/projects/:projectId`

Response:

```json
{
  "project": {
    "_id": "...",
    "title": "...",
    "description": "...",
    "whyBuilding": "...",
    "targetAudience": "...",
    "currentStatus": "...",
    "category": "Education",
    "stage": "Concept",
    "status": "Recruiting",
    "commitment": "3 hrs/week",
    "compensation": "volunteer",
    "experienceLevel": "beginner",
    "location": "Austin, TX",
    "skills": ["React", "Firebase"],
    "tags": ["education", "student"],
    "milestones": [{ "title": "...", "status": "InProgress" }],
    "memberCount": 1,
    "maxTeamSize": 4,
    "applicantCount": 5,
    "ownerId": {
      "_id": "...",
      "name": "Sofia Reyes",
      "headline": "Community builder and aspiring product manager",
      "bio": "...",
      "location": "Austin, TX",
      "skills": ["Product Management", "UX Research"],
      "links": { "github": "...", "website": "...", "linkedin": "..." }
    }
  },
  "roles": [
    {
      "id": "...",
      "title": "React contributor",
      "skills": ["React", "Firebase"],
      "slots": 3,
      "status": "Open",
      "applicants": 5,
      "accepted": 2,
      "pending": 2,
      "spotsRemaining": 1,
      "viewerApplicationStatus": null
    }
  ],
  "members": [
    {
      "id": "...",
      "memberRole": "Owner",
      "roleTitle": "React contributor",
      "joinedAt": "...",
      "user": {
        "id": "...",
        "name": "Sofia Reyes",
        "headline": "...",
        "location": "...",
        "skills": ["..."],
        "links": {}
      }
    }
  ],
  "viewer": {
    "isOwner": false,
    "isMember": false,
    "applications": { "<roleId>": "Pending" }
  }
}
```

Role counts are computed from `Application` records grouped by role and status.
`spotsRemaining = max(0, slots - accepted)`.

### `POST /api/projects/:projectId/roles/:roleId/applications`

Auth + CSRF. Accepts `multipart/form-data` with the following fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `message` | string | **yes** | Why you are interested (1–1000 chars). |
| `experience` | string | no | Relevant experience (≤1000 chars). |
| `portfolioUrl` | string | no | Link to portfolio/work sample (valid http(s) URL, ≤300 chars). |
| `availability` | string | no | One of the `COMMITMENT` enum values. |
| `timezone` | string | no | IANA timezone or free text (≤80 chars). |
| `startDate` | string (date) | no | Earliest start date (ISO date). |
| `useProfileResume` | boolean | no | `"true"` to attach the resume already stored in your profile. |
| `resume` | file | no | PDF/DOC/DOCX ≤5 MB. Ignored when `useProfileResume=true`. |

Rules:

- Project must exist and be `Recruiting` or `Active`.
- Role must exist and belong to the project, with `status: "Open"`.
- Owner cannot apply to their own project.
- Active members cannot apply.
- The role must not already have `slots` accepted applications.
- One application per user per role (`409` on duplicate).
- A user may apply to different roles on the same project.
- If `useProfileResume=true` and the user has no profile resume, returns `400`.

On success:

- Creates an `Application` with `status: "Pending"`.
- Increments `Project.applicantCount`.
- Returns `201` with `{ message, application }` where `application.resume` contains `{ originalName, size, source, uploadedAt }`.

### `GET /api/projects/:projectId/applications/:applicationId/resume`

Auth required. Only the project owner can download. Streams the resume file as an attachment. Returns `404` if no resume attached.

## 4. UI

### Header

- Category and stage eyebrow.
- Project title and description.
- Status, commitment, and member count badges.
- Primary “Apply to a role” anchor and “All projects” link.

### Main column

1. **About**: why building, target audience, current status.
2. **Milestones**: progress bar, done/total, status list.
3. **Skills & tags**.
4. **Team**: member avatars, names, headlines, membership role.
5. **Open roles**: each card shows role skills, slots, applicants, pending count,
   open spots, and an apply action.

### Sidebar

- **At a glance**: stage, compensation, commitment, team size, applicants,
  location, experience, start date, target end date.
- **Project owner**: avatar, name, headline, bio, location, skills, links,
  contact, posted time.
- Share prompt.

### Apply wizard (3 steps)

**Step 1 — Your pitch**  
- *Why this role?* (required, 1–1000 chars)  
- *Relevant experience* (optional, ≤1000 chars)  
- *Portfolio / work sample URL* (optional, validated URL)

**Step 2 — Availability & resume**  
- *Availability* (select from `COMMITMENT` enum, optional)  
- *Timezone* (optional, ≤80 chars)  
- *Earliest start date* (optional date picker)  
- *Resume*: if a profile resume exists, three radio options:
  - **Use resume from your profile** (selected by default) — shows file name and size.
  - **Upload a different resume** — file input (PDF/DOC/DOCX ≤5 MB).
  - **No resume**.
  If no profile resume, only “Upload a resume (optional)” and “No resume”.

**Step 3 — Review**  
Summary of all entered fields and the chosen resume. Submit sends the application.

### Apply states

| State | Action |
| --- | --- |
| Signed out | “Sign in to apply” → `/account?next=...` |
| Owner | Disabled “Your project” |
| Member | Disabled “You are on the team” |
| Already applied | Application status badge + “Applied” |
| Project not recruiting | Disabled “Applications closed” |
| Role not open | Disabled “Applications closed” |
| No spots left | Disabled “Role filled” |
| Eligible | “Apply now” opens the wizard |

### Apply wizard behaviour

- Escape, backdrop click, and close button dismiss while idle.
- Client-side validation per step with inline errors.
- On success, closes, shows a confirmation toast, and refreshes the project data so role counts and application state update.

## 5. Links from elsewhere

- Find Projects “View project” opens the detail page.
- Dashboard owned/joined project titles, sent/received application project
  names, and recommended project titles link to the detail page.
- Login supports a safe internal `next` path, so the apply flow resumes after
  authentication.

## 6. Owner resume access

Project owners can download applicant resumes from the **Applications received**
section on the dashboard. Each received application with a resume shows a
“Resume” button that triggers a download.

## 7. Verification performed

- Project detail returned owner profile, roles, members, counts, and viewer
  state.
- Unauthenticated apply returned `401`.
- A fresh user applied successfully (`201`, `Pending`); viewer state and role
  counts updated.
- Duplicate application returned `409`.
- Owner applying to their own project returned `400`.
- Private project: anonymous `404`, owner `200`, non-owner `404`.
- Dashboard sent/received applications now include `projectId`.
- Resume upload, profile-resume reuse, and owner download all worked.
- Frontend production build passed, including the dynamic `/projects/[projectId]` route.

## 8. Known limitations / future work

- Owner accept/reject actions are not implemented; all applications stay
  `Pending`.
- Accepting an application should eventually create a `Membership`, update role
  slots, and update project counts atomically.
- No edit/archive project actions on the detail page.
- Share is a placeholder prompt; no social integrations.
- Activity is still derived rather than event-sourced.

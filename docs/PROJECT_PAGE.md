# GroupHub — Project Page & Applications

**Status:** Implemented (applications are created as `Pending`)
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

Auth + CSRF. Body:

```json
{ "message": "Optional note, up to 1000 characters." }
```

Rules:

- Project must exist and be `Recruiting` or `Active`.
- Role must exist and belong to the project, with `status: "Open"`.
- Owner cannot apply to their own project.
- Active members cannot apply.
- The role must not already have `slots` accepted applications.
- One application per user per role (`409` on duplicate).
- A user may apply to different roles on the same project.

On success:

- Creates an `Application` with `status: "Pending"`.
- Increments `Project.applicantCount`.
- Returns `201` with `{ message, application }`.

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
| Eligible | “Apply now” opens the message modal |

### Apply modal

- Optional message, maximum 1000 characters with a live counter.
- Escape, backdrop click, and close button all dismiss it while idle.
- Shows API errors inline.
- On success, closes, shows a confirmation, and refreshes the project data so
  role counts and application state update.

## 5. Links from elsewhere

- Find Projects “View project” opens the detail page.
- Dashboard owned/joined project titles, sent/received application project
  names, and recommended project titles link to the detail page.
- Login supports a safe internal `next` path, so the apply flow resumes after
  authentication.

## 6. Verification performed

- Project detail returned owner profile, roles, members, counts, and viewer
  state.
- Unauthenticated apply returned `401`.
- A new user applied successfully (`201`, `Pending`), and the viewer state and
  role counts updated.
- A second application to the same role returned `409`.
- The project owner applying to their own project returned `400`.
- Private project visibility: anonymous `404`, owner `200`, non-owner `404`.
- Frontend production build passed.

## 7. Known limitations / future work

- Owner accept/reject actions are not implemented; all applications stay
  `Pending`.
- Accepting an application should eventually create a `Membership`, update role
  slots, and update project counts atomically.
- Project owners cannot yet download applicant resumes.
- No edit/archive project actions on the detail page.
- Share is a placeholder prompt; no social integrations.
- Activity is still derived rather than event-sourced.

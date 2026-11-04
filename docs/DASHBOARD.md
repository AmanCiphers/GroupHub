# GroupHub — User Dashboard

**Status:** Implemented (MVP, read-only applications)
**Route:** `/dashboard`
**API:** `GET /api/dashboard`
**Last updated:** 2026-11-04

## 1. Purpose

The dashboard is the authenticated workspace. It answers four questions:

1. Which projects do I own and how far along are they?
2. Which teams have I joined?
3. Which applications have I sent, and what is their status?
4. Who has applied to my projects?

It also surfaces recommended projects and a recent-activity feed.

## 2. Access and auth

- The page is a client component.
- It waits for `auth.initialized` (set by the navbar's `fetchMe()` call).
- If the user is signed out, it redirects to `/account`.
- The API route uses `authenticateToken`; unauthenticated requests return `401`.
- Dashboard data is fetched only after authentication is initialised.

## 3. Data dependencies

| Model | Used for |
| --- | --- |
| `Project` | Owned projects, milestones/progress, recommended projects |
| `Membership` | Joined projects and member roles |
| `Application` | Sent and received applications |
| `ProjectRole` | Application role titles (populated) |
| `User` | Current user name; applicant names in received applications |

`Task` is not used by the dashboard yet.

## 4. API contract

### `GET /api/dashboard`

Requires the `accessToken` cookie. No CSRF token is needed because it is a `GET`.

Response (`200`):

```json
{
  "stats": {
    "myProjects": 2,
    "joinedProjects": 7,
    "applicationsSent": 3,
    "applicationsReceived": 7,
    "pendingReview": 3
  },
  "ownedProjects": [
    {
      "id": "...",
      "title": "CampusCare: daily wellness check-ins for students",
      "category": "Health & Wellness",
      "stage": "Prototype",
      "status": "Recruiting",
      "memberCount": 3,
      "spotsOpen": 3,
      "updatedAt": "2026-11-02T10:00:00.000Z",
      "progress": 33,
      "nextMilestone": "Build the weekly trend dashboard"
    }
  ],
  "joinedProjects": [
    {
      "id": "...",
      "title": "GreenRoute: the carbon-aware commute planner",
      "category": "Environment",
      "stage": "MVP",
      "status": "Recruiting",
      "memberCount": 2,
      "memberRole": "Member",
      "joinedAt": "2026-11-04T10:00:00.000Z"
    }
  ],
  "applications": [
    {
      "id": "...",
      "projectTitle": "Cue: practice rooms and honest feedback for student musicians",
      "roleTitle": "React contributor",
      "status": "Pending",
      "appliedAt": "2026-11-04T10:00:00.000Z"
    }
  ],
  "receivedApplications": [
    {
      "id": "...",
      "projectTitle": "Moodboard: collaborative inspiration boards for design teams",
      "roleTitle": "Figma contributor",
      "applicantName": "Liam O'Connor",
      "applicantEmail": "seed.liam@grouphub.local",
      "status": "Pending",
      "appliedAt": "2026-11-04T10:00:00.000Z"
    }
  ],
  "recommended": [
    {
      "id": "...",
      "title": "StudyCircle: find your perfect study partner",
      "category": "Education",
      "stage": "Concept",
      "skills": ["React", "Firebase", "Product Design", "Figma"],
      "memberCount": 1,
      "spotsOpen": 3
    }
  ],
  "activity": [
    {
      "type": "received",
      "text": "Liam O'Connor applied to Moodboard: collaborative inspiration boards for design teams",
      "timestamp": "2026-11-04T10:00:00.000Z"
    }
  ]
}
```

### Stat definitions

| Key | Definition |
| --- | --- |
| `myProjects` | `Project.countDocuments({ ownerId: userId })` |
| `joinedProjects` | Active `Membership` records where the user is not the owner |
| `applicationsSent` | `Application.countDocuments({ applicantId: userId })` |
| `applicationsReceived` | Applications whose `projectId` belongs to the user |
| `pendingReview` | Received applications with `status: "Pending"` |

### Progress and next milestone

- `progress = round(doneMilestones / totalMilestones * 100)`.
- A milestone counts as done when `status === "Done"`.
- `nextMilestone` is the first milestone that is not `Done`.
- Projects with no milestones return `progress: 0` and
  `nextMilestone: "All milestones complete"`.

### Recommendations

1. Collect distinct skills from the user's owned projects (up to 10).
2. Find public, `Recruiting` projects owned by someone else, excluding owned and
   joined projects, whose `skills` intersect that set.
3. Return the 3 most recent.
4. If none match, fall back to the 3 most recent eligible recruiting projects.

### Activity derivation

There is no dedicated activity collection. The feed merges:

- up to 3 owned projects (`Posted <title>`, using `updatedAt`);
- up to 3 sent applications (`You applied to <title>`);
- up to 3 received applications (`<name> applied to <title>`);
- up to 2 joined memberships (`You joined <title>`).

Items are sorted by timestamp descending and truncated to 6.

## 5. UI structure

```
PageHeader
  Welcome back, <first name>.
  Actions: Bell (placeholder), Settings (placeholder), New project
Stats grid (4 cards)
Main grid: [content 1fr] [aside 360px]
  Content
    My projects
      - status / category / stage badges
      - members, open spots
      - milestone progress bar + percentage
      - next milestone
      - updated time
    Joined projects
      - status + membership role
      - category / stage
      - members, joined time
    My applications
      - project, role, status, applied time
    Applications received
      - applicant avatar / name / email
      - role + project
      - status, applied time
  Aside
    Recommended
      - category, open spots, title, top 3 skills
      - link to /find-projects
    Recent activity
      - icon per event type, text, relative time
```

### States

- **Booting:** skeleton while auth is initialising.
- **Loading:** skeleton while the dashboard request is in flight.
- **Error:** message plus a Retry button that re-dispatches the thunk.
- **Empty:** each section has its own empty state with a relevant call to action.

### Deliberate decisions

- "Active projects" and "Open roles" stat cards were removed by request. The four
  stats now map to the two project lists and the two application lists.
- Bell and Settings remain visible but are not wired yet.
- Applications are read-only. There is no accept/reject or apply flow in this
  iteration.
- The dashboard uses a single aggregate endpoint rather than several resource
  calls, to keep the page to one request.

## 6. Seed demo data

`cd backend && npm run seed` creates:

- 6 demo owners (password `demo-password-123`);
- 12 projects;
- 12 project roles;
- 48 applications;
- memberships that make seed users members of each other's projects.

Example logins:

- `seed.maya@grouphub.local`
- `seed.aarav@grouphub.local`

Seeding is idempotent for seed-owned data and refuses to run in production unless
`--force` is passed.

## 7. Future work

- Accept/reject received applications (requires role/slot updates and
  membership creation). See `PROJECT_PAGE.md` for the current apply flow.
- Task board and milestone management.
- Notifications (Bell) and additional workspace settings beyond `/profile`.
- Real activity event log (`ActivityEvent`) if history must be durable.
- User skills/interests to improve recommendations.
- Saved/bookmarked projects (currently local-only on Find Projects).

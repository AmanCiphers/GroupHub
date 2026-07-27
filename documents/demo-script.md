# GroupHub Demo Video Script (3 minutes)

---

## [0:00–0:15] Hook

**Visual:** Landing page hero with tagline "Find the right team for your project, or the right project for your skills."

**VO:** "You have an idea but no team. Or you have skills but no project. GroupHub solves both sides — it matches you with projects and people based on what actually fits."

---

## [0:15–0:45] Sign Up & Profile
 
**Visual:** Click "Get Started" → sign-up form → fill name, email, password → submit → land on account page

**VO:** "Sign up takes seconds. Once you're in, build your profile — add your skills, your interests, your availability and experience level. Every field feeds into the matchmaking engine."

**Visual:** Type skills into pill input ("React", "TypeScript", "UI/UX"), type interests ("Technology", "Design"), set availability to 15 hrs/week

**VO:** "Skills and interests are entered as pills — just type and press enter. The matchmaking algorithm uses five dimensions to score compatibility: skills, interests, availability, experience level, and reputation."

---

## [0:45–1:15] Dashboard & Matchmaking

**Visual:** Navigate to dashboard → show stats cards (Active Projects, Open Roles, etc.) → scroll to Recommended sidebar

**VO:** "The dashboard gives you an overview of your projects, applications, and incoming requests. But the most useful piece is the recommended projects sidebar — this is the matchmaking engine at work."

**Visual:** Point at match score percentages shown on recommended project cards

**VO:** "Every project gets a score from 0 to 100 based on how well it fits your profile. The algorithm considers whether your skills overlap with what the project needs, whether the category matches your interests, and whether the time commitment aligns with your availability."

---

## [1:15–1:45] Browsing Projects

**Visual:** Navigate to Find Projects page → show full project list with AI Fit scores

**VO:** "The find-projects page lets you browse every open project. Each one shows an AI fit score — sign in to see yours. You can filter by category or search by keyword."

**Visual:** Click filter categories, type in search bar, point at a project card

**VO:** "Click into any project to see the details — open roles, required skills, team spots, and the project's progress. If it looks like a good fit, you can apply directly."

**Visual:** Click into a project → show open roles → click Apply

**VO:** "Tell the owner why you're a good match, and your application is sent instantly."

---

## [1:45–2:15] Managing Projects & Team

**Visual:** Go back to dashboard → show incoming applications → Accept an applicant

**VO:** "If you own a project, incoming applications appear in your dashboard. Review them, accept or reject — when you accept, the role slot is filled atomically so no two applicants can take the same spot."

**Visual:** Click into a project's Manage page → show team members

**VO:** "Approved members get access to a team dashboard with task management, an activity feed, and a member directory."

**Visual:** Show task list, point at status columns (To Do, In Progress, Done)

**VO:** "Tasks can be assigned or claimed, with priorities and due dates. The team can track progress at a glance."

---

## [2:15–2:45] Security & Deployment

**Visual:** Quick split-screen: browser DevTools Application tab showing httpOnly cookie vs localStorage (no token visible)

**VO:** "From day one, security was built in. JWT access tokens are stored in httpOnly signed cookies, not localStorage — XSS can't steal them. Refresh tokens use rotation: every refresh issues a new token and revokes the old one."

**Visual:** Show the Deployed On badges: Vercel + Render

**VO:** "The frontend runs on Vercel, the backend on Render. Cross-origin auth works with SameSite=None cookies, CSP headers, and CSRF validation on every state-changing request."

---

## [2:45–3:00] Close

**Visual:** Back to landing page → fade to GroupHub logo

**VO:** "GroupHub is open source. Check it out on GitHub, contribute, or just sign up and find your next project. The right team is waiting."

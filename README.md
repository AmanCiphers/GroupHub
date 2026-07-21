# GroupHub

> Find the right team for your project, or the right project for your skills.

## About the Project

### Inspiration

So here's the problem I kept running into. I'd meet people who had cool ideas but zero team to build them with. And on the flip side, I knew people with serious skills who were bored — they wanted to contribute to something but had no idea where to look.

The existing options aren't great. Freelance platforms are a noisy mess. Job boards are too rigid — you either get the role or you don't, there's no in-between. And neither of them tells you "hey, this project actually fits you."

So I thought — what if there was a middle ground? What if a platform could look at your skills, your interests, your availability, and just tell you which projects you'd be a good fit for? Before you even apply.

That's how GroupHub started.

### How I Built It

The app has two parts. A Next.js frontend on Vercel — that's what you see and interact with. And an Express API on Render with MongoDB — that's where the auth, matchmaking, and data live.

The matchmaking engine is the heart of the app. It scores every project against your profile across five dimensions:

| Dimension | Weight | Max points |
|---|---|---|
| Skills overlap | $w_s = 0.35$ | 35 |
| Interest $\times$ category | $w_i = 0.20$ | 20 |
| Availability fit | $w_a = 0.20$ | 20 |
| Experience $\times$ stage | $w_e = 0.10$ | 10 |
| Reputation | $w_r = 0.15$ | 15 |

The final score works like this:

$$
\text{score} = \lfloor w_s \cdot S(u, p) + w_i \cdot I(u, p) + w_a \cdot A(u, p) + w_e \cdot E(u, p) + w_r \cdot R(u) \rfloor
$$

Each piece is normalized to a 0-to-1 scale:

- $S(u, p)$ = what fraction of the project's skills you actually have
- $I(u, p)$ = 1 if any of your interests match the project category, 0 otherwise
- $A(u, p)$ = $\max(0, 1 - |h_u - h_p| / 80)$ — how well your weekly hours line up with theirs
- $E(u, p)$ = pulled from a lookup table that maps experience levels to project stages
- $R(u)$ = $\min(\text{reputation} / 100, 1)$ — reputation points, capped at 100

If you already own the project or are a member, it's excluded. Everything gets sorted by score and capped at whatever limit you set.

The same algorithm runs in reverse too — `recommendMembers` scores people against a project using the exact same weights. So when you add skills to your profile, you don't just get better recommendations — you become more discoverable too.

### What I Learned

**Security layers fail silently, and that's terrifying.** I deployed the frontend on Vercel and the backend on Render — different domains. Three things had to line up for auth to work: CORS, CSRF, and SameSite cookies. Each one blocks authentication independently. The worst was SameSite: the cookie was set perfectly, the backend was sending it, but the browser just... dropped it. No error. No warning. Just an empty cookie header and a 401. Took me way too long to figure out why users were logging in and getting kicked out one second later.

**httpOnly cookies are a pain to set up, but absolutely worth it.** Moving JWT tokens out of localStorage meant touching every layer — cookie helpers on the backend, middleware that reads signed cookies, stripping all the token logic from the frontend API client. But the payoff is that no XSS attack can steal the token now. It's invisible to JavaScript.

**A two-sided marketplace is only as good as both sides working.** I made sure the matchmaking is symmetric — recommending projects to people and people to projects use the exact same logic. That way, filling out your profile doesn't just help you find projects, it helps projects find you.

### The Hard Parts

**Deploying cross-origin auth was a three-round fight.** Round one: CORS blocks everything because my custom domain isn't in the allowlist. Round two: CSRF blocks everything because the env var isn't set on Render. Round three: auth finally works, but only for one second, then the user gets silently logged out — SameSite cookie issue. Each round felt like "okay NOW it's fixed" until the next error showed up.

**Email verification without ruining the signup flow.** The security audit rightfully called out that anyone could sign up with a fake email and start using the platform immediately. But blocking login until verification felt harsh for an MVP. The compromise: verification emails go out asynchronously, the user gets in right away, and the `emailVerified` flag is there for when I need to gate sensitive actions later.

**A silly but annoying bug — inconsistent scores.** The backend was returning scores like 85.2 (rounded to one decimal). The dashboard displayed it raw. The find-projects page rounded it to an integer. Same project, two different numbers. Fix was trivial — round at the source — but it was one of those bugs that makes you look sloppy until you catch it.

---

## Features

- **AI matchmaking** — Projects and members scored by skills, interests, availability, experience, and reputation
- **Skill-based profiles** — Pill input UI for adding/removing skills and interests with autocomplete suggestions
- **Project management** — Create projects with open roles, track applications, manage team members
- **Application workflow** — Apply to open roles, accept/reject applicants, atomic slot filling prevents overallocation
- **Team dashboard** — Task management, activity feed, member directory, project progress tracking
- **httpOnly auth** — JWT access tokens in signed cookies, refresh token rotation, CSRF protection
- **Email verification** — Resend-powered verification flow with development-mode console fallback
- **Rate limiting** — Tiered limits per endpoint (auth, refresh, public, API)
- **Security headers** — CSP, HSTS, XFO, Referrer-Policy, Permissions-Policy via Next.js config

---

## Tech Stack

### Frontend
- Next.js (App Router)
- React
- Tailwind CSS
- Lucide React Icons
- Deployed on **Vercel**

### Backend
- Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs, zod, helmet, cors, express-rate-limit
- Resend (email)
- Deployed on **Render**

---

## Project Structure

```
grouphub/
├── app/                    # Next.js App Router pages
│   ├── account/            # Login, register, profile management
│   ├── dashboard/          # User dashboard, projects, applications
│   ├── find-projects/      # Browse and search projects
│   ├── projects/           # Project detail, manage, member view
│   └── verify-email/       # Email verification page
├── backend/
│   └── src/
│       ├── config/         # Env, CORS, DB config
│       ├── controllers/    # Route handlers
│       ├── middlewares/     # Auth, rate limit, validation, CSRF
│       ├── models/         # Mongoose schemas
│       ├── repositories/   # Data access layer
│       ├── routes/         # Express routers
│       ├── services/       # Business logic (auth, matchmaking, email)
│       └── utils/          # Crypto, error helpers, validation
├── components/             # Shared React components
├── lib/                    # Frontend utilities (API client)
├── public/                 # Static assets, favicon, blogs
└── docs/                   # Reference documentation (gitignored)
```

---

## Getting Started

### Prerequisites
- Node.js >= 20
- MongoDB instance (Atlas or local)
- Resend API key (optional, verification falls back to console)

### 1. Clone

```bash
git clone https://github.com/AmanCiphers/GroupHub.git
cd grouphub
```

### 2. Install dependencies

```bash
cd backend && npm install && cd ..
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Fill in your MongoDB URI, JWT secrets, etc.
```

### 4. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## License

MIT

## Author

Built by [Aman](https://github.com/AmanCiphers).

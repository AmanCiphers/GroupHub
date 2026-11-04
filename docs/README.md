# GroupHub Documentation

| Document | Purpose |
| --- | --- |
| [`IMPLEMENTATION_LOG.md`](./IMPLEMENTATION_LOG.md) | Chronological, detailed record of engineering work, decisions, verification, and known limitations. |
| [`DASHBOARD.md`](./DASHBOARD.md) | Feature specification for the authenticated user dashboard: API contract, stats, UI sections, seed data, and future work. |
| [`PROJECT_ARCHITECTURE.md`](./PROJECT_ARCHITECTURE.md) | Historical architecture snapshot dated 15 October 2026. Useful for broader context, but it predates the project-domain backend, seeded data, discovery filters, and the dashboard. |

## Current source vs. old documents

`PROJECT_ARCHITECTURE.md` describes an earlier state of the repository. For
current behaviour, prefer:

1. the source code;
2. `IMPLEMENTATION_LOG.md`;
3. `DASHBOARD.md`.

## Quick reference

```bash
# API
cd backend
npm run dev      # http://localhost:8762
npm run seed     # seed demo projects, roles, memberships, applications

# Web
cd frontend
npm run dev      # http://localhost:3000
npm run build    # production build
```

Seed accounts use the password `demo-password-123` (for example,
`seed.maya@grouphub.local`).

> `npm run lint` is currently not runnable because ESLint is not installed or
> declared in `frontend/package.json`.

# GroupHub — Complete Project Documentation

> **For personal reference & portfolio interviews**
> Built by Aman

---

## Table of Contents
1. [The Idea](#1-the-idea)
2. [Tech Stack & Why](#2-tech-stack--why)
3. [Architecture Overview](#3-architecture-overview)
4. [Design System](#4-design-system)
5. [Component Architecture](#5-component-architecture)
6. [Page-by-Page Deep Dive](#6-page-by-page-deep-dive)
7. [shadcn/ui Components](#7-shadcnui-components)
8. [Responsive Strategy](#8-responsive-strategy)
9. [Challenges & Solutions](#9-challenges--solutions)
10. [Deployment Checklist](#10-deployment-checklist)

---

## 1. The Idea

### Problem
Students, developers, and creators have ideas they want to build but struggle to find teammates with the right complementary skills. Existing platforms (LinkedIn, Behance, GitHub) are passive portfolios — they don't actively match people to open roles within projects.

### Solution
A **project-first collaboration platform** where:
- Users post project ideas with specific open roles (e.g., "looking for a React frontend dev and a UI designer")
- Contributors browse projects by category, skill, and role
- Each project page shows roles, commitment level, stage, and team size upfront
- Leaderboard gamifies contributions with points and badges

### Target User
Students and early-career professionals who want to build portfolio projects with real teams rather than working alone.

### Key Differentiator
Role-first matching. Most platforms show projects; GroupHub shows **open roles within projects** first. You're not browsing "projects" — you're browsing "frontend roles," "design roles," etc. This reduces friction: you know immediately if there's a spot for your skill set.

---

## 2. Tech Stack & Why

### Frontend
| Technology | Why |
|------------|------|
| **Next.js 16.2.4** | App Router, file-based routing, RSC support, code splitting |
| **React 19** | Latest React |
| **Tailwind CSS v4** | CSS-first config via `@tailwindcss/postcss`, no `tailwind.config.js` |
| **shadcn/ui (New York)** | Copy-paste component system on Radix primitives, `data-slot` pattern |
| **Radix UI** | 26 accessible headless primitives (dialog, dropdown, select, tabs, etc.) |
| **lucide-react** | Consistent icon library, tree-shakeable |
| **class-variance-authority** | Variant-based styling for components |
| **clsx + tailwind-merge** | `cn()` utility for conflict-free className merging |
| **tw-animate-css** | Tailwind v4 animation utilities (fade, slide, zoom) |
| **recharts** | Charts (used in dashboard analytics) |
| **embla-carousel-react** | Touch-optimized carousel |
| **vaul** | Drawer component |
| **react-hook-form + zod** | Form validation |
| **sonner** | Toast notifications |
| **next-themes** | Theme switching (dark/light) |
| **date-fns** | Date formatting |
| **cmdk** | Command palette / search |

### No Backend
GroupHub is **frontend-only** with hardcoded demo data. All forms, filters, and interactions work with local state. There's no authentication, no database, no API calls. This is intentional — it's a **UI prototype / landing page** demonstrating the product concept.

### Why No TypeScript?
The project uses `.jsx` files throughout. TypeScript is listed as a devDependency but `next.config.mjs` sets `typescript: { ignoreBuildErrors: true }`. The components.json confirms `"tsx": false`.

### Build Configuration
- **Webpack** (not Turbopack) — `next dev --webpack` in package.json scripts
- **Vercel Analytics** — production only via `<Analytics />` component
- **Images** — unoptimized (`images: { unoptimized: true }`)
- **PostCSS** — `@tailwindcss/postcss` plugin (Tailwind v4)

---

## 3. Architecture Overview

### Routes

| Route | Type | Purpose |
|-------|------|---------|
| `/` | Server | Landing / Hero page |
| `/about` | Server | About the platform, mission, team |
| `/account` | Client | Login / Sign-up forms (non-functional) |
| `/contact` | Client | Contact form, FAQ accordion |
| `/contribute` | Server | Contribution types, featured projects |
| `/dashboard` | Client | User workspace, projects, stats, activity |
| `/find-projects` | Client | Project discovery with search/filter/save |
| `/leaderboard` | Server | Top contributors ranking with stats |
| `/tutorials` | Server | Learning guides grid |

### Page Type Split

**Server Components** (no `"use client"`): Home, About, Contribute, Leaderboard, Tutorials
- Render static or mostly-static content
- No state, no event handlers
- Better performance, smaller JS bundle

**Client Components** (`"use client"`): Account, Contact, Dashboard, Find-Projects
- Use `useState` for UI state management
- Handle form inputs, filters, modals, toggles
- Each page manages its own state independently

### Global Layout

```
<html>
  <body className="font-sans antialiased min-h-screen flex flex-col">
    <Navbar />            ← changes style based on pathname
    <main className="flex-1">
      {page content}      ← each page renders here
    </main>
    <Footer />            ← consistent across all pages
    <Analytics />         ← production only
  </body>
</html>
```

---

## 4. Design System

### Theme Strategy
GroupHub uses a **dark-only theme**. There is no `.dark` class override in the active CSS file. The `@custom-variant dark (&:is(.dark *))` is declared but never triggered — the `:root` variables are already dark. A second CSS file at `styles/globals.css` has a light+dark theme but is NOT imported anywhere.

### CSS Variables (OKLCH Color Space)

| Token | Value | Perceived Color |
|-------|-------|-----------------|
| `--background` | `oklch(0.13 0.01 240)` | Near-black with blue hint |
| `--foreground` | `oklch(0.98 0 0)` | Near-white |
| `--primary` | `oklch(0.75 0.15 180)` | Teal/cyan |
| `--card` | `oklch(0.17 0.01 240)` | Very dark grey-blue |
| `--popover` | `oklch(0.17 0.01 240)` | Same as card |
| `--secondary` | `oklch(0.22 0.01 240)` | Dark grey-blue |
| `--muted` | `oklch(0.22 0.01 240)` | Same as secondary |
| `--muted-foreground` | `oklch(0.65 0 0)` | Medium grey |
| `--accent` | `oklch(0.75 0.15 180)` | Same as primary |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Red |
| `--border` | `oklch(0.28 0.01 240)` | Dark grey-blue |
| `--input` | `oklch(0.22 0.01 240)` | Same as secondary |
| `--ring` | `oklch(0.75 0.15 180)` | Teal focus ring |
| `--radius` | `0.75rem` | Border radius base |

**Why OKLCH?** OKLCH is a perceptually uniform color space — a change of X units looks like the same visual change regardless of hue. This is more modern and accurate than HSL or RGB for design tokens.

### Theme Inline Mapping (`@theme inline`)
The CSS maps variable tokens to Tailwind's design system:
```css
@theme inline {
  --color-primary: var(--primary);
  --color-background: var(--background);
  --radius-sm: calc(var(--radius) - 4px);  /* 0.5rem */
  --radius-md: calc(var(--radius) - 2px);  /* 0.625rem */
  --radius-lg: var(--radius);              /* 0.75rem */
  --radius-xl: calc(var(--radius) + 4px);  /* 1rem */
}
```
This is the Tailwind v4 way of extending the theme — instead of `tailwind.config.js` → `extend` → `colors`, you define everything in CSS.

### App-Level Color Palette (hardcoded hex in pages)

These are NOT CSS variables — they are hardcoded directly in JSX. They form the visual identity of the app:

| Hex | Name | Usage |
|-----|------|-------|
| `#f7f7f3` | Warm off-white | Main page background (landing, dashboard, etc.) |
| `#fbfbfa` | Light warm off-white | Card backgrounds, section backgrounds, navbar right panel |
| `#171717` | Near-black | Primary text, filled buttons, progress bar fill, active badges, modal overlay |
| `#2f2f2d` | Dark grey | Navbar (inner pages), hero left panel, footer, dark cards, section highlights |
| `#d9d8d2` | Light warm grey | ALL borders, dividers |
| `#62615d` | Medium warm grey | Section labels, muted text, stat labels |
| `#55544f` | Medium-dark warm grey | Body descriptions, secondary text |
| `#77766f` | Medium grey | Meta text, placeholders, stat values |
| `#efeee8` | Very light warm grey | Pending/inactive backgrounds |
| `#e5e3dc` | Light warm beige | Progress bar track |
| `#c9c8c1` | Light grey | Search input border |
| `#31312f` | Dark warm grey | Role tag text |

### Opacity Variants
White at various opacities for text on dark backgrounds:
- `white/85` — Primary text on dark
- `white/78` — Nav links (home page)
- `white/75` — Mobile menu links
- `white/70` — Secondary text on dark
- `white/65` — Footer descriptions
- `white/62` — Inactive nav links
- `white/60` — Footer links
- `white/50` — Copyright text
- `white/15` — Borders on dark

### Typography

**Fonts:**
- Sans: `Geist` (via `next/font/google`), fallback `'Geist Fallback'`
- Mono: `Geist Mono`, fallback `'Geist Mono Fallback'`
- Applied via `font-sans` on `<body>` with `antialiased`

**Font Size Scale:**
| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 12px | Badges, stat labels, timestamps |
| `text-sm` | 14px | Body, nav, buttons, descriptions |
| `text-base` | 16px | Paragraphs |
| `text-lg` | 18px | Large body, action items |
| `text-xl` | 20px | Card titles, subheadings |
| `text-2xl` | 24px | Section subheadings |
| `text-3xl` | 30px | Major headings |
| `text-4xl` | 36px | H1 (mobile) |
| `text-5xl` | 48px | H1 (desktop), match scores |
| `text-6xl` | 60px | H1 (larger desktop) |
| `text-7xl` | 72px | H1 (landing page hero, lg breakpoint) |

**Font Weights:**
- `font-medium` (500) — Desktop nav links
- `font-semibold` (600) — Body text, descriptions
- `font-bold` (700) — Emphasized text, active nav links
- **`font-black` (900)** — **DOMINANT WEIGHT.** Used for ALL headings, CTAs, badges, stat values, labels, buttons. This is the signature of the design.

**Line Heights:**
- `leading-[0.95]` — H1 (tight, dramatic)
- `leading-[1.05]` — Major section H2s
- `leading-tight` — Subheadings
- `leading-snug` — Body paragraphs
- `leading-relaxed` — Longer descriptions

**Letter Spacing:**
- `tracking-normal` — Default headings
- `tracking-[0.18em]` — Section labels (e.g., "Project-first", "About GroupHub")
- `tracking-[0.14em]` — Footer group titles, stat labels
- `tracking-[0.12em]` — Metric labels, progress labels

### Spacing Patterns

**Page Padding (consistent across ALL pages):**
```jsx
px-6 sm:px-10 lg:px-20 xl:px-28
```

**Section Padding:**
- Header sections: `py-10`, `py-12`, `py-16`
- Content sections: `py-8`, `py-12`, `py-14`, `py-20`

**Gap Scale:**
- `gap-2` — Tags, icon groups
- `gap-3` — Form fields, button groups
- `gap-4` — Card grids, stat grids
- `gap-6` — Inside cards
- `gap-8` — Grid columns, nav items
- `gap-10` — Layout columns
- `gap-12` — Major sections

**Card Padding:**
- Standard: `p-5`
- Large/featured: `p-6`, `p-7`
- Dark cards: `p-5`, `p-7`

**Button/Input Heights:**
- Buttons: `h-11` (standard), `h-10`, `h-9`
- Icon buttons: `size-11`, `size-9`
- Inputs: `h-11`, `h-14` (search)
- Avatar: `size-14`, `size-10`, `size-9`

---

## 5. Component Architecture

### File Structure
```
app/
├── globals.css              # Dark-only theme, CSS variables, @theme, base layer
├── layout.jsx               # Root layout: Geist fonts, Navbar, Footer
├── page.jsx                 # Landing page (hero + features + steps)
├── about/page.jsx           # About, mission, values, team
├── account/page.jsx         # Login/signup forms (non-functional)
├── contact/page.jsx         # Contact form + FAQ accordion
├── contribute/page.jsx      # Contribution types + featured projects
├── dashboard/page.jsx       # User workspace with stats/projects/modal
├── find-projects/page.jsx   # Project discovery with search/filter/save
├── leaderboard/page.jsx     # Top contributors with rankings
└── tutorials/page.jsx       # Tutorial cards grid

components/
├── navbar.jsx               # Responsive nav with CSS-only mobile drawer
├── footer.jsx               # Multi-column footer with link groups
└── ui/                      # 57 shadcn/ui components (New York style)

hooks/
├── use-mobile.jsx           # Mobile viewport detection (< 768px)
└── use-toast.jsx            # Toast notification system (reducer-based)

lib/
└── utils.jsx                # cn() utility

styles/
└── globals.css              # Unused alternate light+dark theme
```

### Navbar (`components/navbar.jsx`)
**Type:** Client Component (`"use client"`)

**Two rendering modes based on `pathname === "/"`:**

**Home page mode:**
- `absolute inset-x-0 top-0 z-[70]` — floats above the hero
- Two-column grid `xl:grid-cols-[1fr_29vw]` matching the hero layout
- Left col: transparent bg, logo, nav links (hidden until `xl:`)
- Right col: `bg-[#fbfbfa] text-[#171717]`, Account + Dashboard links
- Mobile menu: `<details>` element (pure HTML/CSS, no JavaScript)

**Inner page mode:**
- `sticky top-0 z-[70] border-b border-white/15 bg-[#2f2f2d] text-white`
- `min-h-[72px]` height
- Nav links visible at `lg:`, Account + Dashboard at `lg:`
- Dashboard button: `border border-white px-4 py-2 text-sm font-black`

**NativeMobileMenu component:**
Uses the `<details>` HTML element for toggle — zero JavaScript. The `<summary>` toggles between Menu/X icons. The slide-in panel uses `group-open:translate-x-0` with `transition-transform duration-300 ease-out`. Panel width: `w-[min(82vw,360px)]`.

**Active link styling:**
```jsx
className={`text-sm font-bold transition-colors hover:text-white ${
  pathname === link.href ? "text-white" : "text-white/62"
}`}
```

### Footer (`components/footer.jsx`)
**Type:** Server Component

**Layout:** `bg-[#2f2f2d] text-white border-t border-[#d9d8d2]`
**Grid:** `md:grid-cols-2 lg:grid-cols-5`
- Col 1 (span 2): Logo, description, social links (Github, Twitter, LinkedIn)
- Cols 2-4: Platform, Company, Legal link groups
- Bottom bar: Copyright with dynamic year

**Link group title:** `text-sm font-black uppercase tracking-[0.14em]`
**Link style:** `text-sm font-semibold text-white/60 hover:text-white`

---

## 6. Page-by-Page Deep Dive

### 6a. Landing Page (`app/page.jsx`)

**Type:** Server Component

**Sections:**
1. **Hero** — Two-column `lg:grid-cols-[1fr_29vw]`:
   - Left: `bg-[#2f2f2d]` dark panel with headline "Build What You Couldn't Alone", two-column action matrix (Discover Projects / Start Ideas ←→ Join Teams / Build Proof), description, CTA buttons (Get Started outlined, Browse projects ghost)
   - Right: `bg-[#fbfbfa]` illustration panel with hero image

2. **Projects showcase** — Three sample project cards (AI Study Companion, Campus Event Map, Portfolio Builder) with role tags and status badges. Cards have `hover:border-[#171717]`.

3. **How it works** — Three numbered steps with check icons, "See how it works" link

**Data flow:** All content is hardcoded in the component. No API calls.

### 6b. About Page (`app/about/page.jsx`)

**Type:** Server Component

**Layout:** Standard two-column header + content sections

**Sections:**
1. Header with "About GroupHub" label
2. Mission card (`bg-[#2f2f2d] text-white` with Target icon) + Origin card (`bg-[#fbfbfa]`)
3. Four value cards (Community First, Skill Growth, Clear Roles, Real Momentum) in `lg:grid-cols-2`
4. Team section with 4 member cards showing avatar initials, role, bio

**Avatar initials pattern:**
```jsx
name.split(" ").map((part) => part[0]).join("")
```

### 6c. Account Page (`app/account/page.jsx`)

**Type:** Client Component

**Note:** This is a **non-functional** UI prototype. No actual auth.

**Two-panel layout:**
- Left: `bg-[#2f2f2d]` dark panel with feature points
- Right: Auth form toggles between Login/Sign-up via `isLogin` state

**Form sections:**
- Social login buttons (GitHub, Google) — non-functional
- Divider with "or"
- Name field (sign-up only), Email, Password, Confirm password (sign-up only)
- Forgot password link
- Submit with ArrowRight icon
- Toggle link at bottom

**Custom Field component:**
```jsx
function Field({ icon: Icon, id, label, type, placeholder }) {
  // Icon positioned absolutely, input with pl-10
}
```

### 6d. Contact Page (`app/contact/page.jsx`)

**Type:** Client Component

**Sections:**
1. Header with "Contact" label
2. Three contact method cards (Email, Support, Office) with icons in `md:grid-cols-3`
3. Two-column layout: Contact form (name, email, subject, message) + FAQ accordion (4 questions with toggle-able answers)
4. Form submission toggles to success state via `setSubmitted(true)`

**FAQ accordion pattern (no Radix — pure CSS):**
```jsx
<details className="group">
  <summary className="cursor-pointer list-none font-bold">
    Question text
    <ChevronDown className="size-4 group-open:rotate-180 transition-transform" />
  </summary>
  <div className="mt-3 font-semibold text-[#55544f]">Answer text</div>
</details>
```

### 6e. Contribute Page (`app/contribute/page.jsx`)

**Type:** Server Component

**Sections:**
1. Header with CTA "Browse projects"
2. Three value proposition cards (Build proof, Meet builders, Earn history)
3. Six contribution type cards in responsive grid:
   - Each card has: icon (in dark square), title, description, skill tags, opening count badge
   - Categories: Development (156), Design (89), Marketing (67), Documentation (45), Mentorship (34), Testing & QA (52)
4. Three featured project cards with priority badges and needed role tags

**Contribution type card pattern:**
```jsx
<div className="border border-[#d9d8d2] bg-[#fbfbfa] p-5">
  <div className="flex size-11 items-center justify-center bg-[#2f2f2d] text-white">
    <Icon className="size-5" />
  </div>
  <h3 className="mt-4 text-xl font-black">{title}</h3>
  <p className="mt-2 text-sm font-semibold text-[#55544f]">{description}</p>
  <div className="mt-4 flex flex-wrap gap-2">{/* skills */}</div>
  <div className="border border-[#d9d8d2] px-2.5 py-1 text-xs font-black text-[#55544f]">{openings}</div>
</div>
```

### 6f. Dashboard Page (`app/dashboard/page.jsx`)

**Type:** Client Component — heavy `useState`

**Sections:**
1. **Workspace Header** — Title, Bell icon button, Settings icon button, "New project" dark button
2. **Stats Bar** — 4 cards in `sm:grid-cols-2 lg:grid-cols-4` (Active projects: 3, Open roles: 6, Applications: 5, Reputation: 1,250)
3. **Project Command section** — 3 project cards with status badges, progress bars, "N new" notifications, team size
4. **Applications section** — 3 application entries with status badges
5. **Right sidebar** — Activity feed (3 items with icons) + Recommended card (dark bg)
6. **New Project Modal** — Inline conditional overlay with form

**State:**
```js
const [showNewProject, setShowNewProject] = useState(false)
```

**Status badge classes (object lookup pattern):**
```js
const statusClass = {
  Active: "bg-[#171717] text-white",
  Recruiting: "bg-white text-[#171717] border border-[#171717]",
  Pending: "bg-[#efeee8] text-[#55544f]",
  Accepted: "bg-[#171717] text-white",
  Rejected: "bg-white text-[#77766f] border border-[#d9d8d2]",
}
```

**Progress bar:**
```jsx
<div className="h-2 bg-[#e5e3dc]">
  <div className="h-full bg-[#171717]" style={{ width: `${project.progress}%` }} />
</div>
```

**Inline modal (not shadcn Dialog):**
```jsx
{showNewProject && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171717]/70 p-4">
    <div className="w-full max-w-xl border border-[#171717] bg-[#fbfbfa] p-6">
      {/* form */}
    </div>
  </div>
)}
```

### 6g. Find Projects Page (`app/find-projects/page.jsx`)

**Type:** Client Component — most complex state management

**State:**
```js
const [searchQuery, setSearchQuery] = useState("")
const [selectedCategory, setSelectedCategory] = useState("All")
const [selectedSkill, setSelectedSkill] = useState("All")
const [savedProjects, setSavedProjects] = useState([])
```

**Layout:** `lg:grid-cols-[280px_1fr]` — sidebar filters + content

**Sidebar:**
- Category filter: 7 categories with counts (All: 248, Technology: 89, Design: 56, etc.)
- Skill filter: 10 skills (React, Python, UI/UX, etc.)

**Filter logic:**
```js
const filteredProjects = projects.filter((project) => {
  const searchable = [project.title, project.description, project.category, ...project.skills, ...project.roles]
    .join(" ").toLowerCase()
  const matchesSearch = searchable.includes(query)
  const matchesCategory = selectedCategory === "All" || project.category === selectedCategory
  const matchesSkill = selectedSkill === "All" || project.skills.includes(selectedSkill)
  return matchesSearch && matchesCategory && matchesSkill
})
```

**Project cards** show: category/stage/commitment badges, title (hover underline), description, save button (Bookmark icon toggle), role tags, skill tags, team info, match score (large number), owner avatar + posted time, "View project" button.

**Filter button states:**
- Active: `bg-[#2f2f2d] text-white`
- Inactive: `text-[#55544f] hover:bg-[#efeee8] hover:text-[#171717]`

**Search input:** `h-14 border border-[#c9c8c1] pl-12` with Search icon

**Save/bookmark toggle:**
```jsx
const [savedProjects, setSavedProjects] = useState([])
const isSaved = savedProjects.includes(project.id)
// Toggle: add or remove from savedProjects array
```

### 6h. Leaderboard Page (`app/leaderboard/page.jsx`)

**Type:** Server Component

**Sections:**
1. Header with "Leaderboard" label
2. 4 stat cards (Active contributors: 2,450, Projects completed: 1,280, etc.)
3. Period filter buttons: "All Time" (active), "This Month", "This Week" (visual only)
4. Top 3 contributors with featured cards in `lg:grid-cols-3`:
   - #1: `bg-[#2f2f2d] text-white` with Trophy icon
   - #2, #3: standard styling with Medal icon
   - Each shows: badge name, avatar initials, name, username, points/projects/helps, skill tags
5. Rows 4-10 with rank, avatar, name, points, projects
6. "How to Climb" section with 4 point-value actions (+100, +50, +25, +75)

**Metric sub-component pattern:**
```jsx
function Metric({ value, label }) {
  return (
    <div>
      <p className="text-xl font-black">{value}</p>
      <p className="text-xs font-black uppercase tracking-[0.12em] opacity-60">{label}</p>
    </div>
  )
}
```

### 6i. Tutorials Page (`app/tutorials/page.jsx`)

**Type:** Server Component

**Sections:**
1. Header with "Tutorials" label
2. Category filter buttons (All, Getting Started, Projects, Collaboration, Advanced)
3. 8 tutorial cards in `md:grid-cols-2 xl:grid-cols-4`:
   - Icon in dark square, difficulty badge, title (hover underline), description, duration + category, "Start" button
4. CTA banner: `bg-[#2f2f2d] text-white` card with "Find projects" link

---

## 7. shadcn/ui Components

57 components in `components/ui/`. All follow the New York style.

### Core Components (most used)

| Component | Key Features |
|-----------|-------------|
| **Button** | 6 variants (default, destructive, outline, secondary, ghost, link), 5 sizes (default h-9, sm h-8, lg h-10, icon size-9, icon-sm, icon-lg). Uses Slot for asChild pattern. |
| **Card** | 7 parts: Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter. `rounded-xl border py-6 shadow-sm`. |
| **Input** | Standard text input with focus ring, error state (`aria-invalid`), file input support |
| **Badge** | 4 variants (default, secondary, destructive, outline). Uses Slot for asChild. |
| **Dialog** | Radix Dialog with overlay, animated content, close button, header/footer/title/description. `max-w-[calc(100%-2rem)] sm:max-w-lg`. |
| **Select** | Full Radix Select with scroll buttons, grouped items, check icons, labels, separators |
| **Dropdown Menu** | Full Radix DropdownMenu with items, separators, labels, sub-menus, checkbox/radio items |
| **Tabs** | Radix Tabs with list, trigger, content. `bg-muted` list with `rounded-lg p-[3px]`. |
| **Tooltip** | Radix Tooltip with portal, arrow, animations |
| **Sheet** | Side panel using Radix Dialog. 4 sides (right, left, top, bottom). Animated slide-in/out. |
| **Avatar** | Radix Avatar with image + fallback. `rounded-full size-8`. |
| **Separator** | Radix Separator, horizontal or vertical |
| **Skeleton** | `bg-accent animate-pulse rounded-md` |
| **Spinner** | Lucide Loader2Icon with `animate-spin` |

### Form-Related Components
| Component | Purpose |
|-----------|---------|
| **Form** | react-hook-form integration with Field context, error states |
| **Field** | Field wrapper with orientation (vertical/horizontal/responsive), error display, separator |
| **Label** | Radix Label with peer-disabled state |
| **Textarea** | Multi-line input with `field-sizing-content` for auto-resize |
| **Checkbox** | Radix Checkbox |
| **Radio Group** | Radix RadioGroup |
| **Switch** | Radix Switch toggle |
| **Slider** | Radix Slider range input |

### Advanced Components
| Component | Purpose |
|-----------|---------|
| **Sidebar** | Full sidebar system with context, collapsible states, cookie persistence, keyboard shortcut (Cmd+B), mobile drawer, responsive behavior |
| **Chart** | Recharts wrapper for data visualization |
| **Carousel** | Embla carousel with navigation buttons and dot indicators |
| **Command** | cmdk-based command palette with search, groups, items |
| **Drawer** | Vaul-based bottom drawer |
| **Navigation Menu** | Radix NavigationMenu with viewport |
| **Context Menu** | Radix right-click menu |
| **Hover Card** | Radix hover preview card |
| **Menubar** | Radix horizontal menu |
| **Pagination** | Page navigation with previous/next and page numbers |
| **Progress** | Radix progress bar |
| **Resizable** | React-resizable-panels with horizontal/vertical groups |
| **Scroll Area** | Radix custom scrollbar |
| **Toast/Toaster** | Sonner-based toast notifications |
| **Toggle/ToggleGroup** | Radix toggle buttons |
| **Alert/AlertDialog** | Inline alerts + modal confirmations |
| **Accordion** | Radix collapsible accordion |
| **Breadcrumb** | Navigation breadcrumb trail |
| **Calendar** | React-day-picker date picker |
| **Collapsible** | Radix collapsible panel |
| **Empty** | Empty state with media, title, description, content |
| **InputGroup** | Grouped input elements |
| **InputOTP** | OTP one-time-password input |
| **Kbd** | Keyboard shortcut display |
| **Table** | Data table component |

### Writing Style (every component)
```jsx
// Function keyword, not arrow
function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

// Named exports
export { Button, buttonVariants }
```

---

## 8. Responsive Strategy

### Breakpoints Used
- Default: Mobile-first
- `sm:` — 640px (tablets)
- `md:` — 768px (tablets landscape)
- `lg:` — 1024px (desktop)
- `xl:` — 1280px (large desktop)

### Layout Patterns

**Grid stacks on mobile, goes multi-column at breakpoints:**
```jsx
// 3 cards on desktop, 2 on tablet, 1 on mobile
grid gap-4 sm:grid-cols-2 lg:grid-cols-3

// 4 stat cards
grid gap-4 sm:grid-cols-2 lg:grid-cols-4

// Sidebar layout
grid gap-8 lg:grid-cols-[280px_1fr]

// Two-column layout
grid gap-10 lg:grid-cols-[1fr_420px]

// Tutorial cards
grid gap-6 md:grid-cols-2 xl:grid-cols-4
```

**Navbar:**
- Desktop (`xl:flex`): Full nav links in two-column grid
- Tablet (`lg:flex`): Compact nav with Account/Dashboard
- Mobile (`< lg`): Hidden nav, only `NativeMobileMenu` shows

**Mobile Menu:**
- Width: `w-[min(82vw,360px)]` — 82% of viewport, capped at 360px
- Covers right side with overlay on left
- Pure CSS open/close using `<details>` + group modifiers
- Slide animation: 300ms ease-out

### Touch Considerations
- All interactive elements have sufficient tap targets (h-11 = 44px)
- Nav links on mobile: `py-2` (vertical padding adds to tap area)
- No `hover:` dependent interactions on mobile (hover effects degrade gracefully)

---

## 9. Challenges & Solutions

### Challenge 1: Tailwind v4 Migration
**Symptom:** Tailwind v4 changed the configuration approach — no `tailwind.config.js`, instead CSS-first config via `@theme inline`. The shadcn v4 components were designed for this new approach.

**Solution:** Used `@tailwindcss/postcss` plugin and `@theme inline {}` in `app/globals.css` to map CSS variables to Tailwind design tokens. Installed `tw-animate-css` for animation utilities. The `components.json` points to `app/globals.css` with empty `tailwind.config`.

### Challenge 2: Dual Theme Files
**Symptom:** Two `globals.css` files exist — `app/globals.css` (dark-only, active) and `styles/globals.css` (light+dark, unused). This creates confusion.

**Solution:** The `app/globals.css` is the only one imported (in `layout.jsx`). The `styles/globals.css` appears to be the default shadcn theme template that was left behind when the custom dark theme was built. For consistency, remove `styles/globals.css` or import the light theme if you want to support light mode.

### Challenge 3: Client vs Server Component Architecture
**Symptom:** Some pages need interactivity (state, effects, event handlers) but others don't. Using `"use client"` on every page would bloat the JS bundle.

**Solution:** Pages are strategically split:
- **Server** (no directive): Home, About, Contribute, Leaderboard, Tutorials — static content only
- **Client** (`"use client"`): Account, Contact, Dashboard, Find-Projects — forms, filters, modals, state

### Challenge 4: Mobile Menu Without JavaScript
**Symptom:** Using React state for a mobile menu toggle adds complexity (click handler, state management, overlay handling).

**Solution:** Used the native `<details>` HTML element for the mobile menu. The `<summary>` acts as the toggle button. CSS `group-open:` modifiers handle all visibility and animation. Zero JavaScript, zero state, zero re-renders.

### Challenge 5: Filter Logic Complexity
**Symptom:** The Find Projects page needs to filter by search query, category, AND skill simultaneously.

**Solution:** Single `filteredProjects` computation using `.filter()` with combined conditions:
```js
searchable.includes(query) && matchesCategory && matchesSkill
```
All in one pass, no multiple filter calls. The `searchable` string combines all search-relevant fields for simple `.includes()` matching.

### Challenge 6: No Actual Backend
**Symptom:** The app has forms (Account login, Contact message) that look functional but don't actually send data anywhere.

**Solution:** This is intentional — it's a UI prototype. The Account page toggles between login/signup visually. The Contact page simulates success with `setSubmitted(true)`. The Dashboard modal collects input but doesn't save. If you want to make it functional, add Supabase (same setup as RepRoute) for auth and data persistence.

---

## 10. Deployment Checklist

### Prerequisites
- [ ] Review and remove `styles/globals.css` if not needed (unused duplicate)
- [ ] Decide: keep as static prototype OR add Supabase for real data
- [ ] If adding Supabase: follow RepRoute's auth + RLS setup

### Vercel Deployment
1. Push code to GitHub
2. Import repo in Vercel (framework: Next.js automatically detected)
3. No environment variables needed (static app)
4. Set build command: `npm run build` (uses `next build`)
5. Deploy

### If Making Functional (Adding Supabase)
See RepRoute documentation for:
- Supabase project setup
- Database schema (workout_plans → plan_days → day_exercises etc.)
- Auth flow (use the same AuthProvider pattern)
- RLS policies

### Production Considerations
- The `next.config.mjs` has `typescript: { ignoreBuildErrors: true }` — remove if you add proper TS types
- `images: { unoptimized: true }` is fine for static assets, but remove if you use Next.js Image optimization
- The app uses Webpack (`next dev --webpack`) — you can remove the `--webpack` flag to use Turbopack for faster dev
- Vercel Analytics is production-only via `<Analytics />` component

---

## Quick Reference: Key Files to Edit

| What you want to change | File |
|--------------------------|------|
| Colors | `app/globals.css` (CSS variables in `:root`) |
| Landing page content | `app/page.jsx` |
| Navbar links | `components/navbar.jsx` (navLinks array, hardcoded) |
| Footer links | `components/footer.jsx` (footerLinks object) |
| Sample projects data | `app/find-projects/page.jsx` (projects array) |
| Dashboard projects | `app/dashboard/page.jsx` (projects/applications/activity arrays) |
| Leaderboard data | `app/leaderboard/page.jsx` (topContributors, leaderboard arrays) |
| Tutorials data | `app/tutorials/page.jsx` (tutorials array) |
| Contribution types | `app/contribute/page.jsx` (contributionTypes array) |
| Team members | `app/about/page.jsx` (team array) |
| Icons | Import from `lucide-react` (already in package.json) |
| Active theme | `app/globals.css` |
| Unused theme | `styles/globals.css` |
| Add a new page | Create `app/page-name/page.jsx`, add to `components/navbar.jsx` navLinks |
| Component styles | Each file in `components/ui/` |
| Mobile menu | `components/navbar.jsx` (NativeMobileMenu) |
| Make auth real | Add Supabase client + AuthProvider (copy from RepRoute) |

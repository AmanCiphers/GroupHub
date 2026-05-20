# CloverForge Design System

This document describes the visual design system for GroupHub. It is intended for both humans and AI coding agents. An agent reading this file should be able to replicate the design language in another application.

---

## 1. Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS v4 (CSS-first config, no tailwind.config.js) |
| Component library | shadcn/ui (New York style) on Radix UI primitives |
| Icons | lucide-react |
| Class utility | `cn()` — clsx + tailwind-merge |
| Theme switching | next-themes (not actively used; app is dark-only) |
| Animation | tw-animate-css |
| Font | Geist (sans) + Geist Mono via next/font/google |

---

## 2. cn() Utility

Every component wraps `className` with `cn()` to allow consumers to override styles:

```js
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
```

---

## 3. Color System

### 3.1 Semantic Tokens (OKLCH)

The app uses a **dark-only** theme. `:root` holds the dark palette. These tokens are mapped to Tailwind classes via `@theme inline {}` and used by shadcn components.

| Token | OKLCH | Appearance |
|---|---|---|
| `--background` | `oklch(0.13 0.01 240)` | Near-black (blue hint) |
| `--foreground` | `oklch(0.98 0 0)` | Near-white |
| `--card` | `oklch(0.17 0.01 240)` | Dark grey-blue |
| `--card-foreground` | `oklch(0.98 0 0)` | Near-white |
| `--popover` | `oklch(0.17 0.01 240)` | Dark grey-blue |
| `--popover-foreground` | `oklch(0.98 0 0)` | Near-white |
| `--primary` | `oklch(0.75 0.15 180)` | Teal/cyan |
| `--primary-foreground` | `oklch(0.13 0.01 240)` | Near-black |
| `--secondary` | `oklch(0.22 0.01 240)` | Dark grey-blue |
| `--secondary-foreground` | `oklch(0.98 0 0)` | Near-white |
| `--muted` | `oklch(0.22 0.01 240)` | Dark grey-blue |
| `--muted-foreground` | `oklch(0.65 0 0)` | Medium grey |
| `--accent` | `oklch(0.75 0.15 180)` | Teal/cyan |
| `--accent-foreground` | `oklch(0.13 0.01 240)` | Near-black |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Red |
| `--destructive-foreground` | `oklch(0.98 0 0)` | Near-white |
| `--border` | `oklch(0.28 0.01 240)` | Dark grey-blue |
| `--input` | `oklch(0.22 0.01 240)` | Dark grey-blue |
| `--ring` | `oklch(0.75 0.15 180)` | Teal focus ring |
| `--chart-1` | `oklch(0.75 0.15 180)` | Teal |
| `--chart-2` | `oklch(0.65 0.15 280)` | Purple |
| `--chart-3` | `oklch(0.7 0.2 140)` | Green |
| `--chart-4` | `oklch(0.8 0.15 60)` | Yellow |
| `--chart-5` | `oklch(0.65 0.2 340)` | Pink |
| `--sidebar` | `oklch(0.15 0.01 240)` | Darker grey-blue |
| `--sidebar-foreground` | `oklch(0.98 0 0)` | Near-white |
| `--sidebar-primary` | `oklch(0.75 0.15 180)` | Teal |
| `--sidebar-primary-foreground` | `oklch(0.13 0.01 240)` | Near-black |
| `--sidebar-accent` | `oklch(0.22 0.01 240)` | Dark grey-blue |
| `--sidebar-accent-foreground` | `oklch(0.98 0 0)` | Near-white |
| `--sidebar-border` | `oklch(0.28 0.01 240)` | Dark grey-blue |
| `--sidebar-ring` | `oklch(0.75 0.15 180)` | Teal |

Mapping in `globals.css`:
```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... every token above ... */
}
```

### 3.2 App-Level Palette (hex, used directly in JSX)

These are the actual colors used in page layouts. The semantic tokens above are only consumed by shadcn components.

| Hex | Usage |
|---|---|
| `#f7f7f3` | Page backgrounds |
| `#fbfbfa` | Card backgrounds, nav right panel |
| `#171717` | Headings, body text, filled buttons, active badges, progress bars |
| `#2f2f2d` | Dark card backgrounds, hero left, navbar inner, footer |
| `#d9d8d2` | ALL borders and dividers |
| `#62615d` | Section labels, muted text |
| `#55544f` | Body descriptions, secondary text |
| `#77766f` | Meta text, placeholder text |
| `#efeee8` | Pending/inactive backgrounds |
| `#e5e3dc` | Progress bar track |
| `#c9c8c1` | Search input border |
| `#31312f` | Role tag text |
| `#4a4945` | Body text (variant) |

### 3.3 White Opacity on Dark Backgrounds

Used when text sits on `#2f2f2d` or `#171717` backgrounds:

| Opacity | Usage |
|---|---|
| `white/85` | Primary text on dark |
| `white/78` | Nav links (home page) |
| `white/75` | Body text on dark |
| `white/70` | Secondary text on dark |
| `white/65` | Footer descriptions |
| `white/62` | Inactive nav links |
| `white/60` | Footer links |
| `white/50` | Copyright text |
| `white/30` | Ultra-muted text |
| `white/15` | Borders on dark backgrounds |
| `white/10` | Menu dividers |

---

## 4. Typography

### 4.1 Fonts

```js
import { Geist, Geist_Mono } from "next/font/google"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })
```

Applied: `body className="font-sans antialiased"` (font-sans = Geist via Tailwind config).

### 4.2 Size Scale

| Tailwind | Size | Common usage |
|---|---|---|
| `text-xs` | 12px | Badges, stat labels, timestamps |
| `text-sm` | 14px | Body, nav links, buttons, descriptions |
| `text-base` | 16px | Paragraphs |
| `text-lg` | 18px | Large body, action items |
| `text-xl` | 20px | Card titles, subheadings |
| `text-2xl` | 24px | Section subheadings, card titles |
| `text-3xl` | 30px | Major subheadings |
| `text-4xl` | 36px | H1 (mobile) |
| `text-5xl` | 48px | H1 (desktop), match scores |
| `text-6xl` | 60px | H1 (larger desktop) |
| `text-7xl` | 72px | H1 (landing hero, lg breakpoint) |

### 4.3 Weights

| Weight | Tailwind | Usage |
|---|---|---|
| 500 | `font-medium` | Desktop nav links |
| 600 | `font-semibold` | Body text, descriptions, inputs |
| 700 | `font-bold` | Emphasized text, active nav, skill tags |
| 900 | `font-black` | **ALL headings, CTAs, badges, labels, buttons, stat values** |

`font-black` is the dominant weight — use it for every heading, label, badge, button text, and statistic.

### 4.4 Line Height

| Value | Usage |
|---|---|
| `leading-[0.95]` | H1 (extremely tight) |
| `leading-[1.05]` | Major section H2 |
| `leading-tight` | Subheadings |
| `leading-snug` | Body paragraphs |
| `leading-relaxed` | Longer descriptions |

### 4.5 Letter Spacing

| Value | Usage |
|---|---|
| `tracking-normal` | Default |
| `tracking-[0.18em]` | Section labels ("Project-first", "About GroupHub") |
| `tracking-[0.14em]` | Footer group titles, stat labels, filter headings |
| `tracking-[0.12em]` | Metric labels, progress labels, category badges |
| `tracking-widest` | Dropdown menu shortcuts |

Section labels are typically **uppercase + letter-spaced**.

---

## 5. Border Radius

| Token | Value | Computed |
|---|---|---|
| `--radius` (base) | `0.75rem` | 12px |
| `--radius-sm` | `calc(var(--radius) - 4px)` | 8px |
| `--radius-md` | `calc(var(--radius) - 2px)` | 10px |
| `--radius-lg` | `var(--radius)` | 12px |
| `--radius-xl` | `calc(var(--radius) + 4px)` | 16px |

Card default: `rounded-xl`.

---

## 6. Shadows

| Class | Usage |
|---|---|
| `shadow-xs` | Buttons, inputs (shadcn default) |
| `shadow-sm` | Cards, sidebar inset |
| `shadow-md` | Dropdown menus |
| `shadow-lg` | Dialogs, sheets |
| `shadow-xl` | Chart tooltips |
| `shadow-2xl` | Mobile menu panel |

---

## 7. Spacing

### 7.1 Page Padding (every page)

```
px-6 sm:px-10 lg:px-20 xl:px-28
```

### 7.2 Section Vertical Padding

| Class | Usage |
|---|---|
| `py-8` | Compact sections |
| `py-10` | Section headers |
| `py-12` | Standard sections |
| `py-14` | Feature sections |
| `py-16` | Major sections, headers |
| `py-20` | Hero sections |

### 7.3 Card Padding

| Class | Context |
|---|---|
| `p-4` | Compact cards, table rows |
| `p-5` | **Standard** card padding |
| `p-6` | Large modals, dashboard cards |
| `p-7` | Featured / dark cards |
| `p-8` | CTA banners |
| `p-10` | Empty states |

### 7.4 Gap Scale

| Class | Usage |
|---|---|
| `gap-1.5` | Breadcrumbs, toggle items |
| `gap-2` | Tags, icon groups, form items |
| `gap-3` | Form fields, button groups |
| `gap-4` | Card grids, stat grids |
| `gap-5` | Section elements |
| `gap-6` | Inside cards |
| `gap-7` | Sidebar filter sections |
| `gap-8` | Grid columns, nav items |
| `gap-10` | Layout columns |
| `gap-12` | Major content areas |

### 7.5 Sizing (Buttons, Inputs, Icons)

| Class | Usage |
|---|---|
| `h-9` | Default button height (shadcn) |
| `h-10` | Large buttons, icon containers |
| `h-11` | **Standard app button height** |
| `h-14` | Search input |
| `size-4` (16px) | Default icon |
| `size-5` (20px) | Standard icon in content |
| `size-7` (28px) | Medium icon |
| `size-8` (32px) | Avatar default |
| `size-9` (36px) | Icon button |
| `size-10` (40px) | Large icon button, avatar |
| `size-11` (44px) | Icon button container |
| `size-12` (48px) | Feature icon circle |
| `size-14` (56px) | Team avatar, metric icon |

---

## 8. Breakpoints

| Prefix | Min-width | Usage |
|---|---|---|
| *(none)* | 0 | Mobile-first single column |
| `sm:` | 640px | Two-column grids |
| `md:` | 768px | Multi-column layouts |
| `lg:` | 1024px | Desktop sidebar + content |
| `xl:` | 1280px | Large desktop |

---

## 9. Layout Patterns

### Sidebar + Content
```jsx
<div className="grid gap-8 lg:grid-cols-[280px_1fr]">
```

### Two-Column Hero / Header
```jsx
<div className="grid gap-10 lg:grid-cols-[1fr_420px]">
<div className="grid gap-10 lg:grid-cols-[1fr_360px]">
<div className="lg:grid-cols-[1fr_29vw]">
```

### Grids
```jsx
// Stats
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

// Cards
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

// Footer
<div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
```

### Inline Modal / Overlay
```jsx
{showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171717]/70 p-4">
    <div className="w-full max-w-xl border border-[#171717] bg-[#fbfbfa] p-6">
      {/* content */}
    </div>
  </div>
)}
```

---

## 10. Component State Patterns

### 10.1 Filter Button (Active / Inactive)
```jsx
// Active
"border-[#171717] bg-[#171717] text-white"
// Inactive
"border-[#d9d8d2] text-[#55544f] hover:bg-[#efeee8] hover:text-[#171717]"
```

### 10.2 Status Badge (Object Lookup)
```js
const statusStyles = {
  Active:    "bg-[#171717] text-white",
  Recruiting:"bg-white text-[#171717] border border-[#171717]",
  Pending:   "bg-[#efeee8] text-[#55544f]",
  Accepted:  "bg-[#171717] text-white",
  Rejected:  "bg-white text-[#77766f] border border-[#d9d8d2]",
}
```

### 10.3 Dark Card Highlight
```jsx
// First/featured card gets inverted colors
className={
  index === 0
    ? "border-[#171717] bg-[#2f2f2d] text-white"
    : "border-[#d9d8d2] bg-[#fbfbfa]"
}
```

### 10.4 Initials Avatar
```jsx
{name.split(" ").map(part => part[0]).join("")}
```

---

## 11. Animation Classes (tw-animate-css)

| Class | Usage |
|---|---|
| `animate-in fade-in-0 zoom-in-95` | Dialog, Sheet, DropdownMenu enter |
| `animate-out fade-out-0 zoom-out-95` | Dialog, Sheet, DropdownMenu exit |
| `slide-in-from-top-2` / `slide-out-to-top` | Top panels |
| `slide-in-from-right-2` / `slide-out-to-right` | Right panels |
| `slide-in-from-bottom-2` / `slide-out-to-bottom` | Bottom sheets |
| `slide-in-from-left-2` / `slide-out-to-left` | Left panels |
| `animate-pulse rounded-md` | Skeleton loading |
| `animate-spin` | Spinner |
| `transition-all duration-200 ease-linear` | Sidebar resize |
| `transition-transform duration-300 ease-out` | Mobile menu slide |

---

## 12. shadcn/ui Components Used

This project uses shadcn/ui **New York** style. 57 components are available under `components/ui/`. Key components include:

| Component | Notes |
|---|---|
| Button | 6 variants (default, destructive, outline, secondary, ghost, link), 5 sizes (default, sm, lg, icon, xl). Uses cva + slot. |
| Card | 7 parts (Card, Header, Title, Description, Content, Footer, Action). `rounded-xl border shadow-sm py-6`. |
| Badge | 4 variants. Slot/asChild pattern. |
| Dialog | Radix + animated overlay. `data-[state=open]:animate-in ...` |
| Sheet | Side panel, 4 sides. `data-[state=open]:animate-in ...` |
| Sidebar | 22 sub-components. Full sidebar system with collapsible sections. |
| Avatar | Image + initials fallback. `rounded-full` |
| Input | Focus ring via ring-offset + ring-color. Error state. |
| DropdownMenu | Full Radix dropdown with submenus, check items, radio items. |
| Tabs | `rounded-lg p-[3px]` list container. |
| Skeleton | `animate-pulse rounded-md bg-muted` |
| Tooltip | Radix tooltip with arrow. |

General shadcn patterns:
```jsx
'use client'
import * as Primitive from '@radix-ui/react-primitive'
import { cn } from '@/lib/utils'

const Comp = React.forwardRef(({ className, ...props }, ref) => (
  <Primitive.Root
    ref={ref}
    data-slot="comp-name"
    className={cn('tailwind-base-classes', className)}
    {...props}
  />
))
Comp.displayName = 'Comp'
```

---

## 13. Server vs Client Components

- **Server** (static, no `"use client"`): landing page, about, leaderboard, tutorials, contribute
- **Client** (`"use client"`): dashboard, find-projects, contact, account, navbar

---

## 14. Implementation Checklist

To replicate this design system in another app:

1. Set up Next.js + Tailwind CSS v4 (PostCSS with `@tailwindcss/postcss`)
2. Add `@theme inline {}` block in globals.css mapping all OKLCH tokens to Tailwind color classes
3. Install and configure: `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `tw-animate-css`
4. Create `cn()` utility
5. Import Geist + Geist Mono via next/font/google, set `font-sans` on body
6. Copy over `components/ui/` (the 57 shadcn components) — or re-init shadcn with New York style
7. Apply page padding: `px-6 sm:px-10 lg:px-20 xl:px-28`
8. Use `font-black` as the default weight for all headings, labels, badges, buttons
9. Use the app-level hex palette (section 3.2) for all page-level styles
10. Use the semantic OKLCH tokens (section 3.1) for shadcn component styles
11. Status badges use the object-lookup pattern (section 10.2)
12. Filter toggles use the active/inactive class pair (section 10.1)

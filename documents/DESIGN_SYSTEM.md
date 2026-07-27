# GroupHub Design System

## Purpose

This document is the source of truth for GroupHub's current design language as of June 2, 2026. It combines a codebase audit with a practical handbook for designers and developers working in this repository.

The current system is made of two layers:

1. A broad shadcn/Radix primitive layer in `components/ui/*`
2. A custom GroupHub product layer in `app/*`, [`components/navbar.jsx`](/Users/aman/codes/grouphub/components/navbar.jsx), and [`components/footer.jsx`](/Users/aman/codes/grouphub/components/footer.jsx)

The product layer is the clearest expression of the brand today. The primitive layer is more generic and is not yet fully aligned with the marketing and app surfaces.

## Design Philosophy

### Visual Personality

GroupHub currently reads as:

- Serious, practical, and editorial
- High-contrast but not flashy
- Product-focused rather than community-social
- Warm-neutral rather than sterile grayscale

The dominant visual signature is a charcoal and ivory pairing with strong black-weight typography, restrained accents, and dense information cards.

### Brand Characteristics

- Collaborative: layouts emphasize teams, roles, and shared momentum
- Structured: borders, sections, and card groupings make work feel organized
- Direct: copy is short, confident, and functional
- Human: warm off-whites and soft neutrals reduce the coldness of a typical dark SaaS palette

### Design Principles

- Lead with structure before decoration
- Make hierarchy obvious through weight and spacing
- Use contrast to communicate importance
- Keep layouts modular and card-friendly
- Prefer meaningful density over empty minimalism

### UX Philosophy

- Project-first over profile-first
- Fast scanning over ornamental complexity
- Clear calls to action over feature overload
- Mobile layouts should collapse cleanly without hiding primary paths

### Accessibility Principles

Strengths already present:

- Semantic headings and landmark structure across pages
- Strong text contrast on the branded product pages
- Keyboard-close behavior in the mobile menu
- Reusable UI primitives built on accessible Radix foundations

Gaps to address:

- Many branded forms use raw inputs instead of shared accessible field primitives
- Some image logos use empty `alt` text inside interactive links
- Button and link styling is sometimes visually strong but not tokenized
- Live status and feedback patterns are not yet standardized across the product layer

### Component Philosophy

The intended direction should be:

- Radix-backed primitives provide accessibility and API consistency
- Product components apply GroupHub's tone, spacing, and layout patterns
- Page templates assemble primitives instead of hand-rolling new patterns each time

Today, the repository is between those stages.

## Foundations

### Color System

The product currently uses two color systems.

#### A. Runtime product palette used on pages

This is the visible brand language in `app/*`.

| Token | Value | Current role |
| --- | --- | --- |
| `ink-950` | `#171717` | Primary text, strong borders, active states |
| `surface-900` | `#2f2f2d` | Hero panels, footer, dark cards |
| `paper-0` | `#ffffff` | Interior cards, inputs, contrast chips |
| `canvas-25` | `#fbfbfa` | Section surface |
| `canvas-50` | `#f7f7f3` | Page background |
| `line-200` | `#d9d8d2` | Default borders and dividers |
| `line-300` | `#c9c8c1` | Stronger input border variant |
| `muted-600` | `#77766f` | Secondary labels |
| `muted-650` | `#62615d` | Eyebrows, metadata |
| `muted-700` | `#55544f` | Supporting body copy |
| `muted-750` | `#4a4945` | Denser body copy on light panels |
| `wash-100` | `#efeee8` | Subtle selected or pending backgrounds |
| `track-150` | `#e5e3dc` | Progress track |

Why this palette exists:

- The warm neutrals keep the product grounded and less generic than pure gray
- Dark surfaces establish confidence and contrast for hero moments
- Borders do a large amount of visual organization work
- The absence of a saturated brand accent makes typography and layout carry the identity

#### B. Tokenized UI palette in `app/globals.css`

The tokenized layer is dark-first and uses OKLCH variables:

- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`
- `--chart-1` through `--chart-5`
- `--sidebar-*`
- `--radius`

These feed Tailwind theme tokens such as `bg-background`, `text-foreground`, `border-border`, `bg-primary`, and `rounded-lg`.

#### Audit Note

There is a second global stylesheet at [`styles/globals.css`](/Users/aman/codes/grouphub/styles/globals.css) with a different neutral token system and dark-mode overrides. It is not the stylesheet used by the App Router layout. This is a design-system inconsistency and a maintenance risk.

### Typography

Fonts:

- Sans: `Geist`
- Mono: `Geist Mono`

Observed hierarchy:

| Role | Typical classes |
| --- | --- |
| Hero headlines | `text-4xl sm:text-6xl font-black leading-[0.95]` |
| Section headlines | `text-3xl sm:text-5xl font-black leading-[1.05]` |
| Card titles | `text-xl` to `text-2xl font-black` |
| Eyebrows | `text-sm font-black uppercase tracking-[0.18em]` |
| Body emphasis | `text-lg font-semibold leading-snug` |
| Supporting body | `text-sm font-semibold leading-relaxed` |
| Metadata | `text-xs` or `text-sm font-black uppercase tracking-[0.12em]` |

Reading pattern:

- Headlines are compressed and assertive
- Supporting copy is almost always semi-bold
- Uppercase labels create navigation and scan anchors
- The system relies more on weight than on color for hierarchy

### Spacing System

The layout rhythm is strongly Tailwind-based.

Common horizontal paddings:

- `px-6`
- `sm:px-10`
- `lg:px-20`
- `xl:px-28`

Common vertical paddings:

- Section: `py-12`, `py-16`, `py-20`
- Component/card interior: `p-4`, `p-5`, `p-6`, `p-7`, `p-8`

Usage rules inferred from the codebase:

- Use larger vertical spacing to separate semantic sections
- Use `gap-4` and `gap-5` for card internals
- Use `gap-8` to `gap-12` for section-level composition
- Preserve the `px-6 / sm:px-10 / lg:px-20 / xl:px-28` shell for page consistency

### Border Radius

Observed radius tokens:

| Token | Value | Usage |
| --- | --- | --- |
| `--radius-sm` | `calc(var(--radius) - 4px)` | Fine primitives |
| `--radius-md` | `calc(var(--radius) - 2px)` | Inputs, buttons |
| `--radius-lg` | `var(--radius)` | Default token radius |
| `--radius-xl` | `calc(var(--radius) + 4px)` | Larger containers |
| Product usage | `rounded-md`, `rounded-full` | Branded cards and badges |

Current feel:

- Product pages favor restrained rounding
- Full pills are used for labels and initials
- The UI primitives are slightly rounder than the branded pages

### Elevation

Observed shadow levels:

| Level | Usage |
| --- | --- |
| `shadow-sm` / `shadow-xs` | Tokenized cards and controls |
| `shadow-lg` | Dev banner |
| `shadow-2xl` | Mobile menu panel |

The branded app mostly relies on borders instead of shadows. Elevation is reserved for overlays and system primitives.

### Motion

Observed motion primitives:

| Pattern | Usage |
| --- | --- |
| `transition` / `transition-colors` | Most hoverable controls |
| `transition-transform duration-300 ease-out` | Mobile menu sheet |
| `duration-200` | Accordion icon rotation |
| `animate-spin` | Spinner |
| `animate-accordion-down` / `animate-accordion-up` | Accordion content |

Principles inferred:

- Motion is functional, not decorative
- Hover states are quick and subtle
- Sliding panels should feel weighty and controlled
- Animated states are reserved for disclosure and loading

## Component Inventory

### Product Components

#### `Navbar`

- Purpose: Global navigation, dev-status alert, account/dashboard entry points
- Usage: All app pages through [`app/layout.jsx`](/Users/aman/codes/grouphub/app/layout.jsx)
- Anti-patterns: Do not duplicate local page nav when the global shell already provides it
- Variants: Home hero nav, sticky internal nav, mobile drawer
- States: Default, active link, mobile open, mobile closed
- Props: `hiddenClass` on internal `MobileMenu`
- Accessibility: Escape closes menu; background scroll is locked; overlay click closes
- Example: `<Navbar />`

#### `Footer`

- Purpose: Global footer with platform/company/legal links
- Usage: All pages through layout
- Anti-patterns: Avoid adding dense product controls here
- Variants: Single current variant
- States: Hoverable links and icons
- Props: None
- Accessibility: Semantic lists and link labels, but social links need real destinations
- Example: `<Footer />`

### UI Primitive Library

All files in `components/ui/*` are reusable primitives. Most are shadcn/Radix wrappers that forward native or Radix props.

#### Core primitives

| Component | Purpose | Variants / states | Notes |
| --- | --- | --- | --- |
| `Button` | Primary action control | `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`; `default`, `sm`, `lg`, `icon`, `icon-sm`, `icon-lg` | Supports `asChild` |
| `Badge` | Small status or metadata label | `default`, `secondary`, `destructive`, `outline` | Good for filters and status |
| `Card` | Content container | Header, action, content, footer slots | Tokenized surface, not branded by default |
| `Input` | Single-line text input | Focus, invalid, disabled | Shared token styling |
| `Textarea` | Multi-line text input | Focus, invalid, disabled | Shared token styling |
| `Label` | Form label | Default | Radix label wrapper |
| `Separator` | Visual divider | Horizontal, vertical | Often useful in dense layouts |
| `Skeleton` | Loading placeholder | Shape by class | For async states |
| `Spinner` | Compact loading icon | Spin state | Uses `Loader2Icon` |
| `Kbd`, `KbdGroup` | Keyboard shortcut display | Default | Good for command hints |

#### Form and selection

| Component | Purpose | Variants / states | Notes |
| --- | --- | --- | --- |
| `Field*` | Structured form field layout | `vertical`, `horizontal`, `responsive` | Best form abstraction in repo |
| `Form*` | React Hook Form bindings | Invalid, message, description | Wraps RHF context |
| `Checkbox` | Boolean selection | Checked, unchecked, disabled | Radix checkbox |
| `RadioGroup`, `RadioGroupItem` | Exclusive selection | Checked, disabled | Radix radio |
| `Select*` | Select menu | Open, closed, disabled | Radix select |
| `Switch` | Binary toggle | On, off, disabled | Radix switch |
| `Slider` | Range input | Dragging, disabled | Radix slider |
| `InputOTP*` | OTP input clusters | Filled, active | Specialized auth control |
| `Calendar` | Date picking | Selected, range, disabled | Day Picker based |
| `InputGroup*` | Rich input composition | Inline/block add-ons, invalid, focus | Strong utility component |

#### Navigation and organization

| Component | Purpose | Variants / states | Notes |
| --- | --- | --- | --- |
| `Accordion*` | Progressive disclosure | Open, closed, disabled | Includes animated content |
| `Tabs*` | In-place section switching | Active, inactive, disabled | Good for docs previews |
| `Breadcrumb*` | Hierarchy trail | Link, page, separator | Use for nested views |
| `Pagination*` | Result/page navigation | Previous, next, ellipsis | Tokenized pattern |
| `NavigationMenu*` | Rich nav menus | Open, closed | Radix navigation menu |
| `Menubar*` | Desktop app-style menus | Open, checked, disabled | Better for tools than marketing |
| `Sidebar*` | App-shell sidebar system | Expanded, collapsed, mobile | Most advanced layout primitive |
| `ScrollArea`, `ScrollBar` | Custom scroll container | Horizontal, vertical | Useful for docs panels |
| `Resizable*` | Pane resizing | Dragging | App/workspace pattern |
| `Carousel*` | Horizontal slide content | Prev/next disabled, active | Embla based |

#### Overlay and feedback

| Component | Purpose | Variants / states | Notes |
| --- | --- | --- | --- |
| `Dialog*` | Modal dialog | Open, closed | General-purpose modal |
| `AlertDialog*` | Destructive confirmation | Open, closed | Safer confirm pattern |
| `Sheet*` | Edge panel overlay | `top`, `bottom`, `left`, `right` | Good for mobile nav or detail panes |
| `Drawer*` | Bottom sheet | Open, closed | Vaul based |
| `Popover*` | Anchored floating panel | Open, closed | Compact contextual content |
| `Tooltip*` | Hover/focus hint | Open, closed | Needs provider |
| `HoverCard*` | Rich hover preview | Open, closed | Dense metadata previews |
| `DropdownMenu*` | Action list | Open, checked, disabled | Standard action menu |
| `ContextMenu*` | Right-click menu | Open, checked, disabled | Secondary interactions |
| `Toast*`, `Toaster`, `Sonner Toaster`, `useToast` | Temporary feedback | Open, dismiss, action | Duplicated hook surface exists |
| `Alert` | Inline status message | Default, destructive via class overrides | Non-modal feedback |
| `Progress` | Progress bar | Determinate progress | Good fit for project progress |

#### Data display and layout helpers

| Component | Purpose | Variants / states | Notes |
| --- | --- | --- | --- |
| `Table*` | Tabular data | Hover, selected | Overflow container included |
| `Avatar*` | User identity thumbnail | Image, fallback | Strong fit for GroupHub |
| `AspectRatio` | Media frame | Variable ratio | Utility only |
| `Chart*` | Token-aware charts | Tooltip, legend | Recharts abstraction |
| `Command*` | Command palette/search | Open, empty, selected | Great for future search UX |
| `Collapsible*` | Basic disclosure container | Open, closed | Lighter than accordion |
| `Toggle` | Single pressed state control | `default`, `outline`; sizes | Toolbar-like control |
| `ToggleGroup*` | Grouped toggles | Single/multiple pressed | Formatting or filter controls |
| `ButtonGroup*` | Connected buttons or mixed controls | Horizontal, vertical | Useful for segmented input toolbars |
| `Item*` | List row pattern | `default`, `outline`, `muted`; `default`, `sm` | Strong reusable content row |
| `Empty*` | Empty-state pattern | Default, icon media | Great for zero-result views |

### Usage Guidelines

- Prefer `components/ui/*` for interaction and accessibility concerns
- Prefer branded page patterns for shell, hero, and card composition
- Standardize new forms on `Field*`, `Input`, `Textarea`, `Select`, and `Button`
- Avoid creating page-specific pseudo-components when a primitive already exists

### Anti-Patterns Seen Today

- Re-implementing field, input, and button styles directly in page files
- Hardcoding hex colors instead of using semantic tokens
- Building status badges with ad hoc class strings rather than `Badge`
- Duplicating hook and styling files with the same responsibility

## Architecture Audit

### Duplicates

1. Global styles are duplicated:
   - [`app/globals.css`](/Users/aman/codes/grouphub/app/globals.css)
   - [`styles/globals.css`](/Users/aman/codes/grouphub/styles/globals.css)

2. Hooks are duplicated:
   - [`hooks/use-toast.jsx`](/Users/aman/codes/grouphub/hooks/use-toast.jsx)
   - [`components/ui/use-toast.jsx`](/Users/aman/codes/grouphub/components/ui/use-toast.jsx)
   - [`hooks/use-mobile.jsx`](/Users/aman/codes/grouphub/hooks/use-mobile.jsx)
   - [`components/ui/use-mobile.jsx`](/Users/aman/codes/grouphub/components/ui/use-mobile.jsx)

3. Product-level form fields are duplicated in page files instead of reusing `Field`, `Input`, and `Textarea`

### Inconsistencies

1. Token mismatch:
   - Branded pages mostly use raw hex colors
   - UI primitives mostly use semantic tokens

2. Radius mismatch:
   - Product pages feel slightly sharper
   - Primitive library defaults to softer token radii

3. Typography mismatch:
   - Product pages use `font-black` heavily
   - Primitive library defaults to `font-medium` and neutral styling

4. Theme mismatch:
   - Runtime product shell is visually warm-neutral
   - Primitive token layer is dark-first teal-accented
   - Unused stylesheet contains a different neutral light/dark token set

### Technical Debt

- `WarningDev` in [`app/layout.jsx`](/Users/aman/codes/grouphub/app/layout.jsx) is unused
- `_geist` and `_geistMono` are instantiated but not applied through variable classes
- Hardcoded social and footer links use placeholder `#`
- Large page files embed repeated card, filter, and CTA patterns that should become product components

## Recommendations

### Immediate

1. Choose a single global stylesheet and delete the duplicate after migration
2. Consolidate duplicated hooks into one canonical import path
3. Add semantic aliases for the current warm-neutral brand palette
4. Use `Badge`, `Button`, `Input`, `Textarea`, and `Field` in product pages before creating new one-off controls

### Near-Term

1. Create branded wrappers such as `SectionShell`, `Eyebrow`, `MetricCard`, `ProjectCard`, and `StatusBadge`
2. Tokenize recurring colors like `#f7f7f3`, `#fbfbfa`, `#2f2f2d`, and `#d9d8d2`
3. Add a real theme strategy instead of carrying split token systems
4. Introduce shared empty, loading, and success states across pages

### Long-Term

1. Align `components/ui/*` tokens with the GroupHub brand rather than default shadcn neutrals
2. Build page templates for marketing, workspace, search, and auth flows
3. Add component tests for interactive primitives and product patterns
4. Formalize content tone guidelines so product copy stays consistent with the current direct, confident voice

## Standardization Opportunities

High-value candidates for extraction from page files:

- Hero section shell
- Eyebrow label
- CTA button pair
- Branded card shell
- Status pill
- Metric/stat tile
- Search/filter panel
- Form field row
- Modal form shell

## Final Assessment

GroupHub already has the ingredients of a serious design system:

- a strong visible brand,
- a deep accessible primitive library,
- a consistent layout shell,
- and a clear product tone.

What it lacks is unification.

The next phase should not be inventing a new visual language. It should be connecting the existing branded product layer to the existing primitive layer so that future pages feel faster to build, easier to maintain, and more obviously part of one coherent system.

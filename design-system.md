# WakeHarbor — Frontend Design System

**Application:** WakeHarbor Dashboard  
**Framework:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4  
**Design Persona:** Modern Infrastructure SaaS / Developer Tooling  

---

## 1. Aesthetic Principles

WakeHarbor is designed as a focused, high-density infrastructure dashboard for developers. It emphasizes:
1. **Clarity over Clutter:** High contrast, legible typography, and purposeful data density.
2. **Operational Status Semantics:** Colors carry strict meaning (emerald for verified health, amber for degraded/investigation, rose for authentication/connection failures, violet for manual triggers).
3. **Restrained Depth:** Subtle border delineation (`border-slate-800`), dark surfaces (`#090d16` background, `slate-900/60` cards), and crisp hover transitions without excessive decorative blurs.
4. **Accessible Feedback:** Visible focus states (`focus:ring-2 focus:ring-emerald-500/50`), accessible ARIA roles, and high-contrast color pairings in both light and dark modes.

---

## 2. Color Palette & Semantic Tokens

### 2.1 Surfaces & Neutrals
- **Dark Mode Canvas:** `#090d16` (Deep obsidian slate)
- **Dark Mode Cards:** `bg-slate-900/60` with `border-slate-800`
- **Light Mode Canvas:** `#f8fafc` (Slate 50)
- **Light Mode Cards:** `#ffffff` with `border-slate-200`
- **Subtle Headers / Overlays:** `bg-slate-950/50`

### 2.2 Status Colors
- **Healthy / Success:**
  - Accent: `emerald-400` / `emerald-500`
  - Badges: `bg-emerald-950/60 text-emerald-400 border-emerald-800/80`
- **Warning / Degraded / Paused:**
  - Accent: `amber-400` / `amber-500`
  - Badges: `bg-amber-950/60 text-amber-400 border-amber-800/80`
- **Critical / Failed / Auth Error:**
  - Accent: `rose-400` / `rose-500`
  - Badges: `bg-rose-950/60 text-rose-400 border-rose-800/80`
- **Scheduled / Secondary Information:**
  - Accent: `cyan-400` / `sky-400`
  - Badges: `bg-sky-950/60 text-sky-400 border-sky-800/80`
- **Manual Triggers:**
  - Accent: `violet-400`

---

## 3. Typography

- **Primary Sans:** Geist Sans (`--font-geist-sans`), falling back to system sans-serif.
- **Monospace:** Geist Mono (`--font-geist-mono`), used for API keys, Supabase URLs, timestamps, latency numbers, and error categories.
- **Scale:**
  - Titles: `text-2xl font-bold tracking-tight`
  - Section Headers: `text-base font-semibold`
  - Metric Numbers: `text-2xl font-bold font-mono`
  - Table / Card Body: `text-xs` (12px)
  - Microcopy / Badges: `text-[10px]` or `text-[11px]` font-semibold

---

## 4. Design Components

### 4.1 Buttons (`src/components/ui/Button.tsx`)
Supports 5 variants with uniform heights, loading spinners, and disabled states:
- `primary`: Solid emerald (`bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-950/30`)
- `secondary`: Neutral dark (`bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700`)
- `outline`: Border-focused (`border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300`)
- `ghost`: Borderless (`text-slate-400 hover:text-slate-100 hover:bg-slate-800/50`)
- `danger`: Destructive actions (`bg-rose-600 hover:bg-rose-500 text-white`)

### 4.2 Status Badge (`src/components/projects/ProjectStatusBadge.tsx`)
Displays animated pulsing indicator dots for active states alongside semantic text labels.

### 4.3 Policy Disclaimer (`src/components/ui/DisclaimerBanner.tsx`)
A prominent component displayed across dashboard and project detail views clearly communicating that WakeHarbor generates evidence of user database activity but does not claim or guarantee that Supabase will never pause a project.

### 4.4 Modal Dialog (`src/components/ui/Modal.tsx`)
Accessible overlay with backdrop blur, keyboard ESC dismissal, focus trap, and smooth mount transitions.

---

## 5. Theme Support

Implemented via `ThemeContext.tsx` and custom Tailwind variant `@custom-variant dark (&:where(.dark, .dark *));`:
- Defaults to Dark mode.
- Preference persisted in `localStorage` under key `wakeharbor_theme`.
- Synchronized dynamically with `document.documentElement` class list.
- Full high-contrast coverage for light mode themes.

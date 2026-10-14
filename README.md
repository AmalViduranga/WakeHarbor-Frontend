# WakeHarbor — Frontend

**Keep your development projects active, intelligently.**

WakeHarbor Frontend is a modern, responsive web application built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4. It provides an intuitive, high-density dashboard for configuring Supabase connections, testing heartbeats, reviewing real execution history, and monitoring connection health.

---

## Features

- **Private Admin Authentication:** Secure login flow backed by HttpOnly session cookies, sliding-window rate limiting, and route protection.
- **Interactive Onboarding Wizard:** 7-step guided setup with live SQL function generation, step-by-step guidance, and real-time database RPC validation.
- **Live Health Diagnostics:** Visual status indicators (`Healthy`, `Degraded`, `Connection Failed`, `Authentication Error`, `Supabase Paused`), consecutive failure counts, and latency tracking.
- **Manual "Run Now" Execution:** Trigger real database heartbeat requests on demand.
- **Publishable Key Rotation:** Seamlessly update API keys in-place with AES-256-GCM backend encryption.
- **Dark & Light Mode:** Tailored modern infrastructure theme with smooth transitions and persistent state.
- **Real-Time Activity History:** Paginated table tracking execution outcomes, HTTP status codes, latencies, and diagnostic details.
- **Comprehensive Documentation & Troubleshooting:** In-app guide and diagnostic resolution matrix.

---

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **UI Library:** React 19
- **Language:** TypeScript (Strict Mode)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Components:** Custom accessible UI primitives based on Radix UI conventions
- **Icons:** [Lucide Icons](https://lucide.dev/)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Charts:** [Recharts](https://recharts.org/)

---

## Directory Structure

```text
wakeharbor-frontend/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── layout.tsx       # Root layout with Theme and Auth providers
│   │   ├── page.tsx         # Dashboard overview with real statistics
│   │   ├── login/           # Admin login page
│   │   ├── projects/        # Project list and search
│   │   │   ├── new/         # 7-step Add Project wizard
│   │   │   └── [id]/        # Project detail, diagnostics, and executions
│   │   ├── history/         # Paginated activity audit logs
│   │   ├── alerts/          # Incident feed and notification preferences
│   │   ├── settings/        # Security, password change, and worker telemetry
│   │   └── docs/            # In-app integration guide and troubleshooting
│   ├── components/
│   │   ├── layout/          # Dashboard navigation, sidebar, and layout shell
│   │   ├── projects/        # Status badges, Run Now button, Rotate Key modal, wizard
│   │   ├── dashboard/       # Stat cards, health trend chart, recent executions
│   │   └── ui/              # Button, Input, Card, Modal, DisclaimerBanner
│   ├── context/             # AuthContext, ThemeContext
│   ├── lib/                 # API client, formatters, SQL script constants
│   └── types/               # TypeScript interfaces matching backend DTOs
├── design-system.md         # Design system tokens and styling principles
├── integration-guide.md     # Frontend-backend integration guide
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js version 18.18+ or 20+ (Node 22 LTS tested)
- npm version 9+

### Installation
```bash
npm install
```

### Configure Environment
Create a `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

### Run Production Build
```bash
npm run build
npm run start
```
Verify that the build completes cleanly with zero errors or warnings.

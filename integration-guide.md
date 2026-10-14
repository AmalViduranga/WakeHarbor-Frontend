# WakeHarbor — Frontend Integration Guide

**Application:** WakeHarbor Web Frontend  
**Audience:** Developers, DevOps Engineers  

---

## 1. Environment Configuration

The frontend connects to the WakeHarbor Control Service backend. In production or local development, set the API base URL in `.env.local` or environment variables:

```bash
# Set this to the backend API base URL
NEXT_PUBLIC_API_URL=http://localhost:8080
```

When deployed behind an Nginx reverse proxy using the same domain (e.g., `https://wakeharbor.yourdomain.com`), leave `NEXT_PUBLIC_API_URL` empty to default to relative path `/api/v1`, avoiding cross-origin overhead.

---

## 2. Authentication Flow

1. **Login:** The user submits their email and password at `/login`.
2. **Backend Response:** Control Service sets an `HttpOnly`, `SameSite=Lax` session cookie (`wakeharbor_session`) and returns a JWT payload for client-side state.
3. **Session Verification:** On every page load, `AuthProvider` calls `/api/v1/auth/me` with `credentials: "include"`.
4. **Route Protection:** If the session is invalid or expired, unauthenticated users are smoothly redirected to `/login`.
5. **Logout:** Calling `logout()` triggers a `POST /api/v1/auth/logout` which clears the cookie on the backend and resets client state.

---

## 3. Project Onboarding Wizard Flow

The **Add Project Wizard** (`src/components/projects/AddProjectWizard.tsx`) walks developers through 7 straightforward steps:

1. **Step 1: Project Details:** Enter friendly name and Supabase project URL (`https://<project-ref>.supabase.co`).
2. **Step 2: API Credentials:** Instructions on locating the **Publishable Key** in the Supabase Dashboard. Explains why secret/service-role keys are strictly rejected.
3. **Step 3: SQL Function:** Displays the copyable `wakeharbor_heartbeat()` SQL script with one-click copy.
4. **Step 4: SQL Execution:** Explains where to open the SQL Editor in Supabase and run the query.
5. **Step 5: Connection Validation:** An interactive button triggers a real, immediate POST request to `/api/v1/projects/{id}/validate` or executes a pre-validation test. Advances only upon verified `{ "ok": true }` response.
6. **Step 6: Schedule Selection:** Choose between 6-hour, 12-hour (recommended), or 24-hour cadence.
7. **Step 7: Activation:** Activates monitoring, persists configuration in PostgreSQL, and navigates to the project details view.

---

## 4. Key Interactive Capabilities

- **Real-Time Diagnostics:** The Project Details page displays consecutive failures, last error message, error category, and latency history.
- **Run Now:** Dispatches a manual execution job directly to the backend and live-refreshes execution history.
- **Key Rotation:** Allows updating or rotating Supabase Publishable Keys without deleting historical telemetry.
- **Pause & Resume:** Toggles monitoring state without deleting project schedules.
- **Search & Filtering:** Search projects by name, reference, or filter by health status (`All`, `Healthy`, `Failed`, `Paused`).
- **Activity History:** Paginated table with status filters, response codes, and diagnostic details.

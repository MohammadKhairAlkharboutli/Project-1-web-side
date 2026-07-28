# Frontend agent guide

## Scope and stack

This directory is the frontend package root. It is a React 19 Vite application written in JavaScript/JSX, styled with Tailwind CSS 4. `components.json` configures the Radix/shadcn-style local primitives in `src/components/ui/`; use `lucide-react` for icons. The `@/` alias resolves to `src/`.

Run commands here:

```powershell
npm run dev
npm run lint
npm run build
```

## Layout and routing

- `src/main.jsx` mounts `BrowserRouter`; `src/App.jsx` is the route registry.
- `src/pages/AdminPageLayout.jsx` is the authenticated admin shell and owns `AdminAccountProvider`.
- Admin routes live under `/admin`; nested profile sections use `Outlet` in their profile/layout page.
- The doctor portal is under `/doctor`; invitation registration is `/doctor-invite/:token`.
- `src/components/ProtectedRoute.jsx` currently checks only for an access token. Keep server roles/guards authoritative; add client role navigation only as UX.
- Put page-specific components next to their page. Reuse shared domain components from `src/components/shared/` and UI primitives from `src/components/ui/` rather than duplicating tables, badges, dialogs, or styling patterns.

## Data and auth conventions

- All HTTP calls belong in `src/api/*Api.js` and use `src/api/axiosClient.js`; do not scatter raw axios calls through pages.
- `axiosClient` uses `VITE_API_URL` (fallback `http://localhost:3000`), attaches `localStorage.accessToken`, and refreshes once on a 401 via `POST /auth/refresh` with `localStorage.refreshToken`.
- Use `authApi` for session lifecycle. Do not change token names or assume a client route check is sufficient authorization.
- `AdminAccountContext` loads `/auth/me`, then `/users/:id`, and manages revocable avatar object URLs. Reuse its methods for the admin shell account rather than duplicating those requests.
- Existing live wrappers cover auth, admin account/avatar, clinics, doctors/assignments, doctor invitations/schedules, admin appointments, queues, and ratings/report moderation. Extend the relevant wrapper when wiring another live feature.

## API status: live versus mock

The admin clinic/doctor/appointment/queue/rating/schedule-request/data-lookup/system-policy flows are connected to the API. Data Lookups currently uses `/lookups`, which returns active records only; an admin-only `/lookups/admin` list is needed to display and re-enable inactive records after a reload. Several surfaces remain presentation/mock based: the doctor portal, shared appointment/schedule fixtures, and parts of clinic assignment data. Files named `mock*.js`, `*Data.js`, and `doctorPortalData.js` are explicit fixtures, not API contracts.

Admin rating and report wrappers normalize the backend's `created_at`/`updated_at` fields to the UI's `createdAt`/`updatedAt` convention. Keep status mutations in `ratingsApi`, and refresh/update local moderation state after hiding a rating or resolving a report.

Before replacing a mock, inspect the backend controller, DTO, guards, and response shape. Preserve loading, error, empty, filter, pagination, and mutation-refresh behavior; avoid mapping backend records to fixture-only fields without an explicit adapter.

## UI and code conventions

- Follow the local file style; imports may be relative or use `@/`, with `@/` preferred for cross-feature imports.
- Use function components and hooks. Keep remote state close to the route/feature that owns it; use context only for genuine shared shell state.
- Use `cn` from `@/lib/utils` for conditional class names and existing `Button`, `Dialog`, table, select, and badge primitives for consistent interaction and accessibility.
- Keep the global design tokens in `src/index.css`; do not create a separate Tailwind config for one-off colors.
- Do not edit `src/components/old-UI/` for new work unless maintaining that legacy implementation.
- Treat multipart requests specially: avatar upload uses `FormData` and overrides the content type in `adminAccountApi`.

## Frontend verification

Run `npm run lint` and `npm run build` after JSX, routing, API, or styling changes. For API work, exercise the affected role with a valid backend session and confirm unauthorized/expired-token handling does not loop or silently keep stale data.

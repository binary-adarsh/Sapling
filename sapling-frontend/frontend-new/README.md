# Sapling — Frontend

A complete rebuild of the recruiter/candidate hiring platform frontend, built
against the existing `ai-backend` Spring Boot API.

## Stack

- React 19 + Vite
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- Framer Motion (animation)
- React Router v6
- Axios (central API client with auth interceptors)
- react-hot-toast (notifications)
- lucide-react (icons)

## Getting started

```bash
npm install
npm run dev
```

The app runs on **http://localhost:5173** by default — this matches the
CORS allow-list already configured in `SecurityConfig.java` on the backend,
so no backend changes are needed.

Make sure the backend is running on `http://localhost:8080` (or update
`.env`, see below), then open the app and register an account as either a
candidate or a recruiter.

## Configuration

The API base URL is read from an environment variable instead of being
hardcoded, so it's safe to deploy without editing source files:

```
# .env
VITE_API_BASE_URL=http://localhost:8080/api
```

## Recent fixes

- **Fixed a real page-transition bug**: the sidebar used to jump/shift during
  navigation because the entire routed content (including the `position:
  fixed` sidebar) was wrapped in an animated element — a CSS `transform` on
  an ancestor redefines the containing block for `fixed` children. The
  transition is now scoped to just the main content column inside
  `AppShell`, so the sidebar stays perfectly still and only the page content
  cross-fades.
- **Added a way to reach the platform's homepage from inside the app**:
  `/home` always shows the public marketing page regardless of login state,
  and there's a "Visit Sapling homepage" link at the bottom of the sidebar
  nav, plus the mobile top bar logo (previously not clickable) now takes you
  back to your dashboard.
- **Added dark mode**: a toggle (sun/moon icon) in the sidebar, the mobile
  top bar, the landing page header, and the login/register screen. Theme
  choice is saved and applied before first paint (no flash of the wrong
  theme). The sidebar and the coding-round editor intentionally keep a
  constant dark "shell" look in both themes, the same way a code editor or a
  branded side panel usually does.
- **More motion polish**: an animated sliding highlight behind the active
  sidebar item, hover-lift on cards, a small particle "burst" when an
  interview or coding round is completed, a shimmer sweep on primary
  buttons, and small ambient background shapes on the landing page hero.
- **Small charts** (recharts): a score-progression bar chart on the
  candidate's Resumes page, and a hiring-pipeline bar chart on the
  recruiter's Dashboard.

## What's different from the previous frontend

This is a ground-up rewrite, not a patch. Notable fixes:

- **Route protection**: every dashboard route now checks for a valid,
  non-expired JWT and the correct role (`CANDIDATE` vs `RECRUITER`) before
  rendering. Previously any URL could be opened directly with no auth check.
- **One source of truth for the token**: a single `localStorage` key,
  read/written in one place (`src/lib/auth.js`), instead of scattered
  `localStorage`/`sessionStorage` lookups per page.
- **Central API client** (`src/lib/api.js`): the base URL, the
  `Authorization` header, and 401/403 handling (auto logout + redirect to
  `/login`) are all defined once instead of being copy-pasted into every
  page's `fetch` calls.
- **Confirmations before destructive actions**: deleting a resume or a job
  now asks first, instead of firing immediately on click.
- **Consistent loading/empty/error states** across every list and form,
  instead of some pages showing nothing while data loads.
- **A dedicated "Applications" page** for candidates to track every job
  they've applied to and jump straight into its interview or coding round,
  instead of relying on stray query parameters with no fallback.

## Project structure

```
src/
  components/        shared UI (AppShell, forms, ui/ primitives)
  context/           AuthContext (JWT decode, login/register/logout)
  lib/               api.js (axios client), auth.js (token helpers)
  pages/
    candidate/       candidate-facing pages
    recruiter/        recruiter-facing pages
```

## Design

The visual identity ("Sapling") intentionally avoids the generic dark
purple-gradient AI SaaS look — it uses a paper/ink palette (sage paper
background, deep forest ink, gold + teal accents), Fraunces for display type
and Plus Jakarta Sans for UI text, with small, purposeful motion (radial
score rings, staggered hero entrance, page/step transitions) rather than
decoration for its own sake.

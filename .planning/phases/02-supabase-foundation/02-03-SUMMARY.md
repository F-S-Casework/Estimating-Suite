# Plan 02-03 Summary — Auth Gate Integration

**Status:** Complete
**Completed:** 2026-04-29
**Phase:** 02-supabase-foundation

## What Was Built

Wired the Supabase auth gate into `project/shell.jsx` — the app now requires login, shows real user initials, and supports logout via the topbar avatar.

### Files Modified

**`project/shell.jsx`** — Refactored `App()` into two components:

- `AuthenticatedApp({ session })` — contains all existing shell logic (Rail, Topbar, view router), plus:
  - Derives user initials from `session.user.email` (e.g. `evan.pruitt@fs.com` → `EP`)
  - Passes `initials` and `onLogout` to `Topbar`
  - `handleLogout()` calls `window.sb.auth.signOut()`

- `App()` — thin auth gate:
  - `useState(undefined)` — prevents flash of content before session check
  - `useEffect` subscribes to `window.sb.auth.onAuthStateChange` with cleanup via `subscription.unsubscribe()`
  - Returns `null` when `session === undefined` (initial load)
  - Returns `<LoginView />` when `session` is null (logged out)
  - Returns `<AuthenticatedApp session={session} />` when session is truthy

- `Topbar` updated to accept `initials` and `onLogout` props with a click-to-reveal "Sign out" dropdown (`avatar-wrap` / `avatar-menu` pattern)

## Requirements Addressed

- AUTH-02: Auth gate blocks unauthenticated access to the app shell ✓
- AUTH-04: Topbar avatar shows real initials; logout returns user to login screen ✓

## Key Decisions Implemented

- D-05: Real user initials derived from email address parts — never hardcoded
- `session === undefined` initial state (not null) prevents authenticated content flash before INITIAL_SESSION fires
- Hooks-safe split: `useState`/`useEffect` are in `AuthenticatedApp` body — no hooks after early returns

## Commits

- `9bbd090` — feat(02-03): refactor App() into AuthenticatedApp + thin App auth gate

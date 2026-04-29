---
phase: 2
plan: "02-02"
subsystem: auth
tags: [auth, login, supabase, cdn, jsx]
dependency_graph:
  requires: []
  provides: [views-auth.jsx, login-css, supabase-cdn-script-order]
  affects: [index.html, project/styles.css]
tech_stack:
  added: [supabase-js@2-cdn]
  patterns: [window.Views-registration, window.sb-auth-signInWithPassword, static-error-string]
key_files:
  created:
    - project/views-auth.jsx
  modified:
    - project/styles.css
    - index.html
decisions:
  - "D-02: No registration or forgot-password links — accounts managed via Supabase dashboard (deliberate omission)"
  - "D-06: No in-app user management UI — deliberate omission"
  - "Error message is static string 'Invalid email or password' — never exposes raw Supabase error.message to prevent email enumeration"
  - "LoginView uses useState from shell.jsx global destructure — no re-import needed"
metrics:
  duration: "~10 minutes"
  completed: "2026-04-29"
  tasks_completed: 2
  tasks_total: 2
  files_created: 1
  files_modified: 2
---

# Phase 2 Plan 02: Auth UI — Login View & Script Tags Summary

**One-liner:** Minimal centered login form calling window.sb.auth.signInWithPassword with static error string, plus Supabase CDN wired before React in index.html.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create project/views-auth.jsx + login CSS | d84b261 | project/views-auth.jsx (created), project/styles.css (modified) |
| 2 | Update index.html script tags | e130e05 | index.html (modified) |

## What Was Built

### Task 1: LoginView Component

`project/views-auth.jsx` contains a `LoginView` functional component using React hooks (available globally from shell.jsx line 1 destructure). The component:

- Has email input (type="email", autoComplete="email", autoFocus) and password input (type="password", autoComplete="current-password")
- Calls `window.sb.auth.signInWithPassword({ email, password })` on submit
- Shows the static string "Invalid email or password" on any auth failure — never exposes `error.message`
- Disables the submit button and shows "Signing in…" text during the async call
- Registers via `window.Views = Object.assign(window.Views || {}, { login: LoginView })`

Login CSS added to `project/styles.css` using existing design system vars (`--bg`, `--panel`, `--line`, `--accent`, `--ink`, `--bad`, `--r-sm`, `--r-lg`). Classes: `.login-wrap`, `.login-card`, `.login-title`, `.login-form`, `.login-input`, `.login-error`, `.login-btn`.

### Task 2: index.html Script Tags

Updated `index.html` to load scripts in the correct order:
1. Supabase CDN (`cdn.jsdelivr.net/npm/@supabase/supabase-js@2`) — plain script, before React
2. `project/supabase.js` — plain script (no type="text/babel"), after CDN, before Babel
3. React CDN, ReactDOM CDN, Babel CDN
4. `project/shell.jsx` — text/babel
5. `project/views-auth.jsx` — text/babel, after shell.jsx (so hooks from shell destructure are available)
6. Remaining view scripts

## Deviations from Plan

None — plan executed exactly as written.

## Context Decisions Implemented

- **D-02:** LoginView has NO registration link and NO forgot-password link — accounts managed exclusively via Supabase dashboard (Authentication → Users → Invite)
- **D-06:** No in-app user management UI — deliberate omission; all accounts created via Supabase dashboard

## Threat Model Compliance

All ASVS L1 mitigations from the plan's threat model are implemented:

| Threat | Mitigation Applied |
|--------|-------------------|
| Email enumeration | Static "Invalid email or password" — no distinction between wrong email vs wrong password |
| XSS via error message | Error is a hardcoded string constant in JSX, never interpolated from API response |
| Credential exposure | type="password" on password input; no credential logging |
| CSRF | Token-based Supabase auth; no cookie session |
| Script injection | CDN URL pinned to @2 version tag; supabase.js same-origin |

## Known Stubs

None — LoginView calls the real `window.sb.auth.signInWithPassword`. The form will fully function once `project/supabase.js` (Plan 02-01) provides `window.sb` and App() in shell.jsx (Plan 02-03) adds the auth gate to render `<LoginView />` when no session exists.

## Self-Check: PASSED

- [x] `project/views-auth.jsx` exists
- [x] `grep "function LoginView" project/views-auth.jsx` matches
- [x] `grep "window.sb.auth.signInWithPassword" project/views-auth.jsx` matches
- [x] `grep "Invalid email or password" project/views-auth.jsx` matches
- [x] `grep "disabled={loading}" project/views-auth.jsx` matches
- [x] `grep "login-wrap" project/styles.css` matches
- [x] `grep "supabase-js@2" index.html` shows CDN before React (line 15 vs 17)
- [x] `grep "project/supabase.js" index.html` shows plain script (no text/babel)
- [x] `grep "views-auth.jsx" index.html` shows text/babel after shell.jsx (line 23 vs 22)
- [x] Commit d84b261 exists (Task 1)
- [x] Commit e130e05 exists (Task 2)

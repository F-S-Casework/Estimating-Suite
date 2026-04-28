# Phase 2: Supabase Foundation — Discussion Log

**Date:** 2026-04-28
**Duration:** 1 session
**Areas discussed:** Login screen design, User provisioning, Supabase config approach, Schema details

---

## Area 1: Login Screen Design

| Question | Options Presented | Selected |
|----------|------------------|----------|
| What should the login screen look like? | Full-page branded / Minimal form / Split screen | **Minimal — just the form** |
| What appears besides email + password + Sign In? | Nothing else / Forgot password link | **Nothing else** |
| Wrong password behavior? | Inline error (recommended) / You decide | **Inline error below the form** |

**Notes:** No branding on login. Accounts managed externally via Supabase dashboard only.

---

## Area 2: User Provisioning

| Question | Options Presented | Selected |
|----------|------------------|----------|
| How do team members get accounts? | Supabase dashboard invite / In-app admin page / Self-registration | **Supabase dashboard (recommended)** |
| Where should user name/initials appear? | Topbar avatar only / Also in activity feed / Both | **Topbar avatar only** |

**Notes:** Fixed team of 4–10. No in-app user management needed. Topbar avatar shows real initials.

---

## Area 3: Supabase Config Approach

| Question | Options Presented | Selected |
|----------|------------------|----------|
| Where do URL and anon key live? | Hardcoded in supabase.js / Separate config.js / Prompt on first run | **Hardcoded in supabase.js (recommended)** |

**Notes:** Anon key is safe to expose; RLS policies protect data at the DB level.

---

## Area 4: Schema Details

| Question | Options Presented | Selected / Freeform |
|----------|------------------|---------------------|
| Bid pipeline stages? | Lead→…→Won→Lost / Simpler / Something different | **Something different** → "ITB-Takeoff/Pricing-Review-Submit-Won-Lost" |
| Job statuses? | Shop→Ready→Installing→Installed→Held / Something different | **Shop→Ready→Installing→Installed→Held** |
| Bid/job numbering? | YY-NNN auto-increment / Manual / You decide | **Freeform** → "Q-YY-NNN for bids, YY-NNN for jobs (separate sequences)" |
| Contact roles? | GC, Owner, Sub, Field / Add Architect+Engineer / Something different | **GC, Owner, Sub, Field** |

**Notes:** Bid number format Q-26-NNN (quote). Won bids become next production job number 26-NNN. Two separate auto-sequences. Pipeline stages differ from current UI kanban columns — UI update needed in Phase 3.

---

## Deferred Ideas

None — discussion stayed within phase scope.

---

## Claude's Discretion Items

- Auth token expiry: `onAuthStateChange` in App component, redirect to login on session end
- Logout: avatar dropdown in topbar with "Sign out" option
- RLS: single policy per table for `authenticated` role, full read/write, no per-row ownership

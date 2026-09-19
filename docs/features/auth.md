# Feature: Authentication

## Overview

Authentication handles user identity and session management using **Supabase Auth**.

For the current Local CEO MVP, authentication is intentionally limited to:

> **Google OAuth via Supabase Auth**

Other authentication methods may be introduced later if product requirements change, but they are not part of the current implementation scope.

---

## Current Authentication Scope

### Included

- Google OAuth login.
- Supabase session creation.
- Session persistence using cookies with `@supabase/ssr`.
- Server-side authenticated identity verification.
- Protected application routes.
- Sign out / logout functionality.
- Login → logout → login lifecycle verification.

### Deferred

- Email/password registration.
- Email/password login.
- Email confirmation.
- Magic links.
- Forgot password.
- Reset password.
- Additional OAuth providers.

---

## Authentication Flow

```text
/login
  ↓
Continue with Google
  ↓
Google OAuth
  ↓
Supabase Auth
  ↓
/auth/callback
  ↓
exchangeCodeForSession(code)
  ↓
/home
```

Root routing:

```text
/
├── Authenticated   → /home
└── Unauthenticated → /login
```

Callback behavior:

```text
/auth/callback
├── Successful OAuth exchange → /home
└── Failed OAuth exchange     → /login
```

---

## Architecture

### Browser Client

```text
lib/supabase/client.ts
```

Used for browser-side Supabase operations such as initiating Google OAuth and signing out.

### Server Client

```text
lib/supabase/server.ts
```

Used by Server Components, Route Handlers, and other server-side code requiring access to authenticated Supabase state.

### Session Proxy

```text
lib/supabase/proxy.ts
proxy.ts
```

Responsible for maintaining Supabase authentication state through the application request lifecycle.

### Server-Side Verification

Authentication verification uses:

```ts
supabase.auth.getClaims();
```

Frontend state is not treated as proof of authentication.

---

## Implementation Status

### Phase 2.1 — Supabase SSR Foundation

- [x] Supabase project created (`local-ceo`).
- [x] `NEXT_PUBLIC_SUPABASE_URL` configured.
- [x] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` configured.
- [x] Browser Supabase client created.
- [x] Server Supabase client created.
- [x] Next.js session proxy configured.
- [x] Server-side claims verification established.

### Phase 2.2 — Google OAuth Login & Callback

- [x] Login page created:
  - `app/(auth)/login/page.tsx`
- [x] Google OAuth configured.
- [x] OAuth callback created:
  - `app/auth/callback/route.ts`
- [x] OAuth code exchanged through:
  - `supabase.auth.exchangeCodeForSession(code)`
- [x] Successful authentication redirects to `/home`.
- [x] Authentication failures redirect to `/login`.
- [x] Protected Home page created.
- [x] Root authentication routing implemented.

### Phase 2.3 — Logout & Session Verification

- [x] Sign Out component created:
  - `components/sign-out-button.tsx`
- [x] Sign Out integrated into Desktop Sidebar.
- [x] Sign Out integrated into Mobile Header.
- [x] Sign out calls:
  - `supabase.auth.signOut()`
- [x] User is redirected to `/login`.
- [x] Authentication cookies are cleared.
- [x] Login → logout → login lifecycle verified.
- [x] Session persistence verified.
- [x] Protected routes verified.

### Verification

Authentication implementation has been verified using:

```bash
npm run lint
npm run type-check
npm run build
```

---

## Connection to Application User Model

Supabase Auth remains the source of authentication identity.

Beginning in Phase 3, Local CEO also maintains an application-level `User` record inside Supabase PostgreSQL's `public` schema.

The relationship is:

```text
Supabase auth.users
        │
        │ same UUID
        ▼
public.User
        │
        ▼
CompanyMembership
        │
        ▼
Company
```

The application `User.id` uses the same UUID as the corresponding Supabase `auth.users.id`.

There is intentionally no Prisma-managed authentication model.

Supabase continues to own:

```text
auth.users
auth.identities
auth.sessions
```

Local CEO owns:

```text
public.User
public.Company
public.CompanyMembership
```

---

## Responsibility Boundaries

Supabase Auth answers:

> Who is this user?

The Local CEO application `User` represents:

> What application-level data belongs to this identity?

`CompanyMembership` answers:

> Which companies does this user belong to?

Future RBAC answers:

> What may this user do inside this company?

Authentication must never be used as a replacement for company membership or authorization checks.

---

## Future Authentication Expansion

Email/password authentication, magic links, password recovery, and additional OAuth providers may be introduced later.

They are explicitly outside the current MVP authentication scope.

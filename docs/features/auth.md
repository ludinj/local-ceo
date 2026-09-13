# Feature: Authentication

## Overview
Authentication handles user sign-up, sign-in, session persistence, password reset, and identity management using **Supabase Auth**.

## Key Requirements
- User registration and login using email/password and magic links.
- Session persistence handled via HTTP-only cookies in Next.js App Router using `@supabase/ssr`.
- User profile management.
- Redirect flow: `Register/Login → User Home → Select/Create Company → Company Dashboard`.

## Data Model Connection
- Global `User` table managed in sync with Supabase Auth `auth.users`.
- Identity is separate from Company Membership (`CompanyMembership`).

---

## Implementation Status

### Completed (Supabase SSR Foundation)
- [x] Supabase project created (`local-ceo`).
- [x] Supabase environment variables configured (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).
- [x] `@supabase/supabase-js` package installed.
- [x] `@supabase/ssr` package installed.
- [x] Browser Supabase client created (`lib/supabase/client.ts`).
- [x] Server Supabase client created with async Next.js 16 cookie handling (`lib/supabase/server.ts`).
- [x] Next.js session proxy created (`lib/supabase/proxy.ts` and root `proxy.ts`).

### Not Implemented Yet
- [ ] Registration (UI & Server Action / Auth handler)
- [ ] Login (UI & Server Action / Auth handler)
- [ ] Logout
- [ ] Email verification
- [ ] Protected application routes
- [ ] Forgot password
- [ ] Reset password
- [ ] User profile
- [ ] Company membership
- [ ] RBAC

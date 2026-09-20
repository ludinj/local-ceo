# Local CEO Project Handoff

> **CRITICAL AGENT INSTRUCTION (MUST READ BEFORE STARTING WORK):**
>
> Before undertaking any new feature, bug fix, or task, AI agents MUST:
>
> 1. Read this `HANDOFF.md`.
> 2. Review `docs/GENERAL.md` for architectural rules.
> 3. Review the relevant `docs/features/<feature>.md`.
> 4. Inspect the current repository state and recent Git history when necessary.
>
> Conversation history may be used when available, but it is not considered
> the canonical source of project state.
>
> Repository documentation and Git history are the source of truth.

---

## Current Project Status & Baseline

- **Repository Path**: `/Users/mecbook/Desktop/react/local-ceo`
- **Current Phase**: **Phase 3 — Organizations & Multi-Tenancy (In Progress)**
- **Current Authentication Strategy**: **Google OAuth via Supabase Auth**
- **Database**: **Supabase PostgreSQL**
- **ORM**: **Prisma ORM 7.10**

### Tech Stack

- Next.js 16.3.4 (App Router)
- React 19.2.8
- TypeScript 5
- Tailwind CSS v4 + PostCSS
- Base UI / shadcn/ui foundation
- Typography UI System
- Lucide icon system through `AppIcon`
- Supabase Auth
- Supabase PostgreSQL
- Prisma ORM 7.10
- PostgreSQL `pg` driver
- Prisma PostgreSQL adapter
- Vercel planned for deployment
- GitHub source control

---

## Completed Implementation

### Phase 1 — Foundation

- [x] Next.js 16 application initialized.
- [x] TypeScript configured.
- [x] Tailwind CSS v4 configured.
- [x] shadcn/Base UI foundation configured.
- [x] Shared utility helpers configured.
- [x] Typography system added.
- [x] Semantic application color system established.
- [x] Reusable `AppIcon` abstraction established using Lucide.
- [x] Tooltip foundation established for icon-only actions.

---

## Phase 2 — Authentication

### Phase 2.1 — Supabase SSR Foundation

- [x] Supabase project created.
- [x] Supabase environment variables configured.
- [x] Browser Supabase client created:
  - `lib/supabase/client.ts`
- [x] Server Supabase client created:
  - `lib/supabase/server.ts`
- [x] Session refresh helper created:
  - `lib/supabase/proxy.ts`
- [x] Next.js root proxy configured:
  - `proxy.ts`
- [x] Server-side authentication verification uses:
  - `supabase.auth.getClaims()`

### Phase 2.2 — Google OAuth

- [x] Google OAuth provider configured.
- [x] Login page created:
  - `app/(auth)/login/page.tsx`
- [x] OAuth callback created:
  - `app/auth/callback/route.ts`
- [x] OAuth callback exchanges code through:
  - `supabase.auth.exchangeCodeForSession(code)`
- [x] Successful authentication redirects to `/home`.
- [x] Authentication failures redirect to `/login`.
- [x] Protected Home route implemented.
- [x] Root route redirects based on authentication state.

### Phase 2.3 — Logout & Session Verification

- [x] Sign Out component created:
  - `components/sign-out-button.tsx`
- [x] Sign Out integrated into desktop navigation.
- [x] Sign Out integrated into mobile navigation.
- [x] Supabase logout implemented.
- [x] Authentication cookies cleared.
- [x] Login → logout → login lifecycle verified.
- [x] Session persistence verified.
- [x] Protected routes verified.

### Verification

Authentication implementation verified with:

```bash
npm run lint
npm run type-check
npm run build
```

Phase 2 is complete for the current Google OAuth MVP scope.

---

## Phase 3 — Organizations & Multi-Tenancy

### Current Architecture

```text
Supabase auth.users
        │
        │ same UUID
        ▼
      User
        │
        │ 1:N
        ▼
CompanyMembership
        │
        │ N:1
        ▼
     Company
```

Authentication and authorization remain separate:

- Supabase Auth proves identity.
- Application `User` stores Local CEO user data.
- `CompanyMembership` establishes company access.
- `CompanyMembership.role` stores membership-specific role metadata.
- Full permissions belong to Phase 4 RBAC.

---

## Phase 3.1 — Prisma + Supabase Database Foundation (Completed)

### Completed

- [x] Prisma ORM 7.10 installed.
- [x] `@prisma/client` installed.
- [x] `@prisma/adapter-pg` installed.
- [x] `pg` installed.
- [x] Prisma CLI configured.
- [x] Prisma schema created:
  - `prisma/schema.prisma`
- [x] Prisma config created:
  - `prisma.config.ts`
- [x] Runtime PostgreSQL connection configured through:
  - `DATABASE_URL`
  - Supabase Transaction Pooler
  - port `6543`
- [x] Prisma migration connection configured through:
  - `DIRECT_URL`
  - Supabase Session Pooler
  - port `5432`
- [x] `.env.local` loading verified.
- [x] Supabase PostgreSQL connectivity verified.
- [x] Database credentials verified.
- [x] Initial `public` schema verified empty before migration.
- [x] Initial models created:
  - `User`
  - `Company`
  - `CompanyMembership`
- [x] Application `User.id` designed to use Supabase Auth UUID.
- [x] Membership role stored on `CompanyMembership`.
- [x] Unique `(userId, companyId)` membership constraint added.
- [x] Prisma schema formatted.
- [x] Prisma schema validated.
- [x] Prisma Client generation verified.
- [x] Initial migration created:
  - `initial_organizations`
- [x] Initial migration successfully applied to Supabase PostgreSQL.
- [x] Prisma migration files committed to Git.
- [x] Reusable Prisma 7.10 runtime client created:
  - `lib/prisma.ts`
- [x] `@prisma/adapter-pg` driver adapter configured with PostgreSQL connection pooling using `DATABASE_URL`.
- [x] Hot reload singleton pattern configured using `globalThis` to prevent duplicate connection pools.
- [x] Runtime Supabase PostgreSQL database connectivity verified.

### Current Database Models

#### User

```text
id
email
name
createdAt
updatedAt
```

Important:

```text
public.User.id = Supabase auth.users.id
```

#### Company

```text
id
name
slug
createdAt
updatedAt
```

#### CompanyMembership

```text
id
userId
companyId
role
createdAt
updatedAt
```

Constraint:

```text
UNIQUE(userId, companyId)
```

---

## Phase 3.2 — Application User Synchronization (Completed)

### Completed

- [x] Reusable server-side user synchronization helper created:
  - `lib/auth/sync-user.ts` (`syncApplicationUser()`)
- [x] Identity mapping established: `public.User.id` = `Supabase auth.users.id` (UUID).
- [x] Persists authenticated `email` and derives Google OAuth display name when available (fallback to email username).
- [x] Uses concurrency-safe Prisma `upsert` strategy to create user on first login and update safe profile fields on repeated access.
- [x] Idempotent across repeated logins and page reloads (user count does not increase for the same user).
- [x] Fails clearly when invoked without an active authenticated session or missing email.
- [x] Kept all Prisma database operations strictly server-side.
- [x] Integrated at application entry point (`app/home/page.tsx`).

---

## EXACT NEXT TASK

### Phase 3.3 — Company Creation

Completed.

The company creation flow remains anchored on the working server-side action and Prisma transaction, but the user journey has been refactored to the `/home` workspace area through a modal-based create flow.

Implemented behavior:

- Company model includes `name`, `legalName`, `slug`, `countryCode`, `registrationNumber`, and `industry`.
- Migration name: `extend_company_profile`.
- Creation entry now lives in the home company grid via a dedicated create card and modal, not a standalone `/companies/new` route.
- Shared validation schema: `lib/validations/company.ts`.
- React Hook Form implementation: `components/companies/company-form.tsx`.
- Home trigger: `components/companies/company-create-card.tsx`.
- Server-side creation operation: `lib/actions/company.ts`.
- Server identity determines ownership and no `userId` is accepted from the browser.
- Slug generation is server-side and handles existing slug collisions by adding numeric suffixes.
- Registration number is generic and international; VE displays `RIF` in the UI without changing the storage field name.
- Country selection uses a library-backed picker while preserving the stored 2-letter country code contract.
- Validation, authentication, and loading states are handled in the form and server action.
- The transaction creates the company and owner membership atomically.

### Phase 3.4 — Company Listing

Replace the temporary company cards on `/home` with real companies loaded through `CompanyMembership`.

### Phase 3.5 — Company Context

Introduce company selection/context and server-side membership verification.

---

## Architectural Rules That Must Remain Preserved

1. **Multi-tenant by design**
   - All company-owned data must be scoped by `companyId`.

2. **Authentication and authorization are separate**
   - Supabase Auth proves identity.
   - CompanyMembership determines company access.
   - RBAC determines permitted actions.

3. **Application User and Supabase Auth remain separate concepts**
   - Supabase owns authentication data.
   - Local CEO owns application user data.

4. **Roles belong to company memberships**
   - Roles must never be stored globally on `User`.

5. **Server-side authorization**
   - Hiding UI elements is never the security boundary.

6. **Progressive data modeling**
   - Inventory, invoices, HR, marketing, and AI tables must be added when those features are implemented.
   - Do not model the entire future business schema prematurely.

7. **One application initially**
   - Continue with the current Next.js application before introducing separate backend services.

8. **Controlled AI access**
   - Future AI agents may access company information only through explicitly approved application tools.

9. **Prisma owns Local CEO application schema**
   - Prisma migrations manage application tables under `public`.
   - Prisma must not manage Supabase internal Auth tables.

10. **Database secrets remain server-only**
    - `DATABASE_URL` and `DIRECT_URL` must never be exposed through `NEXT_PUBLIC_*`.

---

## Verification Protocol for Incoming Agents

Before starting work:

1. Read this file.
2. Read `docs/GENERAL.md`.
3. Read the relevant feature documentation.
4. Inspect `git status`.
5. Inspect recent Git history when necessary.
6. Inspect the current implementation rather than assuming documentation alone proves functionality.
7. Preserve strict task scope.
8. Run lint, type-check, and build before marking implementation complete.
9. Update documentation only after the corresponding implementation has actually been verified.

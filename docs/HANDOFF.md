# Local CEO Project Handoff

> **CRITICAL AGENT INSTRUCTION (MUST READ BEFORE STARTING WORK):**
> Before undertaking any new feature, bug fix, or task, AI agents MUST:
>
> 1. Read this `HANDOFF.md`.
> 2. Review `docs/GENERAL.md` for architectural rules.
> 3. Review the relevant `docs/features/<feature>.md`.
> 4. Inspect the current repository state and recent Git history when necessary.
>
> Conversation history may be used when available, but it is not considered
> the canonical source of project state. Repository documentation and Git
> history are the source of truth.

---

## Current Project Status & Baseline

- **Repository Path**: `/Users/mecbook/Desktop/react/local-ceo`
- **Current Phase**: **Phase 2 — Authentication (Completed)**
- **Current Authentication Strategy**: **Google OAuth via Supabase Auth**
- **Tech Stack Initialized**:
  - Next.js 16.3.4 (App Router)
  - React 19.2.8
  - TypeScript 5
  - Tailwind CSS v4 + PostCSS
  - Base UI / shadcn/ui foundation (`components/ui`, `lib/utils.ts`)
  - Typography UI System (`components/ui/typography.tsx`)
  - Supabase Auth (`@supabase/supabase-js`, `@supabase/ssr`)
  - Project configuration (`components.json`, `tsconfig.json`, `next.config.ts`)

---

## Completed & Verified Implementation

- [x] Phase 1 Foundation: Next.js 16 application setup, Tailwind CSS v4 styling, typography design system.
- [x] Phase 2.1 Supabase SSR Foundation:
  - Supabase client helpers (`lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/proxy.ts`).
  - Next.js 16 Proxy (`proxy.ts`).
  - Server-side session verification via `supabase.auth.getClaims()`.
- [x] Phase 2.2 Google OAuth Code Implementation:
  - Executive SaaS color standard in `app/globals.css` with modern font (`Inter`).
  - Google OAuth Login page (`app/(auth)/login/page.tsx`).
  - Fixed OAuth Callback handler (`app/auth/callback/route.ts`) using `exchangeCodeForSession(code)`.
  - Protected Landing Page (`app/home/page.tsx`) with server-side claims check.
  - Root Router (`app/page.tsx`) redirecting authenticated -> `/home`, unauthenticated -> `/login`.
- [x] Phase 2.3 Logout & Session Verification:
  - Created Sign Out component (`components/sign-out-button.tsx`).
  - Integrated Sign Out action into Sidebar (`components/app-sidebar.tsx`) and Mobile Header.
  - Clears Supabase auth cookies and redirects user to `/login`.
  - Verified with `npm run lint`, `npm run type-check`, and `npm run build`.

---

## EXACT NEXT TASK

### Phase 3 — Organizations & Multi-Tenancy (Company Models)

1. Initialize Prisma ORM with Supabase PostgreSQL database connection (`npx prisma init`).
2. Define multi-tenant schema in `prisma/schema.prisma`:
   - `User` model (linked to Supabase Auth UUID).
   - `Company` model (`id`, `name`, `slug`, `createdAt`).
   - `CompanyMembership` model (`id`, `userId`, `companyId`, `role`).
3. Create database migrations & Prisma Client generation.
4. Replace dummy company placeholders on `/home` with real database company queries.

---

## Architectural Rules That Must Remain Preserved

1. **Multi-tenant by design**: All company-owned data must be scoped by `companyId`.
2. **Authentication and authorization are separate**: Supabase Auth proves identity. CompanyMembership and RBAC determine access.
3. **Roles belong to company memberships**: Roles must never be stored globally on the user.
4. **Server-side authorization**: Hiding UI elements is never the security boundary.
5. **Start simple**: Continue with single Next.js application before introducing microservices.

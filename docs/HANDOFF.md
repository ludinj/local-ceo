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
- **Current Phase**: **Phase 4 — Authorization & Membership (Phase 4.2 Members Completed)**
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

## Phase 3 — Organizations & Multi-Tenancy (Completed)

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
- React Hook Form implementation: `features/companies/components/company-form.tsx`.
- Home trigger: `features/companies/components/company-create-card.tsx`.
- Server-side creation operation: `lib/actions/company.ts`.
- Server identity determines ownership and no `userId` is accepted from the browser.
- Slug generation is server-side and handles existing slug collisions by adding numeric suffixes.
- Registration number is generic and international; VE displays `RIF` in the UI without changing the storage field name.
- Country selection uses a library-backed picker while preserving the stored 2-letter country code contract.
- Validation, authentication, and loading states are handled in the form and server action.
- The transaction creates the company and owner membership atomically.

### Phase 3.4 — Company Listing (Completed)

Completed implementation:

- Replaced the temporary `/home` company cards with real server-side company records loaded through `CompanyMembership`.
- Added server-side list queries and industry discovery scoped to the authenticated application user.
- Added URL-driven search, industry filtering, and pagination using the home query string contract.
- Search is debounced in the UI but filtering is executed server-side in PostgreSQL.
- Industry options are derived from the current user's actual companies.
- Pagination uses a page size of 12.
- Ordering is fixed to company name ascending.
- Added a reusable skeleton loading state and Suspense boundary.
- Company creation refreshes the current route so newly created companies appear immediately.
- Company-specific UI lives under `features/companies/components`.
- Shared UI primitives from `components/ui` should be reused when an appropriate component already exists.
- Verified with lint, type-check, and production build commands.

### Phase 3.5 — Company Context & Workspace Foundation (Completed)

Completed implementation:

- Introduced the company workspace route at `/companies/[slug]`.
- Clicking a company card on `/home` navigates directly to `/companies/[slug]`.
- Created server-side company context helper `getCompanyContext(slug)` in `lib/auth/company-context.ts`:
  - Resolves authenticated Supabase identity and application User server-side.
  - Resolves requested `Company` record by `slug`.
  - Verifies `CompanyMembership` for `(userId, companyId)` in PostgreSQL.
  - Redirects unauthenticated users to `/login`.
  - Returns `notFound()` for nonexistent companies or non-member users to prevent leaking company existence.
- Created `CompanySidebar` exposing the conceptual multi-module workspace navigation structure (Overview, Operations, Growth, Insights, People, Company) with active and coming-soon items.
- Created `CompanyOverview` dashboard showing genuine model data (`Company` name, legal name, country code, industry, tax ID/RIF, membership role, creation dates).
- Created `CompanyWorkspaceSkeleton` and route-level `loading.tsx` for Suspense fallback loading.
- Verified with `npm run lint`, `npm run type-check`, and `npm run build`.

---

## EXACT NEXT TASK

### Phase 4.2 — Members (Completed)

#### 4.1 RBAC Foundation (Completed)
- [x] Created centralized RBAC module in `lib/auth/rbac.ts`.
- [x] Defined 5 built-in roles: `OWNER`, `ADMIN`, `MANAGER`, `FINANCE`, `VIEWER`.
- [x] Defined initial 7 permissions vocabulary: `company.read`, `company.update`, `members.read`, `members.invite`, `members.manage`, `members.remove`, `ownership.transfer`.
- [x] Established Role → Permission mapping matrix (OWNER has all 7, ADMIN has 6 excluding `ownership.transfer`, MANAGER/FINANCE/VIEWER have `company.read` and `members.read`).
- [x] Created reusable, pure `hasPermission` checker: fail-closed for unknown roles, no database queries.
- [x] Created reusable `requirePermission` server-side guard throwing custom `AuthorizationError`.
- [x] Integrated with `CompanyContext` and `CompanyMembership`.
- [x] Added unit tests verifying matrix evaluation, fail-closed behavior, and exception throwing.
- [x] Kept RBAC in application code without database permission tables or migrations.

#### 4.2 Members (Completed)
- [x] Company members listing inside the workspace (`/companies/[slug]/members`).
- [x] Server-side membership query with authenticated company-scoped filtering, search, role filters, and count-based pagination.
- [x] Shared `Pagination` component reused for consistent page navigation while preserving URL params.
- [x] `CompanyMembersFilters` stays mounted while the results area suspends, preventing search focus loss during data reloads.
- [x] `CompanyMembersTableSkeleton` displays a clear loading state while server queries resolve after search, role, or page changes.
- [x] Permission-aware security boundary remains enforced by `requirePermission(context, "members.read")` and server-side Prisma access patterns.
- [x] Verified with `npm run lint`, `npm run type-check`, and `npm run build`.

#### 4.3 Member Administration (Planned)
- Workflows to change member role and remove member.
- Server-side permission enforcement and ownership invariants.
- **Owner Invariants**:
  - `OWNER` is a membership role on `CompanyMembership`.
  - A company must ALWAYS have at least one `OWNER`.
  - The final `OWNER` cannot be removed or demoted.
  - Ownership actions require elevated permissions (`ownership.transfer`).
  - Owner role is NEVER a global `User` property.

#### 4.4 Notification Foundation (Planned)
- Generic application-level notification capability (`Notification`).
- Notifications answer: *What should a specific application user be informed about?*
- Recipient-oriented notifications with read/unread states (`readAt` timestamp) and unread count helpers.
- Future notification consumers include: invitation events (received/accepted/declined), role changes, member removals, overdue invoices, low inventory, ready reports, AI recommendations, AI action approvals, and billing alerts.
- **Global Notification Bell**:
  - Visible in authenticated application header/sidebar areas.
  - Displays badge with unread count.
  - Opens a lightweight popover/dropdown showing the **latest 5 notifications**.
- **Full Notifications Page**:
  - History of user notifications with read/unread filtering.
- **Actionable Modals**:
  - Reserved strictly for high-priority notifications requiring explicit user action (e.g., pending organization invitation, AI action approval).
  - Will NOT pop up automatically for every ordinary notification.

---

## Phase 5 — Invitations (Planned)

#### 5.1 Invitation Foundation (Planned)
- `Invitation` entity (companyId, invited email, intended role, inviterId, secure token, expiration, status).
- Invitation statuses: `PENDING`, `ACCEPTED`, `DECLINED`, `EXPIRED`, `REVOKED`.

#### 5.2 Invitation Flow (Planned)
- Authorized member invites a user by email.
- Invitation created as `PENDING`.
- **Membership vs Invitation Distinction**: An invitation is a pending access offer. Creating an invitation MUST NOT automatically create a `CompanyMembership`. `CompanyMembership` is created ONLY when the invitation is explicitly accepted by the verified user.
- **Onboarding Scenarios**:
  - *Existing Local CEO user*: Associated by verified email; receives in-app notification & actionable UI.
  - *New User*: Invitation exists by email; external delivery directs user to complete Google OAuth authentication; post-authentication server logic verifies that authenticated email matches invited email.
  - Browser query params containing email are NEVER trusted for authorization.
- Authenticated invited user accepts or declines.
- `CompanyMembership` created ONLY upon successful acceptance, updating invitation status to `ACCEPTED`.

#### 5.3 Invitation Notifications & UX (Planned)
- Notification generated for recipient upon invitation creation.
- Actionable invitation UI (modal / banner).
- Inviter receives notification when invitation is accepted or declined.

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

11. **Mandatory UI Component Usage (`components/ui`)**
    - Whenever appropriate, developers and AI agents MUST always use existing components in the `components/ui` folder (such as `Typography`, `AppIcon`, `Button`, `Input`, `Dialog`, `Select`, `Tooltip`, etc.) rather than writing raw HTML tags or duplicating styles.
    - For text rendering specifically, always use `<Typography variant="...">` for headings, subtitles, body text, labels, captions, and badges. Add new typography variants to `components/ui/typography.tsx` when a new typographic style is needed.

12. **Notification Read State vs Domain Action State**
    - Notification read state (`readAt`) and domain action state (e.g., `invitation.status = PENDING`) are separate concerns.
    - Viewing or marking an invitation notification as read (`readAt != null`) does NOT accept or decline the invitation (`status = PENDING`). Notification read state must never be used as the source of truth for domain lifecycle states.

13. **Notifications vs Audit Log**
    - **Notifications**: User-facing, recipient-oriented events that inform a specific user of relevant activity and support read/unread states.
    - **Audit Log**: System-wide / company historical record tracking who performed what action on which resource for compliance, security, and AI agent action traceability. Notifications and audit events serve different purposes and must not be merged.

14. **Future AI Actor Compatibility**
    - Notification actors may be a human user, an AI agent, or a system service.
    - Notification architecture must remain extensible for AI-generated and system-generated notifications without assuming the actor is always another human user.

15. **Generic Notification System**
    - Notifications are a generic application capability, not limited to invitations.

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

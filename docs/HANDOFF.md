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
- **Current Phase**: **Phase 5 — Member Invitations & Notifications (Backend foundation complete; Members and Invitations tabs, multi-status & role filters, invite modal, revocation flow with confirmation dialog, and shared UI components implemented in repo; runtime verification pending for latest filtering and revocation additions)**
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

## Historical Implementation — Completed

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

## Historical Implementation — Completed

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

#### 4.4 Notification Foundation (Completed in backend scope)

- Generic application-level notification capability (`Notification`) is implemented as a user-recipient persistence layer.
- Notifications answer: _What should a specific application user be informed about?_
- Recipient-oriented notifications support optional `companyId`, read/unread states (`readAt`), optional actor metadata, and unread count helpers.
- Current backend notification consumers include invitation events and other future app-level alerts. Email and push delivery remain deferred.
- **Current scope limitation**:
  - The global notification bell and full notification center are not implemented yet.
  - Notification UI and popover experiences remain pending.

---

## Phase 5 — Invitations & Notifications

### Summary of Latest Development Session (November 22, 2026)

During the November 22, 2026 session, development focused on completing the sent invitation management experience inside the company workspace, introducing advanced multi-select filtering, implementing invitation revocation with a confirmation dialog, and standardizing reusable UI components.

#### 1. Invitation Creation Integration

- **Dialog & Form**: `InviteMemberDialog` (`features/invitations/components/invite-member-dialog.tsx`) provides the modal interface for inviting new members. Built with React Hook Form, `@hookform/resolvers/zod`, `InputText`, and `SimpleSelector`.
- **Server Action**: Fully integrated with `createInvitationAction()` (`lib/actions/invitations.ts`).
- **Policy-Governed Roles**: Available target roles are strictly derived server-side via `getAssignableInvitationRoles(context.membership.role)` from `lib/invitations/policy.ts`. `OWNER` can assign `ADMIN`, `MANAGER`, `FINANCE`, `VIEWER`; `ADMIN` can assign `MANAGER`, `FINANCE`, `VIEWER`. Other roles cannot invite. `OWNER` can never be assigned via invitation.
- **Validation & Duplicate Prevention**: Validates email format, checks for existing company membership, and blocks duplicate active pending invitations for the same email and company.
- **Expiration & Notification**: Sets a 7-day expiration (`INVITATION_DURATION_DAYS = 7`). Immediately creates an in-app `Notification` record if the invited recipient already has an application `User` account.
- **Feedback**: Provides immediate user feedback via the global toast system (`toast.success("Invitation created successfully.")`). On failure, preserves user input in the modal and displays server errors in the dialog.

#### 2. Members and Invitations Tabs (`/companies/[slug]/members`)

The workspace members route now supports a dual-tab management layout:

- **Tabbed Interface**: `CompanyMembersPageContent` (`features/companies/components/company-members.tsx`) switches between `Members` (`tab=members` or default) and `Invitations` (`tab=invitations`).
- **Direct Access Protection**: The page component (`app/companies/[slug]/members/page.tsx`) enforces server-side authorization:
  ```ts
  requirePermission(context, "members.read");
  const canInvite = hasPermission(context, "members.invite");
  if (tab === "invitations") {
    requirePermission(context, "members.invite");
  }
  ```
  Users without `members.invite` cannot access or view the Invitations tab.
- **Members Directory**: Retains the existing member directory with server-side search, multi-role filter via `MultiSelector`, and count-based pagination.
- **Invitations Directory**: `CompanyInvitationsList` (`features/invitations/components/company-invitations-list.tsx`) lists sent company invitations with email, role badge (`MemberRoleBadge`), effective status badge (`InvitationStatusBadge`), formatted creation date, expiration date, count-based pagination, and revocation action.

#### 3. Multi-Select Status & Role Filtering

The Invitations tab filter control (`CompanyInvitationsFilters` in `features/invitations/components/company-invitations-filters.tsx`) supports advanced multi-selection:

- **Statuses Supported**: `PENDING`, `ACCEPTED`, `DECLINED`, `EXPIRED`, `REVOKED`.
- **Default Status**: `PENDING` is the default filter. When only `PENDING` is selected, the `status` parameter is omitted from the URL.
- **Multiple Statuses**: Multiple statuses can be selected simultaneously (e.g., `?tab=invitations&status=PENDING,ACCEPTED`).
- **Empty Selection (`ALL`)**: Deselecting all status options causes the URL to set `status=ALL`. The server translates this into an empty status constraint (`statuses = []`), returning all invitations regardless of status.
- **Role Filtering**: Multi-selection of invitable roles via `MultiSelector`, serialized to the `inviteRoles` URL parameter.
- **Clear Filters**: "Clear filters" resets both `status` and `inviteRoles` and deletes `page`, returning the user to the default Pending view.
- **Pagination Reset**: Any change to status or role filters immediately deletes the `page` parameter, resetting navigation to page 1.
- **Effective Expiration in Queries**: `getCompanyInvitations()` in `features/invitations/queries.ts` accurately queries effective expiration:
  - Filtering for `PENDING`: queries `{ status: "PENDING", expiresAt: { gt: now } }`.
  - Filtering for `EXPIRED`: queries `{ OR: [{ status: "EXPIRED" }, { status: "PENDING", expiresAt: { lte: now } }] }`.
  - Display items calculate `effectiveStatus`: `status === "PENDING" && expiresAt <= now ? "EXPIRED" : status`.

#### 4. Invitation Revocation Flow

- **Component**: `RevokeInvitationButton` (`features/invitations/components/revoke-invitation-button.tsx`).
- **Eligibility**: Revocation action is only rendered when `invitation.effectiveStatus === "PENDING"` AND `allowedRoles.includes(invitation.role)`.
- **Confirmation Dialog**: Clicking Revoke opens `ConfirmationDialog` with title "Revoke invitation", descriptive warning, confirm label "Revoke", and destructive styling (`destructive={true}`).
- **Server Action**: `revokeInvitationAction({ companySlug, invitationId })` in `lib/actions/invitations.ts`:
  - Enforces `members.invite` permission server-side.
  - Ensures tenant scoping by matching `companyId`.
  - Verifies actor's role can manage the target role via `canAssignInvitationRole()`.
  - Verifies invitation status is `PENDING`.
  - Executes atomic conditional update (`updateMany` where `status = "PENDING"` and `expiresAt > now`), preventing race conditions against concurrent acceptance.
  - Revalidates `/companies/[slug]/members` and `/home`.
- **Feedback**: Triggers `toast.success("Invitation revoked successfully.")` and `router.refresh()` on success, or `toast.error(result.error)` on failure.

#### 5. Reusable Shared UI Improvements

- **`MultiSelector`** (`components/ui/MultiSelector.tsx`): Generic popover-based multi-option selection component built on `@base-ui/react/popover`. Presentation-oriented and completely decoupled from domain logic.
- **`ConfirmationDialog`** (`components/ui/confirmation-dialog.tsx`): Reusable confirmation modal with title, description, loading state, and destructive/standard action buttons.
- **`SimpleSelector`** (`components/ui/simple-selector.tsx`): Single-select wrapper over shadcn/Base UI `Select`.
- **`InputText`** (`components/ui/input-text.tsx`): Standard text input wrapper with integrated label, error, and helperText.
- **`Button`** (`components/ui/button.tsx`): Styled action button supporting design-system variants and sizes.
- **`Typography`** (`components/ui/typography.tsx`): Centralized typography system supporting semantic variants (`header-1` to `header-4`, `subtitle`, `regular`, `small`, `muted`, `caption`, `code`, and aliases).
- **`AppIcon`** (`components/ui/app-icon.tsx`): Centralized Lucide icon registry, extended with `info` and `alert-triangle`.
- **`ToastProvider` / `useToast`** (`components/ui/toaster.tsx`): Lightweight global ephemeral notification system mounted in `app/layout.tsx`.

---

## UI Component Reuse Conventions

> ### ⚠️ CRITICAL RULE FOR FUTURE AI AGENTS (MANDATORY)
>
> If you are asked to create or modify a UI feature but do not have enough context about the existing shared components, **DO NOT guess their APIs or recreate them.**
>
> First inspect their implementations in `components/ui/`.
>
> If the relevant component source is unavailable or cannot be inspected, explicitly ask the user to share the component code before proceeding:
>
> _"Before implementing this component, please share your existing Button, Typography, MultiSelector, or other relevant UI component so I can reuse your established API and styling conventions."_

All future frontend development MUST strictly follow these 16 UI conventions:

1. **Inspect First**: Before creating a new UI component, inspect `components/ui/` and identify whether a suitable reusable component already exists.
2. **Avoid Native HTML Duplication**: Prefer existing UI components over native HTML elements with duplicated styling whenever appropriate.
3. **Typography**: Use the existing `Typography` component for application text, headings, labels, and related content when its API supports the required semantics (`<Typography variant="...">`).
4. **Button**: Use the shared `Button` component for application actions rather than repeatedly styling native `<button>` tags.
5. **AppIcon Registry**: Use `AppIcon` instead of importing Lucide icons directly into feature components or introducing inline SVG icons when the required icon is available through `AppIcon`.
6. **Extend AppIcon**: If an icon is missing, inspect the `AppIcon` registry in `components/ui/app-icon.tsx` and extend it when appropriate instead of bypassing the centralized icon system.
7. **InputText**: Use `InputText` for standard text input functionality.
8. **SimpleSelector**: Use `SimpleSelector` for single-option selection.
9. **MultiSelector**: Use `MultiSelector` for selecting multiple options.
10. **Generic MultiSelector**: `MultiSelector` must remain strictly generic and reusable. It must not contain feature-specific knowledge about roles, invitations, companies, or database models.
11. **Filter Ownership**: Filter components should own URL parameter management and business-specific filter behavior. Shared UI selectors should remain presentation-oriented and controlled through their props.
12. **ConfirmationDialog**: Use `ConfirmationDialog` for confirmation workflows (e.g. deletions, revocations, cancellations) instead of creating one-off confirmation dialogs or using `window.confirm()`.
13. **Ephemeral Toasts**: Use the existing global toast system (`useToast()`) for ephemeral success, error, warning, and informational feedback.
14. **Primitives & Patterns**: Prefer existing Base UI/shadcn primitives and established design-system patterns.
15. **Accessibility**: Preserve accessibility, keyboard navigation, semantic HTML, and responsive styling.
16. **No Redundant Abstractions**: Avoid introducing new dependencies or unnecessary UI abstractions when an existing component can satisfy the requirement.

---

## Verification Status & Implementation Boundaries

### Verification Already Performed

- `npm run lint`: Passed with zero errors.
- `npm run type-check`: Passed with zero TypeScript errors.
- Visual inspection: Earlier visual verification performed on the initial Invitations table and filter layout.

### Implemented Code vs. Runtime Verification Status

- **Implemented in Repository**:
  - `InviteMemberDialog` integrated with `createInvitationAction()`.
  - Members / Invitations tabbed route layout with server-side protection.
  - `MultiSelector` component and integration into both tabs.
  - Multi-status filter with `PENDING` default, multiple selection, and `ALL` empty selection.
  - Multi-role filter for invitations (`inviteRoles`).
  - Effective expiration query handling in Prisma.
  - `RevokeInvitationButton` and `ConfirmationDialog`.
  - `revokeInvitationAction()` with atomic conditional updates.
  - Global toast feedback.
- **Unverified Runtime Behavior (Pending Live Testing)**:
  - Multi-status invitation filtering combinations in the live database.
  - Combined role and status filter queries in PostgreSQL.
  - Empty status selection (`status=ALL`) query execution.
  - Default `PENDING` restoration upon clearing filters.
  - Pagination boundary conditions across filtered result sets.
  - Live execution of `ConfirmationDialog` confirm/cancel actions.
  - Live revocation success and failure toast feedback.
  - Permission denial behavior when non-permitted users attempt direct navigation to `?tab=invitations`.
  - Immediate appearance of newly created invitations in the list after modal submission.

---

## EXACT NEXT TASK

### Step 1: Verification Protocol for Latest Phase 5 Changes

Before writing new features, verify the implemented invitation management functionality:

1. Verify multi-status invitation filtering (`PENDING`, `ACCEPTED`, `DECLINED`, `EXPIRED`, `REVOKED`).
2. Verify combined role (`inviteRoles`) and status (`status`) filtering.
3. Verify empty status selection (`status=ALL` showing all records).
4. Verify default `PENDING` behavior when parameters are cleared.
5. Verify pagination reset on filter changes and correct pagination navigation.
6. Verify `ConfirmationDialog` opening, cancellation, and confirmation flows.
7. Verify revocation success, error handling, atomic updates, and route revalidation.
8. Verify toast feedback for creation and revocation.
9. Verify authorization restrictions (`members.invite` guard on tab and action).
10. Verify fresh invitation appearance after creation; add or verify `router.refresh()` only if necessary.
11. Run `npm run lint`, `npm run type-check`, and `npm run build`.

### Step 2: Next Major Feature — RECEIVED INVITATIONS (Recipient UX)

Implement the recipient-side invitation experience allowing authenticated users to review and respond to invitations sent to their email address.

**Expected Scope**:

- Display pending invitations belonging to the authenticated user's verified email.
- Integrate the existing `getMyPendingInvitations()` query (`features/invitations/queries.ts`).
- Provide clear Accept and Decline actions.
- Reuse `acceptInvitationAction()` and `declineInvitationAction()` (`lib/actions/invitations.ts`).
- Ensure `CompanyMembership` is created atomically upon acceptance.
- Refresh company memberships and user context after acceptance so the new company appears in the user's workspace.
- Handle expired, revoked, or otherwise unavailable invitations gracefully.
- Preserve company tenant isolation and recipient email verification boundaries.

### Step 3: Notification Center & UX (Following Recipient Invitations)

- Global notification bell in the application navigation header.
- Unread notification count badge.
- Notification popover with recent events and mark-as-read capability.
- Full notification history surface.

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
   - Hiding UI elements is never the security boundary. All Server Actions and data queries must validate permissions server-side.

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

11. **Mandatory UI Component Reuse (`components/ui`)**
    - Developers and AI agents MUST follow the 16 UI Component Reuse Conventions detailed above.
    - Always use `<Typography variant="...">` for text and `<Button>` for actions.
    - Never guess component APIs—inspect `components/ui/` or ask the user for component source code.

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

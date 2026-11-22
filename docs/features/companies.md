# Feature: Companies & Multi-Tenancy

## Overview

Companies serve as the multi-tenant isolation boundary for Local CEO. All business data, inventory, invoices, and AI agent interactions are strictly scoped to a specific company.

## Current Phase 5 Behavior: Members & Invitations Workspace

The company workspace directory at `/companies/[slug]/members` now features a dual-tab management interface:

### 1. Members Tab

- Accessible to any company member with `members.read` permission.
- Scoped server-side query filtering active company members in PostgreSQL.
- Server-side case-insensitive search by member name or email.
- Multi-role filtering powered by the generic `MultiSelector` component, supporting multiple `BUILT_IN_ROLES` (`OWNER`, `ADMIN`, `MANAGER`, `FINANCE`, `VIEWER`).
- Count-based pagination preserving active search and role parameters.
- Suspense boundary with `CompanyMembersTableSkeleton` loading state that preserves filter control mount and focus.

### 2. Invitations Tab

- Scoped sent invitations directory for the active company.
- Access restricted server-side: navigating to or requesting `tab=invitations` executes `requirePermission(context, "members.invite")`.
- Multi-status filtering via `MultiSelector`: `PENDING`, `ACCEPTED`, `DECLINED`, `EXPIRED`, `REVOKED`. Defaults to `PENDING`; empty selection (`status=ALL`) returns all statuses.
- Multi-role filtering via `MultiSelector` for `INVITABLE_ROLES` (`inviteRoles`).
- Dynamic effective expiration handling: unexpired pending invitations vs expired pending invitations are derived accurately at query and presentation time.
- Invitation revocation: eligible pending invitations render a "Revoke" action wired to `RevokeInvitationButton`, `ConfirmationDialog`, and `revokeInvitationAction()`.
- Count-based pagination with automatic page reset upon filter modifications.

### Header & Actions

- When the authenticated member possesses `members.invite` permission and assignable target roles according to `getAssignableInvitationRoles(role)`, an "Invite Member" action button is rendered in the header.
- Clicking the button launches `InviteMemberDialog` for email and role assignment, executing `createInvitationAction()`.
- `OWNER` may assign `ADMIN`, `MANAGER`, `FINANCE`, and `VIEWER`; `ADMIN` may assign `MANAGER`, `FINANCE`, and `VIEWER`. Other roles cannot invite.

## Current Phase 3.4 Behavior

The company list on the home screen is now powered by PostgreSQL through the application user’s CompanyMembership records instead of dummy UI data.

### Server-side company listing

- Company access is resolved through `User -> CompanyMembership -> Company`.
- The listing query is server-only and is executed through Prisma on the backend.
- Search is performed in PostgreSQL with case-insensitive matching against the company name.
- Industry filtering is also applied in PostgreSQL, not in the browser.
- Pagination is handled in Prisma using `skip` and `take`.
- Ordering remains fixed to company name ascending until a future sorting feature is introduced.

### URL contract

The home page list follows this query contract:

- `/home`
- `/home?page=2`
- `/home?search=atlas`
- `/home?industry=Technology`
- `/home?search=atlas&industry=Technology`
- `/home?page=2&industry=Retail`

No `sortBy` or `sortOrder` parameters are supported in this phase.

## Phase 3.5 Workspace & Context Behavior

Selecting a company card on `/home` navigates directly to its workspace at `/companies/[slug]`.

### Server-side company context (`getCompanyContext`)

- Workspace access is protected by `getCompanyContext(slug)` in `lib/auth/company-context.ts`.
- The helper resolves the authenticated Supabase session, synchronizes the application User, fetches the `Company` record by `slug`, and verifies `CompanyMembership` for `(userId, companyId)`.
- If the user is unauthenticated, they are redirected to `/login`.
- If the company slug does not exist, or the authenticated user is not a member of the company, `notFound()` is returned to avoid exposing company existence to non-members.

### Company workspace layout & dashboard

- Route: `/companies/[slug]`
- Layout includes `CompanySidebar` with multi-module workspace navigation (Overview, Operations, Growth, Insights, People, Company).
- Unimplemented modules are displayed with a "Soon" indicator without dead links or fake data.
- The Overview dashboard (`CompanyOverview`) displays genuine model data (`Company` name, legal name, country code, industry, generic tax ID / RIF, membership role, and creation timestamp).
- Loading states use `CompanyWorkspaceSkeleton` wrapped in Suspense via route `loading.tsx`.

## Key Requirements

- Company creation flow initiated from the home-company workspace area through a modal (`Name`, `Legal Name`, `Country`, `Industry`, `Registration / Tax ID`).
- Company listing is server-rendered and supports URL-driven filtering and pagination.
- Company list is scoped to the currently authenticated application user through `CompanyMembership` only.
- Industry options are derived from the current user’s actual company records, not a hardcoded list.
- Empty filtered results show a clear empty state rather than a create card.
- Empty unfiltered results show the create-company card on page 1 only.
- Strict `companyId` context injection remains required for future business modules and server actions.
- Complete data isolation between companies.
- Navigation from `/home` card enters `/companies/[slug]`.
- Company workspace routes verify membership server-side.

## Design Rule

A single user can belong to multiple companies with distinct roles in each company. Data must never leak between companies.

## Implementation Notes

### Home page behavior

- The page maintains server-side authentication verification via Supabase.
- It synchronizes the authenticated user into the Local CEO app database.
- It reads query params safely and sanitizes invalid page values to 1.
- The list is wrapped in a Suspense boundary so a skeleton appears while data loads.

### Company workspace navigation & security

- The authenticated application user ID is the source of truth for company membership queries.
- No company workspace can be accessed from an arbitrary user ID or slug without verified server-side `CompanyMembership`.
- The tenant boundary is enforced in Prisma by filtering through `CompanyMembership` membership records in `getCompanyContext`.

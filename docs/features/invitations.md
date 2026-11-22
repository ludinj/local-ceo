# Feature: Member Invitations

## Overview

The invitation system provides company-scoped, pending access offers that can be created, queried, filtered, revoked, accepted, and declined under strict server-side validation and role-based authorization.

During the November 22, 2026 development session, the company workspace members area (`/companies/[slug]/members`) was expanded from a standalone member list into a two-tab interface:

1. **Members**: The existing directory of active company members with server-side search, multi-role filtering, and pagination.
2. **Invitations**: A comprehensive directory of sent company invitations featuring multi-status filtering, multi-role filtering, pagination, effective expiration status derivation, and an invitation revocation flow guarded by a confirmation dialog.

Additionally, the invitation creation modal (`InviteMemberDialog`) is integrated with the `createInvitationAction()` server action, providing client-side and server-side validation, duplicate prevention, role-policy enforcement, seven-day expiration, and global toast notifications.

> **Implementation vs. Verification Note**: While the invitation creation flow and base UI components passed lint, type-check, and visual review in earlier testing, the newly introduced multi-status filter combinations, empty status selection, and confirmation dialog revocation flow are implemented in code but await full end-to-end runtime verification in the live database.

---

## Architecture & Data Model

### Database Entity (`Invitation`)

Defined in `prisma/schema.prisma` and mapped to PostgreSQL `public.Invitation`:

| Field          | Type             | Description                                           |
| :------------- | :--------------- | :---------------------------------------------------- |
| `id`           | UUID (PK)        | Unique invitation identifier                          |
| `companyId`    | UUID (FK)        | Scoped company offering access                        |
| `inviterId`    | UUID (FK)        | User who created the invitation                       |
| `invitedEmail` | String (254)     | Normalized, lowercase target recipient email          |
| `role`         | String           | Target role (`ADMIN`, `MANAGER`, `FINANCE`, `VIEWER`) |
| `tokenHash`    | String (64)      | SHA-256 hash of the secure invitation token           |
| `expiresAt`    | DateTime         | Timestamp when invitation expires (default: 7 days)   |
| `status`       | InvitationStatus | Persisted lifecycle status enum                       |
| `acceptedAt`   | DateTime?        | Timestamp when accepted by recipient                  |
| `declinedAt`   | DateTime?        | Timestamp when declined by recipient                  |
| `revokedAt`    | DateTime?        | Timestamp when revoked by authorized member           |
| `createdAt`    | DateTime         | Creation timestamp                                    |
| `updatedAt`    | DateTime         | Last update timestamp                                 |

### Persisted Status Enum (`InvitationStatus`)

- `PENDING`: Access offer is active and awaiting recipient response.
- `ACCEPTED`: Offer accepted; membership created.
- `DECLINED`: Offer explicitly declined by recipient.
- `EXPIRED`: Offer passed expiration date (or marked expired during reconciliation).
- `REVOKED`: Offer cancelled by an authorized company member.

### Effective Expiration Status

An invitation whose database status is `PENDING` but whose `expiresAt <= now()` is effectively expired. Local CEO handles this at both display and query layers:

- **Query Level (`getCompanyInvitations`)**: When filtering for `PENDING`, the backend query requires `expiresAt > now`. When filtering for `EXPIRED`, the backend constructs an `OR` condition matching both persisted `EXPIRED` status and `PENDING` invitations with `expiresAt <= now`.
- **Display Level**: `effectiveStatus` derives `"EXPIRED"` if `status === "PENDING" && expiresAt <= now`. Badges and revocation controls evaluate `effectiveStatus`.

---

## Frontend Workspace Implementation (`/companies/[slug]/members`)

### Tabbed Navigation

The page layout (`app/companies/[slug]/members/page.tsx` and `features/companies/components/company-members.tsx`) hosts two tabs:

- **Members Tab** (`?tab=members` or default): Scoped member directory with name/email search, multi-role filter (`roles`), and count-based pagination. Accessible to any member with `members.read`.
- **Invitations Tab** (`?tab=invitations`): Scoped sent invitations directory. Direct access is protected server-side:
  ```ts
  if (tab === "invitations") {
    requirePermission(context, "members.invite");
  }
  ```
  Users without `members.invite` cannot see or navigate to the Invitations tab.

### URL Query Parameter Contract

| Parameter     | Applies To  | Type / Format                       | Default      | Behavior                                                                                                                                                                                             |
| :------------ | :---------- | :---------------------------------- | :----------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tab`         | Page        | `"members"` \| `"invitations"`      | `"members"`  | Selects active view. Direct access to `"invitations"` requires `members.invite`.                                                                                                                     |
| `page`        | Both        | Positive safe integer               | `1`          | Pagination page number. Reset (deleted) upon filter changes.                                                                                                                                         |
| `search`      | Members     | String                              | `""`         | Case-insensitive search on member name and email. Debounced 350ms.                                                                                                                                   |
| `roles`       | Members     | Comma-separated roles               | None (`ALL`) | Filters members by `BUILT_IN_ROLES` (`OWNER`, `ADMIN`, `MANAGER`, `FINANCE`, `VIEWER`).                                                                                                              |
| `status`      | Invitations | Comma-separated statuses \| `"ALL"` | `"PENDING"`  | Filters invitations by effective status. Defaults to `PENDING` if omitted. If all options deselected in UI, uses `status=ALL` (backend fetches all statuses). If reset to default, param is omitted. |
| `inviteRoles` | Invitations | Comma-separated roles               | None (`ALL`) | Filters invitations by `INVITABLE_ROLES` (`ADMIN`, `MANAGER`, `FINANCE`, `VIEWER`).                                                                                                                  |

### Status Filtering Rules for Invitations

1. **Default View**: When no `status` query parameter is present, the page displays `PENDING` invitations only.
2. **Multi-Selection**: Users can check any combination of `PENDING`, `ACCEPTED`, `DECLINED`, `EXPIRED`, and `REVOKED` via `MultiSelector`.
3. **Empty Selection (`ALL`)**: Deselecting all status checkboxes sends `status=ALL` in the URL. The server translates this into an empty status condition list (`statuses = []`), querying invitations without status restriction.
4. **Default Restoration**: Selecting solely `PENDING` deletes the `status` URL parameter, restoring clean canonical URLs.
5. **Clear Filters**: Clicking "Clear filters" removes both `status` and `inviteRoles` parameters and resets `page`, immediately returning to default `PENDING` view.
6. **Pagination Reset**: Every status or role filter change explicitly deletes the `page` parameter, returning users to page 1.

---

## Invitation Workflows

### 1. Invitation Creation (`InviteMemberDialog`)

- **Component**: `features/invitations/components/invite-member-dialog.tsx`
- **Trigger**: "Invite Member" button rendered in page header when `canInvite` is true and `allowedRoles.length > 0`.
- **Form Architecture**: React Hook Form with `@hookform/resolvers/zod`. Uses reusable `InputText` and `SimpleSelector`.
- **Form Schema**:
  - `email`: Required, valid email format, max 254 chars, trimmed, lowercased.
  - `role`: Required, trimmed, validated against `allowedRoles`.
- **Server Action**: `createInvitationAction({ companySlug, email, role })` in `lib/actions/invitations.ts`.
  - Validates `members.invite` permission via `getCompanyContext()`.
  - Enforces `canAssignInvitationRole(actorRole, targetRole)`.
  - Normalizes target email.
  - Reconciles any previously expired pending invitations for that email.
  - Rejects creation if target email is already an active company member (`ALREADY_MEMBER`).
  - Rejects creation if an active pending invitation already exists (`ALREADY_INVITED`).
  - Generates cryptographically secure random token, stores SHA-256 hash.
  - Sets 7-day expiration (`INVITATION_DURATION_DAYS = 7`).
  - Creates in-app `Notification` record if recipient already has an application `User` account.
  - Revalidates `/companies/[slug]/members` and `/home`.
- **Feedback & State**:
  - Success: Closes dialog, resets form state, issues `toast.success("Invitation created successfully.")`.
  - Failure: Preserves user input, keeps modal open, displays server error message in form root alert area.

### 2. Company Invitations Directory (`CompanyInvitationsList`)

- **Component**: `features/invitations/components/company-invitations-list.tsx`
- **Query**: `getCompanyInvitations(companySlug, options)` in `features/invitations/queries.ts`.
- **Features**:
  - Displays total count (e.g., "1 invitation" or "12 invitations").
  - Table grid displaying: Email, Role badge (`MemberRoleBadge`), Status badge (`InvitationStatusBadge`), Created date, Expiration date, and Actions.
  - Responsive horizontally scrollable table container with a minimum width for the grid; the header is not sticky.
  - Shared `Pagination` component for page navigation.
  - Suspense loading state with `CompanyMembersTableSkeleton`.
  - Empty state when no invitations match filters vs. when no invitations exist.

### 3. Invitation Revocation (`RevokeInvitationButton`)

- **Component**: `features/invitations/components/revoke-invitation-button.tsx`
- **Eligibility**:
  - An invitation can only be revoked if `invitation.effectiveStatus === "PENDING"` AND `allowedRoles.includes(invitation.role)`.
  - If ineligible, a dash (`—`) is rendered in the Actions column.
- **Workflow**:
  1. User clicks "Revoke" button (`variant="ghost"`, destructive text).
  2. Reusable `ConfirmationDialog` opens:
     - Title: "Revoke invitation"
     - Description: "Are you sure you want to revoke the invitation for [email]? This action cannot be undone."
     - Confirm button: "Revoke" (`destructive={true}`).
  3. On confirmation, invokes `revokeInvitationAction({ companySlug, invitationId })`.
  4. Server-side execution:
     - Verifies `members.invite` permission.
     - Scopes query to `companyId` (tenant isolation).
     - Verifies actor's role can manage target invitation's role (`canAssignInvitationRole`).
     - Verifies status is `PENDING`.
     - Executes atomic conditional update:
       ```ts
       prisma.invitation.updateMany({
         where: {
           id: invitation.id,
           companyId,
           status: "PENDING",
           expiresAt: { gt: now },
         },
         data: { status: "REVOKED", revokedAt: now },
       });
       ```
     - Revalidates paths (`/companies/[slug]/members`, `/home`).
  5. UI feedback:
     - Success: Closes confirmation dialog, triggers `toast.success("Invitation revoked successfully.")`, and triggers `router.refresh()`.
     - Error: Displays `toast.error(result.error)`.

---

## Authorization & Policy Matrix

### Permissions Required

- `members.read`: View company members directory.
- `members.invite`: View Invitations tab, view "Invite Member" button, submit invitation creation, view pending invitation revocation buttons, execute invitation revocation.

### Role Assignment Matrix (`lib/invitations/policy.ts`)

| Actor Role | Can Invite? | Allowed Target Roles (`INVITABLE_ROLES`) |
| :--------- | :---------: | :--------------------------------------- |
| `OWNER`    |     Yes     | `ADMIN`, `MANAGER`, `FINANCE`, `VIEWER`  |
| `ADMIN`    |     Yes     | `MANAGER`, `FINANCE`, `VIEWER`           |
| `MANAGER`  |     No      | None                                     |
| `FINANCE`  |     No      | None                                     |
| `VIEWER`   |     No      | None                                     |

> **Critical RBAC Rule**: `OWNER` cannot be assigned via invitation. Ownership transfers belong to Phase 4.3 and require `ownership.transfer` permission.

---

## Shared UI Components Utilized

During this implementation, reusable UI components were introduced or consumed:

1. **`MultiSelector`** (`components/ui/MultiSelector.tsx` in the latest shared imports; verify exact filename casing in the current repository):
   - Generic popover multi-select built with `@base-ui/react/popover`.
   - Used for both Members role filtering and Invitations status & role filtering.
   - Remains strictly presentation-oriented with zero domain logic.
2. **`ConfirmationDialog`** (`components/ui/confirmation-dialog.tsx`):
   - Generic modal dialog for destructive or high-impact confirmations.
   - Used for invitation revocation.
3. **`SimpleSelector`** (`components/ui/simple-selector.tsx`):
   - Single-option select wrapper over Base UI / shadcn Select.
   - Used in `InviteMemberDialog` for role selection.
4. **`InputText`** (`components/ui/input-text.tsx`):
   - Controlled/uncontrolled input with label, helper text, and accessible error styling.
5. **`Button`** (`components/ui/button.tsx`) & **`Typography`** (`components/ui/typography.tsx`):
   - Reused across all screens following design system conventions.
6. **`AppIcon`** (`components/ui/app-icon.tsx`):
   - Central icon registry extended with `info` and `alert-triangle`.
7. **`ToastProvider` / `useToast`** (`components/ui/toaster.tsx`):
   - Global ephemeral feedback for creation and revocation actions.

---

## Current Status & Next Tasks

| Area                                    | Status                       | Details                                                                                                       |
| :-------------------------------------- | :--------------------------- | :------------------------------------------------------------------------------------------------------------ |
| **Backend Invitation Foundation**       | **Completed**                | Models, tokens, hashing, recipient matching, actions, queries.                                                |
| **Invite Member Modal**                 | **Implemented**              | RHF + Zod form, server action integration, toast feedback.                                                    |
| **Members / Invitations Tabs**          | **Implemented**              | Protected tab switching, URL synchronization.                                                                 |
| **Multi-Status & Role Filters**         | **Implemented (Unverified)** | Multi-select filters, default PENDING, `ALL` handling, effective expiration queries. Runtime testing pending. |
| **Invitation Revocation Flow**          | **Implemented (Unverified)** | Revoke button, confirmation dialog, atomic server action, toast feedback. Runtime testing pending.            |
| **Received Invitations (Recipient UX)** | **Planned (Next)**           | UI for authenticated users to view (`getMyPendingInvitations`), accept, and decline invitations.              |
| **Notification Center / Bell**          | **Planned**                  | Global header bell, unread count badge, notification popover.                                                 |
| **Outbound Email Delivery**             | **Deferred**                 | Background email delivery service (tokens currently stored as SHA-256 hashes).                                |

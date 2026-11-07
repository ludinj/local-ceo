# Feature: Member Invitations

## Overview
The backend invitation foundation is now implemented for Local CEO. Invitations are company-scoped pending access offers that can be created, queried, accepted, declined, and revoked only with server-side validation.

This feature is intentionally limited to the backend foundation in the current session. Frontend invitation management UI remains pending.

## Current Implementation Scope

### Database model
`Invitation` stores:

- `companyId`
- `inviterId`
- `invitedEmail`
- `role`
- `tokenHash`
- `expiresAt`
- `status`
- lifecycle timestamps: `acceptedAt`, `declinedAt`, `revokedAt`

The persisted status enum is:

- `PENDING`
- `ACCEPTED`
- `DECLINED`
- `EXPIRED`
- `REVOKED`

### Server-side utilities

- `lib/invitations/service.ts` handles email normalization, token generation, SHA-256 hashing, expiry checks, and invitation URL helpers.
- `lib/invitations/policy.ts` defines the invitation role matrix and actor-to-target restrictions.
- `lib/invitations/recipient.ts` enforces verified authentication and email matching before a user can accept or decline their own invitation.

## Invitation workflows implemented

### Recipient queries
- `getMyPendingInvitations()` returns pending, unexpired invitations for the authenticated user based on the verified email.
- Invitations for companies where the user is already a member are excluded.
- The current result set is limited to 50 invitations.

### Company-scoped invitation listing
- `getCompanyInvitations()` provides authorized listing for a company.
- It supports pagination and persisted `status` filtering.
- It derives `effectiveStatus` for display when a pending invitation has passed its expiry time, while preserving the underlying persisted state.

### Invitation creation
- `createInvitationAction()` validates:
  - authenticated company membership,
  - `members.invite` permission,
  - target role via policy,
  - duplicate pending invitation checks,
  - current membership exclusion,
  - expired-outstanding invitation cleanup.
- Existing application users receive an in-app notification when invited.
- Users without an existing application account remain discoverable after verified authentication via email matching.

### Invitation actions
- `acceptInvitationAction()` atomically accepts a pending invitation and creates the corresponding `CompanyMembership`.
- `declineInvitationAction()` marks the invitation as `DECLINED` without creating a membership.
- `revokeInvitationAction()` allows authorized company members to cancel a pending invitation.
- State transitions use conditional database operations to prevent invalid lifecycle races.

## Authorization rules implemented

Only `OWNER` and `ADMIN` have the `members.invite` permission.

### Assignable invitation roles

| Actor role | Allowed target roles |
| :--------- | :------------------ |
| `OWNER`    | `ADMIN`, `MANAGER`, `FINANCE`, `VIEWER` |
| `ADMIN`    | `MANAGER`, `FINANCE`, `VIEWER` |
| `MANAGER`  | None |
| `FINANCE`  | None |
| `VIEWER`   | None |

Additional rules:

- Assignment and revocation enforce the same role restrictions.
- `OWNER` cannot be assigned through ordinary invitations.
- Invitations never create memberships before acceptance.
- Company authorization is enforced server-side using `getCompanyContext()` and `requirePermission()`.
- A user may receive invitations from multiple companies.
- Only the authenticated recipient with a matching verified email may accept or decline.

## Notification relationship

Invitation events are the first concrete use case for the generic notification foundation. Notification persistence is separate from invitation lifecycle state.

> A notification being read does not accept or decline an invitation, and a pending invitation is not considered accepted simply because a user viewed it.

## Current limitations and deferred work

- No background expiration job currently reconciles expired invitations.
- `effectiveStatus` is display-oriented; the persisted status may remain `PENDING` until a manual or conditional status update occurs.
- Status filtering in company invitation queries uses the persisted database status, not the derived effective status.
- Original invitation tokens are stored as hashes and cannot be recovered for future email delivery.
- Pending invitations are not automatically revoked if the inviter later loses invite privileges.
- Frontend invitation modal, forms, recipient action UI, and notification center are still pending.
- Security and concurrency coverage still needs broader expansion.

## Security stance

This feature is backed by server-side authorization, verified email checks, and conditional updates to avoid invalid status changes and duplicate membership creation. The browser is never treated as a trusted source of invitation identity or permission.

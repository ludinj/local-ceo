# Feature: Memberships

## Overview
Memberships represent the active association between a global `User` and a `Company`.

The current backend implementation keeps the role on `CompanyMembership` and treats membership creation as a separate, explicit action triggered by invitation acceptance. An invitation is a pending access offer; it is not itself a membership.

## Current Backend Scope
- `CompanyMembership` remains the tenant-scoped access boundary.
- Memberships are created only when an invitation is explicitly accepted by the authenticated recipient.
- Role metadata stays on `CompanyMembership`, not on `User`.
- Company membership queries and company-scoped member listing continue to enforce server-side authorization.

## Key Rules
- A user can hold different roles in different companies.
- A company may have many members, but each user/company pair is unique.
- Invitations for companies where the user is already a member are excluded from recipient queries.
- A pending invitation does not create a membership before acceptance.
- Acceptance and decline are restricted to the authenticated recipient whose verified email matches the invitation.

## Related Backend Services
- `lib/auth/company-context.ts` resolves the authenticated user and company membership context.
- `lib/auth/rbac.ts` enforces permission checks before invitation and company-scoped actions.
- `lib/actions/invitations.ts` creates, accepts, declines, and revokes invitations.

## Pending Work
- Member role changes and removal workflows remain deferred.
- Ownership transfer and final-owner protections remain deferred.
- Frontend member management UI is still pending.

# Feature: Notifications

## Overview

Notifications are a generic user-based application capability, not an invitation-only feature.

The current backend implementation provides notification persistence for recipient users, with optional company context, actor metadata, read/unread tracking, and query helpers. Invitation events are the first concrete use case, but the model is intentionally reusable for future member changes, invoice reminders, inventory alerts, billing notices, reporting updates, and AI approval workflows.

## Current Data Model

`Notification` stores:

- `recipientId`
- optional `companyId`
- `actorType`
- optional `actorId`
- notification `type`
- `title`
- `message`
- optional `link`
- optional `metadata`
- `readAt`

This keeps notifications tied to the user who needs to see them, while allowing event context to remain optional and domain-specific.

## Architectural principles

- Notifications belong to recipient users, not to companies alone.
- `companyId` is optional because many events are user-scoped or cross-company in nature.
- Invitation events are the first implemented use case, but the model is generic by design.
- Read state and business lifecycle state are independent. Marking a notification as read does not accept or decline an invitation.
- Notification persistence is currently in-app only. Email and push delivery are deferred.
- UI surfaces such as the global notification bell, notification popover, and full notification center are not implemented yet.

## Ephemeral UI toasts vs persisted application notifications

Local CEO now includes a lightweight global toast layer separate from the persisted application notification model.

- `components/ui/toaster.tsx` defines the toast context and `useToast()` hook.
- `app/layout.tsx` mounts the provider so the toast context is available for all application children.
- The provider wraps `{children}` rather than only the display surface, which is required: a standalone toaster that renders only the UI without wrapping the app tree will cause `useToast must be used within a ToastProvider`.
- Toasts support success, error, warning, and info variants with automatic and manual dismissal and accessible live-region announcements.
- These ephemeral UI messages are not stored as `Notification` records and are not part of the persisted user notification history.

The current invite-member modal uses this toast layer for the success message after a successful invitation creation, while the underlying `Notification` model remains a distinct persisted backend capability.

## Backend services implemented

- `lib/notifications/service.ts` supports:
  - notification creation,
  - unread count queries,
  - listing/filtering by user and optional company,
  - mark-as-read behavior,
  - bulk mark-all-read action.

### Current notification creation behavior

- Existing application users receive immediate in-app invitation notifications when an invitation is created for them.
- New users without an app record remain discoverable through pending-invitation queries after verified authentication.
- There is no automatic email or push dispatch layer in this session.

## Deferred or pending work

- Global notification bell in the application shell.
- Notification popover and UI summary count.
- Full notifications page with filtering and history.
- Actionable notification modals for high-priority events.
- Email and push delivery pipelines.
- Notification UI integration with invitation actions and home/company workspaces.

## Known limitations

- This is persistence-only functionality; the user experience is not yet connected to the UI shell.
- The notification architecture is generic but does not yet include a background event bus or dispatch orchestration.
- The current backend does not attempt end-to-end notification delivery outside the database layer.

## Related docs

- [Invitations](./invitations.md)
- [RBAC](./rbac.md)
- [Authentication](./auth.md)

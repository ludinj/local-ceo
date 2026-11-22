# Main Screen Overview

## Purpose

The main screen acts as the user’s company dashboard. It gives the user a central place to see their companies, manage access, and quickly move into a company workspace or create a new one.

## Overall Layout

The screen is built as a two-part layout:

- A left sidebar for navigation and user identity
- A main content area for the company overview and actions

On smaller screens, the sidebar collapses and a compact header is shown instead.

## Main Components

### Sidebar

The sidebar provides:

- Brand area for the Local CEO app
- Main navigation entry for Home
- User profile information
- Sign-out action

This keeps the app structure simple and gives the user quick access to account-level actions.

### Welcome Header

At the top of the main area, the page displays a welcome message using the user’s name. This creates a personalized landing experience and indicates the user is logged in and working inside the app.

### Companies Section

The main content is organized into a dedicated “Your Companies” section.

This section includes:

- A heading for the list of companies
- Search and filter controls
- A company card grid
- Pagination when many companies exist
- A create-company option when the user has no active company or is on the first page

## Functionalities

### Company Search

Users can search for a company by name or relevant text. The search updates the list without leaving the screen.

### Industry Filtering

The page allows users to filter companies by industry so they can narrow down results quickly.

### Company Listing

Each company appears as a card with basic identifying information such as:

- company name
- industry
- user role
- access to the company page

### Company Creation

If the user has no companies yet, or has room to add another one, the screen shows a clear creation option to start a new company record.

### Pagination

When the company list grows, the interface handles navigation through pages so the screen remains manageable and easy to browse.

### Workspace Members & Invitations

Inside a company workspace at `/companies/[slug]/members`, the directory provides a comprehensive management area with two dedicated tabs:

1. **Members Tab**:
   - Active members directory for the company access list.
   - Case-insensitive search by member name or email.
   - Multi-role filtering via `MultiSelector`.
   - Server-side count-based pagination.
   - Loading skeletons while new results are fetched without unmounting filter controls.

2. **Invitations Tab**:
   - Directory of sent company invitations (accessible to members with `members.invite`).
   - Multi-status filtering (`PENDING`, `ACCEPTED`, `DECLINED`, `EXPIRED`, `REVOKED`) with default `PENDING` view.
   - Multi-role filtering for invitation targets.
   - Derivation of effective expiration status for display and query filtering.
   - Revocation workflow for eligible pending invitations, guarded by a confirmation dialog.

3. **Header Actions**:
   - Authorized members (`OWNER`, `ADMIN`) can launch the "Invite Member" modal to send new invitations with 7-day expiration, duplicate prevention, and immediate toast feedback.

## Summary

This screen is a centralized dashboard for managing company access. It combines navigation, user identity, search, filtering, company cards, and creation actions in a single, simple overview that helps users move quickly through the app. The company workspace extends this pattern into a members directory that is secure, searchable, filterable, and resilient during loading.

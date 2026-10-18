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

### Workspace Members

Inside a company workspace, the members area provides a dedicated directory for the current company’s access list. It supports:

- search by member name or email
- role-based filtering
- server-side pagination
- loading skeletons while new results are fetched
- stable filter controls that remain visible during reloads

This member list is read-only for the current phase and reflects the company’s actual membership data without exposing unauthorized operations.

## Summary

This screen is a centralized dashboard for managing company access. It combines navigation, user identity, search, filtering, company cards, and creation actions in a single, simple overview that helps users move quickly through the app. The company workspace extends this pattern into a members directory that is secure, searchable, filterable, and resilient during loading.

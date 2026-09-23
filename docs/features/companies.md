# Feature: Companies & Multi-Tenancy

## Overview

Companies serve as the multi-tenant isolation boundary for Local CEO. All business data, inventory, invoices, and AI agent interactions are strictly scoped to a specific company.

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

## Key Requirements

- Company creation flow initiated from the home-company workspace area through a modal (`Name`, `Legal Name`, `Country`, `Industry`, `Registration / Tax ID`).
- Company listing is server-rendered and supports URL-driven filtering and pagination.
- Company list is scoped to the currently authenticated application user through `CompanyMembership` only.
- Industry options are derived from the current user’s actual company records, not a hardcoded list.
- Empty filtered results show a clear empty state rather than a create card.
- Empty unfiltered results show the create-company card on page 1 only.
- Strict `companyId` context injection remains required for future business modules and server actions.
- Complete data isolation between companies.
- No standalone `/companies/new` route during this phase; the flow stays in the home context.

## Design Rule

A single user can belong to multiple companies with distinct roles in each company. Data must never leak between companies.

## Implementation Notes

### Home page behavior

- The page maintains server-side authentication verification via Supabase.
- It synchronizes the authenticated user into the Local CEO app database.
- It reads query params safely and sanitizes invalid page values to 1.
- The list is wrapped in a Suspense boundary so a skeleton appears while data loads.

### Company creation refresh

- Creating a company triggers a refresh of the current route so the newly created company appears without requiring a browser refresh.
- The flow preserves the existing Phase 3.3 company creation pattern and does not redesign it.

### Security and tenancy

- The authenticated application user ID is the source of truth for company membership queries.
- No company listing can be built from an arbitrary user ID in the URL or request.
- The tenant boundary is enforced in Prisma by filtering through `CompanyMembership` membership records.

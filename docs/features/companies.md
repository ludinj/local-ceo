# Feature: Companies & Multi-Tenancy

## Overview

Companies serve as the multi-tenant isolation boundary for Local CEO. All business data, inventory, invoices, and AI agent interactions are strictly scoped to a specific company.

## Key Requirements

- Company creation flow initiated from the home-company workspace area through a modal (`Name`, `Legal Name`, `Country`, `Industry`, `Registration / Tax ID`).
- Company list view & switcher in header/sidebar.
- Strict `companyId` context injection in Server Actions and API Route Handlers.
- Complete data isolation between companies.
- No standalone `/companies/new` route during this phase; the flow stays in the home context.

## Design Rule

A single user can belong to multiple companies with distinct roles in each company. Data must never leak between companies.

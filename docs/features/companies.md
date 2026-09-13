# Feature: Companies & Multi-Tenancy

## Overview
Companies serve as the multi-tenant isolation boundary for Local CEO. All business data, inventory, invoices, and AI agent interactions are strictly scoped to a specific company.

## Key Requirements
- Company creation flow (`Name`, `Slug`, `Settings`).
- Company list view & switcher in header/sidebar.
- Strict `companyId` context injection in Server Actions and API Route Handlers.
- Complete data isolation between companies.

## Design Rule
A single user can belong to multiple companies with distinct roles in each company. Data must never leak between companies.

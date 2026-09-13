# Feature: Memberships

## Overview
Memberships represent the association between a global `User` and a `Company`.

## Key Requirements
- Track `userId`, `companyId`, `roleId`, and `status` (`ACTIVE`, `SUSPENDED`).
- Store role metadata on `CompanyMembership` rather than on `User`.
- Allow users to accept or decline company memberships.
- Enable company administrators to view and manage team members.

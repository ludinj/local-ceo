# Feature: Role-Based Access Control (RBAC)

## Overview
RBAC enforces granular permissions across all application routes, actions, and API endpoints based on a user's role within their active company.

## Default Roles
- **Owner**: Full administrative control, billing, invitations, company deletion.
- **Manager**: Operational control over products, inventory, customers, and sales.
- **Employee**: Read/write access to assigned operational tools.
- **Lawyer / Accountant**: Specialized read-only or advisory access to financial/legal data.

## Security Rule
Authorization checks MUST be performed on the server side in Server Actions and Route Handlers, using `companyId` and `userId`.

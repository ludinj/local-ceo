# Feature: RBAC & Authorization (Phase 4.1)

## Overview

Local CEO uses a centralized, strongly typed Role-Based Access Control (RBAC) system to enforce company-scoped authorization.

Authentication and authorization are strictly separate concerns:

- **Supabase Auth** proves identity.
- **CompanyMembership** establishes tenant access boundary.
- **RBAC** determines what an authenticated company member may do within that company.

All authorization security boundaries are enforced **server-side**.

---

## 1. Built-in Roles

Roles belong exclusively to `CompanyMembership` (tenant scope) and are **never** stored globally on `User`. The same user can hold different roles in different companies.

Local CEO defines 5 built-in roles:

- `OWNER`: Full company control including ownership transfer.
- `ADMIN`: Full operational and member management permissions, excluding ownership transfer.
- `MANAGER`: Operational read access across company and members.
- `FINANCE`: Financial and operational read access across company and members.
- `VIEWER`: Read-only access to company workspace data.

> **Database Schema Design**: Built-in roles are represented in application code (`lib/auth/rbac.ts`) using TypeScript string literals. No database `Role`, `Permission`, or `RolePermission` tables are used, avoiding unnecessary database migrations. Custom roles remain deferred to future phases.

---

## 2. Initial Permission Vocabulary

Permissions are defined using strongly typed, granular string literals formatted as `<resource>.<action>`.

Phase 4.1 defines the following 7 initial permissions:

- `company.read`: View company profile and overview data.
- `company.update`: Modify company settings and details.
- `members.read`: View member directory and member details.
- `members.invite`: Invite new members to the company workspace (Phase 5 capability).
- `members.manage`: Update member roles and access levels (Phase 4.3 capability).
- `members.remove`: Remove members from the company workspace (Phase 4.3 capability).
- `ownership.transfer`: Execute company ownership transfer (Phase 4.3 capability).

> **Extensibility**: The naming convention is designed to scale seamlessly for future business-module permissions (e.g. `inventory.read`, `inventory.manage`, `invoices.read`, `employees.create`).

---

## 3. Role → Permission Matrix

| Permission           | OWNER | ADMIN | MANAGER | FINANCE | VIEWER |
| :------------------- | :---: | :---: | :-----: | :-----: | :----: |
| `company.read`       |   ✅  |   ✅  |    ✅   |    ✅   |   ✅   |
| `company.update`     |   ✅  |   ✅  |    ❌   |    ❌   |   ❌   |
| `members.read`       |   ✅  |   ✅  |    ✅   |    ✅   |   ✅   |
| `members.invite`     |   ✅  |   ✅  |    ❌   |    ❌   |   ❌   |
| `members.manage`     |   ✅  |   ✅  |    ❌   |    ❌   |   ❌   |
| `members.remove`     |   ✅  |   ✅  |    ❌   |    ❌   |   ❌   |
| `ownership.transfer` |   ✅  |   ❌  |    ❌   |    ❌   |   ❌   |

### Matrix Rules
- Only `OWNER` receives `ownership.transfer`.
- `ADMIN` receives all member and company permissions except `ownership.transfer`.
- `MANAGER`, `FINANCE`, and `VIEWER` currently receive `company.read` and `members.read`. Future business-module permissions (sales, inventory, invoices, expenses) will differentiate them when those modules are implemented.

---

## 4. RBAC Module Architecture (`lib/auth/rbac.ts`)

The RBAC implementation lives in `@/lib/auth/rbac.ts`.

### Key Functions & Classes

#### `hasPermission(subject, permission): boolean`
- Reusable, type-safe permission checker.
- Accepts `CompanyContext`, `CompanyMembership`, `{ role: string }`, or raw role string.
- Evaluates role permissions strictly in memory with zero database queries.
- **Fail-Closed**: Returns `false` for unknown, invalid, missing, or null role values.

```ts
// Example Usage:
if (!hasPermission(context, "company.update")) {
  // Hide edit button or return unauthorized response
}
```

#### `requirePermission(subject, permission): void`
- Reusable server-side guard for Server Actions, Route Handlers, and server services.
- Calls `hasPermission(subject, permission)`.
- Throws `AuthorizationError` if the check fails.

```ts
// Example Usage in Server Action:
requirePermission(context, "members.manage");
```

#### `AuthorizationError`
- Custom `Error` subclass thrown by `requirePermission`.
- Includes `permission`, optional `role`, and a clear failure message.

---

## 5. Permissions vs. Business Invariants

Authorization permissions answer whether an actor has the *capability* to perform an action type.

Business domain invariants enforce domain safety rules separately:

- **Permission**: `members.remove` allows an actor to invoke member removal operations.
- **Business Invariant**: A company must ALWAYS have at least one `OWNER`. The final `OWNER` cannot be removed or demoted.

Conceptually, operations perform:
1. `requirePermission(context, "members.remove")` (Phase 4.1 RBAC)
2. `verifyNotFinalOwner(targetMember)` (Phase 4.3 Member Administration)

Domain invariant workflows belong to Phase 4.3 and are not part of permission matrix definitions.

---

## 6. Server-Side Security Boundary

- Frontend UI logic may use `hasPermission` to conditionally display or disable UI elements.
- Frontend visibility is **never** the security boundary.
- All Server Actions, API routes, and data access layers must independently execute `requirePermission` server-side.

# Local CEO — System Architecture & Technology Plan

## Project Vision

Local CEO will evolve from an inventory and invoicing system into an **AI-powered operating system for small businesses**. Each company will have isolated data, its own members and roles, and AI agents that can analyze company information and eventually perform approved actions.

---

## 1. Core Architecture

Local CEO uses a multi-tenant SaaS architecture. A user can belong to multiple companies and have a different role in each one.

```text
User → Company Membership → Company → Business Modules + AI Agents
```

> **Important Design Rule:** Company data must always be scoped by `companyId`. The same user may be Owner of one company, Lawyer of another, and Manager of a third without mixing permissions or data.

---

## 2. Main System Layers

| Layer                     | Responsibility                                   | Technology Stack                                                 |
| :------------------------ | :----------------------------------------------- | :--------------------------------------------------------------- |
| **Web / UI**              | Frontend user interface & responsive components  | Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui |
| **Application / Backend** | Business logic, API endpoints, server validation | Next.js Route Handlers, Server Actions, Zod                      |
| **Authentication**        | User identity and session management             | Supabase Auth — Google OAuth for the current MVP                 |
| **Authorization**         | Company memberships, RBAC & granular permissions | Custom RBAC + Server-side checks                                 |
| **Database & ORM**        | PostgreSQL database with type-safe schema access | Supabase PostgreSQL + Prisma ORM                                 |
| **AI Layer**              | Model provider abstraction & tool calling        | Vercel AI SDK (Gemini / Groq APIs)                               |
| **Deployment**            | Infrastructure hosting & CI/CD                   | Vercel + GitHub                                                  |

---

## 3. Multi-Tenant Data Model

The database separates the global identity of a user from their relationship with each company.

### Data Hierarchy

```text
User
 └── CompanyMembership
      ├── Company
      └── Role

Company
 ├── Members
 ├── Products / Inventory
 ├── Customers
 ├── Invoices / Sales
 ├── Employees
 ├── Marketing
 ├── Analytics
 └── AI Agents / Conversations
```

### Core Entities

- `User`: Global application identity associated with Supabase Auth.
- `Company`: Multi-tenant organization entity.
- `CompanyMembership`: Join entity connecting `User` and `Company` with role metadata.
- `Role`: Permission level within a specific company.
- `Invitation`: Pending organization invitation tokens.
- `Product` & `InventoryItem`: Inventory tracking entities.
- `Customer`: Customer profiles and contact information.
- `Invoice` & `InvoiceItem`: Invoicing and billing records.
- `Employee`: Employee profiles linked to companies.
- `AIAgent`, `AIConversation`, `AIMessage`: AI agent states and chat histories.

---

## 4. Authentication, Roles & Invitations

### Current MVP Authentication Strategy

Authentication is currently intentionally limited to **Google OAuth through Supabase Auth**.

Current authentication flow:

```text
/login
  ↓
Continue with Google
  ↓
Google OAuth
  ↓
Supabase Auth
  ↓
/auth/callback
  ↓
Exchange OAuth code for Supabase session
  ↓
/home
```

For the current MVP, the following authentication methods are **not part of the active implementation scope**:

- Email/password registration
- Email/password login
- Email confirmation
- Magic-link authentication
- Forgot password
- Reset password
- Additional OAuth providers

These authentication methods may be introduced later if product requirements change.

### Application Flow

The intended application flow is:

```text
Google Login
  ↓
User Home
  ↓
Companies
  ↓
Select/Create Company
  ↓
Company Dashboard
```

Authentication and authorization remain separate concerns:

- **Supabase Auth** determines who the user is.
- **CompanyMembership** determines which companies the user belongs to.
- **RBAC** determines what the user is allowed to do within each company.

### Membership-Specific Roles

Roles are stored on `CompanyMembership`, never globally on `User`.

The same authenticated user may therefore have different roles across different companies.

### Invitations

Invitations will contain:

- `companyId`
- invited email
- role
- secure token
- expiration
- status

Invitation and membership functionality belongs to later development phases and is not part of the current authentication implementation.

---

## 5. AI Agent Architecture

AI agents belong to a company, not directly to a user. Each agent receives a controlled company context and can access only tools permitted by the application.

```text
User
  ↓
Authentication
  ↓
Company Membership + Permissions
  ↓
Current Company Context
  ↓
AI Agent
  ↓
Approved Tools
  ↓
Company-scoped Database
```

### Initial AI Agent Tools

- `getSales()`
- `getInventory()`
- `getInvoices()`
- `getCustomers()`
- `getExpenses()`
- `getEmployees()`
- `getAnalytics()`

**Initially these tools will be read-only. Later, agents may execute actions such as creating purchase orders with explicit human approval.**

---

## 6. Recommended Development Roadmap

| Phase                  | Scope                                                                           | Status        |
| :--------------------- | :------------------------------------------------------------------------------ | :------------ |
| **1. Foundation**      | Next.js project, UI foundation, Tailwind CSS, shadcn/ui                         | **Completed** |
| **2. Authentication**  | Supabase SSR foundation, Google OAuth login, sessions, logout, protected routes | **Completed** |
| **3. Organizations**   | Create company, company list, company selection, memberships                    | Planned       |
| **4. RBAC**            | Roles, permissions, protected routes, server-side authorization                 | Planned       |
| **5. Invitations**     | Invite users, accept invitations, membership creation                           | Planned       |
| **6. Business Core**   | Products, inventory, customers, invoices, and sales                             | Planned       |
| **7. Dashboard**       | Revenue, sales, inventory, and business metrics                                 | Planned       |
| **8. Local CEO Agent** | AI chat + company context + read-only business tools                            | Planned       |
| **9. AI Actions**      | Recommendations, approvals, and controlled write operations                     | Planned       |
| **10. More Agents**    | Accountant, Marketing, HR, and specialized AI agents                            | Planned       |
| **11. Employees**      | Employee management and human-AI agent collaboration                            | Planned       |

### Phase 2 — Authentication Breakdown

```text
2.1 Supabase SSR Foundation        → Completed
2.2 Google OAuth Login             → In Progress
2.3 Logout & Session Verification  → Planned
2.4 Authentication Cleanup         → Planned
```

Email/password authentication and password recovery are intentionally deferred and are not required to complete the current MVP authentication phase.

---

## 7. Architectural Principles

1. **Multi-tenant by design**
   Every company is an isolated tenant and all company-owned data must be scoped by `companyId`.

2. **Authentication and authorization are separate**
   Supabase Auth proves identity. Company memberships and RBAC determine access.

3. **Roles belong to memberships**
   Roles must never be stored globally on the user.

4. **Server-side authorization**
   Frontend visibility is never the sole security layer.

5. **AI is a controlled application layer**
   LLMs do not receive unrestricted database access.

6. **Human approval for sensitive actions**
   AI agents recommend first and act only through controlled application tools.

7. **Provider abstraction**
   AI model providers can be replaced without rewriting core business logic.

8. **Start simple**
   Continue with a single Next.js application before introducing separate backend services.

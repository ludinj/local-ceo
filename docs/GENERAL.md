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

| Layer | Responsibility | Technology Stack |
| :--- | :--- | :--- |
| **Web / UI** | Frontend user interface & responsive components | Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui |
| **Application / Backend** | Business logic, API endpoints, server validation | Next.js Route Handlers, Server Actions, Zod |
| **Authentication** | User identity, registration, session management | Supabase Auth |
| **Authorization** | Company memberships, RBAC & granular permissions | Custom RBAC + Server-side checks |
| **Database & ORM** | PostgreSQL database with type-safe schema access | Supabase PostgreSQL + Prisma ORM |
| **AI Layer** | Model provider abstraction & tool calling | Vercel AI SDK (Gemini / Groq APIs) |
| **Deployment** | Infrastructure hosting & CI/CD | Vercel + GitHub |

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
- `User`: Global identity & authentication credentials.
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
- **Flow**: `Register/Login → User Home → Companies → Select Company → Company Dashboard`
- **Membership-Specific Roles**: Roles are stored on `CompanyMembership` rather than `User`.
- **Invitations**: Contain `companyId`, `invited email`, `role`, `secure token`, `expiration`, and `status`.

---

## 5. AI Agent Architecture
AI agents belong to a company, not directly to a user. Each agent receives a controlled company context and can access only tools permitted by the application.

```text
User → Authentication → Company Membership + Permissions → Current Company Context → AI Agent → Approved Tools → Company-scoped Database
```

### Initial AI Agent Tools
- `getSales()`
- `getInventory()`
- `getInvoices()`
- `getCustomers()`
- `getExpenses()`
- `getEmployees()`
- `getAnalytics()`

*Initially these tools will be read-only. Later, agents may execute actions (such as creating purchase orders) with explicit human approval.*

---

## 6. Recommended Development Roadmap

| Phase | Scope | Status |
| :--- | :--- | :--- |
| **1. Foundation** | Next.js project, UI foundation, Tailwind CSS, shadcn/ui | **Completed** |
| **2. Auth** | Register, login, sessions, password reset via Supabase Auth | Planned |
| **3. Organizations** | Create company, company list, company selection, memberships | Planned |
| **4. RBAC** | Roles, permissions, protected routes, server-side authorization | Planned |
| **5. Invitations** | Invite users, accept invitations, membership creation | Planned |
| **6. Business Core** | Products, inventory, customers, invoices, and sales | Planned |
| **7. Dashboard** | Revenue, sales, inventory, and business metrics | Planned |
| **8. Local CEO Agent** | AI chat + company context + read-only business tools | Planned |
| **9. AI Actions** | Recommendations, approvals, and controlled write operations | Planned |
| **10. More Agents** | Accountant, Marketing, HR, and specialized AI agents | Planned |
| **11. Employees** | Employee management and human-AI agent collaboration | Planned |

---

## 7. Architectural Principles
1. **Multi-tenant by design**: Every company is an isolated tenant (`companyId` scoped).
2. **Server-side authorization**: Frontend visibility is never the sole security layer.
3. **AI is a controlled application layer**: LLMs do not receive unrestricted database access.
4. **Human approval for sensitive actions**: AI agents recommend first and act only via controlled tools.
5. **Provider abstraction**: AI model providers can be swapped without rewriting business logic.
6. **Start simple**: Single Next.js application prior to introducing microservices.

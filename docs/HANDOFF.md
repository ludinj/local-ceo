# Local CEO Project Handoff

> **CRITICAL AGENT INSTRUCTION (MUST READ BEFORE STARTING WORK):**
> Before undertaking any new feature, bug fix, or task, AI agents MUST:
>
> 1. Read this `HANDOFF.md`.
> 2. Review `docs/GENERAL.md` for architectural rules.
> 3. Review the relevant `docs/features/<feature>.md`.
> 4. Inspect the current repository state and recent Git history when necessary.
>
> Conversation history may be used when available, but it is not considered
> the canonical source of project state. Repository documentation and Git
> history are the source of truth.

---

## Current Project Status & Baseline

- **Repository Path**: `/Users/mecbook/Desktop/react/local-ceo`
- **Current Phase**: **Phase 1: Foundation (Completed)**
- **Tech Stack Initialized**:
  - Next.js 16.3.4 (App Router)
  - React 19.2.8
  - TypeScript 5
  - Tailwind CSS v4 + PostCSS
  - Base UI / shadcn/ui foundation (`components/ui`, `lib/utils.ts`)
  - Project configuration (`components.json`, `tsconfig.json`, `next.config.ts`)

---

## Completed Tasks

- [x] Next.js 16 application initialization with TypeScript & App Router.
- [x] Tailwind CSS v4 and PostCSS styling setup (`app/globals.css`).
- [x] Utility helper set up (`lib/utils.ts`).
- [x] Documentation-as-code structure simplified & created under `docs/`:
  - `docs/README.md` (Documentation Index)
  - `docs/GENERAL.md` (Comprehensive Architecture & Deployment Spec)
  - `docs/HANDOFF.md` (Handoff & Agent verification protocol)
  - `docs/features/*.md` (Detailed specification for each business feature)

---

## Next Immediate Tasks (Roadmap)

### Next Up: Phase 2 — Authentication Setup

1. Configure Supabase Auth integration with Next.js App Router (Middleware, Route Handlers).
2. Build User Registration, Login, and Session management.
3. Implement protected route wrappers and user profile hooks.

### Following Up: Phase 3 & 4 — Organizations & Multi-Tenancy (RBAC)

1. Initialize Prisma ORM with Supabase PostgreSQL connection.
2. Define `User`, `Company`, `CompanyMembership`, and `Role` models.
3. Enforce `companyId` row-level / query-level isolation across all data interactions.

---

## Verification Protocol for Incoming Agents

1. **Check previous task completion**: Run `git status` or inspect recent commits/files to confirm no broken state exists.
2. **Review documentation**: Consult `docs/GENERAL.md` for architecture rules and `docs/features/<feature>.md` before making changes.
3. **Strict Scoping**: Do not introduce unrequested external dependencies or alter working foundation files unnecessarily.
4. **Update Handoff**: After completing a task, update `HANDOFF.md` to reflect new achievements and next steps.

import type { CompanyContext } from "@/lib/auth/company-context";
import type { CompanyMembership } from "@/lib/generated/prisma/client";

/**
 * Local CEO Built-in Roles.
 * Roles belong strictly to CompanyMembership (tenant scope) and are NOT global User properties.
 */
export const BUILT_IN_ROLES = [
  "OWNER",
  "ADMIN",
  "MANAGER",
  "FINANCE",
  "VIEWER",
] as const;

export type Role = (typeof BUILT_IN_ROLES)[number];

/**
 * Granular Permission Vocabulary for Phase 4.1.
 * Naming convention is `<resource>.<action>`, designed for future business-module expansion.
 */
export const PERMISSIONS = [
  "company.read",
  "company.update",
  "members.read",
  "members.invite",
  "members.manage",
  "members.remove",
  "ownership.transfer",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/**
 * Centralized Role → Permission Mapping Matrix.
 * Defines what each built-in role is authorized to do within a company context.
 */
export const ROLE_PERMISSIONS: Readonly<Record<Role, ReadonlySet<Permission>>> = {
  OWNER: new Set<Permission>([
    "company.read",
    "company.update",
    "members.read",
    "members.invite",
    "members.manage",
    "members.remove",
    "ownership.transfer",
  ]),
  ADMIN: new Set<Permission>([
    "company.read",
    "company.update",
    "members.read",
    "members.invite",
    "members.manage",
    "members.remove",
  ]),
  MANAGER: new Set<Permission>([
    "company.read",
    "members.read",
  ]),
  FINANCE: new Set<Permission>([
    "company.read",
    "members.read",
  ]),
  VIEWER: new Set<Permission>([
    "company.read",
    "members.read",
  ]),
};

/**
 * Union type for flexible authorization subjects.
 * Allows passing CompanyContext, CompanyMembership, or a role container/string.
 */
export type AuthorizationSubject =
  | CompanyContext
  | CompanyMembership
  | { role: string }
  | Role
  | string
  | null
  | undefined;

/**
 * Custom error thrown when a server-side permission check fails in `requirePermission`.
 */
export class AuthorizationError extends Error {
  readonly permission: Permission;
  readonly role?: string;

  constructor(permission: Permission, role?: string, message?: string) {
    super(
      message ??
        `Unauthorized: missing required permission "${permission}"` +
          (role ? ` for role "${role}"` : "")
    );
    this.name = "AuthorizationError";
    this.permission = permission;
    this.role = role;
  }
}

/**
 * Type guard to check if a value is a valid built-in Role.
 */
export function isBuiltInRole(role: unknown): role is Role {
  return (
    typeof role === "string" &&
    (BUILT_IN_ROLES as readonly string[]).includes(role)
  );
}

/**
 * Helper to safely extract the raw role string from various context/membership subjects.
 */
function extractRole(subject: AuthorizationSubject): string | null {
  if (!subject) {
    return null;
  }

  if (typeof subject === "string") {
    return subject;
  }

  if ("membership" in subject && subject.membership && typeof subject.membership.role === "string") {
    return subject.membership.role;
  }

  if ("role" in subject && typeof subject.role === "string") {
    return subject.role;
  }

  return null;
}

/**
 * Evaluates whether a subject (CompanyContext, CompanyMembership, or role) has a specific permission.
 *
 * Security Principles:
 * - Fail closed: returns `false` if role is missing, invalid, or unsupported.
 * - No database queries: uses in-memory pre-resolved role permissions.
 * - Pure & strongly typed.
 */
export function hasPermission(
  subject: AuthorizationSubject,
  permission: Permission
): boolean {
  const role = extractRole(subject);

  if (!role || !isBuiltInRole(role)) {
    return false;
  }

  const permissions = ROLE_PERMISSIONS[role];
  return permissions.has(permission);
}

/**
 * Server-side guard that enforces permission verification.
 * Throws `AuthorizationError` if the subject lacks the required permission.
 *
 * Suitable for use in Server Actions, Route Handlers, and server-side feature services.
 */
export function requirePermission(
  subject: AuthorizationSubject,
  permission: Permission
): void {
  const role = extractRole(subject);

  if (!hasPermission(subject, permission)) {
    throw new AuthorizationError(
      permission,
      role ?? undefined,
      `Forbidden: missing required permission "${permission}"`
    );
  }
}

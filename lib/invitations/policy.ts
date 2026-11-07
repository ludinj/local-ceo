export const INVITABLE_ROLES = [
  "ADMIN",
  "MANAGER",
  "FINANCE",
  "VIEWER",
] as const;

export type InvitableRole = (typeof INVITABLE_ROLES)[number];

const ASSIGNABLE_ROLES: Record<"OWNER" | "ADMIN", readonly InvitableRole[]> = {
  OWNER: INVITABLE_ROLES,
  ADMIN: ["MANAGER", "FINANCE", "VIEWER"],
};

export function canAssignInvitationRole(
  actorRole: string,
  targetRole: string
): targetRole is InvitableRole {
  if (actorRole !== "OWNER" && actorRole !== "ADMIN") {
    return false;
  }

  return ASSIGNABLE_ROLES[actorRole].some((role) => role === targetRole);
}

export function getAssignableInvitationRoles(
  actorRole: string
): readonly InvitableRole[] {
  if (actorRole !== "OWNER" && actorRole !== "ADMIN") {
    return [];
  }

  return ASSIGNABLE_ROLES[actorRole];
}

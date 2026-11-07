import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const INVITATION_STATUS_VALUES = [
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "EXPIRED",
  "REVOKED",
] as const;

export type InvitationStatusValue = (typeof INVITATION_STATUS_VALUES)[number];

export function isValidInvitationStatus(
  value: unknown
): value is InvitationStatusValue {
  return (
    typeof value === "string" &&
    INVITATION_STATUS_VALUES.includes(value as InvitationStatusValue)
  );
}

export function normalizeInvitationStatus(
  value: string
): InvitationStatusValue {
  const status = value.trim().toUpperCase();
  if (!isValidInvitationStatus(status)) {
    throw new Error(`Unsupported invitation status: ${value}`);
  }
  return status;
}

export function normalizeInvitationEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error("A valid invitation email is required.");
  }
  return normalized;
}

export function generateInvitationToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function verifyInvitationToken(
  token: string,
  storedHash: string
): boolean {
  if (!/^[a-f0-9]{64}$/i.test(storedHash)) return false;
  const candidate = Buffer.from(hashInvitationToken(token), "hex");
  const expected = Buffer.from(storedHash, "hex");
  return timingSafeEqual(candidate, expected);
}

export function isInvitationExpired(
  expiresAt: Date | string | number,
  now = new Date()
): boolean {
  const expiration = new Date(expiresAt).getTime();
  return !Number.isFinite(expiration) || now.getTime() >= expiration;
}

// Intended for a future one-time delivery flow. Never store the resulting
// token-bearing URL in a Notification record or database metadata.
export function buildInvitationAcceptUrl(
  baseUrl: string,
  token: string
): string {
  const url = new URL("/invite/accept", baseUrl);
  url.searchParams.set("token", token);
  return url.toString();
}

import assert from "node:assert/strict";
import test from "node:test";

import {
  buildInvitationAcceptUrl,
  generateInvitationToken,
  hashInvitationToken,
  isInvitationExpired,
  isValidInvitationStatus,
  normalizeInvitationEmail,
  normalizeInvitationStatus,
  verifyInvitationToken,
} from "./service";

test("normalizes and validates invitation status", () => {
  assert.equal(normalizeInvitationStatus(" accepted "), "ACCEPTED");
  assert.equal(isValidInvitationStatus("PENDING"), true);
  assert.equal(isValidInvitationStatus("pending"), false);
  assert.throws(
    () => normalizeInvitationStatus("DRAFT"),
    /Unsupported invitation status/
  );
});

test("normalizes invited email and rejects invalid values", () => {
  assert.equal(
    normalizeInvitationEmail("  Person@Example.COM  "),
    "person@example.com"
  );
  assert.throws(
    () => normalizeInvitationEmail("not-an-email"),
    /valid invitation email/
  );
});

test("generates high-entropy distinct tokens and validates hashes", () => {
  const first = generateInvitationToken();
  const second = generateInvitationToken();
  assert.match(first, /^[a-f0-9]{64}$/);
  assert.notEqual(first, second);
  assert.equal(hashInvitationToken(first).length, 64);
  assert.notEqual(hashInvitationToken(first), first);
  assert.equal(verifyInvitationToken(first, hashInvitationToken(first)), true);
  assert.equal(
    verifyInvitationToken(second, hashInvitationToken(first)),
    false
  );
  assert.equal(verifyInvitationToken(first, "invalid"), false);
});

test("expiration accepts fixed reference time", () => {
  const now = new Date("2026-11-06T12:00:00Z");
  assert.equal(isInvitationExpired("2026-11-06T11:59:59Z", now), true);
  assert.equal(isInvitationExpired("2026-11-06T12:00:01Z", now), false);
  assert.equal(isInvitationExpired("invalid", now), true);
});

test("accept URL escapes token and is not intended for database storage", () => {
  assert.equal(
    buildInvitationAcceptUrl("https://app.localceo.com", "token-123"),
    "https://app.localceo.com/invite/accept?token=token-123"
  );
});

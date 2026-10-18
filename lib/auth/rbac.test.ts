import {
  hasPermission,
  requirePermission,
  AuthorizationError,
  BUILT_IN_ROLES,
  PERMISSIONS,
  type Permission,
} from "./rbac";

console.log("=== Testing RBAC Foundation ===");

// 1. Check all built-in roles in matrix
console.log("\nChecking Built-in Roles:");
console.log("Built-in roles:", BUILT_IN_ROLES);
console.log("Permissions vocabulary:", PERMISSIONS);

// 2. OWNER Matrix Verification
console.log("\nVerifying OWNER permissions:");
const ownerPermissions: Permission[] = [
  "company.read",
  "company.update",
  "members.read",
  "members.invite",
  "members.manage",
  "members.remove",
  "ownership.transfer",
];

for (const perm of ownerPermissions) {
  const result = hasPermission({ role: "OWNER" }, perm);
  if (!result) {
    throw new Error(`OWNER should have permission: ${perm}`);
  }
}
console.log("✅ OWNER has all 7 required permissions.");

// 3. ADMIN Matrix Verification
console.log("\nVerifying ADMIN permissions:");
const adminAllowed: Permission[] = [
  "company.read",
  "company.update",
  "members.read",
  "members.invite",
  "members.manage",
  "members.remove",
];

for (const perm of adminAllowed) {
  if (!hasPermission({ role: "ADMIN" }, perm)) {
    throw new Error(`ADMIN should have permission: ${perm}`);
  }
}

if (hasPermission({ role: "ADMIN" }, "ownership.transfer")) {
  throw new Error("ADMIN must NOT have ownership.transfer permission!");
}
console.log("✅ ADMIN has 6 permissions and lacks ownership.transfer.");

// 4. MANAGER Matrix Verification
console.log("\nVerifying MANAGER permissions:");
if (!hasPermission({ role: "MANAGER" }, "company.read")) throw new Error("MANAGER missing company.read");
if (!hasPermission({ role: "MANAGER" }, "members.read")) throw new Error("MANAGER missing members.read");
if (hasPermission({ role: "MANAGER" }, "members.manage")) throw new Error("MANAGER should not have members.manage");
if (hasPermission({ role: "MANAGER" }, "company.update")) throw new Error("MANAGER should not have company.update");
console.log("✅ MANAGER verified.");

// 5. FINANCE Matrix Verification
console.log("\nVerifying FINANCE permissions:");
if (!hasPermission({ role: "FINANCE" }, "company.read")) throw new Error("FINANCE missing company.read");
if (!hasPermission({ role: "FINANCE" }, "members.read")) throw new Error("FINANCE missing members.read");
if (hasPermission({ role: "FINANCE" }, "members.manage")) throw new Error("FINANCE should not have members.manage");
console.log("✅ FINANCE verified.");

// 6. VIEWER Matrix Verification
console.log("\nVerifying VIEWER permissions:");
if (!hasPermission({ role: "VIEWER" }, "company.read")) throw new Error("VIEWER missing company.read");
if (!hasPermission({ role: "VIEWER" }, "members.read")) throw new Error("VIEWER missing members.read");
if (hasPermission({ role: "VIEWER" }, "company.update")) throw new Error("VIEWER should not have company.update");
if (hasPermission({ role: "VIEWER" }, "members.invite")) throw new Error("VIEWER should not have members.invite");
console.log("✅ VIEWER verified.");

// 7. Fail Closed Verification
console.log("\nVerifying Fail-Closed behavior for invalid roles / inputs:");
if (hasPermission({ role: "SUPERMAN" }, "company.read")) throw new Error("Invalid role should return false");
if (hasPermission({ role: "" }, "company.read")) throw new Error("Empty role should return false");
if (hasPermission(null, "company.read")) throw new Error("Null subject should return false");
if (hasPermission(undefined, "company.read")) throw new Error("Undefined subject should return false");
console.log("✅ Fail-closed checks verified.");

// 8. requirePermission behavior
console.log("\nVerifying requirePermission guard:");
let caughtError = false;
try {
  requirePermission({ role: "VIEWER" }, "members.manage");
} catch (err) {
  if (err instanceof AuthorizationError) {
    caughtError = true;
    console.log("✅ AuthorizationError correctly thrown:", err.message);
  }
}

if (!caughtError) {
  throw new Error("requirePermission did not throw AuthorizationError for unauthorized check!");
}

// requirePermission should succeed for allowed permission
try {
  requirePermission({ role: "OWNER" }, "ownership.transfer");
  console.log("✅ requirePermission passed for OWNER ownership.transfer.");
} catch {
  throw new Error("requirePermission threw error when permission was valid!");
}

console.log("\n=== ALL RBAC TESTS PASSED SUCCESSFULLY! ===");

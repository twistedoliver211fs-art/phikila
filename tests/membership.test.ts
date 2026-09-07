import { describe, it, expect } from "vitest";
import { pickPrimaryMembership, isMemberRole, portalForRole } from "@/lib/membership";

describe("pickPrimaryMembership", () => {
  it("prefers super_admin over teacher", () => {
    const primary = pickPrimaryMembership([
      { role: "teacher", school_id: "a" },
      { role: "super_admin", school_id: "b" },
    ]);
    expect(primary?.role).toBe("super_admin");
    expect(primary?.school_id).toBe("b");
  });

  it("returns undefined for empty input", () => {
    expect(pickPrimaryMembership([])).toBeUndefined();
    expect(pickPrimaryMembership(null)).toBeUndefined();
  });
});

describe("isMemberRole", () => {
  it("accepts known roles only", () => {
    expect(isMemberRole("principal")).toBe(true);
    expect(isMemberRole("owner")).toBe(false);
  });
});

describe("portalForRole", () => {
  it("does not fall back to teacher for unknown roles", () => {
    expect(portalForRole("nope")).toBe("/no-access");
    expect(portalForRole("teacher")).toBe("/teacher");
  });
});

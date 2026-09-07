import { describe, it, expect } from "vitest";
import {
  getAllowedRoles,
  isProtectedPath,
  isAuthPath,
  portalRoutes,
  routeRoleMap,
} from "@/lib/auth-config";

describe("getAllowedRoles", () => {
  it("returns super_admin only for /super-admin", () => {
    expect(getAllowedRoles("/super-admin")).toEqual(["super_admin"]);
  });

  it("returns principal and super_admin for /principal", () => {
    expect(getAllowedRoles("/principal")).toContain("principal");
    expect(getAllowedRoles("/principal")).toContain("super_admin");
  });

  it("returns teacher, timetable_manager, super_admin for /teacher", () => {
    const roles = getAllowedRoles("/teacher");
    expect(roles).toContain("teacher");
    expect(roles).toContain("timetable_manager");
    expect(roles).toContain("super_admin");
  });

  it("returns parent and super_admin for /parent", () => {
    expect(getAllowedRoles("/parent")).toContain("parent");
    expect(getAllowedRoles("/parent")).toContain("super_admin");
  });

  it("returns finance, principal, super_admin for /finance", () => {
    const roles = getAllowedRoles("/finance");
    expect(roles).toContain("finance");
    expect(roles).toContain("principal");
    expect(roles).toContain("super_admin");
  });

  it("returns secretary, principal, super_admin for /secretary", () => {
    const roles = getAllowedRoles("/secretary");
    expect(roles).toContain("secretary");
    expect(roles).toContain("principal");
    expect(roles).toContain("super_admin");
  });

  it("returns admissions_officer, principal, super_admin for /admissions-officer", () => {
    const roles = getAllowedRoles("/admissions-officer");
    expect(roles).toContain("admissions_officer");
    expect(roles).toContain("principal");
    expect(roles).toContain("super_admin");
  });

  it("matches sub-routes", () => {
    expect(getAllowedRoles("/principal/students")).toContain("principal");
    expect(getAllowedRoles("/teacher/attendance")).toContain("teacher");
    expect(getAllowedRoles("/finance/payments")).toContain("finance");
  });

  it("returns null for unknown routes", () => {
    expect(getAllowedRoles("/unknown")).toBeNull();
    expect(getAllowedRoles("/")).toBeNull();
  });

  it("returns all roles for /dashboard", () => {
    const roles = getAllowedRoles("/dashboard");
    expect(roles).toHaveLength(Object.keys(portalRoutes).length);
  });
});

describe("isProtectedPath", () => {
  it("returns true for all portal paths", () => {
    expect(isProtectedPath("/super-admin")).toBe(true);
    expect(isProtectedPath("/principal")).toBe(true);
    expect(isProtectedPath("/teacher")).toBe(true);
    expect(isProtectedPath("/parent")).toBe(true);
    expect(isProtectedPath("/finance")).toBe(true);
    expect(isProtectedPath("/secretary")).toBe(true);
    expect(isProtectedPath("/admissions-officer")).toBe(true);
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/platform")).toBe(true);
  });

  it("returns true for sub-routes", () => {
    expect(isProtectedPath("/principal/students")).toBe(true);
    expect(isProtectedPath("/teacher/attendance")).toBe(true);
  });

  it("returns false for public paths", () => {
    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/login")).toBe(false);
    expect(isProtectedPath("/register")).toBe(false);
    expect(isProtectedPath("/download")).toBe(false);
  });
});

describe("isAuthPath", () => {
  it("returns true for auth paths", () => {
    expect(isAuthPath("/login")).toBe(true);
    expect(isAuthPath("/auth/callback")).toBe(true);
    expect(isAuthPath("/callback")).toBe(true);
  });

  it("returns false for non-auth paths", () => {
    expect(isAuthPath("/")).toBe(false);
    expect(isAuthPath("/principal")).toBe(false);
    expect(isAuthPath("/register")).toBe(false);
  });
});

describe("portalRoutes", () => {
  it("has entries for all roles", () => {
    const expectedRoles = [
      "super_admin",
      "principal",
      "teacher",
      "timetable_manager",
      "finance",
      "admissions_officer",
      "secretary",
      "parent",
    ];
    for (const role of expectedRoles) {
      expect(portalRoutes[role]).toBeDefined();
    }
  });

  it("maps timetable_manager to /teacher", () => {
    expect(portalRoutes.timetable_manager).toBe("/teacher");
  });

  it("all values start with /", () => {
    for (const route of Object.values(portalRoutes)) {
      expect(route.startsWith("/")).toBe(true);
    }
  });
});

describe("routeRoleMap completeness", () => {
  it("every route in routeRoleMap has at least one role", () => {
    for (const roles of Object.values(routeRoleMap)) {
      expect(roles.length).toBeGreaterThan(0);
    }
  });

  it("super_admin is allowed on all portal routes", () => {
    for (const [mappedRoute, roles] of Object.entries(routeRoleMap)) {
      if (mappedRoute === "/dashboard") continue;
      expect(roles).toContain("super_admin");
    }
  });

  it("every portal route has a corresponding routeRoleMap entry", () => {
    for (const route of Object.values(portalRoutes)) {
      expect(routeRoleMap[route]).toBeDefined();
    }
  });
});

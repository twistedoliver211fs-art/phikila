export const portalRoutes: Record<string, string> = {
  super_admin: "/super-admin",
  principal: "/principal",
  teacher: "/teacher",
  timetable_manager: "/teacher",
  finance: "/finance",
  admissions_officer: "/admissions-officer",
  secretary: "/secretary",
  parent: "/parent",
};

export const routeRoleMap: Record<string, string[]> = {
  "/super-admin": ["super_admin"],
  "/principal": ["principal", "super_admin"],
  "/teacher": ["teacher", "timetable_manager", "super_admin"],
  "/parent": ["parent", "super_admin"],
  "/admissions-officer": ["admissions_officer", "principal", "super_admin"],
  "/finance": ["finance", "principal", "super_admin"],
  "/secretary": ["secretary", "principal", "super_admin"],
  "/dashboard": Object.keys(portalRoutes),
};

export function getAllowedRoles(pathname: string): string[] | null {
  for (const [route, roles] of Object.entries(routeRoleMap)) {
    if (pathname.startsWith(route)) {
      return roles;
    }
  }
  return null;
}

export const protectedPaths = [
  "/dashboard",
  "/super-admin",
  "/principal",
  "/teacher",
  "/parent",
  "/admissions-officer",
  "/finance",
  "/secretary",
  "/platform",
];

export function isProtectedPath(pathname: string): boolean {
  return protectedPaths.some((p) => pathname.startsWith(p));
}

export function isAuthPath(pathname: string): boolean {
  return pathname.startsWith("/login") || pathname.startsWith("/auth") || pathname.startsWith("/callback");
}

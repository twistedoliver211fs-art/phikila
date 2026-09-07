import { portalRoutes } from "@/lib/auth-config";

export const MEMBER_ROLES = [
  "super_admin",
  "principal",
  "teacher",
  "timetable_manager",
  "finance",
  "admissions_officer",
  "secretary",
  "parent",
] as const;

export type MemberRole = (typeof MEMBER_ROLES)[number];

export const ASSIGNABLE_ROLES: MemberRole[] = MEMBER_ROLES.filter(
  (role) => role !== "super_admin"
);

const ROLE_PRIORITY: Record<string, number> = {
  super_admin: 100,
  principal: 90,
  admissions_officer: 80,
  finance: 70,
  secretary: 60,
  timetable_manager: 50,
  teacher: 40,
  parent: 10,
};

export function isMemberRole(value: unknown): value is MemberRole {
  return typeof value === "string" && (MEMBER_ROLES as readonly string[]).includes(value);
}

export function pickPrimaryMembership<T extends { role: string }>(
  members: T[] | null | undefined
): T | undefined {
  if (!members?.length) return undefined;
  return [...members].sort(
    (a, b) => (ROLE_PRIORITY[b.role] ?? 0) - (ROLE_PRIORITY[a.role] ?? 0)
  )[0];
}

export function portalForRole(role: string | undefined): string {
  if (!role) return "/no-access";
  return portalRoutes[role] ?? "/no-access";
}

export const STAFF_ROLES_CAN_SYNC_ATTENDANCE = [
  "teacher",
  "timetable_manager",
  "principal",
  "super_admin",
] as const;

export const STAFF_ROLES_CAN_SYNC_MARKS = [
  "teacher",
  "timetable_manager",
  "principal",
  "super_admin",
] as const;

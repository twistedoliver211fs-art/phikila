import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const memberRole = v.union(
  v.literal("super_admin"),
  v.literal("principal"),
  v.literal("teacher"),
  v.literal("finance"),
  v.literal("admissions_officer"),
  v.literal("secretary"),
  v.literal("parent"),
  v.literal("timetable_manager"),
);

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("invited"), v.literal("suspended")),
  }).index("by_email", ["email"]),

  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("active"),
      v.literal("suspended"),
      v.literal("archived"),
    ),
  }).index("by_slug", ["slug"]),

  memberships: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    role: memberRole,
    status: v.union(v.literal("active"), v.literal("inactive")),
  })
    .index("by_organizationId_userId", ["organizationId", "userId"])
    .index("by_userId", ["userId"]),

  staff: defineTable({
    organizationId: v.id("organizations"),
    userId: v.optional(v.id("users")),
    firstName: v.string(),
    lastName: v.string(),
    role: memberRole,
    status: v.union(v.literal("active"), v.literal("inactive")),
  })
    .index("by_organizationId", ["organizationId"])
    .index("by_userId", ["userId"]),

  students: defineTable({
    organizationId: v.id("organizations"),
    admissionNumber: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("alumni")),
  })
    .index("by_organizationId", ["organizationId"])
    .index("by_organizationId_admissionNumber", ["organizationId", "admissionNumber"]),
});

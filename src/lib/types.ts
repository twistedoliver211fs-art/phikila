export type UserRole = "super_admin" | "principal" | "teacher" | "parent" | "staff";

export interface School {
  id: string;
  name: string;
  type: "public" | "private" | "international" | "other";
  country: string;
  address: string;
  phone: string;
  email: string;
  website: string | null;
  staff_count: number;
  education_level: "junior" | "senior" | "both";
  status: "pending" | "approved" | "active" | "suspended" | "archived";
  created_at: string;
}

export interface SchoolMember {
  id: string;
  user_id: string;
  school_id: string;
  role: UserRole;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface AttentionItem {
  id: string;
  type: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  source: "system" | "admin";
  school_id?: string;
  created_at: string;
  action_label?: string;
  action_url?: string;
}

export interface PlatformStats {
  schools: number;
  users: number;
  students: number;
  subscriptions: number;
}

export interface SchoolOverview {
  student_attendance: number;
  staff_attendance: number;
  fee_collection: number;
  admissions_pending: number;
}

export interface TimetableSlot {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
  subject: string;
  teacher: string;
  class: string;
  room: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

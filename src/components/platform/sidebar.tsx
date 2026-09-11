"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  School,
  Users,
  CreditCard,
  Activity,
  MessageSquare,
  BarChart3,
  FileText,
  Settings,
  GraduationCap,
  BookOpen,
  DollarSign,
  Megaphone,
  ClipboardCheck,
  UserCheck,
  Home,
  Baby,
  Calendar,
  Mail,
  X,
  ClipboardList,
  BookMarked,
  Bell,
  Upload,
  Key,
  Webhook,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  role: string;
  open: boolean;
  onClose: () => void;
}

const navConfig: Record<string, { label: string; href: string; icon: React.ComponentType<{ className?: string }>; disabled?: boolean }[]> = {
  super_admin: [
    { label: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
    { label: "Schools", href: "/super-admin/schools", icon: School },
    { label: "Users", href: "/super-admin/users", icon: Users },
    { label: "Audit Log", href: "/super-admin/audit", icon: FileText },
    { label: "Platform Settings", href: "/super-admin/settings", icon: Settings },
    { label: "Feature Flags", href: "/super-admin/feature-flags", icon: Flag },
  ],
  principal: [
    { label: "Dashboard", href: "/principal", icon: LayoutDashboard },
    { label: "Students", href: "/principal/students", icon: GraduationCap },
    { label: "Staff", href: "/principal/staff", icon: Users },
    { label: "Attendance", href: "/principal/attendance", icon: ClipboardCheck },
    { label: "Staff Attendance", href: "/principal/staff-attendance", icon: ClipboardCheck },
    { label: "Fees & Finance", href: "/principal/fees", icon: DollarSign },
    { label: "Invoices", href: "/principal/invoices", icon: FileText },
    { label: "Payments", href: "/principal/payments", icon: CreditCard },
    { label: "Academics", href: "/principal/academics", icon: BookOpen },
    { label: "All Exams", href: "/principal/exams", icon: BarChart3 },
    { label: "Grading System", href: "/principal/exams/grading", icon: Settings },
    { label: "Performance Analysis", href: "/principal/exams/analysis", icon: BarChart3 },
    { label: "Report Cards", href: "/principal/report-cards", icon: FileText },
    { label: "Timetable Builder", href: "/principal/timetable", icon: Calendar },
    { label: "Teacher Assignments", href: "/principal/teacher-assignments", icon: UserCheck },
    { label: "Subject Frequencies", href: "/principal/subject-frequencies", icon: BookMarked },
    { label: "Print Timetables", href: "/principal/timetable/print", icon: FileText },
    { label: "Who's Where", href: "/principal/timetable/who-is-where", icon: Activity },
    { label: "Timetable Settings", href: "/principal/timetable/settings", icon: Settings },
    { label: "Admissions", href: "/principal/admissions", icon: UserCheck },
    { label: "Billing", href: "/principal/billing", icon: CreditCard },
    { label: "Analytics", href: "/principal/analytics", icon: BarChart3 },
    { label: "Import Data", href: "/principal/import", icon: Upload },
    { label: "Documents", href: "/principal/documents", icon: FileText },
    { label: "API Keys", href: "/principal/api-keys", icon: Key },
    { label: "Webhooks", href: "/principal/webhooks", icon: Webhook },
    { label: "Messages", href: "/principal/messages", icon: MessageSquare },
    { label: "Announcements", href: "/principal/announcements", icon: Megaphone },
    { label: "Notifications", href: "/principal/notifications", icon: Bell },
    { label: "Reports", href: "/principal", icon: FileText, disabled: true },
  ],
  teacher: [
    { label: "Dashboard", href: "/teacher", icon: LayoutDashboard },
    { label: "My Timetable", href: "/teacher/timetable", icon: Calendar },
    { label: "My Students", href: "/teacher/students", icon: GraduationCap },
    { label: "Attendance", href: "/teacher/attendance", icon: ClipboardCheck },
    { label: "Exams & Results", href: "/teacher/exams", icon: BarChart3 },
    { label: "Academics", href: "/teacher", icon: BookOpen, disabled: true },
    { label: "Communication", href: "/teacher/communication", icon: MessageSquare },
    { label: "Profile", href: "/teacher", icon: Settings, disabled: true },
  ],
  timetable_manager: [
    { label: "Dashboard", href: "/teacher", icon: LayoutDashboard },
    { label: "Timetable Builder", href: "/principal/timetable", icon: Calendar },
    { label: "Teacher Assignments", href: "/principal/teacher-assignments", icon: UserCheck },
    { label: "Subject Frequencies", href: "/principal/subject-frequencies", icon: BookMarked },
    { label: "Print Timetables", href: "/principal/timetable/print", icon: FileText },
    { label: "Who's Where", href: "/principal/timetable/who-is-where", icon: Activity },
    { label: "Timetable Settings", href: "/principal/timetable/settings", icon: Settings },
    { label: "My Timetable", href: "/teacher/timetable", icon: Calendar },
    { label: "My Students", href: "/teacher/students", icon: GraduationCap },
    { label: "Attendance", href: "/teacher/attendance", icon: ClipboardCheck },
    { label: "Academics", href: "/teacher", icon: BookOpen },
    { label: "Communication", href: "/teacher", icon: MessageSquare },
    { label: "Profile", href: "/teacher", icon: Settings },
  ],
  parent: [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Children", href: "/parent", icon: Baby },
    { label: "Attendance", href: "/parent/attendance", icon: ClipboardCheck },
    { label: "Fees", href: "/parent/fees", icon: DollarSign },
    { label: "Timetable", href: "/parent/timetable", icon: Calendar },
    { label: "Announcements", href: "/parent/announcements", icon: Megaphone },
    { label: "Messages", href: "/parent/messages", icon: Mail },
  ],
  admissions_officer: [
    { label: "Dashboard", href: "/admissions-officer", icon: LayoutDashboard },
    { label: "Staff Registration", href: "/admissions-officer/staff", icon: Users },
    { label: "Student Registration", href: "/admissions-officer/students", icon: GraduationCap },
    { label: "Non-Teaching Staff", href: "/admissions-officer/non-teaching", icon: UserCheck },
    { label: "Reports", href: "/admissions-officer", icon: BarChart3, disabled: true },
    { label: "Communication", href: "/admissions-officer", icon: MessageSquare, disabled: true },
  ],
  finance: [
    { label: "Dashboard", href: "/finance", icon: LayoutDashboard },
    { label: "Payments", href: "/finance/payments", icon: DollarSign },
    { label: "Fee Structures", href: "/finance/fee-structures", icon: CreditCard },
    { label: "Outstanding", href: "/finance", icon: ClipboardList, disabled: true },
    { label: "Reports", href: "/finance", icon: BarChart3, disabled: true },
    { label: "Communication", href: "/finance", icon: MessageSquare, disabled: true },
  ],
  secretary: [
    { label: "Dashboard", href: "/secretary", icon: LayoutDashboard },
    { label: "Announcements", href: "/secretary/announcements", icon: Megaphone },
    { label: "Messages", href: "/secretary", icon: Mail, disabled: true },
    { label: "Staff Directory", href: "/secretary", icon: Users, disabled: true },
    { label: "Calendar", href: "/secretary", icon: Calendar, disabled: true },
    { label: "Documents", href: "/secretary", icon: FileText, disabled: true },
  ],
};

export function Sidebar({ role, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const items = navConfig[role] ?? navConfig.teacher;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-4">
          <Image
            src="/logo.jpeg"
            alt="Decimal"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-base font-bold tracking-tight">Decimal</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-0.5">
            {items.map((item) => {
              const isActive = item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href;
              return (
                <li key={item.label}>
                  {item.disabled ? (
                    <span className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/50 cursor-not-allowed">
                      <item.icon className="h-4 w-4 shrink-0 opacity-50" />
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}

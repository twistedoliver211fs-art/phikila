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
  ClipboardList,
  DollarSign,
  Megaphone,
  ClipboardCheck,
  UserCheck,
  Home,
  Baby,
  Calendar,
  Mail,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  role: "super_admin" | "principal" | "teacher" | "parent";
  open: boolean;
  onClose: () => void;
}

const navConfig: Record<
  SidebarProps["role"],
  { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[]
> = {
  super_admin: [
    { label: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
    { label: "Schools", href: "/super-admin", icon: School },
    { label: "Users", href: "/super-admin", icon: Users },
    { label: "Subscriptions", href: "/super-admin", icon: CreditCard },
    { label: "Monitoring", href: "/super-admin", icon: Activity },
    { label: "Communication", href: "/super-admin", icon: MessageSquare },
    { label: "Reports", href: "/super-admin", icon: BarChart3 },
    { label: "Audit Log", href: "/super-admin/audit", icon: FileText },
    { label: "Settings", href: "/super-admin", icon: Settings },
  ],
  principal: [
    { label: "Dashboard", href: "/principal", icon: LayoutDashboard },
    { label: "Students", href: "/principal/students", icon: GraduationCap },
    { label: "Staff", href: "/principal/staff", icon: Users },
    { label: "Attendance", href: "/principal/attendance", icon: ClipboardCheck },
    { label: "Fees & Finance", href: "/principal/fees", icon: DollarSign },
    { label: "Academics", href: "/principal/academics", icon: BookOpen },
    { label: "Admissions", href: "/principal/admissions", icon: UserCheck },
    { label: "Communication", href: "/principal", icon: MessageSquare },
    { label: "Reports", href: "/principal", icon: BarChart3 },
    { label: "Office", href: "/principal", icon: Calendar },
    { label: "Settings", href: "/principal", icon: Settings },
  ],
  teacher: [
    { label: "Dashboard", href: "/teacher", icon: LayoutDashboard },
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
    { label: "Attendance", href: "/parent", icon: ClipboardCheck },
    { label: "Fees", href: "/parent", icon: DollarSign },
    { label: "Academics", href: "/parent", icon: BookOpen },
    { label: "Timetable", href: "/parent", icon: Calendar },
    { label: "Communication", href: "/parent", icon: Mail },
  ],
};

export function Sidebar({ role, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const items = navConfig[role];

  return (
    <>
      {/* Mobile overlay */}
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
            alt="Phikila"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-base font-bold tracking-tight">Phikila</span>
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
                : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.label}>
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
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}

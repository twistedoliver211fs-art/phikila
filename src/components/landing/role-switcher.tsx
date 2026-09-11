"use client";

import { useState } from "react";
import {
  Crown,
  BookOpen,
  Baby,
  DollarSign,
  Settings,
  Check,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AnimatedSection,
  fadeUp,
} from "./motion";
import { Aurora } from "./aurora";

interface Role {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  headline: string;
  description: string;
  features: string[];
}

const roles: Role[] = [
  {
    id: "principal",
    label: "Principal",
    icon: Crown,
    headline: "See the entire school at a glance.",
    description:
      "A bird's-eye view of everything happening in your school — attendance, academics, finances, and staff — so you can make decisions quickly.",
    features: [
      "Dashboard overview with real-time metrics",
      "Student management across all classes",
      "Staff oversight and performance tracking",
      "Financial reports and fee collection rates",
      "Attendance analytics and absence trends",
    ],
  },
  {
    id: "teacher",
    label: "Teacher",
    icon: BookOpen,
    headline: "Spend less time on administration.",
    description:
      "Focus on teaching while Decimal handles the paperwork — attendance, grades, student records, and your timetable all in one place.",
    features: [
      "Quick class management and student lists",
      "One-tap attendance marking (works offline)",
      "Fast grade entry with automatic computation",
      "Student profiles with academic history",
      "Personal timetable view",
    ],
  },
  {
    id: "parent",
    label: "Parent",
    icon: Baby,
    headline: "Stay connected to your child's school.",
    description:
      "Track your child's attendance, view report cards, pay fees, and communicate with teachers — all from your phone.",
    features: [
      "Real-time attendance tracking",
      "Fee status and payment history",
      "Report cards and academic progress",
      "School announcements and notifications",
      "Direct teacher communication",
    ],
  },
  {
    id: "finance",
    label: "Finance",
    icon: DollarSign,
    headline: "Complete financial visibility.",
    description:
      "Manage fee structures, track payments, generate invoices, and produce financial reports — with full audit trails.",
    features: [
      "Fee structure configuration per class",
      "Payment tracking with receipt generation",
      "Invoice management and reminders",
      "Comprehensive financial reports",
      "Balance monitoring and reconciliation",
    ],
  },
  {
    id: "administrator",
    label: "Administrator",
    icon: Settings,
    headline: "Manage the entire platform.",
    description:
      "Configure school settings, manage users, handle data operations, and maintain the system — with full control.",
    features: [
      "School configuration and branding",
      "User management and role assignment",
      "System settings and integrations",
      "Data import, export, and backup",
      "Audit logs and security monitoring",
    ],
  },
];

export function RoleSwitcher() {
  const [activeTab, setActiveTab] = useState(roles[0].id);
  const activeRole = roles.find((r) => r.id === activeTab) || roles[0];

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-background via-primary/[0.02] to-background py-24 sm:py-32">
      <Aurora className="opacity-40" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection variants={fadeUp}>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              For every role
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              One platform. Every perspective.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Each role gets a purpose-built experience — the right information,
              the right actions, the right level of detail.
            </p>
          </div>
        </AnimatedSection>

        {/* Tab Bar */}
        <AnimatedSection variants={fadeUp} delay={0.1} className="mt-12">
          <div
            role="tablist"
            aria-label="User roles"
            className="flex flex-wrap gap-2"
          >
            {roles.map((role) => {
              const isActive = role.id === activeTab;
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${role.id}`}
                  id={`tab-${role.id}`}
                  onClick={() => setActiveTab(role.id)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10"
                      : "border-border bg-card text-muted-foreground hover:border-primary/20 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{role.label}</span>
                  <span className="sm:hidden">
                    {role.label.slice(0, 3)}
                  </span>
                </button>
              );
            })}
          </div>
        </AnimatedSection>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            role="tabpanel"
            id={`panel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
            className="mt-8"
          >
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <activeRole.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    {activeRole.label}
                  </span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  {activeRole.headline}
                </h3>

                <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                  {activeRole.description}
                </p>

                <ul className="mt-6 space-y-3">
                  {activeRole.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-all duration-200 hover:gap-2.5 hover:text-primary/80"
                >
                  Explore {activeRole.label.toLowerCase()} portal
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>

              {/* Visual Placeholder */}
              <div className="flex-1 min-w-0 w-full">
                <div className="rounded-2xl border border-border bg-card/50 min-h-[340px] flex items-center justify-center overflow-hidden">
                  <div className="flex flex-col items-center gap-3 p-8 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                      <activeRole.icon className="h-8 w-8 text-primary/40" />
                    </div>
                    <p className="text-sm text-muted-foreground/60 font-medium">
                      {activeRole.label} portal screenshot
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

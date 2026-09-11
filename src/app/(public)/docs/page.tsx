import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Users,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  HelpCircle,
  ArrowRight,
  Search,
} from "lucide-react";
import { docsNavigation } from "@/lib/docs/docs-data";

export const metadata: Metadata = {
  title: "Documentation — Decimal",
  description:
    "Everything you need to manage your school with Decimal. Guides, references, and tutorials.",
};

const popularCards = [
  {
    title: "Students",
    description: "Manage student records, enrollment, and profiles",
    href: "/docs/core/students",
    icon: Users,
  },
  {
    title: "Attendance",
    description: "Track daily attendance and generate reports",
    href: "/docs/core/attendance",
    icon: Calendar,
  },
  {
    title: "Timetable",
    description: "Build and manage class schedules",
    href: "/docs/core/timetable",
    icon: Calendar,
  },
  {
    title: "Finance",
    description: "Fee structures, payments, and billing",
    href: "/docs/core/finance",
    icon: DollarSign,
  },
  {
    title: "Examinations",
    description: "Exam management and result analysis",
    href: "/docs/core/examinations",
    icon: BarChart3,
  },
  {
    title: "Reports",
    description: "Analytics, report cards, and insights",
    href: "/docs/core/reports",
    icon: BarChart3,
  },
];

const quickLinks = [
  {
    group: "Get started",
    items: [
      { title: "Overview", href: "/docs/getting-started/overview" },
      { title: "Quickstart", href: "/docs/getting-started/quickstart" },
      { title: "First-day checklist", href: "/docs/getting-started/first-day" },
    ],
  },
  {
    group: "For your role",
    items: [
      { title: "Principal", href: "/docs/roles/principal" },
      { title: "Teacher", href: "/docs/roles/teacher" },
      { title: "Finance", href: "/docs/roles/finance" },
      { title: "Parent", href: "/docs/roles/parent" },
    ],
  },
  {
    group: "Guides",
    items: [
      { title: "School setup", href: "/docs/guides/school-setup" },
      { title: "Create a timetable", href: "/docs/guides/create-timetable" },
      { title: "Manage school fees", href: "/docs/guides/manage-fees" },
      { title: "Generate reports", href: "/docs/guides/generate-reports" },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Decimal Documentation
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Everything you need to manage your school with Decimal.
        </p>

        {/* Search hint */}
        <div className="mx-auto mt-8 max-w-md">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-muted-foreground shadow-sm">
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left text-sm">
              Search documentation...
            </span>
            <kbd className="hidden rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground sm:inline-block">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Get Started CTA */}
      <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Get started
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Set up your school in under 5 minutes. Create your account, add
              students, and start managing.
            </p>
          </div>
          <Link
            href="/docs/getting-started/quickstart"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Popular features */}
      <div className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Popular
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popularCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <card.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-semibold text-foreground group-hover:text-primary transition-colors">
                {card.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {card.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick links grid */}
      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        {quickLinks.map((group) => (
          <div key={group.group}>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {group.group}
            </h2>
            <ul className="mt-3 space-y-2">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    <ArrowRight className="h-3 w-3 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* All sections */}
      <div className="mt-16 border-t border-border pt-12">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Explore Decimal
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {docsNavigation.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h3>
              <ul className="mt-2 space-y-1.5">
                {section.items.slice(0, 5).map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/docs/${item.slug}`}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
                {section.items.length > 5 && (
                  <li>
                    <Link
                      href={`/docs/${section.items[0].slug}`}
                      className="text-sm text-primary hover:underline"
                    >
                      +{section.items.length - 5} more
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Help */}
      <div className="mt-12 rounded-xl border border-border bg-card p-6 text-center">
        <HelpCircle className="mx-auto h-8 w-8 text-muted-foreground" />
        <h2 className="mt-3 font-semibold text-foreground">Need help?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Search the documentation or contact Decimal support.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            href="/docs/support/faq"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
          >
            FAQ
          </Link>
          <Link
            href="/docs/support/troubleshooting"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
          >
            Troubleshooting
          </Link>
          <Link
            href="/docs/support/contact"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
          >
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}

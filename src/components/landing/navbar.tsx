"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Users,
  BookOpen,
  Calendar,
  ClipboardCheck,
  Clock,
  DollarSign,
  UserPlus,
  MessageSquare,
  BarChart3,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

type MegaColumn = {
  heading?: string;
  items: {
    icon?: React.ElementType;
    title: string;
    description?: string;
    href: string;
    badge?: string;
  }[];
};

type NavLink = {
  label: string;
  href?: string;
  mega?: MegaColumn[];
};

const NAV_LINKS: NavLink[] = [
  {
    label: "Product",
    mega: [
      {
        heading: "Platform",
        items: [
          {
            icon: Users,
            title: "Students",
            description: "Manage student records, guardians, classes and academic history.",
            href: "/docs/core/students",
          },
          {
            icon: BookOpen,
            title: "Academics",
            description: "Curriculum, subjects, assessments and grading.",
            href: "/docs/core/academics",
          },
          {
            icon: Calendar,
            title: "Timetable",
            description: "AI-powered scheduling with constraint management.",
            href: "/docs/core/timetable",
          },
          {
            icon: ClipboardCheck,
            title: "Attendance",
            description: "Daily tracking, reports and parent notifications.",
            href: "/docs/core/attendance",
          },
          {
            icon: Clock,
            title: "Staff",
            description: "Staff records, roles, assignments and workloads.",
            href: "/docs/core/staff",
          },
          {
            icon: DollarSign,
            title: "Finance",
            description: "Fees, invoicing, receipts and financial reports.",
            href: "/docs/core/finance",
          },
          {
            icon: UserPlus,
            title: "Admissions",
            description: "Applications, enrolment workflows and intake pipelines.",
            href: "/docs/core/admissions",
          },
          {
            icon: MessageSquare,
            title: "Communication",
            description: "Announcements, messaging and parent notifications.",
            href: "/docs/core/communication",
          },
          {
            icon: BarChart3,
            title: "Reports",
            description: "Analytics dashboards for academics, finance and attendance.",
            href: "/docs/core/reports",
          },
        ],
      },
      {
        heading: "Quick links",
        items: [
          { title: "Overview", href: "/#features" },
          { title: "Quickstart", href: "/docs/quickstart" },
          { title: "Changelog", href: "/docs/changelog" },
        ],
      },
      {
        items: [
          {
            title: "Recent updates",
            description: "New AI timetable engine, improved finance reports, bulk student import.",
            href: "/docs/changelog",
          },
        ],
      },
    ],
  },
  {
    label: "Solutions",
    mega: [
      {
        heading: "By role",
        items: [
          { title: "School Administrators", href: "/docs/roles/admin" },
          { title: "Principals", href: "/docs/roles/principal" },
          { title: "Teachers", href: "/docs/roles/teacher" },
          { title: "Finance Staff", href: "/docs/roles/finance" },
          { title: "Secretaries", href: "/docs/roles/secretary" },
          { title: "Parents", href: "/docs/roles/parent" },
        ],
      },
      {
        heading: "By school type",
        items: [
          { title: "Primary Schools", href: "/docs/schools/primary" },
          { title: "Secondary Schools", href: "/docs/schools/secondary" },
          { title: "Multi-campus Schools", href: "/docs/schools/multi-campus" },
        ],
      },
    ],
  },
  {
    label: "Resources",
    mega: [
      {
        items: [
          { title: "Documentation", href: "/docs" },
          { title: "Help Center", href: "/docs/help" },
          { title: "Guides", href: "/docs/guides" },
        ],
      },
      {
        items: [
          { title: "FAQ", href: "/docs/faq" },
          { title: "Changelog", href: "/docs/changelog" },
          { title: "Blog", href: "/blog", badge: "coming soon" },
        ],
      },
      {
        items: [
          { title: "Contact Support", href: "mailto:omixsystems@gmail.com" },
          { title: "Report a Problem", href: "mailto:omixsystems@gmail.com" },
        ],
      },
    ],
  },
];

const SIMPLE_LINKS: NavLink[] = [
  { label: "Pricing", href: "/#pricing" },
  { label: "Docs", href: "/docs" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);

  const megaRef = useRef<HTMLDivElement>(null);
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Scroll detection
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Close mega menu on route change
  useEffect(() => {
    setActiveMega(null);
    setMobileOpen(false);
  }, [pathname]);

  // Close on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMega(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Close mega on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setActiveMega(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const openMega = (label: string) => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
    setActiveMega(label);
  };

  const closeMegaWithDelay = () => {
    megaTimeout.current = setTimeout(() => setActiveMega(null), 120);
  };

  const cancelCloseMega = () => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
  };

  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const activeLinkClass = "text-primary font-medium";
  const inactiveLinkClass = "text-muted-foreground hover:text-foreground";

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-200",
          scrolled
            ? "border-b border-border/60 bg-background/80 backdrop-blur-xl shadow-sm shadow-black/5"
            : "border-b border-transparent bg-background/60 backdrop-blur-md"
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-200 sm:px-6 lg:px-8",
            scrolled ? "h-14" : "h-16"
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Image
                src="/logo.jpeg"
                alt=""
                width={18}
                height={18}
                className="rounded-sm"
                aria-hidden
              />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">
              Decimal
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            ref={megaRef}
            className="hidden items-center gap-1 md:flex"
            aria-label="Main"
          >
            {NAV_LINKS.map((link) => (
              <div
                key={link.label}
                onMouseEnter={() => link.mega && openMega(link.label)}
                onMouseLeave={() => link.mega && closeMegaWithDelay()}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (link.mega) {
                      setActiveMega(activeMega === link.label ? null : link.label);
                    }
                  }}
                  onMouseEnter={() => cancelCloseMega()}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                    activeMega === link.label
                      ? "text-foreground bg-muted/50"
                      : inactiveLinkClass
                  )}
                >
                  {link.label}
                  {link.mega && (
                    <svg
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-200",
                        activeMega === link.label && "rotate-180"
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>

                {/* Mega Menu Panel */}
                {link.mega && activeMega === link.label && (
                  <div
                    role="menu"
                    className={cn(
                      "absolute left-1/2 top-full z-50 mt-2 w-max min-w-[640px] -translate-x-1/2 rounded-xl border border-border bg-background/95 p-6 shadow-2xl backdrop-blur-xl",
                      prefersReducedMotion
                        ? "opacity-100"
                        : "animate-in fade-in zoom-in-95 duration-150"
                    )}
                    onMouseEnter={() => cancelCloseMega()}
                    onMouseLeave={() => closeMegaWithDelay()}
                  >
                    <div className="flex gap-8">
                      {link.mega.map((column, ci) => (
                        <div key={ci} className="min-w-[180px]">
                          {column.heading && (
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {column.heading}
                            </p>
                          )}
                          <ul className="space-y-1">
                            {column.items.map((item) => (
                              <li key={item.title}>
                                <Link
                                  href={item.href}
                                  role="menuitem"
                                  className={cn(
                                    "group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors duration-150 hover:bg-muted/50",
                                    column.heading === "Platform" && "min-w-[280px]"
                                  )}
                                  onClick={() => setActiveMega(null)}
                                >
                                  {item.icon && (
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                                      <item.icon className="h-4 w-4 text-primary" />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-foreground">
                                        {item.title}
                                      </span>
                                      {item.badge && (
                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                          {item.badge}
                                        </span>
                                      )}
                                      {item.title === "Recent updates" && (
                                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                                      )}
                                    </div>
                                    {item.description && (
                                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                        {item.description}
                                      </p>
                                    )}
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}

                      {/* Recent updates card (Product) */}
                      {link.label === "Product" && (
                        <div className="ml-auto flex items-center">
                          <Link
                            href="/docs/changelog"
                            className="group flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                            onClick={() => setActiveMega(null)}
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                              <Sparkles className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                Latest updates
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                AI timetable engine &bull; Finance reports &bull; Bulk import
                              </p>
                            </div>
                            <ChevronRight className="ml-2 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {SIMPLE_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href ?? "/"}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                  isLinkActive(link.href ?? "/")
                    ? activeLinkClass
                    : inactiveLinkClass
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side CTAs */}
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden md:block">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/register" className="hidden md:block">
              <Button variant="glow" size="sm">
                Start for free
              </Button>
            </Link>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-muted md:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Panel */}
          <div
            className={cn(
              "absolute inset-x-0 top-0 max-h-full overflow-y-auto bg-background shadow-2xl",
              prefersReducedMotion
                ? "opacity-100"
                : "animate-in slide-in-from-top duration-200"
            )}
          >
            {/* Mobile header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/60 bg-background/90 px-4 backdrop-blur-xl h-14">
              <Link
                href="/"
                className="flex items-center gap-2.5"
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                  <Image src="/logo.jpeg" alt="" width={18} height={18} className="rounded-sm" aria-hidden />
                </div>
                <span className="text-base font-bold tracking-tight text-foreground">Decimal</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile links */}
            <div className="px-4 py-4 space-y-1">
              {/* Simple links */}
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-muted",
                  isLinkActive("/") ? activeLinkClass : inactiveLinkClass
                )}
              >
                Home
              </Link>
              <Link
                href="/#pricing"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-muted",
                  isLinkActive("/#pricing") ? activeLinkClass : inactiveLinkClass
                )}
              >
                Pricing
              </Link>

              {/* Accordion sections */}
              {NAV_LINKS.map((link) => (
                <div key={link.label}>
                  <button
                    type="button"
                    onClick={() =>
                      setMobileAccordion(mobileAccordion === link.label ? null : link.label)
                    }
                    className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
                  >
                    {link.label}
                    <svg
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                        mobileAccordion === link.label && "rotate-180"
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {mobileAccordion === link.label && link.mega && (
                    <div className="ml-3 space-y-1 border-l border-border pl-3">
                      {link.mega.map((column, ci) => (
                        <div key={ci}>
                          {column.heading && (
                            <p className="mb-2 mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {column.heading}
                            </p>
                          )}
                          {column.items.map((item) => (
                            <Link
                              key={item.title}
                              href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              {item.icon && (
                                <item.icon className="h-4 w-4 shrink-0 text-primary/70" />
                              )}
                              <span>{item.title}</span>
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <Link
                href="/docs"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-muted",
                  isLinkActive("/docs") ? activeLinkClass : inactiveLinkClass
                )}
              >
                Docs
              </Link>
            </div>

            {/* Mobile CTAs */}
            <div className="sticky bottom-0 border-t border-border/60 bg-background/90 px-4 py-4 backdrop-blur-xl space-y-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}>
                <Button variant="glow" className="w-full">
                  Start for free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

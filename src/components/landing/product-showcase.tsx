"use client";

import {
  Users,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  DollarSign,
  UserPlus,
  MessageSquare,
  FileText,
  Check,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AnimatedSection,
  slideInLeft,
  slideInRight,
  fadeUp,
} from "./motion";
import { Aurora } from "./aurora";

interface Feature {
  label: string;
  headline: string;
  description: string;
  icon: LucideIcon;
  bullets: string[];
  screenshot: string;
  screenshotAlt: string;
}

const features: Feature[] = [
  {
    label: "Students",
    headline: "Every student. One complete picture.",
    description:
      "Centralize every student record — profiles, guardians, admission info, class assignments, and academic history — in a single, searchable view.",
    icon: Users,
    bullets: [
      "Complete student profiles with guardian links",
      "Admission tracking and enrollment status",
      "Class assignment history and transitions",
      "Academic records across all terms",
    ],
    screenshot: "/images/screenshots/principal-students.png",
    screenshotAlt: "Student management interface showing student list with filters and search",
  },
  {
    label: "Academics",
    headline: "Make academic administration simpler.",
    description:
      "Manage classes, subjects, grading schemes, and assessments across academic years — all connected and always up to date.",
    icon: BookOpen,
    bullets: [
      "Class and subject management",
      "Flexible grading schemes and scales",
      "Assessment creation and tracking",
      "Academic year and term configuration",
    ],
    screenshot: "/images/screenshots/principal-exams.png",
    screenshotAlt: "Academic management interface showing exams and grading",
  },
  {
    label: "Attendance",
    headline: "Know what's happening in your school.",
    description:
      "Track attendance daily, monitor patterns, and get alerts when students are absent — whether you're online or offline.",
    icon: ClipboardCheck,
    bullets: [
      "Daily and class-level attendance marking",
      "Real-time analytics and trends",
      "Automatic absence alerts for parents",
      "Works offline with automatic sync",
    ],
    screenshot: "/images/screenshots/principal-attendance.png",
    screenshotAlt: "Attendance tracking interface with daily records and analytics",
  },
  {
    label: "Examinations",
    headline: "Turn assessment data into useful insight.",
    description:
      "Schedule exams, capture marks, compute grades, and generate performance reports — all from one place.",
    icon: BarChart3,
    bullets: [
      "Exam scheduling and room allocation",
      "Quick mark entry with validation",
      "Automatic grade computation",
      "Performance reports and rankings",
    ],
    screenshot: "/images/screenshots/principal-exams.png",
    screenshotAlt: "Examination management with performance charts and grade analysis",
  },
  {
    label: "Finance",
    headline: "Make school finances easier to manage.",
    description:
      "Define fee structures, generate invoices, track payments, and produce financial reports without the spreadsheet chaos.",
    icon: DollarSign,
    bullets: [
      "Flexible fee structures per class or student",
      "Automatic invoice generation",
      "Payment tracking with receipts",
      "Comprehensive financial reports",
    ],
    screenshot: "/images/screenshots/principal-fees.png",
    screenshotAlt: "Finance management interface showing fee collections and payment tracking",
  },
  {
    label: "Admissions",
    headline: "From application to enrollment.",
    description:
      "Manage the entire admissions pipeline — applications, reviews, enrollments, and onboarding — without losing a single student in the process.",
    icon: UserPlus,
    bullets: [
      "Application intake and tracking",
      "Enrollment pipeline visibility",
      "Automated onboarding workflows",
      "Guardian communication during admission",
    ],
    screenshot: "/images/screenshots/principal-students.png",
    screenshotAlt: "Admissions pipeline showing application tracking and enrollment status",
  },
  {
    label: "Communication",
    headline: "Keep everyone connected.",
    description:
      "Send announcements, communicate with parents, and manage notifications — all from a single hub that reaches every stakeholder.",
    icon: MessageSquare,
    bullets: [
      "School-wide and targeted announcements",
      "Direct parent-teacher messaging",
      "Automated notification delivery",
      "Message history and read receipts",
    ],
    screenshot: "/images/screenshots/teacher-dashboard.png",
    screenshotAlt: "Communication hub with messages and announcements",
  },
  {
    label: "Reports",
    headline: "Turn school data into decisions.",
    description:
      "Generate analytics, report cards, and trend reports that give principals and administrators the insight they need.",
    icon: FileText,
    bullets: [
      "Customizable analytics dashboards",
      "Student report cards and transcripts",
      "Attendance and performance trends",
      "Exportable data in multiple formats",
    ],
    screenshot: "/images/screenshots/principal-dashboard.png",
    screenshotAlt: "Analytics dashboard showing school performance metrics and trends",
  },
];

export function ProductShowcase() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-background via-primary/[0.02] to-background">
      <Aurora className="opacity-40" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <AnimatedSection variants={fadeUp}>
          <div className="mx-auto max-w-2xl text-center mb-20">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              Product Deep Dive
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
              Everything your school needs
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Explore every module in detail — designed to work together, built
              to work offline.
            </p>
          </div>
        </AnimatedSection>

        {features.map((feature, index) => {
          const isOdd = index % 2 === 0;
          const textVariant = isOdd ? slideInLeft : slideInRight;
          const visualVariant = isOdd ? slideInRight : slideInLeft;

          return (
            <AnimatedSection
              key={feature.label}
              variants={fadeUp}
              delay={0.05}
              className="mb-24 last:mb-0"
            >
              <div
                className={`flex flex-col lg:flex-row ${
                  isOdd ? "" : "lg:flex-row-reverse"
                } gap-12 items-center`}
              >
                {/* Text Content */}
                <motion.div
                  className="flex-1 min-w-0"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={textVariant}
                  transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                      {feature.label}
                    </span>
                  </div>

                  <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                    {feature.headline}
                  </h3>

                  <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {feature.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-3 text-sm text-muted-foreground"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={`/docs/core/${feature.label.toLowerCase()}`}
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-all duration-200 hover:gap-2.5 hover:text-primary/80"
                  >
                    Learn more
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </motion.div>

                {/* Real Screenshot */}
                <motion.div
                  className="flex-1 min-w-0 w-full"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={visualVariant}
                  transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-2xl shadow-primary/5">
                    {/* Browser chrome */}
                    <div className="flex items-center gap-1.5 border-b border-border/50 bg-muted/30 px-4 py-2.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                      <span className="ml-2 text-xs text-muted-foreground truncate">
                        Decimal — {feature.label}
                      </span>
                    </div>
                    {/* Screenshot */}
                    <div className="relative aspect-[16/10] bg-muted/20">
                      <img
                        src={feature.screenshot}
                        alt={feature.screenshotAlt}
                        className="w-full h-full object-cover object-top"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </AnimatedSection>
          );
        })}
      </div>
    </section>
  );
}

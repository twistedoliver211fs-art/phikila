import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Documentation — Phikila",
  description: "Learn how to use Phikila school management platform",
};

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:py-28">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Documentation
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Everything you need to get started with Phikila.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Getting Started */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Getting Started</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign up with your Google account, set up your school profile, and invite
            teachers and students in minutes.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Register your school via Google OAuth
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Complete your school profile
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Add teachers, students, and staff
            </li>
          </ul>
        </div>

        {/* Timetable */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Timetable</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Auto-generate clash-free timetables based on teacher assignments,
            subject frequencies, and room availability.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Assign teachers to subjects and classes
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Set subject frequencies per grade
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Generate, export, and print timetables
            </li>
          </ul>
        </div>

        {/* Attendance */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Attendance</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Track daily attendance for students and staff with real-time dashboards
            and absence alerts.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Mark attendance by class or individually
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              View daily and weekly reports
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Identify attendance trends
            </li>
          </ul>
        </div>

        {/* Exams */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Examinations</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage exams, record results, configure grading systems, and analyse
            student performance with charts.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Create and schedule exams
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Record marks and auto-calculate grades
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Performance analysis with charts
            </li>
          </ul>
        </div>

        {/* Finance */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Finance</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage school fees, track payments, generate invoices, and monitor
            financial health.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Record fee structures and payments
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Track outstanding balances
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Generate financial reports
            </li>
          </ul>
        </div>

        {/* Admissions */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Admissions</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Register new students and staff, manage CBC curriculum subjects,
            and handle non-teaching staff records.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Register students with auto-generated IDs
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Add teaching and non-teaching staff
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              Auto-seed CBC curriculum subjects
            </li>
          </ul>
        </div>
      </div>

      {/* Request Demo CTA */}
      <div className="mt-12 text-center">
        <p className="text-muted-foreground">
          Ready to see Phikila in action?
        </p>
        <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/demo">
            <Button size="lg">Request a Demo</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">Sign In</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

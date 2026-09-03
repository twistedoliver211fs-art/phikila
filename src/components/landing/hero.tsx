"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navLinks = [
  { label: "Platform", href: "#platform" },
  { label: "Features", href: "#features" },
  { label: "Timetable", href: "#timetable" },
  { label: "For Schools", href: "#roles" },
];

export function Hero() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <section className="relative overflow-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.jpeg"
              alt="Phikila"
              width={32}
              height={32}
              className="rounded-md"
            />
            <span className="text-lg font-bold tracking-tight">Phikila</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Register your School</Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border/40 bg-background px-4 pb-4 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/login">
                <Button variant="outline" className="w-full" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button className="w-full" size="sm">
                  Register your School
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
            The School Management Platform
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
            Run your school
            <br />
            with clarity.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Administration, academics, attendance, finance, admissions,
            communication and intelligent scheduling in one platform.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login">
              <Button size="lg" className="text-base px-6">
                Register your School
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-base px-6">
                Sign in with Google
              </Button>
            </Link>
          </div>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="mt-16 rounded-xl border border-border bg-card p-1 shadow-2xl shadow-primary/5">
          <div className="rounded-lg border border-border/50 bg-background overflow-hidden">
            <div className="flex items-center gap-1.5 border-b border-border/50 bg-muted/30 px-4 py-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-muted-foreground">
                Phikila Dashboard
              </span>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border border-border/60 bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Needs Attention
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground">12</p>
                <p className="text-sm text-muted-foreground">
                  students absent today
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Attendance
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground">94%</p>
                <p className="text-sm text-muted-foreground">
                  student attendance
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Fees
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground">82%</p>
                <p className="text-sm text-muted-foreground">
                  fee collection rate
                </p>
              </div>
            </div>
            <div className="border-t border-border/50 bg-muted/20 p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Timetable Preview
              </p>
              <div className="grid grid-cols-5 gap-1 text-xs">
                {["MON", "TUE", "WED", "THU", "FRI"].map((day) => (
                  <div key={day} className="text-center font-medium text-muted-foreground py-1">
                    {day}
                  </div>
                ))}
                {[
                  ["Math", "English", "Math", "Science", "English"],
                  ["Science", "Math", "English", "Math", "Science"],
                  ["English", "Science", "Art", "PE", "Music"],
                ].map((week, wi) =>
                  week.map((subj, di) => (
                    <div
                      key={`${wi}-${di}`}
                      className="rounded bg-primary/5 border border-primary/10 px-1 py-1.5 text-center text-primary/70 font-medium"
                    >
                      {subj}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

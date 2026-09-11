"use client";

import {
  Users,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  BarChart3,
  DollarSign,
  FileBarChart,
  Heart,
} from "lucide-react";
import {
  AnimatedSection,
  StaggerGrid,
  StaggerItem,
  fadeUp,
} from "./motion";

const flowSteps = [
  { icon: Users, label: "Students" },
  { icon: BookOpen, label: "Classes" },
  { icon: GraduationCap, label: "Teachers" },
  { icon: ClipboardCheck, label: "Attendance" },
  { icon: BarChart3, label: "Assessment" },
  { icon: DollarSign, label: "Finance" },
  { icon: FileBarChart, label: "Reports" },
  { icon: Heart, label: "Parents" },
];

export function SolutionIntro() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-primary/[0.02] to-background py-24 sm:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 hidden bg-[linear-gradient(to_right,#80808012_1px,transparent_1px)] bg-[size:40px_40px] sm:block" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection variants={fadeUp}>
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              The Solution
            </p>
            <h2 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
              Meet Decimal.
            </h2>
            <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              One connected platform for running the modern school.
            </p>
          </div>
        </AnimatedSection>

        {/* Vertical flow diagram */}
        <StaggerGrid className="mx-auto max-w-md mt-16 space-y-0">
          {flowSteps.map((step, i) => (
            <StaggerItem key={step.label}>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  {i < flowSteps.length - 1 && (
                    <div className="w-px h-8 bg-border" />
                  )}
                </div>
                <p className="text-sm font-semibold text-foreground -mt-0.5">
                  {step.label}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>

        <AnimatedSection variants={fadeUp} delay={0.2}>
          <div className="mx-auto max-w-2xl mt-16 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              One source of truth.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

"use client";

import {
  Database,
  ClipboardList,
  FileSpreadsheet,
  MessageSquare,
  Calendar,
  FileText,
} from "lucide-react";
import {
  AnimatedSection,
  StaggerGrid,
  StaggerItem,
  fadeUp,
} from "./motion";

const fragmentedSystems = [
  {
    icon: Database,
    title: "Students in one system",
    description: "Registration data lives in a separate database that only admin can access.",
  },
  {
    icon: ClipboardList,
    title: "Attendance on paper",
    description: "Teachers mark rolls by hand. Data takes days to reach the office.",
  },
  {
    icon: FileSpreadsheet,
    title: "Finances in spreadsheets",
    description: "Fee tracking across dozens of disconnected Excel files.",
  },
  {
    icon: MessageSquare,
    title: "Communication through chat apps",
    description: "Important updates buried in WhatsApp groups and SMS threads.",
  },
  {
    icon: Calendar,
    title: "Timetables manually built",
    description: "Hours spent building schedules that break with one teacher absence.",
  },
  {
    icon: FileText,
    title: "Reports compiled by hand",
    description: "Staff spend weeks gathering data from different systems for term reports.",
  },
];

export function ProblemSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection variants={fadeUp}>
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              The Problem
            </p>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              School administration shouldn&apos;t feel fragmented.
            </h2>
          </div>
        </AnimatedSection>

        <AnimatedSection variants={fadeUp} delay={0.1}>
          <div className="mx-auto max-w-3xl mt-6 text-center">
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Most schools run on a patchwork of disconnected tools — spreadsheets
              for finances, paper registers for attendance, chat apps for
              communication. Staff waste hours every week copying data between
              systems that were never designed to work together.
            </p>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              When a parent asks for their child&apos;s attendance record or fee
              balance, staff have to check three different places. When it&apos;s
              time for reports, someone has to manually compile everything into a
              document.
            </p>
          </div>
        </AnimatedSection>

        <StaggerGrid className="mx-auto max-w-4xl mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fragmentedSystems.map((system) => (
            <StaggerItem key={system.title}>
              <div className="rounded-xl border border-border bg-card p-4 transition-colors duration-200 hover:bg-muted/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <system.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">
                  {system.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {system.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>

        <AnimatedSection variants={fadeUp} delay={0.2}>
          <p className="mx-auto max-w-2xl mt-12 text-center text-sm sm:text-base text-muted-foreground italic">
            This creates duplicated work, disconnected data, and unnecessary
            administrative overhead.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}

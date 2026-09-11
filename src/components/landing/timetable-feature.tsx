"use client";

import {
  AlertTriangle,
  Sparkles,
  Zap,
  Users,
  Clock,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  AnimatedSection,
  StaggerGrid,
  StaggerItem,
  fadeUp,
} from "./motion";
import { Aurora } from "./aurora";

const subjectColors: Record<string, string> = {
  Mathematics: "bg-blue-50 border-blue-200 text-blue-700",
  English: "bg-green-50 border-green-200 text-green-700",
  Science: "bg-purple-50 border-purple-200 text-purple-700",
  History: "bg-amber-50 border-amber-200 text-amber-700",
  Art: "bg-pink-50 border-pink-200 text-pink-700",
  PE: "bg-orange-50 border-orange-200 text-orange-700",
};

const days = ["MON", "TUE", "WED", "THU", "FRI"];
const periods = [
  { time: "8:00", slots: ["Mathematics", "English", "Mathematics", "Science", "English"] },
  { time: "9:00", slots: ["Science", "Mathematics", "English", "Mathematics", "Science"] },
  { time: "10:00", slots: ["English", "Science", "Art", "Mathematics", "PE"] },
  { time: "11:00", slots: ["History", "Mathematics", "Science", "English", "History"] },
];

const features = [
  {
    icon: Zap,
    title: "Conflict Detection",
    description:
      "Automatically identifies scheduling conflicts — double-booked teachers, room clashes, and constraint violations — before they cause problems.",
  },
  {
    icon: Users,
    title: "Teacher Availability",
    description:
      "Respects teacher constraints, preferences, and workload limits when generating schedules.",
  },
  {
    icon: Clock,
    title: "One-Click Generation",
    description:
      "Generate optimized timetables instantly — balanced workloads, no conflicts, and ready to publish.",
  },
];

function getSubjectColor(subject: string) {
  return subjectColors[subject] || "bg-muted border-border text-muted-foreground";
}

export function TimetableFeature() {
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInView = useInView(gridRef, { once: true, amount: 0.15 });

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-background via-primary/[0.02] to-background py-24 sm:py-32">
      <Aurora className="opacity-40" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection variants={fadeUp}>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              Intelligent Scheduling
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Build smarter school schedules.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Our timetable engine handles constraints, detects conflicts, and
              suggests optimal solutions — so you spend less time shuffling
              slots and more time on what matters.
            </p>
          </div>
        </AnimatedSection>

        {/* Timetable Grid */}
        <AnimatedSection variants={fadeUp} delay={0.15} className="mt-12">
          <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
            <div ref={gridRef} className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="w-16 px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Time
                    </th>
                    {days.map((day, i) => (
                      <motion.th
                        key={day}
                        initial={{ opacity: 0, y: -10 }}
                        animate={gridInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        {day}
                      </motion.th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periods.map((period, pi) => (
                    <tr
                      key={period.time}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="px-3 py-3 text-xs font-medium text-muted-foreground">
                        {period.time}
                      </td>
                      {period.slots.map((subject, si) => {
                        const isConflict = pi === 2 && si === 3;
                        return (
                          <motion.td
                            key={`${pi}-${si}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={
                              gridInView ? { opacity: 1, scale: 1 } : {}
                            }
                            transition={{
                              delay: 0.3 + pi * 0.06 + si * 0.03,
                              duration: 0.35,
                              ease: "easeOut",
                            }}
                            className="px-2 py-2"
                          >
                            <div
                              className={`rounded-lg px-3 py-2.5 text-center text-sm font-medium border transition-all duration-300 hover:shadow-sm ${
                                isConflict
                                  ? "bg-red-50 border-red-200 text-red-700 shadow-sm shadow-red-100"
                                  : getSubjectColor(subject)
                              }`}
                            >
                              {subject}
                            </div>
                          </motion.td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Conflict + AI Suggestion */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={gridInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="border-t border-border bg-muted/30 p-4 sm:p-6"
            >
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Scheduling conflict detected
                  </p>
                  <p className="mt-1 text-sm text-red-700">
                    Mr. Kamau is assigned to both Mathematics and Science at
                    10:00 on Thursday.
                  </p>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={gridInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 1.0, duration: 0.4 }}
                    className="mt-3 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3"
                  >
                    <Sparkles className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-sm text-primary/80">
                      <span className="font-semibold text-primary">
                        AI suggestion:
                      </span>{" "}
                      Move Grade 9B Mathematics to Tuesday 11:00.
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={gridInView ? { opacity: 1 } : {}}
                    transition={{ delay: 1.2, duration: 0.3 }}
                    className="mt-3 flex gap-2"
                  >
                    <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:shadow-sm">
                      Review suggestion
                    </button>
                    <button className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-all duration-200">
                      Fix manually
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Feature Cards */}
        <StaggerGrid className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}

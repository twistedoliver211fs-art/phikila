"use client";

import {
  Users,
  GraduationCap,
  DollarSign,
  MessageSquare,
  Calendar,
  BarChart3,
} from "lucide-react";
import {
  AnimatedSection,
  StaggerGrid,
  StaggerItem,
  fadeUp,
} from "./motion";

const features = [
  {
    icon: Users,
    title: "School Operations",
    items: ["Students", "Staff", "Attendance", "Office"],
  },
  {
    icon: GraduationCap,
    title: "Academic Management",
    items: ["Academics", "Assessments", "Results", "Performance"],
  },
  {
    icon: DollarSign,
    title: "Finance & Admissions",
    items: ["Fees & Finance", "Admissions", "Enrolment", "Reports"],
  },
  {
    icon: MessageSquare,
    title: "Communication",
    items: ["Announcements", "Messages", "Notifications"],
  },
  {
    icon: Calendar,
    title: "Intelligent Timetables",
    items: [
      "Classes / Teachers / Rooms",
      "Workload / Availability",
      "Constraints / AI",
    ],
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    items: ["Attendance Reports", "Finance Reports", "Academic Reports"],
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection variants={fadeUp}>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              Capabilities
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Everything your school needs
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              One connected platform covering every aspect of school management.
            </p>
          </div>
        </AnimatedSection>

        <StaggerGrid className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <div className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <ul className="mt-3 space-y-1.5">
                  {feature.items.map((item) => (
                    <li
                      key={item}
                      className="text-sm text-muted-foreground flex items-center gap-2"
                    >
                      <span className="h-1 w-1 rounded-full bg-primary/40" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}

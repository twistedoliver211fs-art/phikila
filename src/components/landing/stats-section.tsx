"use client";

import { AnimatedSection, StaggerGrid, StaggerItem, fadeUp } from "./motion";

const stats = [
  {
    number: "7",
    subtitle: "Role-based portals",
    description: "Super Admin to Parent access",
  },
  {
    number: "22+",
    subtitle: "Database tables",
    description: "With row-level security",
  },
  {
    number: "9",
    subtitle: "Documentation sections",
    description: "Comprehensive guides",
  },
  {
    number: "3",
    subtitle: "Platform apps",
    description: "Web, Android, Desktop",
  },
];

export function StatsSection() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-background via-primary/[0.02] to-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection variants={fadeUp}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Built for modern school operations.
            </h2>
          </div>
        </AnimatedSection>

        <StaggerGrid className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StaggerItem key={stat.subtitle}>
              <div className="rounded-2xl border border-border bg-card p-8 text-center transition-all duration-300 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10">
                <p className="text-5xl font-bold text-primary">{stat.number}</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {stat.subtitle}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}

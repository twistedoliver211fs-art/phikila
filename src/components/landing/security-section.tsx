"use client";

import { Shield, Lock, Eye, RefreshCw, Database, Users } from "lucide-react";
import {
  AnimatedSection,
  StaggerGrid,
  StaggerItem,
  fadeUp,
} from "./motion";

const securityFeatures = [
  {
    icon: Shield,
    title: "Role-based access",
    description: "Every user sees only what they need.",
  },
  {
    icon: Lock,
    title: "Secure authentication",
    description: "Email/password + Google OAuth login.",
  },
  {
    icon: Eye,
    title: "Audit trails",
    description: "Track who changed what and when.",
  },
  {
    icon: RefreshCw,
    title: "Secure synchronization",
    description: "Data integrity across devices.",
  },
  {
    icon: Database,
    title: "Data protection",
    description: "Row-level security on every table.",
  },
  {
    icon: Users,
    title: "Access control",
    description: "Seven distinct roles with granular permissions.",
  },
];

export function SecuritySection() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-background via-primary/[0.02] to-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection variants={fadeUp}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Security & Trust
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Built for sensitive school data.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Student records, financial data, and staff information deserve
                rigorous protection. Decimal is designed with security at its
                core — not bolted on as an afterthought.
              </p>
              <p className="mt-4 text-lg text-muted-foreground">
                Every database table enforces row-level security. Every user
                action is logged. Every authentication flow is hardened. Your
                school&apos;s data stays yours.
              </p>
            </div>

            <StaggerGrid
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              amount={0.2}
            >
              {securityFeatures.map((feature) => (
                <StaggerItem key={feature.title}>
                  <div className="group rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/15">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

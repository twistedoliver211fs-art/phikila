"use client";

import {
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  CheckCircle,
  Cloud,
  ArrowRight,
  MonitorSmartphone,
  FileText,
  DollarSign,
  MessageSquare,
  Users,
  Settings,
  BarChart3,
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

const onlinePath = [
  { icon: MonitorSmartphone, label: "Teacher marks\nattendance", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { icon: null, label: "→", color: "" },
  { icon: Cloud, label: "Decimal\nCloud", color: "bg-primary/10 border-primary/20 text-primary" },
  { icon: null, label: "→", color: "" },
  { icon: CheckCircle, label: "Synced", color: "bg-green-50 border-green-200 text-green-700" },
];

const offlinePath = [
  { icon: MonitorSmartphone, label: "Teacher marks\nattendance", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { icon: null, label: "→", color: "" },
  { icon: Database, label: "Local\nstorage", color: "bg-amber-50 border-amber-200 text-amber-700" },
  { icon: null, label: "→", color: "" },
  { icon: WifiOff, label: "Offline\nmode", color: "bg-orange-50 border-orange-200 text-orange-700" },
  { icon: null, label: "→", color: "" },
  { icon: RefreshCw, label: "Connection\nrestored", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { icon: null, label: "→", color: "" },
  { icon: CheckCircle, label: "Automatic\nsync", color: "bg-green-50 border-green-200 text-green-700" },
];

const offlineWorks = [
  { icon: MonitorSmartphone, label: "Marking attendance" },
  { icon: Users, label: "Viewing student records" },
  { icon: DollarSign, label: "Creating invoices" },
  { icon: MessageSquare, label: "Drafting messages" },
];

const requiresInternet = [
  { icon: Cloud, label: "Syncing to cloud" },
  { icon: MessageSquare, label: "Sending notifications" },
  { icon: BarChart3, label: "Generating reports" },
  { icon: Settings, label: "User management" },
];

function FlowPath({
  steps,
  label,
}: {
  steps: { icon: React.ComponentType<{ className?: string }> | null; label: string; color: string }[];
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div ref={ref}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 text-center sm:text-left">
        {label}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {steps.map((step, i) => {
          const isArrow = step.label === "→";
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
              className={
                isArrow
                  ? "hidden sm:flex text-muted-foreground text-lg font-light"
                  : `flex items-center gap-2 rounded-xl border px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium ${step.color}`
              }
            >
              {!isArrow && step.icon && (
                <step.icon className="h-4 w-4 shrink-0" />
              )}
              {!isArrow && (
                <span className="whitespace-pre-line leading-tight">
                  {step.label}
                </span>
              )}
              {isArrow && <ArrowRight className="h-4 w-4" />}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function OfflineSection() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-background via-primary/[0.03] to-background py-24 sm:py-32">
      <Aurora className="opacity-40" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection variants={fadeUp}>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              Built for reality
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Your school doesn&apos;t stop when the internet does.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Decimal works offline so your teachers, administrators, and finance
              team can keep going — no matter the connection.
            </p>
          </div>
        </AnimatedSection>

        {/* Flow Diagram */}
        <AnimatedSection variants={fadeUp} delay={0.1} className="mt-14">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="space-y-8">
              <FlowPath steps={onlinePath} label="Online path" />
              <div className="border-t border-border/60" />
              <FlowPath steps={offlinePath} label="Offline path" />
            </div>
          </div>
        </AnimatedSection>

        {/* Two-column lists */}
        <AnimatedSection variants={fadeUp} delay={0.2} className="mt-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* What works offline */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-green-600 mb-4">
                What works offline
              </h3>
              <StaggerGrid className="space-y-3" amount={0.3}>
                {offlineWorks.map((item) => (
                  <StaggerItem key={item.label}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 border border-green-200">
                        <item.icon className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.label}
                      </span>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGrid>
            </div>

            {/* Requires internet */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-600 mb-4">
                Requires internet
              </h3>
              <StaggerGrid className="space-y-3" amount={0.3}>
                {requiresInternet.map((item) => (
                  <StaggerItem key={item.label}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 border border-amber-200">
                        <item.icon className="h-4 w-4 text-amber-600" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.label}
                      </span>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGrid>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

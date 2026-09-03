"use client";

import {
  Shield,
  Wifi,
  WifiOff,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  AnimatedSection,
  StaggerGrid,
  StaggerItem,
  staggerContainer,
  staggerItem,
  fadeUp,
} from "./motion";

const offlineCapabilities = [
  "Attendance",
  "Timetable",
  "Student Records",
  "Academic Records",
];

const offlineSteps = [
  { icon: Wifi, label: "Online", color: "text-green-600 bg-green-50 border-green-200" },
  { icon: null, label: "→", color: "text-muted-foreground bg-transparent border-transparent" },
  { icon: null, label: "Work", color: "text-primary bg-primary/5 border-primary/20" },
  { icon: null, label: "→", color: "text-muted-foreground bg-transparent border-transparent" },
  { icon: WifiOff, label: "Offline", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { icon: null, label: "→", color: "text-muted-foreground bg-transparent border-transparent" },
  { icon: RefreshCw, label: "Reconnect", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { icon: null, label: "→", color: "text-muted-foreground bg-transparent border-transparent" },
  { icon: CheckCircle, label: "Synced", color: "text-green-600 bg-green-50 border-green-200" },
];

const roles = [
  {
    role: "Super Admin",
    desc: "Platform-wide monitoring, school management, system health",
    color: "from-red-500/10 to-red-500/5 border-red-200",
    icon: Shield,
  },
  {
    role: "Principal",
    desc: "School operations, staff oversight, decision-making",
    color: "from-primary/10 to-primary/5 border-primary/20",
    icon: null,
  },
  {
    role: "Teacher",
    desc: "Daily teaching, attendance, academics, communication",
    color: "from-blue-500/10 to-blue-500/5 border-blue-200",
    icon: null,
  },
  {
    role: "Staff",
    desc: "Finance, admissions, office administration",
    color: "from-amber-500/10 to-amber-500/5 border-amber-200",
    icon: null,
  },
  {
    role: "Parent",
    desc: "Child overview, fees, academics, communication",
    color: "from-green-500/10 to-green-500/5 border-green-200",
    icon: null,
  },
];

const channels = [
  {
    from: "Principal",
    to: "Teachers",
    desc: "Staff announcements, schedule changes, direct messages",
  },
  {
    from: "Principal",
    to: "Parents",
    desc: "School updates, fee reminders, academic reports",
  },
  {
    from: "Super Admin",
    to: "Schools",
    desc: "Platform updates, policy changes, support",
  },
];

const trustFeatures = [
  "Role-based access",
  "Audit trails",
  "Secure authentication",
  "Safe sync",
];

export function Roles() {
  const flowRef = useRef<HTMLDivElement>(null);
  const flowInView = useInView(flowRef, { once: true, amount: 0.3 });

  return (
    <>
      {/* Offline Section */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection variants={fadeUp}>
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
                Offline-First
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Keep working when the connection doesn&apos;t
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Essential workflows continue offline. Changes sync automatically
                when you&apos;re back online.
              </p>
            </div>
          </AnimatedSection>

          {/* Flow Diagram — steps animate in sequence */}
          <div ref={flowRef} className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {offlineSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={
                  flowInView
                    ? { opacity: 1, scale: 1, y: 0 }
                    : {}
                }
                transition={{
                  delay: i * 0.08,
                  duration: 0.4,
                  ease: "easeOut",
                }}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium ${step.color}`}
              >
                {step.icon && <step.icon className="h-4 w-4" />}
                <span>{step.label}</span>
              </motion.div>
            ))}
          </div>

          <StaggerGrid className="mt-8 flex flex-wrap justify-center gap-3" amount={0.3}>
            {offlineCapabilities.map((cap) => (
              <StaggerItem key={cap}>
                <span className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors duration-200">
                  {cap}
                </span>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection variants={fadeUp}>
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
                Role-Based
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                One platform. Built around every role.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Each role gets a purpose-built experience — the right information,
                the right actions, the right level of detail.
              </p>
            </div>
          </AnimatedSection>

          <StaggerGrid className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {roles.map((item) => (
              <StaggerItem key={item.role}>
                <div
                  className={`group rounded-xl border bg-gradient-to-b p-5 ${item.color} transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
                >
                  <h3 className="text-base font-semibold text-foreground">
                    {item.role}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* Communication Section */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection variants={fadeUp}>
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
                Communication
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Keep everyone connected
              </h2>
            </div>
          </AnimatedSection>

          <StaggerGrid className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {channels.map((channel) => (
              <StaggerItem key={`${channel.from}-${channel.to}`}>
                <div className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <span>{channel.from}</span>
                    <motion.span
                      className="text-muted-foreground"
                      animate={{ x: [0, 3, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    >
                      ↔
                    </motion.span>
                    <span>{channel.to}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {channel.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection variants={fadeUp}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Built for responsible school management
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Role-based access, audit trails, secure authentication, and safe
              synchronization — so your school data stays protected.
            </p>
          </AnimatedSection>

          <StaggerGrid className="mt-10 flex flex-wrap justify-center gap-4" amount={0.3}>
            {trustFeatures.map((feature) => (
              <StaggerItem key={feature}>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-medium text-foreground hover:border-primary/30 hover:shadow-sm transition-all duration-200">
                  <CheckCircle className="h-4 w-4 text-success" />
                  {feature}
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>
    </>
  );
}

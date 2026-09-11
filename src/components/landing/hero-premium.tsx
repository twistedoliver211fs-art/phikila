"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useMemo } from "react";
import { staggerContainer, staggerItem, fadeUp } from "./motion";

export function HeroPremium() {
  const heroRef = useRef<HTMLDivElement>(null);
  const dashRef = useRef<HTMLDivElement>(null);
  const dashInView = useInView(dashRef, { once: true, amount: 0.15 });
  const prefersReducedMotion = useReducedMotion();

  const heroVariants = useMemo(
    () => (prefersReducedMotion ? { hidden: {}, visible: {} } : staggerContainer),
    [prefersReducedMotion]
  );

  const dashVariants = useMemo(
    () =>
      prefersReducedMotion
        ? { hidden: {}, visible: {} }
        : {
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
            },
          },
    [prefersReducedMotion]
  );

  return (
    <section
      ref={heroRef}
      className="relative isolate overflow-hidden bg-gradient-to-b from-primary/[0.04] via-background to-background"
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,white_30%,transparent)]"
        style={{
          backgroundImage:
            "linear-gradient(to_right,oklch(0.398 0.237 264.376 / 0.06) 1px, transparent 1px), linear-gradient(to_bottom,oklch(0.398 0.237 264.376 / 0.06) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-32 sm:pb-24">
        {/* Hero Content */}
        <motion.div
          ref={heroRef}
          initial="hidden"
          animate="visible"
          variants={heroVariants}
          className="text-center mx-auto max-w-4xl"
        >
          {/* Eyebrow */}
          <motion.div variants={staggerItem}>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              School Management Platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={staggerItem}
            className="mt-8 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-7xl"
          >
            Run your entire school
            <br />
            <span className="text-primary">from one place.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={staggerItem}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Students, academics, attendance, finance, communication, timetables
            and reports — connected in one intelligent school management
            platform.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={staggerItem}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-base">
                Start for free
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base"
              >
                Book a demo
              </Button>
            </Link>
            <Link
              href="/docs/getting-started/overview"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Explore Decimal →
            </Link>
          </motion.div>

          {/* Trust line */}
          <motion.p
            variants={staggerItem}
            className="mt-6 text-xs text-muted-foreground"
          >
            Free for small schools · No credit card required · Set up in minutes
          </motion.p>
        </motion.div>

        {/* Dashboard Screenshot */}
        <motion.div
          ref={dashRef}
          initial="hidden"
          animate={dashInView ? "visible" : "hidden"}
          variants={dashVariants}
          className="mt-16 mx-auto max-w-5xl lg:mt-20"
        >
          <div className="relative rounded-2xl border border-border bg-card p-1 shadow-2xl shadow-primary/5">
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 rounded-t-xl border-b border-border/50 bg-muted/30 px-4 py-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-muted-foreground">
                Decimal — School Dashboard
              </span>
            </div>

            {/* Real screenshot */}
            <div className="relative overflow-hidden rounded-b-xl bg-background">
              <img
                src="/images/screenshots/principal-dashboard.png"
                alt="Decimal school management dashboard showing student counts, attendance analytics, and fee collection overview"
                className="w-full object-cover object-top"
                style={{ maxHeight: "600px" }}
              />
              {/* Gradient overlay at bottom for smooth fade */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
            </div>
          </div>

          {/* Floating badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={dashInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-border bg-card px-4 py-2 shadow-lg"
          >
            <p className="text-xs font-medium text-muted-foreground">
              Real dashboard · Live data · Built for schools
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

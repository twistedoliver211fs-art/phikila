"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  staggerContainer,
  staggerItem,
  fadeUp,
  slideInRight,
} from "./motion";
import { Aurora } from "./aurora";

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const dashInView = useInView(dashboardRef, { once: true, amount: 0.2 });

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-background via-background to-primary/5">
      {/* Aurora + grid pattern */}
      <Aurora />
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-primary/[0.03] blur-3xl" />
      </div>

      {/* Hero Content */}
      <div
        ref={heroRef}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36"
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          <motion.p
            variants={staggerItem}
            className="text-sm font-semibold uppercase tracking-widest text-primary mb-4"
          >
            The School Management Platform
          </motion.p>
          <motion.h1
            variants={staggerItem}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]"
          >
            Run your school
            <br />
            with clarity.
          </motion.h1>
          <motion.p
            variants={staggerItem}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed"
          >
            Administration, academics, attendance, finance, admissions,
            communication and intelligent scheduling in one platform.
          </motion.p>
          <motion.div
            variants={staggerItem}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href="/login">
              <Button variant="glow" size="lg" className="text-base px-6">Get Started</Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="text-base px-6 hover:border-primary/40 hover:text-primary">Request a Demo</Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Dashboard Preview Mockup */}
        <motion.div
          ref={dashboardRef}
          initial="hidden"
          animate={dashInView ? "visible" : "hidden"}
          variants={slideInRight}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-16 rounded-xl border border-border bg-card p-1 shadow-2xl shadow-primary/5"
        >
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="rounded-lg border border-border/50 bg-background overflow-hidden"
          >
            <div className="flex items-center gap-1.5 border-b border-border/50 bg-muted/30 px-4 py-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-muted-foreground">
                Phikila Dashboard
              </span>
            </div>

            {/* Stats row — stagger in */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate={dashInView ? "visible" : "hidden"}
              className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {[
                { label: "Needs Attention", value: "12", sub: "students absent today" },
                { label: "Attendance", value: "94%", sub: "student attendance" },
                { label: "Fees", value: "82%", sub: "fee collection rate" },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={staggerItem}
                  className="rounded-lg border border-border/60 bg-card p-4"
                >
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.sub}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Timetable grid — cells stagger */}
            <div className="border-t border-border/50 bg-muted/20 p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Timetable Preview
              </p>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate={dashInView ? "visible" : "hidden"}
                className="grid grid-cols-5 gap-1 text-xs"
              >
                {["MON", "TUE", "WED", "THU", "FRI"].map((day) => (
                  <div
                    key={day}
                    className="text-center font-medium text-muted-foreground py-1"
                  >
                    {day}
                  </div>
                ))}
                {[
                  ["Math", "English", "Math", "Science", "English"],
                  ["Science", "Math", "English", "Math", "Science"],
                  ["English", "Science", "Art", "PE", "Music"],
                ].map((week, wi) =>
                  week.map((subj, di) => (
                    <motion.div
                      key={`${wi}-${di}`}
                      variants={staggerItem}
                      className="rounded bg-primary/5 border border-primary/10 px-1 py-1.5 text-center text-primary/70 font-medium"
                    >
                      {subj}
                    </motion.div>
                  ))
                )}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

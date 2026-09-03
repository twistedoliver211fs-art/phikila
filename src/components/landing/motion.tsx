"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { useRef, type ReactNode, type ElementType } from "react";

/* ── Reusable animation wrapper ───────────────────────────── */

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variants?: Variants;
  /** Element tag — defaults to "div" */
  as?: ElementType;
  /** Amount visible before triggering (0–1) */
  amount?: number;
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
  variants = fadeUp,
  as: Tag = "div",
  amount = 0.2,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── Pre-built variant sets ─────────────────────────────── */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

/* ── Stagger container (pair with staggerItem) ─────────── */

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
  },
};

/* ── Shorthand for staggered grids ─────────────────────── */

interface StaggerGridProps {
  children: ReactNode;
  className?: string;
  amount?: number;
}

export function StaggerGrid({ children, className, amount = 0.15 }: StaggerGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

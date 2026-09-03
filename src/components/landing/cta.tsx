"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedSection, fadeUp } from "./motion";

export function CTA() {
  return (
    <section className="py-20 sm:py-28 bg-primary relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-white/[0.05] blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-white/[0.04] blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative">
        <AnimatedSection variants={fadeUp}>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary-foreground">
            Ready to run your school differently?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Join schools already using Phikila to bring clarity to their
            operations.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/login">
              <Button
                size="lg"
                variant="secondary"
                className="text-base px-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                Register your School
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-6 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-300 hover:-translate-y-0.5"
              >
                Get a Demo
              </Button>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

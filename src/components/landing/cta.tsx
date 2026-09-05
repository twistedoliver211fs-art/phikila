import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Aurora } from "./aurora";

export function CTA() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-24">
      <Aurora className="opacity-80" />

      <div className="relative mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Ready to transform your school?
        </h2>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Join schools across Kenya that are using Phikila to manage timetables,
          attendance, exams, and communication — all in one place.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button variant="glow" size="lg" className="text-base px-8">Get Started Free</Button>
          </Link>
          <Link href="/demo">
            <Button variant="outline" size="lg" className="text-base px-8 hover:border-primary/40 hover:text-primary">Request a Demo</Button>
          </Link>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          No credit card required · Free for small schools · Setup in 5 minutes
        </p>
      </div>
    </section>
  );
}

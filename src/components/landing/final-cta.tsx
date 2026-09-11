import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Aurora } from "./aurora";

export function FinalCTA() {
  return (
    <section className="relative isolate overflow-hidden py-24 sm:py-32">
      <Aurora className="opacity-60" />

      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
          Ready to run your school better?
        </h2>
        <p className="mt-6 text-lg text-muted-foreground">
          Bring students, academics, attendance, finance, communication and
          reporting into one connected platform.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button variant="glow" size="lg" className="text-base px-8">
              Start for free
            </Button>
          </Link>
          <Link href="/demo">
            <Button
              variant="outline"
              size="lg"
              className="text-base px-8 hover:border-primary/40 hover:text-primary"
            >
              Book a demo
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Free for small schools · No credit card required · Set up in minutes
        </p>
      </div>
    </section>
  );
}

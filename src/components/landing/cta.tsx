import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-20 sm:py-28 bg-primary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
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
              className="text-base px-6"
            >
              Register your School
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="text-base px-6 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              Get a Demo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

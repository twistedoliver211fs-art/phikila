import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <section className="relative flex min-h-screen items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-primary/[0.04] blur-3xl" />
      </div>

      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.jpeg" alt="Phikila" width={40} height={40} className="rounded-lg" />
            <span className="text-xl font-bold tracking-tight">Phikila</span>
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Register Your School</h1>
          <p className="mt-4 text-muted-foreground">
            School registration is handled through your Google account. Click below to get started.
          </p>
          <div className="mt-6 space-y-3">
            <Link href="/login">
              <Button className="w-full">Sign In / Register with Google</Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">&larr; Back to home</Link>
        </p>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [authError, setAuthError] = useState("");

  const canSubmit = email.trim() !== "";

  const handleReset = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setAuthError("");

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setAuthError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <section
      className="relative flex min-h-screen items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/login-get-started-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50 -z-10" />

      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.jpeg"
              alt="Decimal"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-xl font-bold tracking-tight">Decimal</span>
          </Link>
        </div>

        <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 shadow-2xl hover:border-white/30 transition-colors duration-300">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Reset your password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {authError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-center">
              <p className="text-sm font-medium text-red-800">{authError}</p>
            </div>
          )}

          {sent ? (
            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-center">
              <p className="text-sm font-medium text-green-800">
                Check your email for a password reset link.
              </p>
              <p className="mt-2 text-xs text-green-700">
                Didn&apos;t receive it? Check your spam folder or try again.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-6">
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleReset}
                  disabled={!canSubmit || loading}
                  variant="outline"
                  className="w-full h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/80">
            <Link href="/login" className="font-medium text-white hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function SignupForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const passwordsMatch = password === confirmPassword;
  const minLen = password.length >= 8;
  const canSubmit =
    fullName.trim() !== "" &&
    email.trim() !== "" &&
    minLen &&
    passwordsMatch;

  const handleSignUp = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setAuthError("");

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });

    if (signUpError) {
      if (signUpError.message.includes("already")) {
        setAuthError("An account with this email already exists. Please sign in instead.");
      } else {
        setAuthError(signUpError.message);
      }
      setLoading(false);
      return;
    }

    router.push("/register/school");
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Create your account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Get started with Decimal for your school.
            </p>
          </div>

          {authError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-center">
              <p className="text-sm font-medium text-red-800">{authError}</p>
            </div>
          )}

          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="fullName" className="sr-only">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
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
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 pr-10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="relative">
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 pr-10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
                tabIndex={-1}
              >
                {showConfirm ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-red-400">Passwords do not match.</p>
            )}
            {password && !minLen && (
              <p className="text-xs text-white/50">Password must be at least 8 characters.</p>
            )}
          </div>

          <div className="mt-6">
            <Button
              onClick={handleSignUp}
              disabled={!canSubmit || loading}
              variant="outline"
              className="w-full h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/80">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-white hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-white/60">
            <Link href="/terms" className="hover:underline">Terms</Link>
            {" · "}
            <Link href="/privacy" className="hover:underline">Privacy</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}

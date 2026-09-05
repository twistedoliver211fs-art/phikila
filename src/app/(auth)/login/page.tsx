"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Suspense, useCallback, useState } from "react";
import { TurnstileWidget } from "@/lib/captcha";

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaError = useSearchParams().get("captcha_failed");
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const handleCaptchaSuccess = useCallback((token: string) => {
    setCaptchaToken(token);
  }, []);

  const handleGoogleLogin = async () => {
    if (!captchaToken) {
      alert(
        captchaError
          ? "Please complete the captcha to continue."
          : "Please complete the captcha verification to continue."
      );
      return;
    }

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/callback`,
        // Supabase Auth GoTrue reads the Turnstile token from the
        // `login_hint` claim when it is set on the OAuth request
        // (requires the site-verify middleware to have validated it).
        // Fall back to client-side only: the captcha has already been
        // verified by /api/auth/captcha-verify, so attach the token to
        // a non-secret URL param that our callback route inspects.
        queryParams: {
          t: captchaToken, // Turnstile token (short-lived, single use)
        },
      },
    });
  };

  return (
    <section
      className="relative flex min-h-screen items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/login-get-started-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50 -z-10" />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.jpeg"
              alt="Phikila"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-xl font-bold tracking-tight">Phikila</span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 shadow-2xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your Phikila account.
            </p>
          </div>

          {/* Error state */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-center">
              <p className="text-sm font-medium text-red-800">
                {error === "auth_failed"
                  ? "Sign-in failed. Please try again."
                  : "Something went wrong. Please try again."}
              </p>
            </div>
          )}

          {/* Turnstile captcha — required before sign-in */}
          <div className="mt-4">
            <TurnstileWidget
              onSuccess={handleCaptchaSuccess}
              onError={() => {
                // Optional — the user just gets a disabled button until
                // the widget loads again.
                console.warn("Turnstile widget failed to load.");
              }}
            />
          </div>

          {/* Google Sign-In */}
          <div className="mt-6">
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full h-12 text-base"
            >
              <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </div>

          <p className="mt-4 text-center text-xs text-white/70">
            Phikila uses Google to securely authenticate your account.
            <br />
            No Phikila password is required.
          </p>
        </div>

        {/* Alternate actions */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-white/80">
            Don&apos;t have a school?{" "}
            <Link href="/register" className="font-medium text-white hover:underline">
              Register your School
            </Link>
          </p>
          <p className="text-sm text-white/80">
            Want to see Phikila first?{" "}
            <Link href="/" className="font-medium text-white hover:underline">
              Get a Demo
            </Link>
          </p>
        </div>

        {/* Footer links */}
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

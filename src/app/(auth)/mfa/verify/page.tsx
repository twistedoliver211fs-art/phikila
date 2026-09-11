"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function MfaVerifyForm() {
  const router = useRouter();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }

      supabase.auth.mfa.listFactors().then(({ data, error }) => {
        if (error || !data) {
          router.push("/mfa/enroll");
          return;
        }
        const totp = data.totp?.[0];
        if (!totp) {
          router.push("/mfa/enroll");
          return;
        }
        setFactorId(totp.id);
      });
    });
  }, [router]);

  const handleVerify = async () => {
    if (!factorId || code.length !== 6) return;
    setLoading(true);
    setVerifyError("");

    const supabase = createClient();

    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError || !challengeData) {
      setVerifyError("Failed to create challenge. Please try again.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: challengeData.id, code });

    if (error) {
      setVerifyError("Invalid code. Try again.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
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

        <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 shadow-2xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Enter Authentication Code
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          {verifyError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-center">
              <p className="text-sm font-medium text-red-800">{verifyError}</p>
            </div>
          )}

          <div className="mt-6">
            <label htmlFor="verify-code" className="sr-only">
              Authentication code
            </label>
            <input
              id="verify-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 text-center tracking-[0.5em] font-mono"
            />
          </div>

          <div className="mt-6">
            <Button
              onClick={handleVerify}
              disabled={code.length !== 6 || loading}
              variant="outline"
              className="w-full h-12 text-base"
            >
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/mfa/enroll"
              className="text-sm text-white/70 hover:text-white hover:underline"
            >
              Use a different method
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MfaVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <MfaVerifyForm />
    </Suspense>
  );
}

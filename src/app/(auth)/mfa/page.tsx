"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface TotpFactor {
  id: string;
  friendly_name?: string;
  factor_type: string;
}

function MfaStatusForm() {
  const router = useRouter();
  const [factor, setFactor] = useState<TotpFactor | null>(null);
  const [aalLevel, setAalLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    const supabase = createClient();

    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const [aalResult, factorsResult] = await Promise.all([
        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
        supabase.auth.mfa.listFactors(),
      ]);

      if (aalResult.data) {
        setAalLevel(aalResult.data.currentLevel);
      }

      if (factorsResult.data?.totp?.length) {
        setFactor(factorsResult.data.totp[0]);
      }

      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleDisable = async () => {
    if (!factor) return;
    setActionLoading(true);
    setStatusError("");

    const supabase = createClient();
    const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });

    if (error) {
      setStatusError("Failed to disable two-factor authentication. Please try again.");
      setActionLoading(false);
      return;
    }

    setFactor(null);
    setActionLoading(false);
  };

  const handleSetup = () => {
    router.push("/mfa/enroll");
  };

  if (loading) {
    return (
      <section
        className="relative flex min-h-screen items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/login-get-started-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50 -z-10" />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </section>
    );
  }

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
              Two-Factor Authentication
            </h1>
          </div>

          {statusError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-center">
              <p className="text-sm font-medium text-red-800">{statusError}</p>
            </div>
          )}

          <div className="mt-6 flex flex-col items-center gap-4">
            {factor ? (
              <>
                <div className="flex items-center gap-2 rounded-full border border-green-400/30 bg-green-500/10 px-4 py-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-green-400">
                    Two-factor authentication is enabled
                  </span>
                </div>

                {factor.friendly_name && (
                  <p className="text-xs text-white/50">
                    Device: {factor.friendly_name}
                  </p>
                )}

                {aalLevel && (
                  <p className="text-xs text-white/50">
                    Current assurance level: {aalLevel.toUpperCase()}
                  </p>
                )}

                <Button
                  onClick={handleDisable}
                  disabled={actionLoading}
                  variant="destructive"
                  className="mt-2 w-full h-12 text-base"
                >
                  {actionLoading ? "Disabling..." : "Disable Two-Factor Authentication"}
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-red-400">
                    Two-factor authentication is not set up
                  </span>
                </div>

                <p className="text-xs text-white/50 text-center">
                  Add an extra layer of security to your account by enabling
                  two-factor authentication.
                </p>

                <Button
                  onClick={handleSetup}
                  variant="outline"
                  className="mt-2 w-full h-12 text-base"
                >
                  Set Up Two-Factor Authentication
                </Button>
              </>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/dashboard"
              className="text-sm text-white/70 hover:text-white hover:underline"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MfaStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <MfaStatusForm />
    </Suspense>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function MfaEnrollForm() {
  const router = useRouter();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }

      supabase.auth.mfa
        .enroll({ factorType: "totp", friendlyName: "Authenticator App" })
        .then(({ data, error }) => {
          if (error) {
            setEnrollError(error.message);
            return;
          }
          setFactorId(data.id);
          setQrCode(data.totp.qr_code);
          const uriParts = data.totp.uri.split("secret=");
          if (uriParts.length > 1) {
            setSecret(uriParts[1].split("&")[0]);
          }
        });
    });
  }, [router]);

  const handleCopy = () => {
    if (!secret) return;
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    if (!factorId || code.length !== 6) return;
    setLoading(true);
    setEnrollError("");

    const supabase = createClient();

    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError || !challengeData) {
      setEnrollError("Failed to create challenge. Please try again.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: challengeData.id, code });

    if (error) {
      setEnrollError("Invalid code. Please check your authenticator app and try again.");
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
              Set Up Two-Factor Authentication
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Scan this QR code with your authenticator app (Google
              Authenticator, Authy, etc.)
            </p>
          </div>

          {enrollError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-center">
              <p className="text-sm font-medium text-red-800">{enrollError}</p>
            </div>
          )}

          <div className="mt-6 flex flex-col items-center gap-4">
            {qrCode ? (
              <div className="rounded-lg bg-white p-3">
                <Image
                  src={qrCode}
                  alt="QR Code"
                  width={200}
                  height={200}
                />
              </div>
            ) : (
              <div className="flex h-[200px] w-[200px] items-center justify-center rounded-lg bg-white/5">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            )}

            {secret && (
              <div className="w-full">
                <p className="mb-1.5 text-xs text-white/60 text-center">
                  Or enter this key manually:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-center text-sm font-mono text-white tracking-widest">
                    {secret}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="shrink-0 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <label htmlFor="mfa-code" className="sr-only">
              Verification code
            </label>
            <input
              id="mfa-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit code"
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
              {loading ? "Verifying..." : "Verify & Activate"}
            </Button>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/dashboard"
              className="text-sm text-white/70 hover:text-white hover:underline"
            >
              Skip for now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MfaEnrollPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <MfaEnrollForm />
    </Suspense>
  );
}

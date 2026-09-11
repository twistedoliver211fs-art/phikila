"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Suspense, useState } from "react";

function OAuthConsentForm() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const scope = searchParams.get("scope") || "openid profile email";
  const state = searchParams.get("state") || "";
  const responseType = searchParams.get("response_type") || "code";

  const hasValidRequest = clientId && redirectUri;
  const scopes = scope.split(" ").filter(Boolean);

  const scopeLabels: Record<string, string> = {
    openid: "Verify your identity",
    profile: "Access your profile information",
    email: "Access your email address",
  };

  const [loading, setLoading] = useState(false);

  const handleAuthorize = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (redirectUri) {
      params.set("code", crypto.randomUUID());
      if (state) params.set("state", state);
      window.location.href = `${redirectUri}?${params.toString()}`;
    }
  };

  const handleDeny = () => {
    const params = new URLSearchParams();
    if (redirectUri) {
      params.set("error", "access_denied");
      params.set("error_description", "The user denied the authorization request.");
      if (state) params.set("state", state);
      window.location.href = `${redirectUri}?${params.toString()}`;
    }
  };

  if (!hasValidRequest) {
    return (
      <section
        className="relative flex min-h-screen items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/login-get-started-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50 -z-10" />
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 shadow-2xl text-center">
            <h1 className="text-2xl font-bold text-foreground">Invalid Request</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Missing required parameters. Please try the authorization flow again.
            </p>
            <Link href="/login" className="mt-4 inline-block">
              <Button variant="outline">Back to Sign In</Button>
            </Link>
          </div>
        </div>
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
              Authorize Application
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              An application is requesting access to your account
            </p>
          </div>

          <div className="mt-6">
            <div className="rounded-lg border border-white/20 bg-white/5 p-4">
              <p className="text-xs text-white/50 mb-1">Requesting application</p>
              <p className="text-sm font-medium text-white">{clientId}</p>
              {redirectUri && (
                <p className="mt-1 text-xs text-white/40 truncate">
                  {redirectUri}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs text-white/50 mb-2">
              This application will be able to:
            </p>
            <ul className="space-y-2">
              {scopes.map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-white/80">
                    {scopeLabels[s] || s}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              onClick={handleDeny}
              disabled={loading || !redirectUri}
              variant="ghost"
              className="flex-1 h-12 text-base"
            >
              Deny
            </Button>
            <Button
              onClick={handleAuthorize}
              disabled={loading || !redirectUri}
              variant="outline"
              className="flex-1 h-12 text-base"
            >
              {loading ? "Authorizing..." : "Authorize"}
            </Button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-white/40">
              Only authorize this application if you trust it. You can revoke
              access at any time from your account settings.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function OAuthConsentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <OAuthConsentForm />
    </Suspense>
  );
}

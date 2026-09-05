"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle, LogIn, School } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FormData {
  name: string;
  schoolType: string;
  educationLevel: string;
  phone: string;
  email: string;
  address: string;
}

type AuthState = "loading" | "signed-in" | "signed-out";

export default function RegisterSchoolPage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormData>({
    name: "",
    schoolType: "private",
    educationLevel: "junior_senior",
    phone: "",
    email: "",
    address: "",
  });

  // School registration must be tied to a real account, so a session is
  // required before showing the form. New users sign in with Google first;
  // the login page sends them back here via the `next` param.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAuthState(user ? "signed-in" : "signed-out");
    });
  }, []);

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register-school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          // Session expired while filling in the form — ask for sign-in again.
          setAuthState("signed-out");
          return;
        }
        setError(data.error || "Failed to register school");
        return;
      }

      router.push("/principal");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const pageShell = "relative flex min-h-screen items-center justify-center px-4 bg-cover bg-center bg-no-repeat";

  if (authState === "loading") {
    return (
      <section className={pageShell} style={{ backgroundImage: "url('/login-get-started-bg.jpg')" }}>
        <div className="absolute inset-0 bg-black/50 -z-10" />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </section>
    );
  }

  if (authState === "signed-out") {
    return (
      <section className={pageShell} style={{ backgroundImage: "url('/login-get-started-bg.jpg')" }}>
        <div className="absolute inset-0 bg-black/50 -z-10" />

        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.jpeg" alt="Phikila" width={40} height={40} className="rounded-lg" />
              <span className="text-xl font-bold tracking-tight text-white">Phikila</span>
            </Link>
          </div>

          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
              <School className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Register Your School</h1>
            <p className="mt-2 text-sm text-white/70">
              First, sign in with Google so your school can be linked to your
              account. You&apos;ll fill in the school details right after.
            </p>

            <Link href={`/login?next=${encodeURIComponent("/register/school")}`}>
              <Button className="mt-6 w-full h-12 text-base gap-2">
                <LogIn className="h-5 w-5" />
                Continue with Google
              </Button>
            </Link>

            <p className="mt-4 text-xs text-white/50">
              Don&apos;t have an account yet? Signing in with Google will
              create one automatically.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-white/60">
            <Link href="/register" className="hover:underline">&larr; Back to options</Link>
          </p>
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

      <div className="w-full max-w-lg">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.jpeg" alt="Phikila" width={40} height={40} className="rounded-lg" />
            <span className="text-xl font-bold tracking-tight text-white">Phikila</span>
          </Link>
        </div>

        <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 shadow-2xl">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1">
                <div className={`h-1.5 rounded-full ${s <= step ? "bg-white" : "bg-white/20"}`} />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-6">
            <School className="h-5 w-5 text-white" />
            <h1 className="text-xl font-bold text-white">Register Your School</h1>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-center">
              <p className="text-sm font-medium text-red-300">{error}</p>
            </div>
          )}

          {/* Step 1: School Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">School Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="e.g. Sunrise Academy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">School Type</label>
                <select
                  value={form.schoolType}
                  onChange={(e) => update("schoolType", e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  <option value="private" className="bg-gray-800">Private</option>
                  <option value="public" className="bg-gray-800">Public</option>
                  <option value="international" className="bg-gray-800">International</option>
                  <option value="other" className="bg-gray-800">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">Education Level</label>
                <select
                  value={form.educationLevel}
                  onChange={(e) => update("educationLevel", e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  <option value="junior" className="bg-gray-800">Junior (Primary)</option>
                  <option value="senior" className="bg-gray-800">Senior (Secondary)</option>
                  <option value="junior_senior" className="bg-gray-800">Junior &amp; Senior</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Contact Info */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="+254 712 345 678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">School Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="info@school.ac.ke"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="Nairobi, Kenya"
                />
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-white/70">Review your school details before registering.</p>

              <div className="rounded-lg border border-white/20 bg-white/5 p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">School Name</span>
                  <span className="text-sm font-medium text-white">{form.name || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">Type</span>
                  <span className="text-sm font-medium text-white capitalize">{form.schoolType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/60">Education Level</span>
                  <span className="text-sm font-medium text-white capitalize">{form.educationLevel.replace("_", " & ")}</span>
                </div>
                {form.phone && (
                  <div className="flex justify-between">
                    <span className="text-sm text-white/60">Phone</span>
                    <span className="text-sm font-medium text-white">{form.phone}</span>
                  </div>
                )}
                {form.email && (
                  <div className="flex justify-between">
                    <span className="text-sm text-white/60">Email</span>
                    <span className="text-sm font-medium text-white">{form.email}</span>
                  </div>
                )}
                {form.address && (
                  <div className="flex justify-between">
                    <span className="text-sm text-white/60">Address</span>
                    <span className="text-sm font-medium text-white">{form.address}</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-white/50">
                Your school will be registered with &quot;pending&quot; status. A super admin will review and activate it.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}

            {step < 3 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 1 && !form.name.trim()}
                className="flex-1"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? (
                  "Registering..."
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Register School
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-white/60">
          <Link href="/register" className="hover:underline">&larr; Back to options</Link>
        </p>
      </div>
    </section>
  );
}

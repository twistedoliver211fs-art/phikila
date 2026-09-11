"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Mail,
  Calendar,
  ExternalLink,
  Copy,
  Check,
  GraduationCap,
  Users,
  BookOpen,
  Wallet,
  ClipboardList,
  UserPlus,
} from "lucide-react";
import { CONTACTS } from "@/lib/contacts";

const DEMO_PORTALS = [
  {
    role: "Principal",
    email: "principal@decimal.app",
    password: "Demo1234!",
    icon: GraduationCap,
    description: "Full school management — students, fees, attendance, exams",
    portal: "/principal",
    color: "from-indigo-500 to-purple-500",
  },
  {
    role: "Teacher",
    email: "teacher@decimal.app",
    password: "Demo1234!",
    icon: BookOpen,
    description: "Attendance, student records, exams, and communication",
    portal: "/teacher",
    color: "from-blue-500 to-cyan-500",
  },
  {
    role: "Parent",
    email: "parent@decimal.app",
    password: "Demo1234!",
    icon: Users,
    description: "Child progress, attendance, fees, and messages",
    portal: "/parent",
    color: "from-emerald-500 to-teal-500",
  },
  {
    role: "Finance",
    email: "finance@decimal.app",
    password: "Demo1234!",
    icon: Wallet,
    description: "Fee structures, payments, invoicing, and reports",
    portal: "/finance",
    color: "from-amber-500 to-orange-500",
  },
  {
    role: "Secretary",
    email: "secretary@decimal.app",
    password: "Demo1234!",
    icon: ClipboardList,
    description: "Announcements, documents, and daily operations",
    portal: "/secretary",
    color: "from-pink-500 to-rose-500",
  },
  {
    role: "Admissions",
    email: "admissions@decimal.app",
    password: "Demo1234!",
    icon: UserPlus,
    description: "Student enrollment, applications, and onboarding",
    portal: "/admissions-officer",
    color: "from-violet-500 to-fuchsia-500",
  },
];

export default function DemoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(result.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section
        className="relative flex min-h-screen items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/login-get-started-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50 -z-10" />
        <div className="w-full max-w-2xl text-center">
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 shadow-2xl">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground">
              Demo Credentials Ready!
            </h1>
            <p className="mt-4 text-white/80">
              Use any of the credentials below to explore Decimal. All portals
              share the same demo school with sample data.
            </p>

            <div className="mt-6 space-y-3">
              <a
                href="/login"
                className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Open Demo Login
              </a>
              <a
                href="https://calendly.com/twistedoliver211fs/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-lg border-2 border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                Book a Live Demo
              </a>
            </div>

            <div className="mt-6 rounded-lg bg-white/5 border border-white/10 p-4">
              <p className="text-xs text-white/60">
                Didn&apos;t receive the email? Check your spam folder or{" "}
                <a
                  href={CONTACTS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  WhatsApp {CONTACTS.phoneInternational}
                </a>
              </p>
            </div>

            <Link href="/">
              <Button variant="outline" className="mt-4">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative min-h-screen px-4 py-12 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/login-get-started-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60 -z-10" />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <Image
              src="/logo.jpeg"
              alt="Decimal"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-xl font-bold tracking-tight text-white">
              Decimal
            </span>
          </Link>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">
              Try Every Portal
            </h1>
            <p className="mt-2 text-sm text-white/70 max-w-lg">
              Explore Decimal from any perspective. Each portal comes with
              pre-loaded data — students, fees, attendance, and more.
            </p>
          </div>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {DEMO_PORTALS.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.role}
                className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl p-5 hover:bg-white/15 transition-all group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${portal.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{portal.role}</h3>
                    <p className="text-xs text-white/60">{portal.description}</p>
                  </div>
                </div>

                {/* Credentials */}
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-black/30 rounded px-2 py-1.5 text-white/90 font-mono truncate">
                      {portal.email}
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(portal.email, `email-${portal.role}`)
                      }
                      className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                    >
                      {copiedField === `email-${portal.role}` ? (
                        <Check className="h-3.5 w-3.5 text-green-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-black/30 rounded px-2 py-1.5 text-white/90 font-mono">
                      {portal.password}
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          portal.password,
                          `pass-${portal.role}`
                        )
                      }
                      className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                    >
                      {copiedField === `pass-${portal.role}` ? (
                        <Check className="h-3.5 w-3.5 text-green-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Login */}
                <a
                  href="/login"
                  className="mt-3 flex items-center justify-center gap-1.5 w-full rounded-lg bg-white/10 px-4 py-2 text-xs font-medium text-white hover:bg-white/20 transition-colors"
                >
                  Login as {portal.role}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            );
          })}
        </div>

        {/* Request Form */}
        <div className="max-w-md mx-auto">
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 shadow-2xl">
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-white">
                Want a personalized demo?
              </h2>
              <p className="mt-1 text-sm text-white/60">
                Enter your details and we&apos;ll send you a custom demo with
                your school&apos;s data.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-center">
                <p className="text-sm font-medium text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Your name"
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Email address"
                />
              </div>
              <div>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="school"
                  required
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="School name"
                />
              </div>
              <div>
                <select
                  name="role"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="" className="bg-gray-800">
                    Your role
                  </option>
                  <option value="principal" className="bg-gray-800">
                    Principal / Head Teacher
                  </option>
                  <option value="teacher" className="bg-gray-800">
                    Teacher
                  </option>
                  <option value="bursar" className="bg-gray-800">
                    Bursar / Finance
                  </option>
                  <option value="other" className="bg-gray-800">
                    Other
                  </option>
                </select>
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 text-sm"
              >
                {submitting ? "Sending..." : "Get Custom Demo"}
              </Button>
            </form>

            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-white/50">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> Instant email
              </span>
              <span>·</span>
              <span>No credit card</span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-white/60">
          <Link href="/" className="hover:text-white transition-colors">
            &larr; Back to home
          </Link>
        </p>
      </div>
    </section>
  );
}

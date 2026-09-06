"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Calendar, ExternalLink } from "lucide-react";
import { CONTACTS } from "@/lib/contacts";

export default function DemoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
        <div className="w-full max-w-lg text-center">
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 shadow-2xl">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground">
              Demo Credentials Sent!
            </h1>
            <p className="mt-4 text-white/80">
              Check your email for login credentials to the Phikila demo school.
              You can start exploring right away.
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
      className="relative flex min-h-screen items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/login-get-started-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50 -z-10" />

      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.jpeg"
              alt="Phikila"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-xl font-bold tracking-tight text-white">
              Phikila
            </span>
          </Link>
        </div>

        <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 shadow-2xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Get a Demo</h1>
            <p className="mt-2 text-sm text-white/70">
              Explore Phikila with a pre-loaded demo school. No commitment
              required.
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-center">
              <p className="text-sm font-medium text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-white mb-1"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                placeholder="John Mwangi"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                placeholder="john@school.ac.ke"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-white mb-1"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                placeholder="+254 712 345 678"
              />
            </div>

            <div>
              <label
                htmlFor="school"
                className="block text-sm font-medium text-white mb-1"
              >
                School Name
              </label>
              <input
                type="text"
                id="school"
                name="school"
                required
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                placeholder="Phikila Academy"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-white mb-1"
              >
                Your Role
              </label>
              <select
                id="role"
                name="role"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              >
                <option value="" className="bg-gray-800">
                  Select your role
                </option>
                <option value="principal" className="bg-gray-800">
                  Principal / Head Teacher
                </option>
                <option value="deputy" className="bg-gray-800">
                  Deputy Principal
                </option>
                <option value="bursar" className="bg-gray-800">
                  Bursar / Finance
                </option>
                <option value="teacher" className="bg-gray-800">
                  Teacher
                </option>
                <option value="other" className="bg-gray-800">
                  Other
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-white mb-1"
              >
                Message (Optional)
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                placeholder="Tell us about your school..."
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 text-base"
            >
              {submitting ? "Submitting..." : "Get Demo Access"}
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" /> Instant email delivery
            </span>
            <span>·</span>
            <span>No credit card required</span>
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

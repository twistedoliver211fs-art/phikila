"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

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

    try {
      const res = await fetch("https://formspree.io/f/xeaqzwer", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("Something went wrong. Please try again.");
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
        <div className="w-full max-w-md text-center">
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 shadow-2xl">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground">Request Received!</h1>
            <p className="mt-4 text-muted-foreground">
              Thank you for your interest in Phikila. Our team will contact you within 24 hours to schedule your demo.
            </p>
            <Link href="/">
              <Button className="mt-6">Back to Home</Button>
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
            <Image src="/logo.jpeg" alt="Phikila" width={40} height={40} className="rounded-lg" />
            <span className="text-xl font-bold tracking-tight">Phikila</span>
          </Link>
        </div>

        <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 shadow-2xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Get a Demo</h1>
            <p className="mt-2 text-sm text-white/70">
              See how Phikila can transform your school management.
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-center">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="John Mwangi"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="john@school.ac.ke"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="+254 712 345 678"
              />
            </div>

            <div>
              <label htmlFor="school" className="block text-sm font-medium text-foreground mb-1">School Name</label>
              <input
                type="text"
                id="school"
                name="school"
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Phikila Academy"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-foreground mb-1">Your Role</label>
              <select
                id="role"
                name="role"
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select your role</option>
                <option value="principal">Principal / Head Teacher</option>
                <option value="deputy">Deputy Principal</option>
                <option value="bursar">Bursar / Finance</option>
                <option value="teacher">Teacher</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">Message (Optional)</label>
              <textarea
                id="message"
                name="message"
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Tell us about your school..."
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Submitting..." : "Request Demo"}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-white/60">
            We&apos;ll never share your information. No spam, ever.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-white/70">
          <Link href="/" className="hover:underline">&larr; Back to home</Link>
        </p>
      </div>
    </section>
  );
}

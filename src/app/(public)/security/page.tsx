import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, Eye, Key, FileCheck, AlertTriangle, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Security — Phikila",
  description: "How Phikila protects your school's data",
};

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:py-28">
      <div className="text-center mb-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 mb-6">
          <Shield className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Security
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          How we protect your school&apos;s data
        </p>
      </div>

      <div className="space-y-8">
        {/* Encryption */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Encryption</h2>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong className="text-foreground">In Transit:</strong> All data is encrypted using TLS 1.3. Every connection to Phikila is HTTPS-only with HSTS enforcement.</p>
            <p><strong className="text-foreground">At Rest:</strong> All data is stored in Supabase (PostgreSQL) with encryption at rest using AES-256.</p>
            <p><strong className="text-foreground">Offline Data:</strong> Local data cached on devices uses browser-level encryption via IndexedDB. Data is cleared on logout.</p>
          </div>
        </section>

        {/* Authentication */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Authentication</h2>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Google OAuth:</strong> We use Google for authentication. Phikila never stores passwords — your credentials are handled entirely by Google.</p>
            <p><strong className="text-foreground">Session Management:</strong> Sessions are managed by Supabase Auth with secure, HTTP-only cookies.</p>
            <p><strong className="text-foreground">Captcha:</strong> Cloudflare Turnstile protects against automated attacks during login.</p>
          </div>
        </section>

        {/* Authorization */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Authorization & Access Control</h2>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Role-Based Access Control:</strong> Every user is assigned a role (Principal, Teacher, Finance, etc.) that determines what they can see and do.</p>
            <p><strong className="text-foreground">Row-Level Security:</strong> Supabase RLS policies ensure users can only access data from their own school. Teachers see their classes, principals see their school, super admins see everything.</p>
            <p><strong className="text-foreground">School Isolation:</strong> Data is completely isolated between schools. No school can access another school&apos;s data.</p>
          </div>
        </section>

        {/* Audit Logging */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileCheck className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Audit Logging</h2>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>All data modifications are logged with timestamps, user IDs, and the type of change. Audit logs are immutable and accessible to super administrators for compliance and incident investigation.</p>
          </div>
        </section>

        {/* Data Residency */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Data Residency</h2>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>All data is stored in Supabase&apos;s EU (Frankfurt, Germany) region. Supabase is SOC 2 Type II certified and GDPR compliant. Data is not transferred outside the EU without explicit consent.</p>
          </div>
        </section>

        {/* Incident Response */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Incident Response</h2>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Detection:</strong> We monitor for unauthorized access, data breaches, and system anomalies using automated alerting.</p>
            <p><strong className="text-foreground">Response Time:</strong> Security incidents are triaged within 24 hours. Critical vulnerabilities are patched within 72 hours.</p>
            <p><strong className="text-foreground">Notification:</strong> Affected users and relevant authorities are notified within 72 hours of a confirmed breach, in compliance with GDPR Article 33.</p>
            <p><strong className="text-foreground">Investigation:</strong> All incidents are documented with root cause analysis and remediation steps. Audit logs are preserved for investigation.</p>
          </div>
        </section>

        {/* Data Processing Agreement */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileCheck className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Data Processing Agreement</h2>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Data Controller:</strong> The school (you) is the data controller. Phikila (Omix Digital Solutions) is the data processor.</p>
            <p><strong className="text-foreground">Purpose:</strong> Data is processed solely for the purpose of providing school management services as directed by the school.</p>
            <p><strong className="text-foreground">Sub-processors:</strong> Supabase (database hosting), Vercel (app hosting), Google (authentication). All sub-processors are GDPR compliant.</p>
            <p><strong className="text-foreground">Data Deletion:</strong> Schools can request complete data deletion at any time. Data is permanently removed within 30 days of request.</p>
            <p><strong className="text-foreground">Data Export:</strong> Schools can export all their data in standard formats (CSV, JSON) at any time.</p>
            <p><strong className="text-foreground">DPA Contact:</strong> For a full Data Processing Agreement, contact <a href="mailto:legal@phikila.app" className="text-primary hover:underline">legal@phikila.app</a>.</p>
          </div>
        </section>

        {/* Contact */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Security Contact</h2>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>If you discover a security vulnerability, please report it responsibly to:</p>
            <p className="mt-2">
              <a href="mailto:security@phikila.app" className="text-primary hover:underline font-medium">
                security@phikila.app
              </a>
            </p>
            <p className="mt-2">We respond to security reports within 48 hours and aim to resolve confirmed vulnerabilities within 72 hours.</p>
          </div>
        </section>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Phikila",
  description: "Phikila privacy policy",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:py-28">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: September 2026
      </p>
      <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            1. Information We Collect
          </h2>
          <p>
            Phikila collects information necessary to provide school management
            services, including names, email addresses (via Google OAuth),
            school affiliation, and role information. We do not collect
            passwords — authentication is handled entirely by Google.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            2. How We Use Information
          </h2>
          <p>
            We use collected information to operate the platform, manage school
            administration, communicate with users, and improve our services.
            Data is used solely for the purpose of providing Phikila&apos;s
            school management functionality.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            3. Data Storage &amp; Security
          </h2>
          <p>
            All data is stored securely using Supabase (PostgreSQL) with
            row-level security policies. We implement role-based access
            controls, audit logging, and encryption in transit and at rest.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            4. Data Sharing
          </h2>
          <p>
            We do not sell or share personal information with third parties
            except as required to provide the service (e.g., Google OAuth for
            authentication). School data is isolated and not shared between
            schools.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            5. Your Rights
          </h2>
          <p>
            Users can request access to, correction of, or deletion of their
            personal data by contacting the school administrator or Phikila
            support.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            6. Contact
          </h2>
          <p>
            For privacy-related inquiries, contact us at{" "}
            <a href="mailto:privacy@phikila.app" className="text-primary hover:underline">
              privacy@phikila.app
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Phikila",
  description: "Phikila terms of service",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:py-28">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: September 2026
      </p>
      <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using Phikila, you agree to these Terms of Service.
            If you do not agree, do not use the platform.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            2. Description of Service
          </h2>
          <p>
            Phikila is a multi-school management platform providing
            administration, academics, attendance, finance, admissions,
            communication, and timetable management tools for schools.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            3. User Responsibilities
          </h2>
          <p>
            Users are responsible for maintaining the confidentiality of their
            account, ensuring data they enter is accurate, and using the
            platform in compliance with applicable laws and school policies.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            4. Data Ownership
          </h2>
          <p>
            Schools retain ownership of their data. Phikila acts as a data
            processor to provide the service. Schools may request data export
            or deletion at any time.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            5. Limitation of Liability
          </h2>
          <p>
            Phikila is provided &quot;as is&quot; without warranties of any
            kind. We are not liable for any indirect, incidental, or
            consequential damages arising from use of the platform.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            6. Changes to Terms
          </h2>
          <p>
            We may update these terms from time to time. Continued use of the
            platform after changes constitutes acceptance of the updated terms.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            7. Contact
          </h2>
          <p>
            For questions about these terms, contact us at{" "}
            <a href="mailto:omixsystems@gmail.com" className="text-primary hover:underline">
              omixsystems@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}

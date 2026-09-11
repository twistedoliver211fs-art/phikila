"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatedSection, fadeUp } from "./motion";

const faqs = [
  {
    question: "What is Decimal?",
    answer:
      "Decimal is a comprehensive school management platform that connects students, academics, attendance, finance, communication, and reporting in one system.",
  },
  {
    question: "Who is Decimal for?",
    answer:
      "School administrators, principals, teachers, finance officers, admissions staff, and parents. Each role gets a tailored portal.",
  },
  {
    question: "Can Decimal work offline?",
    answer:
      "Yes. Essential workflows like attendance, student records, and invoicing continue offline. Changes sync automatically when connectivity returns.",
  },
  {
    question: "How does synchronization work?",
    answer:
      "Decimal uses a background sync engine. Changes made offline are queued and uploaded when the device reconnects. Conflicts are detected and resolved automatically.",
  },
  {
    question: "What roles are supported?",
    answer:
      "Seven roles: Super Admin, Principal, Teacher, Finance, Secretary, Admissions Officer, and Parent. Each has a dedicated portal with appropriate permissions.",
  },
  {
    question: "Can I import students?",
    answer:
      "Yes. Decimal supports bulk student import via CSV/Excel files. You can also add students individually through the admissions portal.",
  },
  {
    question: "Does Decimal manage fees?",
    answer:
      "Yes. Create fee structures, generate invoices, record payments, track outstanding balances, and produce financial reports.",
  },
  {
    question: "Can Decimal generate timetables?",
    answer:
      "Yes. The timetable engine considers teacher availability, subject frequencies, room constraints, and generates optimized schedules with conflict detection.",
  },
  {
    question: "Is there a mobile app?",
    answer:
      "Decimal is available as a Progressive Web App (PWA) that works on any device. Native Android and desktop apps are also available.",
  },
  {
    question: "How do I get started?",
    answer:
      "Register your school, configure your academic year, add classes and subjects, invite staff, and start adding students. The whole process takes about 15 minutes.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Decimal uses row-level security on all database tables, role-based access control, secure authentication, and audit trails. Data is encrypted in transit.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Visit our support page, email omixsystems@gmail.com, or WhatsApp +254 768 214 649.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-background via-primary/[0.02] to-background py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection variants={fadeUp}>
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              FAQ
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Frequently asked questions
            </h2>
          </div>
        </AnimatedSection>

        <AnimatedSection variants={fadeUp} delay={0.1}>
          <div className="mt-12 divide-y divide-border rounded-2xl border border-border bg-card">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <p className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

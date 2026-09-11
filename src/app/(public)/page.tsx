import type { Metadata } from "next";
import { HeroPremium } from "@/components/landing/hero-premium";
import { ProblemSection } from "@/components/landing/problem-section";
import { SolutionIntro } from "@/components/landing/solution-intro";
import { ProductShowcase } from "@/components/landing/product-showcase";
import { OfflineSection } from "@/components/landing/offline-section";
import { TimetableFeature } from "@/components/landing/timetable-feature";
import { RoleSwitcher } from "@/components/landing/role-switcher";
import { SecuritySection } from "@/components/landing/security-section";
import { StatsSection } from "@/components/landing/stats-section";
import { FAQSection } from "@/components/landing/faq-section";
import { FinalCTA } from "@/components/landing/final-cta";

export const metadata: Metadata = {
  title: "Decimal — Modern School Management Platform",
  description:
    "Run your entire school from one place. Students, academics, attendance, finance, communication, timetables and reports — connected in one intelligent platform.",
  keywords: [
    "school management system",
    "school administration software",
    "student management",
    "school attendance",
    "school finance",
    "school timetable",
    "school ERP",
    "academic management",
  ],
  openGraph: {
    title: "Decimal — Modern School Management Platform",
    description:
      "Run your entire school from one place. Students, academics, attendance, finance, communication, timetables and reports — connected in one intelligent platform.",
    type: "website",
    siteName: "Decimal",
  },
  twitter: {
    card: "summary_large_image",
    title: "Decimal — Modern School Management Platform",
    description:
      "Run your entire school from one place. Students, academics, attendance, finance, communication, timetables and reports — connected in one intelligent platform.",
  },
};

export default function LandingPage() {
  return (
    <>
      <HeroPremium />
      <ProblemSection />
      <SolutionIntro />
      <ProductShowcase />
      <OfflineSection />
      <TimetableFeature />
      <RoleSwitcher />
      <SecuritySection />
      <StatsSection />
      <FAQSection />
      <FinalCTA />
    </>
  );
}

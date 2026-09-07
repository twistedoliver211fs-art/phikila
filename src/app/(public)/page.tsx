import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { TimetablePreview } from "@/components/landing/timetable-preview";
import { Roles } from "@/components/landing/roles";
import { CTA } from "@/components/landing/cta";
import { DownloadSection } from "@/components/landing/download-section";
import { DemoVideo } from "@/components/landing/demo-video";
import { PWAInstallBanner } from "@/components/pwa-install-banner";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <DemoVideo />
      <Features />
      <TimetablePreview />
      <Roles />
      <DownloadSection />
      <CTA />
      <PWAInstallBanner />
    </>
  );
}

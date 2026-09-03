import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { TimetablePreview } from "@/components/landing/timetable-preview";
import { Roles } from "@/components/landing/roles";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <TimetablePreview />
      <Roles />
      <CTA />
      <Footer />
    </>
  );
}

import Link from "next/link";
import { ArrowRight, Download, Globe, Monitor, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection, StaggerGrid, StaggerItem, fadeUp } from "./motion";
import { Aurora } from "./aurora";
import { RELEASE, WEB_APP_URL } from "@/lib/releases";

const channels = [
  {
    icon: Smartphone,
    title: "Android",
    description: "Native APK with offline-first sync",
  },
  {
    icon: Monitor,
    title: "Desktop",
    description: "Windows installer · Linux .deb / AppImage",
  },
  {
    icon: Globe,
    title: "Web App",
    description: "Installable PWA — works on macOS & iOS too",
  },
];

export function DownloadSection() {
  return (
    <section className="relative isolate overflow-hidden border-t border-border bg-gradient-to-b from-primary/[0.05] via-background to-primary/[0.04] py-24">
      <Aurora className="opacity-70" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection variants={fadeUp}>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Install Decimal
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Take Decimal everywhere
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Install on any device — phone, tablet, or computer. Offline
              support included, verified downloads, no app store required.
            </p>
          </div>
        </AnimatedSection>

        <StaggerGrid className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
          {channels.map((channel) => (
            <StaggerItem key={channel.title}>
              <div className="h-full rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                <channel.icon className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-3 text-center font-semibold text-foreground">
                  {channel.title}
                </h3>
                <p className="mt-1 text-center text-sm leading-relaxed text-muted-foreground">
                  {channel.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>

        <AnimatedSection variants={fadeUp} delay={0.15}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/download">
              <Button size="lg" className="text-base">
                <Download />
                Download Decimal
              </Button>
            </Link>
            <a href={WEB_APP_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="text-base">
                <Globe />
                Open the Web App
                <ArrowRight />
              </Button>
            </a>
          </div>
          <p className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            <span>
              v{RELEASE.version} · SHA-256 verified · Built by{" "}
              {RELEASE.publisher.name}
            </span>
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}

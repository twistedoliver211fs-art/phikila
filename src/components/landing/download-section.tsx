import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Monitor, Shield } from "lucide-react";

export function DownloadSection() {
  return (
    <section className="py-24 border-t border-border">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Take Phikila Everywhere
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Install on any device — phone, tablet, or computer. Offline support included.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto">
          <div className="rounded-xl border border-border bg-card p-6">
            <Smartphone className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground">Mobile</h3>
            <p className="text-sm text-muted-foreground mt-1">Android APK with native features</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <Monitor className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground">Desktop</h3>
            <p className="text-sm text-muted-foreground mt-1">Windows, Linux, macOS</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground">PWA</h3>
            <p className="text-sm text-muted-foreground mt-1">Install from any browser</p>
          </div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/download">
            <Button size="lg" className="text-base px-8">
              <Download className="h-5 w-5 mr-2" />
              Download Phikila
            </Button>
          </Link>
          <Link href="/security">
            <Button variant="outline" size="lg" className="text-base px-8">
              <Shield className="h-5 w-5 mr-2" />
              Security
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

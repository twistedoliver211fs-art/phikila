import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CONTACTS } from "@/lib/contacts";
import { SiteHeader } from "@/components/public/site-header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <SiteHeader />

      {/* Content */}
      <main className="flex-1 relative">
        {/* Aurora background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-[40%] -left-[20%] h-[80vh] w-[60vw] rounded-full bg-primary/[0.03] blur-[120px]" />
          <div className="absolute -bottom-[30%] -right-[10%] h-[60vh] w-[50vw] rounded-full bg-purple-500/[0.03] blur-[100px]" />
          <div className="absolute top-[20%] right-[10%] h-[40vh] w-[30vw] rounded-full bg-blue-400/[0.02] blur-[80px]" />
        </div>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2">
                <Image src="/logo.jpeg" alt="Phikila" width={28} height={28} className="rounded-md" />
                <span className="text-base font-bold tracking-tight">Phikila</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                The school management platform built for clarity, action, and
                connection.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Built by{" "}
                <a href={CONTACTS.website} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                  {CONTACTS.publisher}
                </a>{" "}
                &middot;{" "}
                <a href={CONTACTS.whatsapp} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                  WhatsApp {CONTACTS.phoneInternational}
                </a>{" "}
                &middot;{" "}
                <a href={CONTACTS.mailto} className="underline hover:text-foreground">
                  {CONTACTS.email}
                </a>
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground">Platform</h3>
              <ul className="mt-3 space-y-2">
                <li><Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">Features</Link></li>
                <li><Link href="/#timetable" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">Timetable</Link></li>
                <li><Link href="/#roles" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">For Schools</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground">Legal</h3>
              <ul className="mt-3 space-y-2">
                <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">Terms of Service</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground">Support</h3>
              <ul className="mt-3 space-y-2">
                <li><Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">Documentation</Link></li>
                <li><a href={CONTACTS.whatsapp} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">WhatsApp {CONTACTS.phoneInternational}</a></li>
                <li><a href={CONTACTS.mailto} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">{CONTACTS.email}</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-border pt-6">
            <p className="text-xs text-muted-foreground">
              &copy; 2026 Omix Digital Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

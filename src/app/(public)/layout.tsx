import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.jpeg"
              alt="Phikila"
              width={28}
              height={28}
              className="rounded-md"
            />
            <span className="text-base font-bold tracking-tight">Phikila</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/download" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Download
            </Link>
            <Link href="/security" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Security
            </Link>
            <Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Documentation
            </Link>
            <Link href="/privacy" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Register your School</Button>
            </Link>
          </div>
        </div>
      </header>

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
                <a href="https://omixsystems.store" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                  Omix Digital Solutions
                </a>{" "}
                &middot;{" "}
                <a href="mailto:omixsystems@gmail.com" className="underline hover:text-foreground">
                  omixsystems@gmail.com
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
                <li><a href="https://wa.me/254768214649" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">WhatsApp Us</a></li>
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

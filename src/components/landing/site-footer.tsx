import Link from "next/link";
import { CONTACTS } from "@/lib/contacts";

const productLinks = [
  { label: "Students", href: "#features" },
  { label: "Academics", href: "#features" },
  { label: "Attendance", href: "#features" },
  { label: "Examinations", href: "#features" },
  { label: "Timetable", href: "#features" },
  { label: "Finance", href: "#features" },
  { label: "Admissions", href: "#features" },
  { label: "Reports", href: "#features" },
];

const solutionLinks = [
  { label: "Administrators", href: "#roles" },
  { label: "Principals", href: "#roles" },
  { label: "Teachers", href: "#roles" },
  { label: "Staff", href: "#roles" },
  { label: "Parents", href: "#roles" },
];

const resourceLinks = [
  { label: "Documentation", href: "/docs" },
  { label: "Guides", href: "/docs/guides" },
  { label: "Help Center", href: "/support" },
  { label: "FAQ", href: "#faq" },
  { label: "Changelog", href: "/changelog" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Security", href: "/security" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

const socialLinks = [
  { label: "Twitter", href: "#" },
  { label: "GitHub", href: "#" },
  { label: "LinkedIn", href: "#" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 lg:pr-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">Decimal</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              Modern school management platform.
            </p>
            <div className="mt-4 flex items-center gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {social.label}
                </Link>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Built by {CONTACTS.publisher}
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Product</h3>
            <ul className="mt-4 space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Solutions</h3>
            <ul className="mt-4 space-y-2.5">
              {solutionLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Resources</h3>
            <ul className="mt-4 space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Company</h3>
            <ul className="mt-4 space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-8">
          <p className="text-xs text-muted-foreground">
            © 2026 {CONTACTS.publisher}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/security"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

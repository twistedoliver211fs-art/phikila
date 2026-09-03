import Image from "next/image";

const footerLinks = {
  Platform: [
    { label: "Features", href: "#features" },
    { label: "Timetable", href: "#timetable" },
    { label: "For Schools", href: "#roles" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
  Support: [
    { label: "Contact", href: "#" },
    { label: "Documentation", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.jpeg"
                alt="Phikila"
                width={28}
                height={28}
                className="rounded-md"
              />
              <span className="text-base font-bold tracking-tight">
                Phikila
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              The school management platform built for clarity, action, and
              connection.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-foreground">
                {category}
              </h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Phikila. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

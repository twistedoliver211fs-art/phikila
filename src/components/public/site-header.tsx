"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/download", label: "Download" },
  { href: "/security", label: "Security" },
  { href: "/docs", label: "Documentation" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

/**
 * Public site header. Desktop: inline nav. Mobile: hamburger that
 * opens a dropdown panel with all links + auth CTAs (touch-friendly).
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Compact the header once the user scrolls (rAF-throttled).
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-shadow duration-200 ${
        scrolled ? "shadow-sm shadow-black/5" : ""
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-200 sm:px-6 lg:px-8 ${
          scrolled ? "h-12" : "h-16"
        }`}
      >
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

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/login" className="hidden sm:block">
            <Button size="sm">
              <span className="sm:hidden">Register</span>
              <span className="hidden sm:inline">Register your School</span>
            </Button>
          </Link>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-muted md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-border/40 bg-background md:hidden"
        >
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-3 sm:px-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 border-t border-border/40 pt-3 sm:hidden">
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">Sign In</Button>
              </Link>
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button className="w-full">Register your School</Button>
              </Link>
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}

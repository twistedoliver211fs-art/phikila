"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { DocsSearch } from "@/components/docs/DocsSearch";
import { DocsMobileSidebar } from "@/components/docs/DocsMobileSidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-sm lg:px-6">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors lg:hidden"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </button>
        <div className="flex-1" />
        <DocsSearch />
      </div>

      {/* Mobile sidebar */}
      <DocsMobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* 3-column layout */}
      <div className="mx-auto flex max-w-screen-2xl">
        {/* Left sidebar */}
        <aside className="sticky top-12 hidden h-[calc(100vh-3rem)] w-[280px] shrink-0 overflow-y-auto border-r border-border p-4 lg:block">
          <DocsSidebar />
        </aside>

        {/* Center content */}
        <main className="min-w-0 flex-1 py-8 px-8 max-w-5xl">
          {children}
        </main>
      </div>
    </div>
  );
}

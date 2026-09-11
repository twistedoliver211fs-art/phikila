"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsNavigation } from "@/lib/docs/docs-data";
import { cn } from "@/lib/utils";

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-6">
      {docsNavigation.map((section) => (
        <div key={section.title}>
          <h3 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {section.title}
          </h3>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const href = `/docs/${item.slug}`;
              const isActive = pathname === href;

              return (
                <li key={item.slug}>
                  <Link
                    href={href}
                    className={cn(
                      "block rounded-md px-3 py-1.5 text-sm transition-colors duration-150",
                      isActive
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

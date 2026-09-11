"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  title: string;
  level: number;
}

interface DocsTOCProps {
  headings: Heading[];
}

export function DocsTOC({ headings }: DocsTOCProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="On this page">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </h3>
      <ul className="space-y-1 border-l border-border">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "block border-l -ml-px py-1 text-sm transition-colors duration-150",
                heading.level === 2 && "pl-3",
                heading.level === 3 && "pl-6",
                activeId === heading.id
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {heading.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

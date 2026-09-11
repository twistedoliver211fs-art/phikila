"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsNavigation } from "@/lib/docs/docs-data";

function slugToTitle(slug: string, sectionSlug: string): string {
  const section = docsNavigation.find(
    (s) =>
      s.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") === sectionSlug
  );
  if (section) {
    const item = section.items.find(
      (i) => i.slug === `${sectionSlug}/${slug}`
    );
    if (item) return item.title;
  }
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DocsBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs: { label: string; href?: string }[] = [{ label: "Home", href: "/" }];

  if (segments[0] === "docs") {
    crumbs.push({ label: "Docs", href: "/docs" });

    if (segments.length >= 2) {
      const sectionSlug = segments[1];
      const section = docsNavigation.find(
        (s) =>
          s.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-") === sectionSlug
      );

      if (section) {
        crumbs.push({
          label: section.title,
          href: `/docs/${sectionSlug}`,
        });
      }

      if (segments.length >= 3) {
        const pageSlug = segments.slice(1).join("/");
        const item = section?.items.find((i) => i.slug === pageSlug);
        crumbs.push({
          label: item?.title || slugToTitle(segments[segments.length - 1], segments[1]),
        });
      }
    }
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span key={crumb.href ?? crumb.label} className="flex items-center gap-1.5">
            {index > 0 && <span className="text-muted-foreground/50">/</span>}
            {isLast || !crumb.href ? (
              <span className="text-foreground">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="transition-colors hover:text-foreground"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

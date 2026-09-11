"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PaginationItem {
  title: string;
  slug: string;
}

interface DocsPaginationProps {
  prev: PaginationItem | null;
  next: PaginationItem | null;
}

export function DocsPagination({ prev, next }: DocsPaginationProps) {
  return (
    <div className="mt-12 flex items-center gap-4 border-t border-border pt-8">
      {prev ? (
        <Link
          href={`/docs/${prev.slug}`}
          className="group flex-1 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
        >
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ArrowLeft className="h-3 w-3" />
            Previous
          </span>
          <span className="mt-1 block text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {next ? (
        <Link
          href={`/docs/${next.slug}`}
          className="group flex-1 rounded-lg border border-border p-4 text-right transition-colors hover:bg-muted/50"
        >
          <span className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
            Next
            <ArrowRight className="h-3 w-3" />
          </span>
          <span className="mt-1 block text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {next.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  );
}

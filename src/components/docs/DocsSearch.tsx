"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Search, FileText } from "lucide-react";
import { searchDocs, type DocItem } from "@/lib/docs/docs-data";
import { cn } from "@/lib/utils";

export function DocsSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DocItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      setResults(searchDocs(query));
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    },
    []
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results.length > 0) {
      const item = results[selectedIndex];
      if (item) {
        setOpen(false);
      }
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-muted/50 hover:text-foreground"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 text-left">Search documentation...</span>
        <kbd className="pointer-events-none hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </button>

      {/* Modal */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-4 top-[15%] z-50 mx-auto max-w-lg rounded-xl border border-border bg-background shadow-2xl">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search documentation..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                ESC
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {query.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Start typing to search...
                </p>
              ) : results.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No results found for &ldquo;{query}&rdquo;
                </p>
              ) : (
                <ul className="space-y-0.5">
                  {results.map((item, index) => (
                    <li key={item.slug}>
                      <Link
                        href={`/docs/${item.slug}`}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-start gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                          index === selectedIndex
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium">{item.title}</div>
                          {item.description && (
                            <div className="mt-0.5 truncate text-xs text-muted-foreground">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

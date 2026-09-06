"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface DeferredMountProps {
  children: ReactNode;
  /** Reserve vertical space (px) so the page doesn't jump when content mounts. */
  minHeight: number;
  /** Accessible label shown inside the placeholder. */
  label: string;
}

/**
 * Mounts `children` only when the wrapper scrolls close to the viewport
 * (or after a timeout fallback). Heavy below-the-fold widgets — QR codes,
 * the file verifier — stay out of the initial hydration cost.
 */
export function DeferredMount({ children, minHeight, label }: DeferredMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShow(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          observer.disconnect();
        }
      },
      // Mount slightly before the widget scrolls into view.
      { rootMargin: "200px" }
    );
    observer.observe(el);
    // Fallback: never leave the widget unavailable (e.g. odd scroll roots).
    const timer = setTimeout(() => setShow(true), 4000);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={ref}>
      {show ? (
        children
      ) : (
        <div
          style={{ minHeight }}
          className="flex items-center justify-center rounded-xl border border-border/60 bg-card/50"
          role="status"
          aria-label={label}
        >
          <span className="text-xs text-muted-foreground">Loading…</span>
        </div>
      )}
    </div>
  );
}

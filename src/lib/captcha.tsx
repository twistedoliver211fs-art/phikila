// Lightweight Cloudflare Turnstile widget renderer.
// No extra dependency — uses the Turnstile JS API + a div with the standard
// data-* attributes. Works in client components only.
//
// Required env (public, safe to ship):
//   NEXT_PUBLIC_TURNSTILE_SITE_KEY — your Turnstile site key from
//   https://dash.cloudflare.com/?to=/:account/captcha
//
// On load the widget calls `onSuccess(token)` when the user solves it, or
// `onExpire` / `onError` when it expires or fails to load.
//
// Usage:
//   <TurnstileWidget onSuccess={(token) => setToken(token)} />

import { useEffect, useRef, useCallback } from "react";

export interface TurnstileWidgetProps {
  /** Called with the verified token when the user solves the challenge. */
  onSuccess: (token: string) => void;
  /** Called when the challenge expires (user must solve again). */
  onExpire?: () => void;
  /** Called when the widget fails to load. */
  onError?: () => void;
  /** Optional id for the container div. */
  id?: string;
}

const SCRIPT_SRC = "//challenges.cloudflare.com/turnstile/v0/api.js?onload=turnstileOnLoad";

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load Turnstile API script"));
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

function turnstileOnLoad(this: Window) {
  if (typeof window !== "undefined" && (window as unknown as { turnstile: unknown }).turnstile) {
    // The Turnstile API will now be available as window.turnstile.render().
  }
}

interface WidgetRenderResult {
  reset: () => void;
}

export function TurnstileWidget({
  onSuccess,
  onExpire,
  onError,
  id = "cf-turnstile-widget",
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef<WidgetRenderResult | null>(null);

  const handleSuccess = useCallback(
    (token: string) => {
      onSuccess(token);
    },
    [onSuccess]
  );

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const init = async () => {
      await loadScript();
      if (!containerRef.current) return;

      const api = (window as unknown as { turnstile: { render: (container: HTMLElement, opts: Record<string, unknown>) => WidgetRenderResult } }).turnstile;
      if (!api) return;

      const result = api.render(containerRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
        theme: "light",
        size: "normal",
        callback: (token: string) => handleSuccess(token),
        expire_callback: onExpire,
        error_callback: onError,
        // Allow the widget to remember the user across page navigations
        // within the same browser session (turnstile "may persist" model).
        "pen": false,
      });
      renderedRef.current = result;
    };

    init();

    return () => {
      renderedRef.current?.reset();
      renderedRef.current = null;
    };
  }, [handleSuccess, onExpire, onError]);

  return (
    <div
      id={id}
      style={{ width: "100%", minHeight: "80px" }}
    />
  );
}

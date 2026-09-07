"use client";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="rounded-xl border border-border bg-card p-8 text-center max-w-md w-full">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <span className="text-2xl">!</span>
        </div>
        <h1 className="text-lg font-semibold text-foreground">
          Authentication error
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong during authentication. Please try again.
        </p>
        <a
          href="/login"
          className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Back to login
        </a>
      </div>
    </div>
  );
}

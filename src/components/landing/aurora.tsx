/**
 * Aurora background — three large, slowly drifting gradient fields.
 * Pure CSS animation (see .aurora-blob-* in globals.css), disabled under
 * prefers-reduced-motion. Render inside a `relative isolate overflow-hidden`
 * section so it sits above the section background but below content.
 */
export function Aurora({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
    </div>
  );
}

"use client";

import { useToast } from "@/data";

/** The design's toast: fixed at the bottom centre, dark, one line. */
export function Toast() {
  const toast = useToast();
  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed bottom-6 left-1/2 z-[300] -translate-x-1/2">
      {toast && (
        <div key={toast.id} className="type-label max-w-[min(560px,calc(100vw-32px))] rounded-md bg-grey-900 px-4 py-3 text-white shadow-lg">
          {toast.text}
        </div>
      )}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="type-body rounded-md bg-surface p-8 text-center text-text-muted">{children}</div>;
}

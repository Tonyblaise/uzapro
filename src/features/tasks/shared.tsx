"use client";
/** Helpers shared by the Tasks screen: URL-driven overlays (same contract as the Calendar's). */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/** Drawer subtitle: the module name. */
export const CRUMB = "Tasks";

/** Overlay state lives in the URL: `?action=new`, `?view=<taskId>`, `&step=edit`, `&step=delete`. */
export function useTaskOverlay() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const open = useCallback(
    (next: Record<string, string | undefined>) => {
      const q = new URLSearchParams();
      for (const [k, v] of Object.entries(next)) if (v !== undefined && v !== "") q.set(k, v);
      router.replace(`${pathname}?${q.toString()}`, { scroll: false });
    },
    [router, pathname],
  );
  const close = useCallback(() => router.replace(pathname, { scroll: false }), [router, pathname]);
  return { params, open, close };
}

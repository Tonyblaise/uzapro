"use client";
/** Helpers shared by the Calendar screen: URL-driven overlays and the design's chip tones. */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { Tone } from "@/data";

/** The design's drawer subtitle is the module name (`drawerCrumb: m.n`). */
export const CRUMB = "Calendar";

/**
 * Overlay state lives in the URL (contracts/routes.md): `?action=new[&date=YYYY-MM-DD]`,
 * `?view=<eventId>`, `&step=edit` and `&step=delete` (the design's `calConfirm`).
 */
export function useCalOverlay() {
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

/** Event chip colours (design `calView` tones: Accounts warning, Work info, Stock neutral, Marketing success). */
export const CHIP: Record<Tone, string> = {
  warning: "bg-warning-soft text-warning-text",
  info: "bg-info-soft text-info-text",
  neutral: "bg-neutral-soft text-neutral-text",
  success: "bg-success-soft text-success-text",
  danger: "bg-danger-soft text-danger-text",
};

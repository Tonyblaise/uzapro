"use client";
/** URL-driven overlays for Permissions (feature 011): ?action=new | ?action=rename&role= | ?role= (edit). */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useRoleOverlay() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const open = useCallback(
    (next: Record<string, string | undefined>) => {
      const q = new URLSearchParams();
      for (const [k, v] of Object.entries(next)) if (v) q.set(k, v);
      router.replace(`${pathname}?${q.toString()}`, { scroll: false });
    },
    [router, pathname],
  );
  const close = useCallback(() => router.replace(pathname, { scroll: false }), [router, pathname]);
  return { params, open, close };
}

/** "Total 1 user" / "Total 4 users". */
export const usersLabel = (n: number) => `Total ${n} ${n === 1 ? "user" : "users"}`;

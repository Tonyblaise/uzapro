"use client";
/**
 * Shared helpers of the generic screens (feature 005, US5): the URL-driven overlay params
 * (contracts/routes.md: `?action=new`, `?view=<first cell>`, `&confirm=delete`) and the design's
 * 440px drawer whose crumb is the module name (`drawerCrumb: m.n`).
 */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, type ReactNode } from "react";
import { getModule } from "@/config/modules";
import type { ModuleId } from "@/data";
import { Drawer } from "@/components/ui/Overlay";

export function useGenericOverlay() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const open = useCallback(
    (next: Record<string, string>) => router.replace(`${pathname}?${new URLSearchParams(next).toString()}`, { scroll: false }),
    [router, pathname],
  );
  const close = useCallback(() => router.replace(pathname, { scroll: false }), [router, pathname]);
  return { params, open, close };
}

/** The design's generic drawer (default width 440, subtitle = module name). */
export function GenericDrawer({ moduleId, title, onClose, children }: { moduleId: ModuleId; title: string; onClose: () => void; children: ReactNode }) {
  return (
    <Drawer open title={title} subtitle={getModule(moduleId).name} onClose={onClose} width={440}>
      {children}
    </Drawer>
  );
}

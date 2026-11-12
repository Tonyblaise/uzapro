"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { findModuleBySlug } from "@/config/modules";
import { canSee } from "@/config/roles";
import { useSession } from "@/data";

/**
 * Client guard (contracts/routes.md › Guards). Renders nothing until browser settings are hydrated,
 * then: signed out → /login; module or tab hidden for the role → /dashboard.
 */
export function RouteGuard({ children }: { children: ReactNode }) {
  const { authed, hydrated, role } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const [, modSlug, tabSlug] = pathname.split("/");
  const mod = modSlug && modSlug !== "dashboard" ? findModuleBySlug(modSlug) : undefined;
  const tab = mod && tabSlug ? mod.tabs.find((t) => t.slug === tabSlug) : undefined;
  const allowed = !mod || (canSee(role, mod.id) && (!tab || canSee(role, mod.id, tab.title)));

  useEffect(() => {
    if (!hydrated) return;
    if (!authed) router.replace("/login");
    else if (!allowed) router.replace("/dashboard");
  }, [hydrated, authed, allowed, router]);

  if (!hydrated || !authed || !allowed) return <div className="min-h-screen bg-canvas" aria-busy="true" />;
  return <>{children}</>;
}

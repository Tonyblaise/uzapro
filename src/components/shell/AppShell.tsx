"use client";

import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { findModuleBySlug } from "@/config/modules";
import { AppHeader } from "./AppHeader";
import { Sidebar } from "./Sidebar";

/** Canvas layout: sticky 240px sidebar + sticky 64px header + main (max 1360px, 24px padding). */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const slug = pathname.split("/")[1] ?? "";
  const activeId = slug === "dashboard" ? "home" : (findModuleBySlug(slug)?.id ?? null);

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar activeId={activeId} open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      {menuOpen && <div className="fixed inset-0 z-30 bg-overlay md:hidden" aria-hidden="true" onClick={() => setMenuOpen(false)} />}
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader onMenu={() => setMenuOpen(true)} />
        <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-5 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

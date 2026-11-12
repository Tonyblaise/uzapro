import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { RouteGuard } from "@/components/shell/RouteGuard";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <RouteGuard>
      <AppShell>{children}</AppShell>
    </RouteGuard>
  );
}

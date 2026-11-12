"use client";

import { useEffect } from "react";
import { getModule, hrefFor } from "@/config/modules";
import { setSearch, useRole, useVisibleTabs, type ModuleId } from "@/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { screenFor } from "@/features/screens";
import { ModulePlaceholder } from "./ModulePlaceholder";

/**
 * The canvas main column for one module tab: PageHeader (eyebrow = section unless it equals the
 * module name; dashboard greets the user), the tab strip, then the tab's screen.
 */
export function ModuleScreen({ moduleId, tabSlug }: { moduleId: ModuleId; tabSlug: string }) {
  const m = getModule(moduleId);
  const role = useRole();
  const tabs = useVisibleTabs(moduleId);
  const isHome = moduleId === "home";
  const screen = m.inScope ? screenFor(moduleId, tabSlug) : undefined;
  const Body = screen?.Body ?? ModulePlaceholder;
  const Actions = screen?.Actions;

  // Each list starts unfiltered (T086).
  useEffect(() => {
    setSearch("");
  }, [moduleId, tabSlug]);

  return (
    <>
      <PageHeader
        eyebrow={isHome || m.section === m.name ? undefined : m.section}
        title={isHome ? `Welcome back, ${role.name || role.first}` : m.name}
        subtitle={isHome ? "Here's what's happening with your store" : m.subtitle}
        actions={Actions ? <Actions /> : undefined}
      />
      {!isHome && m.inScope && <Tabs tabs={tabs} active={tabSlug} hrefFor={(t) => hrefFor(moduleId, t.title)} />}
      <Body />
    </>
  );
}

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { getModule, hrefFor } from "@/config/modules";
import { AccessContext, has, setSearch, showNotice, useCurrentUserName, useModuleAccess, useVisibleTabs, type AccessLevel, type ModuleId } from "@/data";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { screenFor } from "@/features/screens";
import { ModulePlaceholder } from "./ModulePlaceholder";

/** Record-view steps that change data, and the access they need (feature 011, research R6). */
const STEP_NEED: Record<string, AccessLevel> = { void: "delete", delete: "delete", edit: "write", pay: "write", receive: "write", credit: "write" };

/**
 * The canvas main column for one module tab: PageHeader (eyebrow = section unless it equals the
 * module name; dashboard greets the user), the tab strip, then the tab's screen.
 */
export function ModuleScreen({ moduleId, tabSlug }: { moduleId: ModuleId; tabSlug: string }) {
  const m = getModule(moduleId);
  const userName = useCurrentUserName();
  const tabs = useVisibleTabs(moduleId);
  const isHome = moduleId === "home";
  const screen = m.inScope ? screenFor(moduleId, tabSlug) : undefined;
  const Body = screen?.Body ?? ModulePlaceholder;
  const Actions = screen?.Actions;
  const access = useModuleAccess(moduleId);
  const canWrite = has(access, "write");
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const step = params.get("step") ?? "";
  const stepNeed = params.get("confirm") === "delete" || params.get("cancel") === "1" ? "delete" : STEP_NEED[step];
  const blocked = (!canWrite && (params.has("action") || params.has("edit"))) || (!!stepNeed && !has(access, stepNeed));

  // Forms and void/delete steps opened from a link need Write / Delete (FR-011, research R4.2, R6).
  useEffect(() => {
    if (!blocked) return;
    const q = new URLSearchParams(params.toString());
    for (const k of ["action", "edit", "step", "confirm", "cancel"]) q.delete(k);
    const rest = q.toString();
    router.replace(rest ? `${pathname}?${rest}` : pathname, { scroll: false });
    showNotice(canWrite ? `Your role can't delete or void in ${m.name}.` : `Your role can only view ${m.name}.`);
  }, [blocked, canWrite, params, pathname, router, m.name]);

  // Each list starts unfiltered (T086).
  useEffect(() => {
    setSearch("");
  }, [moduleId, tabSlug]);

  return (
    <AccessContext.Provider value={{ module: moduleId, access }}>
      <PageHeader
        eyebrow={isHome || m.section === m.name ? undefined : m.section}
        title={isHome ? `Welcome back, ${userName}` : m.name}
        subtitle={isHome ? "Here's what's happening with your store" : m.subtitle}
        actions={Actions && canWrite ? <Actions /> : undefined}
      />
      {!isHome && m.inScope && <Tabs tabs={tabs} active={tabSlug} hrefFor={(t) => hrefFor(moduleId, t.title)} />}
      {!blocked && <Body />}
    </AccessContext.Provider>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { hrefFor } from "@/config/modules";
import { useVisibleTabs, type ModuleId } from "@/data";

export function ModuleRedirect({ moduleId }: { moduleId: ModuleId }) {
  const tabs = useVisibleTabs(moduleId);
  const router = useRouter();
  const first = tabs[0];
  useEffect(() => {
    router.replace(first ? hrefFor(moduleId, first.title) : "/dashboard");
  }, [first, moduleId, router]);
  return null;
}

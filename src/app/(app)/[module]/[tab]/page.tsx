import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MODULES, findModuleBySlug, findTab } from "@/config/modules";
import { ModuleScreen } from "@/components/shell/ModuleScreen";

export const dynamicParams = false;

export function generateStaticParams() {
  return MODULES.filter((m) => m.id !== "home").flatMap((m) => m.tabs.map((t) => ({ module: m.slug, tab: t.slug })));
}

export default async function TabPage({ params }: { params: Promise<{ module: string; tab: string }> }) {
  const { module, tab } = await params;
  const m = findModuleBySlug(module);
  if (!m || !findTab(m, tab)) notFound();
  return (
    <Suspense>
      <ModuleScreen moduleId={m.id} tabSlug={tab} />
    </Suspense>
  );
}

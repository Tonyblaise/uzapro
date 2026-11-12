import { notFound } from "next/navigation";
import { MODULES, findModuleBySlug } from "@/config/modules";
import { ModuleRedirect } from "@/components/shell/ModuleRedirect";

export const dynamicParams = false;

export function generateStaticParams() {
  return MODULES.filter((m) => m.id !== "home").map((m) => ({ module: m.slug }));
}

/** `/{module}` → the role's first visible tab (contracts/routes.md). */
export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const m = findModuleBySlug(module);
  if (!m) notFound();
  return <ModuleRedirect moduleId={m.id} />;
}

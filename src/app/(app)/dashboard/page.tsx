import { Suspense } from "react";
import { ModuleScreen } from "@/components/shell/ModuleScreen";

export default function DashboardPage() {
  return (
    <Suspense>
      <ModuleScreen moduleId="home" tabSlug="overview" />
    </Suspense>
  );
}

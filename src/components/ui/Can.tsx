"use client";
import type { ReactNode } from "react";
import { useCan, type AccessLevel, type ModuleId } from "@/data";

/** Renders children only when the signed-in role has `need` on the module (feature 011, FR-011). */
export function Can({ need, module, children }: { need: AccessLevel; module?: ModuleId; children: ReactNode }) {
  return useCan(need, module) ? <>{children}</> : null;
}

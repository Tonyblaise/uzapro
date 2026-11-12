import { getModule } from "@/config/modules";
import type { ModuleId, ScreenKind } from "@/data";
import type { ScreenDef, ScreenMap } from "../types";
import { NewAction } from "./Actions";
import { GenericForm } from "./GenericForm";
import { GenericTable } from "./GenericTable";
import { ReportCards } from "./ReportCards";

/**
 * Generic list, form and card screens (feature 005, US5): rep, ppl, perm, comm and the Settings
 * tabs Staff logins, Taxes, Connected apps and Import and export. The screen kind and the columns
 * come from the module registry; every tab gets the header "New" button (design `headerActions`
 * last fallback).
 */
const BODIES: Partial<Record<ScreenKind, typeof GenericTable>> = { table: GenericTable, form: GenericForm, cards: ReportCards };

function screen(moduleId: ModuleId, tab: string, kind: ScreenKind): ScreenDef {
  const View = BODIES[kind];
  if (!View) throw new Error(`No generic screen for ${moduleId}/${tab} (${kind})`);
  const Body = () => <View moduleId={moduleId} tab={tab} />;
  Body.displayName = `Generic(${moduleId}/${tab})`;
  return { Body, Actions: NewAction };
}

function screensFor(moduleId: ModuleId, only?: readonly string[]): ScreenMap {
  const map: ScreenMap = {};
  for (const t of getModule(moduleId).tabs) if (!only || only.includes(t.slug)) map[t.slug] = screen(moduleId, t.slug, t.kind);
  return map;
}

export const reportsScreens: ScreenMap = screensFor("rep");
export const teamScreens: ScreenMap = screensFor("ppl");
export const permissionsScreens: ScreenMap = screensFor("perm");
export const messagesScreens: ScreenMap = screensFor("comm");
/** Settings tabs served by the generic screens; merged into the Settings map in src/features/screens.ts. */
export const genericSettingsScreens: ScreenMap = screensFor("set", ["staff-logins", "taxes", "connected-apps", "import-and-export"]);

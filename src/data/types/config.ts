import type { ActionKey, ModuleId, RoleId, Tone } from "./common";

export type ScreenKind =
  | "stats"
  | "poslaunch"
  | "roles"
  | "prodboard"
  | "stockboard"
  | "salesdash"
  | "buyboard"
  | "expboard"
  | "table"
  | "cards"
  | "form"
  | "calendar"
  | "docs"
  | "chat"
  | "helpcenter"
  | "profile"
  | "bizprofile"
  | "terminals";

export interface Column {
  title: string;
  numeric?: boolean;
}

export interface Tab {
  title: string;
  slug: string;
  kind: ScreenKind;
  columns?: Column[];
}

export type Section = "Overview" | "Sales" | "Procurement" | "Financials" | "People" | "Office" | "Account";

export interface Module {
  id: ModuleId;
  section: Section;
  icon: string;
  name: string;
  subtitle: string;
  slug: string;
  inScope: boolean;
  tabs: Tab[];
}

export interface QuickTask {
  title: string;
  subtitle: string;
  icon: string;
  module: ModuleId;
  tab: string;
  action?: ActionKey | "waste" | "stock" | "transfer";
}

export interface Alert {
  title: string;
  subtitle: string;
  tone: Tone;
  module: ModuleId;
  tab: string;
}

export interface Role {
  id: RoleId;
  label: string;
  name: string;
  role: string;
  first: string;
  figures?: boolean;
  mods?: ModuleId[];
  tabs?: Partial<Record<ModuleId, string[]>>;
  tasks: QuickTask[];
  attention: Alert[];
}

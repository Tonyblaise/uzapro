/**
 * Office, People and Settings types (specs/005-office-people-settings/data-model.md).
 * Field names follow the design's records (`UZ_EVENTS`, `UZ_DOCS`, `UZ_BIZ`, `UZ_GROUPS`,
 * `UZ_BRANCHES`, `UZ_TERMS`, `_profiles`, `UZ_MODS`).
 */
import type { Pill } from "./common";
import type { Store } from "./stock";

// ---- Calendar ---------------------------------------------------------------------------------

/** The four seed event types; custom types can be added from the event form. */
export type CalSeedType = "Work" | "Accounts" | "Stock" | "Marketing";

export interface CalEvent {
  id: string;
  date: string; // ISO
  /** "HH:MM" or "". */
  time: string;
  /** ISO or "" (seed events have none; the form saves the start date when left empty). */
  endDate: string;
  endTime: string;
  address: string;
  title: string;
  type: string;
  notes: string;
}

/** Event form values (design `calStore`). */
export interface CalEventInput {
  title: string;
  date: string;
  time: string;
  endDate: string;
  endTime: string;
  address: string;
  type: string;
  notes: string;
}

/** One day of the Monday-first month grid (design `calView` cells). */
export interface MonthCell {
  iso: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
}

// ---- File Manager -----------------------------------------------------------------------------

export interface Folder {
  id: string;
  name: string;
  /** Parent folder id; "company" is the top level. */
  parent: string;
  access: string;
  notes: string;
}

export interface DocFile {
  id: string;
  /** Includes the extension. */
  name: string;
  folder: string;
  /** Size in KB. */
  size: number;
  modified: string; // ISO
  owner: string;
  /** Linked record, or "—". */
  linked: string;
  notes: string;
}

export type DocKind = "file" | "folder";

/** Display type by extension (design `kind`). Images / Documents (PDF + Document) / Spreadsheets. */
export type FileKind = "Image" | "Spreadsheet" | "PDF" | "Document";

/** Storage rings, all in KB (design `stat`). */
export interface StorageTotals {
  total: number;
  images: number;
  documents: number;
  spreadsheets: number;
}

/** Upload drawer values (design `docUploadSave`). Only the name and size are kept, never the content. */
export interface UploadInput {
  /** The typed "File name", without the extension. */
  name: string;
  /** The chosen file's own name; its extension is kept. */
  fileName: string;
  /** The chosen file's size in bytes. */
  bytes: number;
  folder: string;
  notes: string;
}

/** Folder-info drawer fields (design `docsDrawer` › docFolder). */
export interface FolderStats {
  location: string;
  access: string;
  folders: number;
  files: number;
  /** KB. */
  size: number;
}

// ---- Settings ---------------------------------------------------------------------------------

/** `UZ_BIZ` keys (all strings; `logo` is a data URL or ""). */
export interface BusinessProfile {
  name: string;
  logo: string;
  trading: string;
  type: string;
  industry: string;
  staff: string;
  email: string;
  phone: string;
  whatsapp: string;
  website: string;
  location: string;
  address: string;
  city: string;
  postal: string;
  pin: string;
  regNo: string;
  regDate: string;
  channels: string;
  customers: string;
}

export type BizKey = keyof BusinessProfile;

/** Business profile edit-modal sections (design `setOpen('biz', section)`). */
export type BizSection = "all" | "contact" | "location" | "registration" | "business";

export interface BizRequirement {
  key: BizKey;
  label: string;
  section: BizSection;
}

export interface BizCompletion {
  missing: BizRequirement[];
  /** 0–100, rounded. */
  pct: number;
  /** "{n} required details missing" / "1 required detail missing" / "Profile complete". */
  title: string;
  /** The first 4 missing details (the "+ {label}" chips). */
  chips: BizRequirement[];
  /** "+{n} more" or "". */
  more: string;
}

export interface Group {
  name: string;
  /** Parent group name, or "" for the top level. */
  parent: string;
  code: string;
}

export interface Branch {
  name: string;
  code: string;
  group: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  hq: boolean;
}

export interface Terminal {
  id: number;
  name: string;
  code: string;
  /** Branch name or "" (any branch). */
  branch: string;
  store: string;
  active: boolean;
  /** Display date, e.g. "22 Oct 2026". */
  added: string;
  main: boolean;
}

export interface TerminalSlots {
  included: number;
  purchased: number;
  /** KES a month per paid slot. */
  price: number;
}

export interface TerminalsState extends TerminalSlots {
  list: Terminal[];
}

/** Which slot an active terminal uses (design `slotOf`). */
export type SlotKind = "plan" | "paid";

export interface BranchRow extends Branch {
  /** Storage locations in this branch. */
  stores: number;
  /** Delete is blocked while it has storage locations or is the headquarters. */
  canDelete: boolean;
}

export interface GroupRow extends Group {
  branches: number;
  subGroups: number;
  /** Delete is blocked while it has branches or sub-groups. */
  canDelete: boolean;
}

/** A Stock › Warehouses record seen from Settings › Storage locations. */
export interface StorageLocationRow extends Store {
  /** "BBL-STG-00n" by list position (design). */
  code: string;
  pos: boolean;
  hasStock: boolean;
  hasTerminal: boolean;
  /** Delete is blocked while it holds stock or a terminal uses it. */
  canDelete: boolean;
}

/** Branch dialog values (design `setOpen('branch')`). */
export interface BranchInput {
  name: string;
  phone: string;
  email: string;
  group: string;
  city: string;
  address: string;
  hq: boolean;
  /** New branches only: also create "{name} Store" with POS on. */
  mkStore?: boolean;
  /** New branches only, needs mkStore: also create "{name} Terminal". */
  mkTerm?: boolean;
}

/** Location group dialog values (design `setOpen('group')`). */
export interface GroupInput {
  name: string;
  /** Parent group name; "" or "None (top level)" for the top level. */
  parent: string;
  mkBranch?: boolean;
  mkStore?: boolean;
  mkTerm?: boolean;
}

/** Storage location dialog values (design `setOpen('store')`). */
export interface StorageLocationInput {
  name: string;
  branch: string;
  type: string;
  pos: boolean;
}

/** Terminal dialog values (design `setOpen('term')`). */
export interface TerminalInput {
  name: string;
  /** Branch name, or "Any branch" / "". */
  branch: string;
  store: string;
  /** When every slot is in use (new terminals only): "pay" = Pay and activate, "inactive" = Add as inactive. */
  choice?: "pay" | "inactive";
}

// ---- Profile ----------------------------------------------------------------------------------

export interface Profile {
  first: string;
  last: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  /** Data URL or "". */
  photo: string;
}

export type ProfileDetails = Omit<Profile, "photo">;

// ---- Generic screens --------------------------------------------------------------------------

export type GenericCell = string | Pill;

/** One table row: the design's cells in column order. The first cell is the row's name/key. */
export type GenericRow = GenericCell[];

/** A form field from `UZ_MODS` (`['Report name','Weekly sales by rep','ph']`). */
export interface GenericField {
  label: string;
  /** The value, or the placeholder text when `placeholder` is true. */
  value: string;
  placeholder: boolean;
  /** Spans the full width (`1 / -1`). */
  full: boolean;
}

export type GenericForm = GenericField[];

export interface ReportCard {
  title: string;
  /** Always "Run, schedule or export" in the design. */
  desc: string;
}

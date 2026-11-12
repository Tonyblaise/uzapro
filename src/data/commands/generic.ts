/**
 * Generic screens commands (feature 005, US5): the design's shared table/form/"New" behaviour
 * (`removeRow`, form Save, the `create` drawer; research R1). Delete is offered to the Owner only.
 */
import { ROLES } from "@/config/roles";
import { getStore, showToast } from "../store";
import { fail, ok, type GenericCell, type ModuleId, type Result, type RoleId } from "../types";

/** A cell's plain text (design `plain`): a pill's label or the string itself. */
export function cellText(c: GenericCell | undefined): string {
  return c === undefined ? "" : typeof c === "string" ? c : c.label;
}

/** Owner only: roles without tab limits (design `canDelete = !role.tabs`). */
export function canDeleteGeneric(roleId: RoleId): boolean {
  return !ROLES[roleId].tabs;
}

/** "Delete" after "Delete {name}?" / "This permanently deletes this record.". `key` = the first cell's text. */
export async function deleteGenericRow(moduleId: ModuleId, tab: string, key: string): Promise<Result<void>> {
  const store = getStore();
  const id = `${moduleId}/${tab}`;
  const rows = store.getState().generic[id] ?? [];
  const at = rows.findIndex((r) => cellText(r[0]) === key);
  if (at < 0) return fail("That record is no longer listed.");
  store.setState((s) => ({ generic: { ...s.generic, [id]: (s.generic[id] ?? []).filter((_, i) => i !== at) } }));
  const message = `${key} deleted.`;
  showToast(message);
  return ok(undefined, message);
}

/** "Create" in the "New record" drawer: a message only, no row is added (Clarification Q1). */
export async function createGenericRecord(): Promise<Result<void>> {
  const message = "Record created.";
  showToast(message);
  return ok(undefined, message);
}

/** "Save" on a generic form: a message only. */
export async function saveGenericForm(): Promise<Result<void>> {
  const message = "Changes saved.";
  showToast(message);
  return ok(undefined, message);
}

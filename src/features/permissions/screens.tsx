import type { ScreenMap } from "../types";
import { AddRoleAction, RoleCards } from "./RoleCards";

/** People › Permissions (feature 011): role cards replace the canvas's static table. */
export const permissionsScreens: ScreenMap = {
  permissions: { Body: RoleCards, Actions: AddRoleAction },
};

/**
 * Screen registry: module → tab slug → screen (T041). Missing in-scope entries fall back to the
 * placeholder until their story phase fills them; out-of-scope modules always use the placeholder.
 */
import type { ModuleId } from "@/data";
import { customersScreens } from "./customers/screens";
import { dashboardScreens } from "./dashboard/screens";
import { productsScreens } from "./products/screens";
import { salesScreens } from "./sales/screens";
import { stockScreens } from "./stock/screens";
import type { ScreenDef, ScreenMap } from "./types";

const SCREENS: Partial<Record<ModuleId, ScreenMap>> = {
  home: dashboardScreens,
  prod: productsScreens,
  inv: stockScreens,
  sales: salesScreens,
  cust: customersScreens,
};

export function screenFor(moduleId: ModuleId, tabSlug: string): ScreenDef | undefined {
  return SCREENS[moduleId]?.[tabSlug];
}

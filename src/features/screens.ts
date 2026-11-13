/**
 * Screen registry: module → tab slug → screen (T041). Missing in-scope entries fall back to the
 * placeholder until their story phase fills them; out-of-scope modules always use the placeholder.
 */
import type { ModuleId } from "@/data";
import { accountsScreens } from "./accounts/screens";
import { calendarScreens } from "./calendar/screens";
import { filesScreens } from "./files/screens";
import { genericSettingsScreens, messagesScreens, reportsScreens, teamScreens } from "./generic/screens";
import { permissionsScreens } from "./permissions/screens";
import { profileScreens } from "./profile/screens";
import { settingsScreens } from "./settings/screens";
import { customersScreens } from "./customers/screens";
import { dashboardScreens } from "./dashboard/screens";
import { expensesScreens } from "./expenses/screens";
import { productsScreens } from "./products/screens";
import { payablesScreens } from "./payables/screens";
import { purchasesScreens } from "./purchases/screens";
import { receivablesScreens } from "./receivables/screens";
import { salesScreens } from "./sales/screens";
import { stockScreens } from "./stock/screens";
import { helpScreens } from "./help/screens";
import { posScreens } from "./pos/screens";
import { suppliersScreens } from "./suppliers/screens";
import type { ScreenDef, ScreenMap } from "./types";

const SCREENS: Partial<Record<ModuleId, ScreenMap>> = {
  home: dashboardScreens,
  prod: productsScreens,
  inv: stockScreens,
  sales: salesScreens,
  pos: posScreens,
  cust: customersScreens,
  buy: purchasesScreens,
  vend: suppliersScreens,
  sup: helpScreens,
  rcv: receivablesScreens,
  pay: payablesScreens,
  fin: accountsScreens,
  exp: expensesScreens,
  rep: reportsScreens,
  ppl: teamScreens,
  perm: permissionsScreens,
  cal: calendarScreens,
  comm: messagesScreens,
  docs: filesScreens,
  prof: profileScreens,
  set: { ...genericSettingsScreens, ...settingsScreens },
};

export function screenFor(moduleId: ModuleId, tabSlug: string): ScreenDef | undefined {
  return SCREENS[moduleId]?.[tabSlug];
}

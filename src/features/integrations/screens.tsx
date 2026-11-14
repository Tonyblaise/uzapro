import type { ScreenMap } from "../types";
import { BankScreen } from "./BankScreen";
import { DarajaScreen } from "./DarajaScreen";
import { QuickbooksScreen } from "./QuickbooksScreen";

/**
 * Integrations › M-Pesa (Daraja), M-Pesa bank integrations and QuickBooks (feature 015). Each
 * saves from a footer button, so none has a header action.
 */
export const integrationsScreens: ScreenMap = {
  "m-pesa-daraja": { Body: DarajaScreen },
  "m-pesa-bank-integrations": { Body: BankScreen },
  quickbooks: { Body: QuickbooksScreen },
};

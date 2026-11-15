import type { ScreenMap } from "../types";
import { CreditNoteList, NewCreditNoteAction } from "../sales/DocumentLists";
import { CustomerList, NewCustomerAction } from "./CustomerList";
import { GroupList, NewGroupAction } from "./GroupList";

/** Tab slug → screen for Customers. */
export const customersScreens: ScreenMap = {
  customers: { Body: CustomerList, Actions: NewCustomerAction },
  "refunds-credit-notes": { Body: CreditNoteList, Actions: NewCreditNoteAction },
  "customer-groups": { Body: GroupList, Actions: NewGroupAction },
};

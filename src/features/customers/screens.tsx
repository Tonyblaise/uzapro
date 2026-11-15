import type { ScreenMap } from "../types";
import { CreditNoteList, NewCreditNoteAction } from "../sales/DocumentLists";
import { IssueCreditAction } from "../receivables/Actions";
import { CreditList } from "../receivables/CreditList";
import { CustomerList, NewCustomerAction } from "./CustomerList";
import { GroupList, NewGroupAction } from "./GroupList";

const CustomerCredits = () => <CreditList side="rcv" />;

/** Tab slug → screen for Customers. */
export const customersScreens: ScreenMap = {
  customers: { Body: CustomerList, Actions: NewCustomerAction },
  "refunds-credit-notes": { Body: CreditNoteList, Actions: NewCreditNoteAction },
  "customer-credits": { Body: CustomerCredits, Actions: IssueCreditAction },
  "customer-groups": { Body: GroupList, Actions: NewGroupAction },
};

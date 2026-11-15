import type { ScreenMap } from "../types";
import { CreditNoteList, NewCreditNoteAction } from "../sales/DocumentLists";
import { CreditList, IssueCreditButton } from "../receivables";
import { CustomerList, NewCustomerAction } from "./CustomerList";
import { GroupList, NewGroupAction } from "./GroupList";

const CustomerCredits = () => <CreditList side="rcv" />;
const IssueCustomerCredit = () => <IssueCreditButton side="rcv" />;

/** Tab slug → screen for Customers. */
export const customersScreens: ScreenMap = {
  customers: { Body: CustomerList, Actions: NewCustomerAction },
  "refunds-credit-notes": { Body: CreditNoteList, Actions: NewCreditNoteAction },
  "customer-credits": { Body: CustomerCredits, Actions: IssueCustomerCredit },
  "customer-groups": { Body: GroupList, Actions: NewGroupAction },
};

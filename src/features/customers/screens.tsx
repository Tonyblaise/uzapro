import type { ScreenMap } from "../types";
import { CustomerList, NewCustomerAction } from "./CustomerList";
import { GroupList, NewGroupAction } from "./GroupList";

/** Tab slug → screen for Customers. */
export const customersScreens: ScreenMap = {
  customers: { Body: CustomerList, Actions: NewCustomerAction },
  "customer-groups": { Body: GroupList, Actions: NewGroupAction },
};

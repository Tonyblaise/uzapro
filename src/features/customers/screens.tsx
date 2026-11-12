import type { ScreenMap } from "../types";
import { CustomerList, NewCustomerAction } from "./CustomerList";

/** Tab slug → screen for Customers. */
export const customersScreens: ScreenMap = {
  customers: { Body: CustomerList, Actions: NewCustomerAction },
};

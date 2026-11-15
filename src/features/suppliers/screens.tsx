import type { ScreenMap } from "../types";
import { NewSupplierAction, SupplierList } from "./SupplierList";

/** Tab slug → screen for Suppliers (feature 002, US5). Supplier credits are listed with Purchases › Purchase returns. */
export const suppliersScreens: ScreenMap = {
  suppliers: { Body: SupplierList, Actions: NewSupplierAction },
};

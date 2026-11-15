import type { ScreenMap } from "../types";
import { FieldDeliveryList, FieldSalesList, NewFieldSaleAction, RepsList } from "./FieldLists";

/** Tab slug → screen for Field sales (feature 024). "New field sale" on every tab, as in the design. */
export const fieldScreens: ScreenMap = {
  "field-sales": { Body: FieldSalesList, Actions: NewFieldSaleAction },
  "sales-reps": { Body: RepsList, Actions: NewFieldSaleAction },
  deliveries: { Body: FieldDeliveryList, Actions: NewFieldSaleAction },
};

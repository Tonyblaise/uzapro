import type { ScreenMap } from "../types";
import { FieldDeliveryList, FieldSalesList, NewDeliveryAction, NewFieldSaleAction, NewRepAction, RepsList } from "./FieldLists";

/** Tab slug → screen for Field sales (feature 024). Header buttons per tab, as in the design. */
export const fieldScreens: ScreenMap = {
  "field-sales": { Body: FieldSalesList, Actions: NewFieldSaleAction },
  "sales-reps": { Body: RepsList, Actions: NewRepAction },
  deliveries: { Body: FieldDeliveryList, Actions: NewDeliveryAction },
};

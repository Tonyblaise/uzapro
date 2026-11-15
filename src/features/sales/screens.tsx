import type { ScreenMap } from "../types";
import { InvoiceList, NewInvoiceAction, NewQuotationAction, QuotationList, VoidList } from "./DocumentLists";
import { AddVisitAction, FieldSales } from "./FieldSales";
import { DeliveryList, NewOrderAction, OrderList } from "./OrderLists";
import { NewSaleAction, SalesList } from "./SalesList";
import { SalesOverview } from "./SalesOverview";
import { NewTargetAction, TargetList } from "./TargetList";

/** Tab slug → screen for Sales (header actions as the design's `headerActions`). */
export const salesScreens: ScreenMap = {
  overview: { Body: SalesOverview, Actions: NewSaleAction },
  "all-sales": { Body: SalesList, Actions: NewSaleAction },
  quotations: { Body: QuotationList, Actions: NewQuotationAction },
  "sales-orders": { Body: OrderList, Actions: NewOrderAction },
  deliveries: { Body: DeliveryList },
  "field-sales": { Body: FieldSales, Actions: AddVisitAction },
  invoices: { Body: InvoiceList, Actions: NewInvoiceAction },
  "voided-items": { Body: VoidList },
  "sales-targets": { Body: TargetList, Actions: NewTargetAction },
};

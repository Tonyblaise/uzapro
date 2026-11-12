import type { ScreenMap } from "../types";
import { CreditNoteList, InvoiceList, NewCreditNoteAction, NewInvoiceAction, NewQuotationAction, QuotationList, VoidList } from "./DocumentLists";
import { NewSaleAction, SalesList } from "./SalesList";
import { SalesOverview } from "./SalesOverview";
import { NewTargetAction, TargetList } from "./TargetList";

/** Tab slug → screen for Sales (header actions as the design's `headerActions`). */
export const salesScreens: ScreenMap = {
  overview: { Body: SalesOverview, Actions: NewSaleAction },
  "all-sales": { Body: SalesList, Actions: NewSaleAction },
  quotations: { Body: QuotationList, Actions: NewQuotationAction },
  invoices: { Body: InvoiceList, Actions: NewInvoiceAction },
  "refunds-credit-notes": { Body: CreditNoteList, Actions: NewCreditNoteAction },
  "voided-items": { Body: VoidList },
  "sales-targets": { Body: TargetList, Actions: NewTargetAction },
};

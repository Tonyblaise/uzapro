import { BulkPaymentList, CreatePlanAction, CreditList, IssueCreditAction, NewBulkPaymentAction, PaymentList, PlanList, RecordPaymentAction } from "@/features/receivables";
import type { ScreenMap } from "../types";
import { AgeingView } from "./AgeingView";
import { PayableList } from "./PayableList";

const Payments = () => <PaymentList side="pay" />;
const Bulk = () => <BulkPaymentList side="pay" />;
const Credits = () => <CreditList side="pay" />;
const Plans = () => <PlanList side="pay" />;

/**
 * Tab slug → screen (feature 003). Header actions follow the design's `headerActions` for `pay`:
 * "Record payment" by default, "New bulk payment", "Issue credit", "Create plan", none on Supplier ageing.
 */
export const payablesScreens: ScreenMap = {
  payables: { Body: PayableList, Actions: RecordPaymentAction },
  payments: { Body: Payments, Actions: RecordPaymentAction },
  "bulk-payments": { Body: Bulk, Actions: NewBulkPaymentAction },
  "supplier-credits": { Body: Credits, Actions: IssueCreditAction },
  "supplier-ageing": { Body: AgeingView },
  "payment-plans": { Body: Plans, Actions: CreatePlanAction },
};

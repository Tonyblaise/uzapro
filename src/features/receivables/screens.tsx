import type { ScreenMap } from "../types";
import { IssueCreditAction, NewBulkPaymentAction, NewPaymentPlanAction, RecordPaymentAction } from "./Actions";
import { CreditList } from "./CreditList";
import { BulkPaymentList, PaymentList } from "./PaymentList";
import { PlanList } from "./PlanList";
import { ReceivableList } from "./ReceivableList";
import { StatementView } from "./StatementView";

const Payments = () => <PaymentList side="rcv" />;
const Plans = () => <PlanList side="rcv" />;
const Credits = () => <CreditList side="rcv" />;
const Bulk = () => <BulkPaymentList side="rcv" />;

/** Tab slug → screen (feature 003). */
export const receivablesScreens: ScreenMap = {
  receivables: { Body: ReceivableList, Actions: RecordPaymentAction },
  payments: { Body: Payments, Actions: RecordPaymentAction },
  "payment-plans": { Body: Plans, Actions: NewPaymentPlanAction },
  "customer-credits": { Body: Credits, Actions: IssueCreditAction },
  "bulk-payments": { Body: Bulk, Actions: NewBulkPaymentAction },
  "receivables-statement": { Body: StatementView },
};

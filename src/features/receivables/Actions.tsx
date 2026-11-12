"use client";
/**
 * Header actions of Receivables and Payables (design `headerActions` for `rcv` and `pay`):
 * "Record payment" on Receivables/Payables and Payments, "New payment plan" (customer) or
 * "Create plan" (supplier) on Payment plans, "Issue credit" on the credits tab, "New bulk payment"
 * on Bulk payments, none on the statement and Supplier ageing.
 */
import { Button } from "@/components/ui/Button";
import { useMoneyOverlay } from "./shared";

function ActionButton({ action, children }: { action: "pay" | "bulk" | "plan" | "credit"; children: string }) {
  const { open } = useMoneyOverlay();
  return (
    <Button icon="plus" onClick={() => open({ action })}>
      {children}
    </Button>
  );
}

export const RecordPaymentAction = () => <ActionButton action="pay">Record payment</ActionButton>;
export const NewBulkPaymentAction = () => <ActionButton action="bulk">New bulk payment</ActionButton>;
export const NewPaymentPlanAction = () => <ActionButton action="plan">New payment plan</ActionButton>;
export const CreatePlanAction = () => <ActionButton action="plan">Create plan</ActionButton>;
export const IssueCreditAction = () => <ActionButton action="credit">Issue credit</ActionButton>;
